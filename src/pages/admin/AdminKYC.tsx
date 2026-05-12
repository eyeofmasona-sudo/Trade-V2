import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserX, Check, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

export const AdminKYC = () => {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('kyc_status', 'PENDING');
    if (data) {
      setQueue(data);
    }
  };

  const handleApprove = async (id: string, email: string) => {
    const { error } = await supabase.from('users').update({ kyc_status: 'VERIFIED' }).eq('id', id);
    if (!error) {
      toast.success(`KYC Approved for ${email}`);
      fetchQueue();
    }
  };

  const handleReject = async (id: string, email: string) => {
    if(!confirm('Reject KYC?')) return;
    const { error } = await supabase.from('users').update({ kyc_status: 'REJECTED' }).eq('id', id);
    if (!error) {
      toast.success(`KYC Rejected for ${email}`);
      fetchQueue();
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">KYC Review Queue</h2>
          <p className="text-sm text-slate-500">Approve or reject pending identity verifications.</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search request ID..." 
            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500/50 w-64 transition-all"
          />
        </div>
      </div>
      
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5">
              <th className="px-6 py-4">Request ID</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Submission Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {queue.map(item => (
              <tr key={item.id} className="hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-mono text-slate-400 text-xs">{item.id.substring(0,8)}...</td>
                <td className="px-6 py-4 font-bold text-white">{item.email}</td>
                <td className="px-6 py-4 text-slate-400">{new Date(item.updated_at || item.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                   <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500">
                      Pending
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleApprove(item.id, item.email)} className="p-2 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"><Check size={16} /></button>
                    <button onClick={() => handleReject(item.id, item.email)} className="p-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><UserX size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {queue.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                  No pending KYC requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
