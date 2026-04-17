
// import React from 'react';
// import {
//   AreaChart, Area,
//   BarChart, Bar,
//   PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid,
//   Tooltip, Legend, ResponsiveContainer,
// } from 'recharts';
// import { useGetSummaryQuery } from '../../features/LeadsSummary/SummarySlice';

// const PIE_COLORS   = ['#4F8EF7','#10B981','#F97316','#8B5CF6','#F59E0B','#EF4444','#06B6D4','#EC4899'];
// const FUNNEL_COLORS= ['#4F8EF7','#10B981','#F59E0B','#F97316'];

// // ── Custom Tooltip ───────────────────────────────────
// const CustomTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg text-sm">
//       {label && <div className="text-slate-400 mb-1">{label}</div>}
//       {payload.map((p, i) => (
//         <div key={i} style={{ color: p.color }} className="font-semibold">
//           {p.name}: {p.value}
//         </div>
//       ))}
//     </div>
//   );
// };

// // ── Stat Card ────────────────────────────────────────
// const StatCard = ({ label, value, color, icon }) => (
//   <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3 relative overflow-hidden">
//     <div style={{ background: color, width: 4, borderRadius: '99px 0 0 99px' }} className="absolute left-0 top-0 h-full" />
//     <div style={{ background: `${color}20` }} className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
//       {icon}
//     </div>
//     <div>
//       <div className="text-slate-400 text-xs uppercase tracking-widest font-medium">{label}</div>
//       <div className="text-slate-800 text-2xl font-bold leading-tight">{value ?? 0}</div>
//     </div>
//   </div>
// );

// // ── Section Title ────────────────────────────────────
// const SectionTitle = ({ children }) => (
//   <div className="flex items-center gap-2 mb-5">
//     <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
//     <span className="text-slate-800 text-base font-semibold">{children}</span>
//   </div>
// );

// // ── Card ─────────────────────────────────────────────
// const Card = ({ children }) => (
//   <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
//     {children}
//   </div>
// );

// // ── MAIN COMPONENT ───────────────────────────────────
// const Leads = () => {
//   const { data, isLoading, isError } = useGetSummaryQuery();

//   const totalLeads   = data?.totalLeads       ?? 0;
//   const stats        = data?.summary          ?? {};
//   const chartData    = data?.chartData        ?? {};
//   const leadSources  = chartData.leadSources  ?? [];
//   const projects     = chartData.projects     ?? [];
//   const funnel       = chartData.funnel       ?? [];
//   const dealStatuses = chartData.dealStatuses ?? [];
//   const monthlyTrend = chartData.monthlyTrend ?? [];

//   if (isLoading) return (
//     <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-4">
//       <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
//       <span className="text-slate-400 text-sm">Loading data...</span>
//     </div>
//   );

//   if (isError) return (
//     <div className="min-h-screen bg-slate-100 flex items-center justify-center">
//       <span className="text-red-500 text-base">⚠️ Failed to load summary data</span>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-slate-100 px-10 py-8">

//       {/* ── Header ── */}
//       <div className="flex items-end justify-between flex-wrap gap-3 mb-7">
//         <div>
//           <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Sales Intelligence</p>
//           <h1 className="text-slate-800 text-4xl font-extrabold leading-tight">Leads Dashboard</h1>
//         </div>
//         <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-2 text-blue-500 text-sm font-semibold">
//           {totalLeads} Total Leads
//         </div>
//       </div>

//       {/* ── Stat Cards ── */}
//       <div className="grid grid-cols-3 gap-4 mb-7">
//         <StatCard label="Total Leads"        value={totalLeads}              color="#4F8EF7" icon="📊" />
//         <StatCard label="Deals Done"         value={stats.doneDeals}         color="#10B981" icon="✅" />
//         <StatCard label="Nego. Failed"       value={stats.negotiationFailed} color="#EF4444" icon="❌" />
//         <StatCard label="Low Budget"         value={stats.lowBudget}         color="#F59E0B" icon="💰" />
//         <StatCard label="Not Interested"     value={stats.notInterested}     color="#F97316" icon="🚫" />
//         <StatCard label="Next Follow Up"     value={stats.nextFollowUp}      color="#8B5CF6" icon="🔔" />
//       </div>

//       {/* ── Row 1: Monthly Trend + Funnel ── */}
//       <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: '1fr 360px' }}>

//         {/* Monthly Trend */}
//         <Card>
//           <SectionTitle>Monthly Trend</SectionTitle>
//           <ResponsiveContainer width="100%" height={260}>
//             <AreaChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
//               <defs>
//                 <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%"  stopColor="#4F8EF7" stopOpacity={0.2} />
//                   <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0} />
//                 </linearGradient>
//                 <linearGradient id="gDeals" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
//                   <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
//                 </linearGradient>
//                 <linearGradient id="gSite" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%"  stopColor="#F97316" stopOpacity={0.2} />
//                   <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
//               <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 11, fill: '#94A3B8' }} />
//               <YAxis stroke="#94A3B8" tick={{ fontSize: 11, fill: '#94A3B8' }} />
//               <Tooltip content={<CustomTooltip />} />
//               <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
//               <Area type="monotone" dataKey="leads"      name="Leads"       stroke="#4F8EF7" fill="url(#gLeads)" strokeWidth={2} dot={{ r: 3, fill: '#4F8EF7' }} />
//               <Area type="monotone" dataKey="siteVisits" name="Site Visits" stroke="#F97316" fill="url(#gSite)"  strokeWidth={2} dot={{ r: 3, fill: '#F97316' }} />
//               <Area type="monotone" dataKey="deals"      name="Deals Done"  stroke="#10B981" fill="url(#gDeals)" strokeWidth={2} dot={{ r: 3, fill: '#10B981' }} />
//             </AreaChart>
//           </ResponsiveContainer>
//         </Card>

//         {/* Conversion Funnel */}
//         <Card>
//           <SectionTitle>Conversion Funnel</SectionTitle>
//           <div className="flex flex-col gap-4 mt-2">
//             {funnel.map((item, i) => {
//               const pct = funnel[0]?.count > 0 ? Math.round((item.count / funnel[0].count) * 100) : 0;
//               return (
//                 <div key={i}>
//                   <div className="flex justify-between mb-1">
//                     <span className="text-slate-400 text-xs">{item.stage}</span>
//                     <span className="text-slate-700 text-xs font-semibold">
//                       {item.count} <span style={{ color: FUNNEL_COLORS[i] }}>({pct}%)</span>
//                     </span>
//                   </div>
//                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
//                     <div
//                       style={{
//                         width: `${pct}%`,
//                         background: FUNNEL_COLORS[i],
//                         boxShadow: `0 0 8px ${FUNNEL_COLORS[i]}80`,
//                         transition: 'width 0.6s ease',
//                       }}
//                       className="h-full rounded-full"
//                     />
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </Card>
//       </div>

//       {/* ── Row 2: Lead Sources + Deal Status + Projects ── */}
//       <div className="grid grid-cols-3 gap-5 mb-10">

//         {/* Lead Sources - Pie */}
//         <Card>
//           <SectionTitle>Lead Sources</SectionTitle>
//           <ResponsiveContainer width="100%" height={240}>
//             <PieChart>
//               <Pie data={leadSources} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" nameKey="name" paddingAngle={3}>
//                 {leadSources.map((_, i) => (
//                   <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
//                 ))}
//               </Pie>
//               <Tooltip content={<CustomTooltip />} />
//               <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
//             </PieChart>
//           </ResponsiveContainer>
//         </Card>

//         {/* Deal Status - Bar */}
//         <Card>
//           <SectionTitle>Deal Status</SectionTitle>
//           <ResponsiveContainer width="100%" height={240}>
//             <BarChart data={dealStatuses} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
//               <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 10, fill: '#94A3B8' }} angle={-35} textAnchor="end" interval={0} />
//               <YAxis stroke="#94A3B8" tick={{ fontSize: 11, fill: '#94A3B8' }} />
//               <Tooltip content={<CustomTooltip />} />
//               <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
//                 {dealStatuses.map((_, i) => (
//                   <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
//                 ))}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </Card>

//         {/* Projects - Horizontal Bar */}
//         <Card>
//           <SectionTitle>Projects</SectionTitle>
//           <ResponsiveContainer width="100%" height={240}>
//             <BarChart data={projects} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
//               <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 11, fill: '#94A3B8' }} />
//               <YAxis type="category" dataKey="name" stroke="#94A3B8" tick={{ fontSize: 10, fill: '#94A3B8' }} width={110} />
//               <Tooltip content={<CustomTooltip />} />
//               <Bar dataKey="value" name="Leads" radius={[0, 6, 6, 0]}>
//                 {projects.map((_, i) => (
//                   <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
//                 ))}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Leads;
