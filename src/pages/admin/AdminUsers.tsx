import React from 'react';
import { Search, Filter, UserMinus, Shield, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const mockUsers: any[] = [];

export const AdminUsers = () => {
  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">User Directory</h2>
          <p className="text-sm text-slate-500">Manage all registered users and their permissions.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search UUID, email, name..." 
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500/50 w-80 transition-all"
            />
          </div>
          <button className="p-2 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5">
              <th className="px-6 py-4">Identity</th>
              <th className="px-6 py-4">UUID</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">KYC Status</th>
              <th className="px-6 py-4">System Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-xs">
            {mockUsers.map(user => (
              <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-bg border border-white/10 flex items-center justify-center font-bold text-white text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-rose-500 transition-colors">{user.name}</p>
                      <p className="text-[10px] text-slate-500 italic mt-0.5">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400">{user.id}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                    user.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-500' :
                    user.role === 'PRO' ? 'bg-accent-primary/10 text-accent-primary' :
                    'bg-white/5 text-slate-500'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.kyc === 'Verified' ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Shield size={12} className="text-slate-600" />}
                    <span className={user.kyc === 'Verified' ? 'text-emerald-500' : 'text-slate-500'}>{user.kyc}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className={user.status === 'Active' ? 'text-emerald-500' : 'text-rose-500'}>{user.status}</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Edit Permissions">
                         <Shield size={16} />
                      </button>
                      <button 
                         onClick={() => {
                           if(window.confirm(`Are you sure you want to suspend the user: ${user.name}?`)) toast.success(`User ${user.name} suspended`);
                         }}
                         className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" 
                         title="Suspend User"
                      >
                         <UserMinus size={16} />
                      </button>
                      <button 
                         onClick={() => {  
                           const val = window.prompt(`How much balance to add for ${user.name}?`);
                           if (val && !isNaN(Number(val))) {
                              if (window.confirm(`Add $${val} to ${user.name}?`)) toast.success(`Balance Added to ${user.name}`);
                           }
                         }}
                         className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" 
                         title="Add Balance"
                      >
                         <span className="font-bold text-xs">+</span>
                      </button>
                      <button 
                         onClick={() => {  
                           const val = window.prompt(`How much balance to remove from ${user.name}?`);
                           if (val && !isNaN(Number(val))) {
                              if (window.confirm(`REMOVE $${val} from ${user.name}?`)) toast.success(`Balance Removed from ${user.name}`);
                           }
                         }}
                         className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all" 
                         title="Remove Balance"
                      >
                         <span className="font-bold text-xs">-</span>
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
