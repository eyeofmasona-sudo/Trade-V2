import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Clock, Search, Filter } from 'lucide-react';
import { useTradingStore } from '../../stores/tradingStore';
import { useTradingContext } from '../../contexts/TradingContext';

export const Watchlist = () => {
  const { setCurrentPair } = useTradingContext();
  const prices = useTradingStore(s => s.prices);
  const priceChanges = useTradingStore(s => s.priceChanges);

  const defaultSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'EURUSD', 'GBPUSD', 'XAUUSD'];
  
  const items = defaultSymbols.map(sym => {
    const p = prices[sym];
    const c = priceChanges[sym];
    const isCrypto = sym.endsWith('USDT');
    // Format presentation symbol
    const displaySym = isCrypto ? sym.replace('USDT', ' / USDT') : `${sym.substring(0,3)} / ${sym.substring(3)}`;
    
    return {
      id: sym,
      symbol: displaySym,
      price: p ? p.toLocaleString(undefined, { maximumFractionDigits: isCrypto ? 2 : 4 }) : '...',
      change: c ? `${c > 0 ? '+' : ''}${c.toFixed(2)}%` : '...',
      trend: c && c >= 0 ? 'up' : 'down'
    };
  });

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-white tracking-wide">Watchlist</h3>
        <div className="flex gap-2">
           <button className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-white transition-colors"><Search size={14}/></button>
           <button className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-white transition-colors"><Filter size={14}/></button>
        </div>
      </div>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest grid grid-cols-12 mb-4 px-2">
         <span className="col-span-6">Symbol</span>
         <span className="col-span-3 text-right">Price</span>
         <span className="col-span-3 text-right">Change</span>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <motion.div 
            key={item.id}
            onClick={() => setCurrentPair(item.id)}
            whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.02)' }}
            className="grid grid-cols-12 items-center px-2 py-3 rounded-xl cursor-pointer transition-all border border-transparent hover:border-white/5"
          >
            <div className="col-span-6 flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-[#111] border border-white/5 flex items-center justify-center text-xs font-bold text-accent-primary">
                  {item.symbol.charAt(0)}
               </div>
               <span className="text-xs font-bold text-slate-200">{item.symbol}</span>
            </div>
            <span className="col-span-3 text-right text-xs font-mono text-slate-300">{item.price}</span>
            <span className={`col-span-3 text-right text-xs font-bold ${item.trend === 'up' ? 'text-accent-secondary' : 'text-accent-quaternary'}`}>
               {item.change}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const MarketMovers = () => {
  const tabs = ['Top Gainers', 'Top Losers', 'Top Volume'];
  const movers = [
    { symbol: 'SOL / USDT', price: '184.45', change: '+8.25%', trend: 'up' },
    { symbol: 'ADA / USDT', price: '0.6123', change: '+6.75%', trend: 'up' },
    { symbol: 'AVAX / USDT', price: '41.23', change: '+5.18%', trend: 'up' },
    { symbol: 'LINK / USDT', price: '16.45', change: '+4.33%', trend: 'up' },
  ];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-sm font-bold text-white tracking-wide">Market Movers</h3>
         <select className="bg-transparent text-[10px] font-bold text-slate-500 outline-none">
            <option>24h</option>
         </select>
      </div>
      <div className="flex p-1 bg-[#111] rounded-xl mb-6">
         {tabs.map((tab, i) => (
           <button key={tab} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${i === 0 ? 'bg-accent-primary/20 text-accent-primary' : 'text-slate-500 hover:text-white'}`}>
              {tab}
           </button>
         ))}
      </div>
      <div className="space-y-4">
        {movers.map((mover) => (
          <div key={mover.symbol} className="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-secondary shadow-neon-emerald group-hover:scale-150 transition-transform" />
                <span className="text-xs font-bold text-slate-200 group-hover:text-accent-primary transition-colors">{mover.symbol}</span>
             </div>
             <div className="text-right">
                <p className="text-xs font-bold text-white">{mover.price}</p>
                <p className="text-[10px] font-bold text-accent-secondary">{mover.change}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RecentActivity = () => {
  const activities = [
    { label: 'Deposit Successful', time: '2 min ago', value: '+$ 1,500.00', color: 'text-accent-secondary' },
    { label: 'BTC / USDT Order Filled', time: '5 min ago', value: 'Buy 0.02 BTC', color: 'text-accent-primary' },
    { label: 'KYC Verification Approved', time: '10 min ago', value: 'Level 2 Active', color: 'text-accent-secondary' },
    { label: 'Withdrawal Completed', time: '1 hour ago', value: '-$ 800.00', color: 'text-accent-quaternary' },
  ];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-sm font-bold text-white tracking-wide">Recent Activity</h3>
         <button className="text-[10px] font-bold text-accent-primary hover:underline">View All</button>
      </div>
      <div className="space-y-6">
        {activities.map((act, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
               <Clock size={14} className="text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-white mb-0.5 truncate">{act.label}</p>
               <p className="text-[10px] font-bold text-slate-500">{act.time}</p>
            </div>
            <span className={`text-[10px] font-bold ${act.color}`}>{act.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
