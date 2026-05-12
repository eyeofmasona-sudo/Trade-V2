import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, RefreshCw, DollarSign } from 'lucide-react';
import { useTransactionStore } from '../../stores/transactionStore';
import { supabase } from '../../lib/supabase';

export const Transactions = () => {
  const { t } = useTranslation('common');
  const [filter, setFilter] = useState('All');
  const { requests } = useTransactionStore();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Format real requests
  const myRequests = requests
    .filter(req => req.userId === (user?.id || 'unknown') || !user)
    .map(req => ({
      ...req,
      asset: req.currency,
      tx: req.id.slice(0, 8),
      date: new Date(req.date).toLocaleString(),
      // Amount should be negative for withdrawals
      valAmount: req.type === 'Withdrawal' ? -req.amount : req.amount
    }));

  // Mock data
  const mockTransactions = [
    { id: '1', type: 'Deposit', asset: 'USDT', amount: 5000, valAmount: 5000, status: 'Completed', date: '2024-03-20 14:30', tx: '0xabc...123' },
    { id: '2', type: 'Trade', asset: 'BTC', amount: -0.5, valAmount: -0.5, status: 'Completed', date: '2024-03-19 10:15', tx: '-' },
    { id: '3', type: 'Withdrawal', asset: 'ETH', amount: -2.1, valAmount: -2.1, status: 'Pending', date: '2024-03-18 16:45', tx: '0xdef...456' },
    { id: '4', type: 'Fee', asset: 'USDT', amount: -12.5, valAmount: -12.5, status: 'Completed', date: '2024-03-18 16:45', tx: '-' },
  ];

  const transactions = [...myRequests, ...mockTransactions].filter((tx: any) => {
    if (filter === 'All') return true;
    if (filter === 'Deposits' && tx.type === 'Deposit') return true;
    if (filter === 'Withdrawals' && tx.type === 'Withdrawal') return true;
    if (filter === 'Trades' && tx.type === 'Trade') return true;
    if (filter === 'Fees' && tx.type === 'Fee') return true;
    return false;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-500';
      case 'Pending':
        return 'bg-orange-500/10 text-orange-500';
      case 'Processing':
        return 'bg-blue-500/10 text-blue-500';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-500';
      default:
        return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <div className="p-4 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">{t('transactions')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-8">
          <div className="md:col-span-8 flex gap-2">
            {['All', 'Deposits', 'Withdrawals', 'Trades', 'Fees'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-accent-primary text-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="md:col-span-4 relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
             <input type="text" placeholder={t('search')} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none" />
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5">
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Transaction</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {tx.type === 'Deposit' && <ArrowDownLeft size={14} className="text-accent-secondary" />}
                       {tx.type === 'Withdrawal' && <ArrowUpRight size={14} className="text-accent-quaternary" />}
                       {tx.type === 'Trade' && <RefreshCw size={14} className="text-accent-primary" />}
                       {tx.type === 'Fee' && <DollarSign size={14} className="text-slate-500" />}
                       <span className="font-bold text-white">{tx.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-400">{tx.asset}</td>
                  <td className={`px-6 py-4 font-mono font-bold ${tx.valAmount > 0 ? 'text-accent-secondary' : 'text-accent-quaternary'}`}>
                    {tx.valAmount > 0 ? '+' : ''}{tx.valAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(tx.status)}`}>
                       {tx.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{tx.date}</td>
                  <td className="px-6 py-4 text-xs font-mono text-blue-400 hover:underline cursor-pointer">{tx.tx}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
