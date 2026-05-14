import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const CRM_API_KEY = process.env.CRM_API_KEY || '';
const CRM_API_URL = process.env.CRM_API_URL || 'http://localhost:3000/api/v1/trading';
const SYNC_WEBHOOK_SECRET = process.env.SYNC_WEBHOOK_SECRET || 'phase4a_secret';
const SYNC_SHADOW_MODE = process.env.SYNC_SHADOW_MODE !== 'false'; // default true


const sanitizePayload = (payload: any): any => {
  if (!payload || typeof payload !== "object") return payload;
  const sanitized = Array.isArray(payload) ? [...payload] : { ...payload };
  for (const key in sanitized) {
    if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizePayload(sanitized[key]);
    } else if (typeof sanitized[key] === "string") {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes("password") || lowerKey.includes("token") || lowerKey.includes("secret") || lowerKey === "x-api-key") {
        sanitized[key] = "***REDACTED***";
      } else if (lowerKey.includes("email")) {
        const parts = sanitized[key].split("@");
        if (parts.length === 2) sanitized[key] = `${parts[0].substring(0, 2)}***@${parts[1]}`;
      } else if (lowerKey.includes("phone")) {
        const phone = sanitized[key];
        sanitized[key] = phone.length > 4 ? `***-***-${phone.slice(-4)}` : "***REDACTED***";
      }
    }
  }
  return sanitized;
};

const logSyncError = (endpoint: string, payload: any, error: any, retryCount: number, status?: number) => {
  const log = {
    timestamp: new Date().toISOString(),
    module: "CRM_Proxy",
    endpoint,
    status: status || "N/A",
    retryCount,
    reason: error instanceof Error ? error.message : String(error.message || error),
    payload: sanitizePayload(payload)
  };
  console.warn(JSON.stringify(log));
};

const fetchWithRetry = async (endpoint: string, payload: any, retries = 3, timeoutMs = 5000): Promise<any> => {
  if (!CRM_API_KEY) throw new Error("CRM API Key not configured on proxy server");
  
  let attempt = 0;
  
  while (attempt < retries) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(`${CRM_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': CRM_API_KEY
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(id);

      if (response.ok) {
        return await response.json();
      }

      const status = response.status;
      if ([400, 401, 404, 409].includes(status)) {
        throw { isHttp: true, status, message: `Terminal HTTP Error: ${status}` };
      }

      throw { isHttp: true, status, message: `Transient HTTP Error: ${status}` };
    } catch (err: any) {
      clearTimeout(id);
      
      const isTerminal = err.isHttp && [400, 401, 404, 409].includes(err.status);
      const isAbort = err.name === "AbortError";
      
      if (isTerminal || attempt === retries - 1) {
        logSyncError(endpoint, payload, isAbort ? "Timeout" : err, attempt, err.status);
        throw err; // Proxy needs to throw so the frontend gets a 500
      }
      
      attempt++;
      await new Promise(res => setTimeout(res, Math.pow(2, attempt - 1) * 1000));
    }
  }
};

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Lightweight in-memory rate limiter (per container)
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();
const checkRateLimit = (ip: string) => {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 }); // 60 seconds
    return true;
  }
  if (record.count >= 30) return false; // Max 30 req / min per IP per container
  record.count++;
  return true;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || 'unknown';
  if (!checkRateLimit(clientIp)) {
    logSyncError(req.url || '/api/crm', req.body, "Rate limit exceeded", 0, 429);
    return res.status(429).json({ error: 'Too many requests' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logSyncError('/api/crm', req.body, "Missing or invalid authorization header", 0, 401);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];

  // 1. Verify User Session via Supabase
  let userId: string;
  try {
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!authRes.ok) {
      logSyncError('/api/crm', req.body, `Supabase Auth Failed: ${authRes.statusText}`, 0, 401);
      return res.status(401).json({ error: 'Invalid session' });
    }
    const user = await authRes.json();
    userId = user.id;
  } catch (err: any) {
    logSyncError('/api/crm', req.body, `Auth verification error: ${err.message}`, 0, 500);
    return res.status(500).json({ error: 'Auth verification failed' });
  }

  const { action, payload } = req.body;

  if (!action || !payload) {
    return res.status(400).json({ error: 'Missing action or payload' });
  }

  // 2. Validate Allowed CRM actions
  const allowedActions = ['registerClient', 'transaction', 'activity', 'kycUpdate'];
  if (!allowedActions.includes(action)) {
    logSyncError('/api/crm', req.body, `Invalid action attempted: ${action}`, 0, 400);
    return res.status(400).json({ error: 'Invalid CRM action' });
  }

  // 3. Authorize Payload Ownership
  // Ensures the user can only sync data for their own trader ID
  if (payload.external_trader_id !== userId) {
    logSyncError(`/api/crm/${action}`, payload, `Ownership mismatch. Expected ${userId}, got ${payload.external_trader_id}`, 0, 403);
    return res.status(403).json({ error: 'Forbidden: Payload ownership mismatch' });
  }

  try {
    let oldResult = null;
    
    // Publish signed envelope to webhook
    const publishEvent = async () => {
      const eventId = crypto.randomUUID();
      const nonce = crypto.randomUUID();
      const timestamp = Date.now().toString();
      const idempotencyKey = payload.external_tx_id || payload.external_trade_id || `kyc_${userId}`;

      const envelope = {
        eventId,
        eventVersion: 1,
        timestamp,
        nonce,
        idempotencyKey,
        eventType: action,
        source: 'Trade-V2',
        payload
      };

      const envelopeStr = JSON.stringify(envelope);
      const signature = crypto.createHmac('sha256', SYNC_WEBHOOK_SECRET)
        .update(`${timestamp}.${nonce}.${envelopeStr}`)
        .digest('hex');

      const webhookResponse = await fetch(`${CRM_API_URL}/webhook/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
          'X-Timestamp': timestamp,
          'X-Nonce': nonce
        },
        body: envelopeStr
      });

      if (!webhookResponse.ok) {
        throw { isHttp: true, status: webhookResponse.status, message: `Webhook Failed: ${webhookResponse.statusText}` };
      }
      return await webhookResponse.json();
    };

    if (SYNC_SHADOW_MODE) {
      // Execute old sync path first
      switch (action) {
        case 'registerClient':
          oldResult = await fetchWithRetry('/register-client', payload);
          break;
        case 'transaction':
          oldResult = await fetchWithRetry('/transaction', payload);
          break;
        case 'activity':
          oldResult = await fetchWithRetry('/activity', payload);
          break;
        case 'kycUpdate':
          oldResult = await fetchWithRetry('/kyc-update', payload);
          break;
      }
      
      // Await webhook publishing to ensure it completes before Vercel kills the execution
      let shadowPublished = false;
      try {
        await publishEvent();
        shadowPublished = true;
      } catch (err: any) {
        logSyncError(`/api/crm/shadow-publish`, payload, err, 0, err.status || 500);
      }
      
      return res.status(200).json({ success: true, data: oldResult, shadowEventPublished: shadowPublished });
    } else {
      // Phase 4C active mode: only publish to webhook
      const webhookResult = await publishEvent();
      return res.status(202).json({ success: true, message: "Event Published", data: webhookResult });
    }

  } catch (error: any) {
    const status = error.isHttp ? error.status : 500;
    return res.status(status).json({ success: false, error: 'CRM Sync Failed' });
  }
}
