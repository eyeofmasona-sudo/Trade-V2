import React from 'react';
import { useTransactionStore, TxStatus } from '../../stores/transactionStore';
import { toast } from 'sonner';

export const AdminWithdrawals = () => {
  const { requests, updateRequestStatus, addNotification } = useTransactionStore();
  const withdrawals = requests.filter(r => r.type === 'Withdrawal');

  const handleAction = (id: string, status: TxStatus, amount: number, user: string) => {
    updateRequestStatus(id, status);
    addNotification(`Withdrawal request for ${amount} from ${user} marked as ${status}`);
    toast.success(`Request marked as ${status}`);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Withdrawals</h2>
          <p className="text-sm text-slate-500">Manage user withdrawal requests.</p>
        </div>
      </div>
      
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-xs text-slate-300">
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No withdrawal requests found</td>
              </tr>
            ) : withdrawals.map(req => (
              <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-sans font-bold text-white">{req.userName}</div>
                  <div className="text-[10px] text-slate-500">{req.userEmail}</div>
                </td>
                <td className="px-6 py-4 text-white font-bold">{req.amount.toLocaleString()} {req.currency}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    req.status === 'Completed' || req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                    req.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                    req.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-blue-500/10 text-blue-500' // Processing
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{new Date(req.date).toLocaleString()}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleAction(req.id, 'Approved', req.amount, req.userName)} className="px-2 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded font-sans font-bold text-[10px] uppercase">Approve</button>
                  <button onClick={() => handleAction(req.id, 'Rejected', req.amount, req.userName)} className="px-2 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded font-sans font-bold text-[10px] uppercase">Reject</button>
                  <button onClick={() => handleAction(req.id, 'Processing', req.amount, req.userName)} className="px-2 py-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded font-sans font-bold text-[10px] uppercase">Mark Processing</button>
                  <button onClick={() => handleAction(req.id, 'Completed', req.amount, req.userName)} className="px-2 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded font-sans font-bold text-[10px] uppercase">Mark Completed</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
