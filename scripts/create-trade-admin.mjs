import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = process.env.TRADE_ADMIN_EMAIL || 'admin@trade.local';
const ADMIN_PASSWORD = process.env.TRADE_ADMIN_PASSWORD || 'TradeAdmin@2026!';
const ADMIN_DISPLAY_NAME = process.env.TRADE_ADMIN_DISPLAY_NAME || 'Trade Admin';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

async function ensureAuthUser() {
  const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(ADMIN_EMAIL)}`, {
    headers,
  });

  if (!listRes.ok) {
    const body = await listRes.text();
    throw new Error(`Failed to query auth user: ${listRes.status} ${body}`);
  }

  const listData = await listRes.json();
  const existing = listData?.users?.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
  if (existing?.id) {
    return existing.id;
  }

  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: ADMIN_DISPLAY_NAME },
    }),
  });

  if (!createRes.ok) {
    const body = await createRes.text();
    throw new Error(`Failed to create auth user: ${createRes.status} ${body}`);
  }

  const created = await createRes.json();
  if (!created?.id) {
    throw new Error('Auth user created but id missing in response');
  }

  return created.id;
}

async function ensurePublicUserRow(userId) {
  const selectRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=id,email,role`,
    { headers }
  );

  if (!selectRes.ok) {
    const body = await selectRes.text();
    throw new Error(`Failed to query public.users: ${selectRes.status} ${body}`);
  }

  const rows = await selectRes.json();
  if (Array.isArray(rows) && rows.length > 0) {
    const patchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(userId)}`,
      {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=representation' },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          display_name: ADMIN_DISPLAY_NAME,
          role: 'ADMIN',
          kyc_status: 'VERIFIED',
          updated_at: new Date().toISOString(),
        }),
      }
    );

    if (!patchRes.ok) {
      const body = await patchRes.text();
      throw new Error(`Failed to update public.users row: ${patchRes.status} ${body}`);
    }

    return;
  }

  const now = new Date().toISOString();
  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify({
      id: userId,
      email: ADMIN_EMAIL,
      display_name: ADMIN_DISPLAY_NAME,
      role: 'ADMIN',
      kyc_status: 'VERIFIED',
      created_at: now,
      updated_at: now,
    }),
  });

  if (!insertRes.ok) {
    const body = await insertRes.text();
    throw new Error(`Failed to insert public.users row: ${insertRes.status} ${body}`);
  }
}

async function main() {
  const userId = await ensureAuthUser();
  await ensurePublicUserRow(userId);

  console.log('Trade admin ensured successfully');
  console.log(`email: ${ADMIN_EMAIL}`);
  console.log('role: ADMIN');
}

main().catch((err) => {
  console.error('seed:admin failed:', err.message || err);
  process.exit(1);
});
