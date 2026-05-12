import { useEffect } from 'react';
import { useTradingStore } from '../stores/tradingStore';
import { useForexStore } from '../stores/forexStore';

// Major crypto pairs
const CRYPTO_PAIRS = [
  'btcusdt', 'ethusdt', 'solusdt', 'bnbusdt', 'xrpusdt', 'adausdt', 'dogeusdt',
  'avaxusdt', 'dotusdt', 'linkusdt', 'ltcusdt', 'trxusdt', 'tonusdt', 'bchusdt',
  'shibusdt', 'pepeusdt', 'aptusdt', 'arbusdt', 'opusdt', 'suiusdt', 'nearusdt',
  'atomusdt', 'filusdt', 'icpusdt', 'uniusdt', 'etcusdt', 'injusdt', 'renderusdt',
  'seiusdt', 'fetusdt'
];

export const useMarketEngine = () => {
  const { updatePrice } = useTradingStore();
  const { tickSimulation, pairs: forexPairs } = useForexStore();

  // Binance WS
  useEffect(() => {
    let ws: WebSocket | null = null;
    
    const connectWS = () => {
      // Connect to combined stream for all tickers
      // Using !ticker@arr to get all 24hr ticker stats without passing a huge URL
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/!ticker@arr`);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            const lowerSymbol = item.s.toLowerCase();
            // Only process if it's in our list to save CPU
            if (CRYPTO_PAIRS.includes(lowerSymbol)) {
              const currentPrice = parseFloat(item.c);
              const priceChangePercent24h = parseFloat(item.P);
              updatePrice(item.s.toUpperCase(), currentPrice, priceChangePercent24h);
            }
          });
        }
      };

      ws.onerror = (e) => {
        console.error("Binance WS Global Error", e);
      };
      
      ws.onclose = () => {
         setTimeout(connectWS, 5000); // Reconnect
      }
    };

    connectWS();

    return () => {
      if (ws) ws.close();
    };
  }, [updatePrice]);

  // Forex Simulation Tick
  useEffect(() => {
    const interval = setInterval(() => {
      tickSimulation();
      
      // Sync forex prices to trading store so charts/orders work seamlessly
      const currentForexPairs = useForexStore.getState().pairs;
      Object.values(currentForexPairs).forEach(fp => {
         updatePrice(fp.symbol, fp.price, fp.change24h);
      });
      
    }, 1000); // 1 second ticks for forex simulation
    
    return () => clearInterval(interval);
  }, [tickSimulation, updatePrice]);
};
