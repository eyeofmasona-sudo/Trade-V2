import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, History, PieChart, Download, Upload, ShieldCheck, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { TransferModal } from './TransferModal';

const performanceData = [
  { name: 'Mon', value: 12400 },
  { name: 'Tue', value: 13200 },
  { name: 'Wed', value: 12800 },
  { name: 'Thu', value: 14500 },
  { name: 'Fri', value: 15100 },
  { name: 'Sat', value: 14800 },
  { name: 'Sun', value: 16420 },
];

const allocationData = [
  { name: 'BTC', value: 45, color: '#F7931A' },
  { name: 'ETH', value: 30, color: '#627EEA' },
  { name: 'SOL', value: 15, color: '#14F195' },
  { name: 'USDT', value: 10, color: '#26A17B' },
];

const transactions = [
  { id: 'tx-1', type: 'Deposit', asset: 'USDT', amount: '+5,000.00', status: 'Completed', time: 'Today, 14:20', hash: '0x8f...3a1' },
  { id: 'tx-2', type: 'Trade', asset: 'BTC/USDT', amount: 'Buy 0.15', status: 'Completed', time: 'Yesterday, 09:15', hash: 'Internal' },
  { id: 'tx-3', type: 'Withdrawal', asset: 'ETH', amount: '-2.50', status: 'Processing', time: 'May 06, 18:40', hash: '0x2b...9c4' },
  { id: 'tx-4', type: 'Trade', asset: 'SOL/USDT', amount: 'Sell 45.0', status: 'Completed', time: 'May 05, 11:10', hash: 'Internal' },
];

export const Portfolio: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('1W');
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit');

  const openTransferModal = (type: 'deposit' | 'withdraw') => {
    setTransferType(type);
    setTransferModalOpen(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 relative">
      <TransferModal 
        isOpen={transferModalOpen} 
        onClose={() => setTransferModalOpen(false)} 
        type={transferType} 
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
            <Wallet className="text-accent-primary" size={28} />
            Wallet & Portfolio
          </h2>
          <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
            <ShieldCheck size={14} className="text-accent-secondary" />
            Simulated Trading Environment - Vault Secured
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button 
            onClick={() => openTransferModal('deposit')}
            className="px-6 py-2.5 bg-accent-secondary/10 border border-accent-secondary/30 rounded-xl text-xs font-bold text-accent-secondary flex items-center gap-2 hover:bg-accent-secondary hover:text-black transition-all shadow-neon-emerald"
          >
            <Download size={14} /> Deposit
          </button>
          <button 
            onClick={() => openTransferModal('withdraw')}
            className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center gap-2 hover:bg-white/10 transition-all"
          >
            <Upload size={14} /> Withdraw
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Balances & Chart */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Balance */}
            <div className="glass-card p-6 border-accent-primary/20 md:col-span-2 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Estimated Balance</p>
               <div className="flex items-baseline gap-4 mb-4">
                  <h3 className="text-4xl font-bold text-white tracking-tight">$16,420.50</h3>
                  <span className="text-sm font-bold text-accent-secondary flex items-center gap-1 bg-accent-secondary/10 px-2 py-0.5 rounded-lg border border-accent-secondary/20">
                    <ArrowUpRight size={14} /> +12.4%
                  </span>
               </div>
               <div className="flex items-center gap-6 mt-6">
                  <div>
                     <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Available Margin</p>
                     <p className="text-white font-mono font-bold">$4,250.00</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                     <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">In Positions</p>
                     <p className="text-white font-mono font-bold">$12,170.50</p>
                  </div>
               </div>
            </div>

            {/* PNL Today */}
            <div className="glass-card p-6 border-accent-secondary/20 flex flex-col justify-center">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Today's P&L</p>
               <h3 className="text-2xl font-bold text-accent-secondary drop-shadow-[0_0_8px_rgba(0,230,118,0.3)]">+$420.69</h3>
               <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-slate-400">
                  <Activity size={12} className="text-accent-secondary" />
                  Performance optimal
               </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="glass-card p-6 holo-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Portfolio Performance</h3>
              <div className="flex items-center gap-1 bg-surface-bg p-1 rounded-lg border border-white/5">
                {['1D', '1W', '1M', 'All'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${timeframe === t ? 'bg-accent-primary text-black shadow-neon-gold' : 'text-slate-500 hover:text-white'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="currentColor" className="text-[10px] text-slate-500" tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" className="text-[10px] text-slate-500" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                    formatter={(value: number) => [`$${value}`, 'Balance']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Holdings List */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Asset Holdings</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="text-left pb-4 font-bold">Asset</th>
                    <th className="text-right pb-4 font-bold">Balance</th>
                    <th className="text-right pb-4 font-bold">Value (USD)</th>
                    <th className="text-right pb-4 font-bold">Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { name: 'Bitcoin', symbol: 'BTC', balance: '0.112', value: '$7,392.00', alloc: '45%' },
                    { name: 'Ethereum', symbol: 'ETH', balance: '1.640', value: '$4,920.00', alloc: '30%' },
                    { name: 'Solana', symbol: 'SOL', balance: '16.50', value: '$2,475.00', alloc: '15%' },
                    { name: 'Tether', symbol: 'USDT', balance: '1,633.50', value: '$1,633.50', alloc: '10%' },
                  ].map((asset, i) => (
                    <tr key={i} className="group hover:bg-white/5 transition-all">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-bg border border-white/10 flex items-center justify-center font-bold text-white text-xs">{asset.symbol[0]}</div>
                          <div>
                            <p className="font-bold text-white text-sm group-hover:text-accent-primary transition-colors">{asset.symbol}</p>
                            <p className="text-[10px] text-slate-500">{asset.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right font-mono text-sm text-slate-300">{asset.balance}</td>
                      <td className="py-4 text-right font-mono text-sm text-white font-bold">{asset.value}</td>
                      <td className="py-4 text-right text-xs text-accent-primary">{asset.alloc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          {/* Allocation Pie Chart */}
          <div className="glass-card p-6 text-center">
             <div className="flex items-center gap-3 mb-6">
               <PieChart className="text-accent-primary" size={20} />
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">Allocation Matrix</h3>
             </div>
             
             <div className="h-[220px] w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                 <RechartsPieChart>
                   <Pie
                     data={allocationData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     {allocationData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                     itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                     formatter={(value: number) => [`${value}%`, 'Allocation']}
                   />
                 </RechartsPieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Total Value</span>
                  <span className="text-sm font-bold text-white">$16.4k</span>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mt-4">
               {allocationData.map(asset => (
                 <div key={asset.name} className="flex justify-between items-center bg-[#111] p-2 rounded-lg border border-white/5">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full shadow-neon-blue" style={{ backgroundColor: asset.color }} />
                     <span className="text-xs font-bold text-slate-300">{asset.name}</span>
                   </div>
                   <span className="text-xs font-mono">{asset.value}%</span>
                 </div>
               ))}
             </div>
          </div>

          {/* Transaction History */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <History className="text-accent-secondary" size={20} />
                 <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('transactions')}</h3>
              </div>
              <button onClick={() => navigate('/transactions')} className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors">View All</button>
            </div>

            <div className="space-y-4">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      tx.type === 'Deposit' ? 'bg-accent-secondary/10 text-accent-secondary' :
                      tx.type === 'Withdrawal' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-accent-primary/10 text-accent-primary'
                    }`}>
                      {tx.type === 'Deposit' ? <Upload size={14} /> : 
                       tx.type === 'Withdrawal' ? <Download size={14} /> : 
                       <TrendingUp size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{tx.type} {tx.asset}</p>
                      <p className="text-[10px] text-slate-400">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold font-mono ${
                      tx.amount.startsWith('+') ? 'text-accent-secondary' : 
                      tx.amount.startsWith('-') ? 'text-white' : 'text-accent-primary'
                    }`}>{tx.amount}</p>
                    <p className="text-[10px] text-slate-500">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
