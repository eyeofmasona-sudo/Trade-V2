import React, { useState } from 'react';
import { Search, ArrowDownRight, CheckCircle2, Clock, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { useTransactionStore, TxStatus } from '../../stores/transactionStore';
import { toast } from 'sonner';

import { useTradingStore } from '../../stores/tradingStore';

export const AdminDeposits = () => {
  const { requests, updateRequestStatus, updateRequestInstructions, addNotification } = useTransactionStore();
  const deposits = requests.filter(r => r.type === 'Deposit');
  const [instructionTexts, setInstructionTexts] = useState<Record<string, string>>({});

  const handleAction = (id: string, status: TxStatus, amount: number, user: string) => {
    updateRequestStatus(id, status);
    addNotification(`Deposit request for ${amount} from ${user} marked as ${status}`);
    toast.success(`Request marked as ${status}`);
    
    if (status === 'Approved' || status === 'Completed') {
      useTradingStore.getState().addBalance(amount);
      toast.success(`Funds added to user's balance!`);
    }
  };

  const handleSendInstructions = (id: string) => {
    const text = instructionTexts[id];
    if (!text || !text.trim()) {
      toast.error('Instructions cannot be empty');
      return;
    }
    updateRequestInstructions(id, text);
    toast.success('Instructions sent to client');
    setInstructionTexts(prev => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Deposits</h2>
          <p className="text-sm text-slate-500">Manage user deposit requests.</p>
        </div>
      </div>
      
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Amount & Method</th>
              <th className="px-6 py-4">Status & Instructions</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-xs text-slate-300">
            {deposits.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No deposit requests found</td>
              </tr>
            ) : deposits.map(req => (
              <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-sans font-bold text-white">{req.userName}</div>
                  <div className="text-[10px] text-slate-500">{req.userEmail}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-white font-bold">{req.amount.toLocaleString()} {req.currency}</div>
                  <div className="text-[10px] text-slate-500 uppercase">{req.method || 'Unknown'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    req.status === 'Completed' || req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                    req.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                    req.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-blue-500/10 text-blue-500' // Processing
                  } mb-2 inline-block`}>
                    {req.status}
                  </span>
                  {req.instructions ? (
                    <div className="text-[10px] text-slate-400 max-w-[200px] truncate"><span className="text-accent-primary">Instr:</span> {req.instructions}</div>
                  ) : (
                    <div className="flex flex-col gap-1 w-[200px]">
                      <input 
                        type="text" 
                        placeholder="Send IBAN/instructions..."
                        value={instructionTexts[req.id] || ''}
                        onChange={e => setInstructionTexts(p => ({ ...p, [req.id]: e.target.value }))}
                        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-accent-primary/50"
                      />
                      {instructionTexts[req.id] && (
                        <button onClick={() => handleSendInstructions(req.id)} className="bg-accent-primary/20 text-accent-primary px-2 py-1 flex items-center justify-center gap-1 rounded text-[10px] uppercase font-bold hover:bg-accent-primary hover:text-black">
                          <MessageSquare size={10} /> Send
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-500">{new Date(req.date).toLocaleString()}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleAction(req.id, 'Approved', req.amount, req.userName)} className="px-2 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded font-sans font-bold text-[10px] uppercase">Approve</button>
                  <button onClick={() => handleAction(req.id, 'Rejected', req.amount, req.userName)} className="px-2 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded font-sans font-bold text-[10px] uppercase">Reject</button>
                  <button onClick={() => handleAction(req.id, 'Processing', req.amount, req.userName)} className="px-2 py-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded font-sans font-bold text-[10px] uppercase">Processing</button>
                  <button onClick={() => handleAction(req.id, 'Completed', req.amount, req.userName)} className="px-2 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded font-sans font-bold text-[10px] uppercase">Comp</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
