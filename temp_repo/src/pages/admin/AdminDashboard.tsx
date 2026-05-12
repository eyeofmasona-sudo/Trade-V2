import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Users, Activity, Terminal, AlertTriangle, CheckCircle2, XCircle, Search, Filter, SlidersHorizontal, Server, Zap, Database, Globe2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CRMSyncPanel } from './CRMSyncPanel';
import { MarketControlPanel } from './MarketControlPanel';

const sysData = [
  { time: '00:00', load: 45, volume: 1.2 },
  { time: '04:00', load: 55, volume: 1.8 },
  { time: '08:00', load: 85, volume: 4.5 },
  { time: '12:00', load: 65, volume: 3.2 },
  { time: '16:00', load: 90, volume: 5.1 },
  { time: '20:00', load: 75, volume: 2.8 },
  { time: '24:00', load: 60, volume: 2.1 },
];

const mockUsers = [
  { id: 'usr_001', name: 'Mike Johnson', email: 'mike@example.com', kyc: 'Verified', xp: 88450, risk: 'Low', status: 'Active' },
  { id: 'usr_002', name: 'Sarah Connor', email: 'sarah@example.com', kyc: 'Pending', xp: 12400, risk: 'Medium', status: 'Active' },
  { id: 'usr_003', name: 'John Doe', email: 'john@example.com', kyc: 'Rejected', xp: 450, risk: 'High', status: 'Suspended' },
  { id: 'usr_004', name: 'Emma Wilson', email: 'emma@example.com', kyc: 'Verified', xp: 145000, risk: 'Low', status: 'Active' },
];

const crmLogs = [
  { id: 1, time: '14:24:05', event: 'SYNC_SUCCESS', details: 'User usr_004 updated in HubSpot CRM', status: 'OK' },
  { id: 2, time: '14:22:11', event: 'WEBHOOK_FAIL', details: 'Failed to push KYC doc data to external verify API', status: 'ERR' },
  { id: 3, time: '14:20:00', event: 'CRON_EXEC', details: 'XP decay calculation completed', status: 'OK' },
  { id: 4, time: '14:15:33', event: 'AUTH_ALERT', details: 'Multiple failed logins for usr_003', status: 'WARN' },
];

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'kyc' | 'crm' | 'system' | 'forex'>('overview');

  return (
    <div className="max-w-[1700px] mx-auto space-y-8 animate-in fade-in duration-500 relative">
      {/* Background ambients for "Admin" feel (darker, red/orange hues for power/alerts) */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-red-900/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
            <Terminal className="text-rose-500" size={28} />
            Command Center
          </h2>
          <p className="text-sm text-slate-400 mt-2 flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse" />
            SYS_STATUS: NOMINAL | <span className="text-accent-primary">ROOT_ACCESS_GRANTED</span>
          </p>
        </div>
        <div className="flex flex-wrap bg-[#111] border border-white/5 p-1 rounded-xl">
          {['overview', 'users', 'kyc', 'crm', 'forex', 'system'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
                : 'text-slate-500 hover:text-white'
              }`}
            >
              {tab === 'forex' ? 'Market Control' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 relative z-10">
        {activeTab === 'overview' && (
          <>
            {/* Global Metrics Row */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Active Sessions', value: '14,245', change: '+12%', icon: Users, color: 'text-accent-secondary' },
                { label: 'Sim Volume (24h)', value: '$45.2M', change: '+5.4%', icon: Activity, color: 'text-accent-primary' },
                { label: 'Pending KYC', value: '342', change: 'Requires Action', icon: ShieldAlert, color: 'text-orange-500' },
                { label: 'Server Load', value: '65%', change: 'Stable', icon: Server, color: 'text-rose-400' }
              ].map((metric, i) => {
                const Icon = metric.icon;
                return (
                  <div key={i} className="glass-card p-6 border-white/5 relative overflow-hidden group">
                     <div className={`absolute top-0 right-0 w-24 h-24 bg-current opacity-5 rounded-full blur-2xl pointer-events-none ${metric.color}`} />
                     <div className="flex justify-between items-start mb-4">
                       <div className={`p-2 rounded-xl bg-white/5 ${metric.color}`}>
                         <Icon size={20} />
                       </div>
                     </div>
                     <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{metric.label}</h4>
                     <p className="text-2xl font-bold font-mono text-white mb-2">{metric.value}</p>
                     <p className={`text-[10px] font-bold ${metric.change.includes('+') ? 'text-accent-secondary' : metric.change.includes('Action') ? 'text-orange-500' : 'text-slate-400'}`}>
                       {metric.change}
                     </p>
                  </div>
                )
              })}
            </div>

            {/* Main Graphs & Logs */}
            <div className="col-span-12 xl:col-span-8 space-y-6">
              <div className="glass-card p-6 border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Activity size={18} className="text-rose-500" /> Infrastructure Load
                  </h3>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sysData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="time" stroke="currentColor" className="text-[10px] text-slate-500" tickLine={false} axisLine={false} />
                      <YAxis stroke="currentColor" className="text-[10px] text-slate-500" tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontFamily: 'monospace' }}
                        itemStyle={{ color: '#f43f5e', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="load" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Geographic Activity Map (Mockured) */}
              <div className="glass-card p-6 border-white/5 min-h-[300px] relative overflow-hidden flex flex-col justify-center items-center text-center">
                 <Globe2 size={120} className="text-white/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                 <div className="relative z-10 w-full">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest text-left mb-6">Global Node Activity</h3>
                    <div className="grid grid-cols-3 gap-4">
                       <div className="p-4 bg-[#111]/80 backdrop-blur rounded-xl border border-white/5 text-left">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">EU_WEST_1</p>
                          <p className="text-accent-secondary text-sm font-mono font-bold">12ms - Optimal</p>
                       </div>
                       <div className="p-4 bg-[#111]/80 backdrop-blur rounded-xl border border-white/5 text-left">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">US_EAST_2</p>
                          <p className="text-accent-secondary text-sm font-mono font-bold">24ms - Optimal</p>
                       </div>
                       <div className="p-4 bg-orange-500/10 backdrop-blur rounded-xl border border-orange-500/20 text-left">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">AP_SOUTHEAST_1</p>
                          <p className="text-orange-500 text-sm font-mono font-bold">142ms - Degraded</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Right Column: CRM Sync & Alerts */}
            <div className="col-span-12 xl:col-span-4 space-y-6">
              {/* Alert Center */}
              <div className="glass-card p-6 border-orange-500/20">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-orange-500" /> Active Alerts
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-3">
                    <ShieldAlert size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white mb-1">High Risk Account Detected</p>
                      <p className="text-[10px] text-slate-400 font-mono">usr_003 flagged for velocity limits</p>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl flex gap-3">
                    <Database size={16} className="text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white mb-1">Database Replication Lag</p>
                      <p className="text-[10px] text-slate-400 font-mono">Replica read behind master by 1.2s</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Stream */}
              <div className="glass-card flex flex-col h-[480px]">
                <div className="p-6 border-b border-white/5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Zap size={18} className="text-accent-primary" /> Live Event Stream
                  </h3>
                </div>
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar font-mono text-xs space-y-2">
                  {crmLogs.map((log) => (
                    <div key={log.id} className="p-2 hover:bg-white/5 rounded transition-colors group border border-transparent hover:border-white/5 flex gap-3">
                      <span className="text-slate-500 w-16">{log.time}</span>
                      <div className="flex-1">
                        <p className={`font-bold mb-1 ${
                          log.status === 'OK' ? 'text-accent-secondary' : 
                          log.status === 'WARN' ? 'text-orange-500' : 'text-rose-500'
                        }`}>[{log.event}]</p>
                        <p className="text-slate-400">{log.details}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-2 text-slate-600 animate-pulse">Awaiting events...</div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="col-span-12 glass-card p-6 border-white/5">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Users size={18} className="text-accent-primary" /> User Directory
               </h3>
               <div className="flex gap-3">
                  <div className="relative">
                     <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                     <input type="text" placeholder="Search UUID, email..." className="bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-accent-primary focus:bg-white/5 text-white w-64" />
                  </div>
                  <button className="p-2 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><Filter size={16} /></button>
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="text-left pb-4">User</th>
                    <th className="text-left pb-4">UUID</th>
                    <th className="text-left pb-4">KYC Status</th>
                    <th className="text-right pb-4">XP Level / Balance</th>
                    <th className="text-center pb-4">Risk</th>
                    <th className="text-right pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mockUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-white/5 transition-all">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-surface-bg border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                             {user.name.charAt(0)}
                           </div>
                           <div>
                             <p className="text-sm font-bold text-white group-hover:text-accent-primary transition-colors">{user.name}</p>
                             <p className="text-[10px] text-slate-500">{user.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-mono text-slate-400">{user.id}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border ${
                          user.kyc === 'Verified' ? 'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary' :
                          user.kyc === 'Pending' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                          'bg-rose-500/10 border-rose-500/20 text-rose-500'
                        }`}>
                          {user.kyc}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <p className="text-xs font-bold text-white font-mono">{user.xp.toLocaleString()} XP</p>
                        <p className="text-[10px] text-slate-500">Tier: {user.xp > 100000 ? 'Diamond' : user.xp > 50000 ? 'Gold' : 'Silver'}</p>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${
                          user.risk === 'Low' ? 'text-accent-secondary' :
                          user.risk === 'Medium' ? 'text-orange-500' : 'text-rose-500'
                        }`}>
                          {user.risk}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                         <div className="flex justify-end gap-2">
                            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-white transition-colors">Manage</button>
                            {user.status === 'Suspended' ? (
                              <button className="px-3 py-1.5 bg-accent-secondary/10 hover:bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/20 rounded text-[10px] font-bold transition-colors">Unban</button>
                            ) : (
                              <button className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded text-[10px] font-bold transition-colors">Suspend</button>
                            )}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'crm' && (
          <CRMSyncPanel />
        )}

        {activeTab === 'forex' && (
          <MarketControlPanel />
        )}
      </div>
    </div>
  );
};
