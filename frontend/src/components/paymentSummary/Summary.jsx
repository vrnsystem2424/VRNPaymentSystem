// import React, { useState, useMemo } from 'react';
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   Title,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Filler,
// } from 'chart.js';
// import { Pie, Line } from 'react-chartjs-2';
// import { ArrowUpCircle, ArrowDownCircle, Wallet, ListOrdered, Calendar } from 'lucide-react';

// // Register ChartJS components
// ChartJS.register(
//   ArcElement, Tooltip, Legend, Title, 
//   CategoryScale, LinearScale, PointElement, LineElement, Filler
// );

// const Summary = () => {
//   const [period, setPeriod] = useState('all');
//   const currentDate = new Date('2026-01-15');

//   // Dummy Data
//   const dummyTransactions = [
//     { date: '2026-01-10', amount: 500, type: 'in', category: 'Salary' },
//     { date: '2026-01-05', amount: 200, type: 'out', category: 'Food' },
//     { date: '2025-12-25', amount: 1200, type: 'in', category: 'Freelance' },
//     { date: '2025-12-15', amount: 400, type: 'out', category: 'Rent' },
//     { date: '2025-11-20', amount: 800, type: 'in', category: 'Bonus' },
//     { date: '2025-10-10', amount: 150, type: 'out', category: 'Shopping' },
//     { date: '2025-08-05', amount: 1500, type: 'in', category: 'Investment' },
//   ];

//   // Logic to filter data based on period
//   const filteredData = useMemo(() => {
//     let startDate = new Date(currentDate);
//     if (period === '1y') startDate.setFullYear(currentDate.getFullYear() - 1);
//     else if (period === '6m') startDate.setMonth(currentDate.getMonth() - 6);
//     else if (period === '3m') startDate.setMonth(currentDate.getMonth() - 3);
//     else if (period === '1m') startDate.setMonth(currentDate.getMonth() - 1);
//     else startDate = new Date(0);

//     return dummyTransactions.filter(t => new Date(t.date) >= startDate);
//   }, [period]);

//   // Totals
//   const totalIn = filteredData.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
//   const totalOut = filteredData.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);
//   const balance = totalIn - totalOut;

//   // Pie Chart Data (Distribution)
//   const pieData = {
//     labels: ['Income', 'Expense'],
//     datasets: [{
//       data: [totalIn, totalOut],
//       backgroundColor: ['#10b981', '#f43f5e'],
//       hoverOffset: 10,
//       borderWidth: 0,
//     }],
//   };

//   // Line Chart Data (Trend Graph)
//   const lineData = {
//     labels: filteredData.map(t => new Date(t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })).reverse(),
//     datasets: [
//       {
//         label: 'Transaction Amount',
//         data: filteredData.map(t => t.amount).reverse(),
//         fill: true,
//         backgroundColor: 'rgba(59, 130, 246, 0.1)',
//         borderColor: '#3b82f6',
//         tension: 0.4,
//         pointRadius: 4,
//       }
//     ],
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans">
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
//         <div>
//           <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
//             <Wallet className="text-blue-600" size={32} /> Financial Overview
//           </h1>
//           <p className="text-slate-500 mt-1">Monitoring your cash flow and transactions</p>
//         </div>
        
//         {/* Modern Filter Switcher */}
//         <div className="flex bg-white shadow-sm border border-slate-200 p-1 rounded-xl">
//           {['all', '1y', '6m', '3m', '1m'].map((p) => (
//             <button
//               key={p}
//               onClick={() => setPeriod(p)}
//               className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
//                 period === p ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
//               }`}
//             >
//               {p.toUpperCase()}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Main Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//         <StatCard title="Total Incoming" amount={totalIn} color="text-emerald-600" icon={<ArrowDownCircle />} />
//         <StatCard title="Total Outgoing" amount={totalOut} color="text-rose-600" icon={<ArrowUpCircle />} />
//         <StatCard title="Net Balance" amount={balance} color="text-blue-600" icon={<Wallet />} isBalance />
//       </div>

//       {/* Charts Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
//         {/* Trend Graph */}
//         <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
//           <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
//             <Calendar size={20} className="text-blue-500" /> Transaction Trend
//           </h3>
//           <div className="h-72">
//             <Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
//           </div>
//         </div>

//         {/* Distribution Pie Chart */}
//         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
//           <h3 className="text-lg font-bold text-slate-800 mb-6 self-start">Cash Distribution</h3>
//           <div className="h-64 w-full">
//             <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
//           </div>
//         </div>
//       </div>

//       {/* Latest Transactions Table */}
//       <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
//         <div className="p-6 border-b border-slate-50 flex justify-between items-center">
//           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
//             <ListOrdered size={20} className="text-blue-500" /> Recent Activities
//           </h3>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-left">
//             <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
//               <tr>
//                 <th className="px-6 py-4">Date</th>
//                 <th className="px-6 py-4">Category</th>
//                 <th className="px-6 py-4">Type</th>
//                 <th className="px-6 py-4 text-right">Amount</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {filteredData.slice(0, 5).map((t, i) => (
//                 <tr key={i} className="hover:bg-slate-50/50 transition-colors">
//                   <td className="px-6 py-4 text-sm text-slate-600 font-medium">
//                     {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-slate-800 font-semibold">{t.category || 'General'}</td>
//                   <td className="px-6 py-4">
//                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
//                       {t.type === 'in' ? 'CREDIT' : 'DEBIT'}
//                     </span>
//                   </td>
//                   <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
//                     {t.type === 'in' ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN')}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Helper Component for Stats
// const StatCard = ({ title, amount, color, icon, isBalance }) => (
//   <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
//     <div className="flex justify-between items-start mb-4">
//       <div className={`p-3 rounded-2xl ${color.replace('text', 'bg')}/10 ${color}`}>
//         {React.cloneElement(icon, { size: 24 })}
//       </div>
//     </div>
//     <h3 className="text-slate-500 text-sm font-semibold">{title}</h3>
//     <p className={`text-3xl font-black mt-1 ${color}`}>
//       ₹{amount.toLocaleString('en-IN')}
//     </p>
//   </div>
// );

// export default Summary;


///////// //////

import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { ArrowUpCircle, ArrowDownCircle, Wallet, ListOrdered, Calendar } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  ArcElement, Tooltip, Legend, Title,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler
);

const Summary = () => {
  const [period, setPeriod] = useState('all');
  const currentDate = new Date('2026-01-15');

  // Dummy Data
  const dummyTransactions = [
    { date: '2026-01-10', amount: 500, type: 'in', category: 'Salary' },
    { date: '2026-01-05', amount: 200, type: 'out', category: 'Food' },
    { date: '2025-12-25', amount: 1200, type: 'in', category: 'Freelance' },
    { date: '2025-12-15', amount: 400, type: 'out', category: 'Rent' },
    { date: '2025-11-20', amount: 800, type: 'in', category: 'Bonus' },
    { date: '2025-10-10', amount: 150, type: 'out', category: 'Shopping' },
    { date: '2025-08-05', amount: 1500, type: 'in', category: 'Investment' },
  ];

  // Filter data based on period
  const filteredData = useMemo(() => {
    let startDate = new Date(currentDate);
    if (period === '1y') startDate.setFullYear(currentDate.getFullYear() - 1);
    else if (period === '6m') startDate.setMonth(currentDate.getMonth() - 6);
    else if (period === '3m') startDate.setMonth(currentDate.getMonth() - 3);
    else if (period === '1m') startDate.setMonth(currentDate.getMonth() - 1);
    else startDate = new Date(0);

    return dummyTransactions.filter(t => new Date(t.date) >= startDate);
  }, [period]);

  // Totals
  const totalIn = filteredData.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const totalOut = filteredData.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);
  const balance = totalIn - totalOut;

  // Pie Chart Data
  const pieData = {
    labels: ['Income', 'Expense'],
    datasets: [{
      data: [totalIn, totalOut],
      backgroundColor: ['#10b981', '#f43f5e'],
      hoverOffset: 10,
      borderWidth: 0,
    }],
  };

  // Line Chart Data - DYNAMIC: Income aur Expense alag-alag lines
  const lineChartData = useMemo(() => {
    const sortedData = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedData.map(t => 
      new Date(t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    );
    
    const incomeData = sortedData.map(t => t.type === 'in' ? t.amount : null);
    const expenseData = sortedData.map(t => t.type === 'out' ? t.amount : null);

    return {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          fill: true,
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: '#10b981',
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 7,
          spanGaps: true,
        },
        {
          label: 'Expense',
          data: expenseData,
          fill: true,
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          borderColor: '#f43f5e',
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#f43f5e',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 7,
          spanGaps: true,
        }
      ],
    };
  }, [filteredData]);

  // Bar Chart Data - DYNAMIC: Month-wise Income vs Expense
  const barChartData = useMemo(() => {
    const monthlyData = {};
    
    filteredData.forEach(t => {
      const monthYear = new Date(t.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expense: 0 };
      }
      
      if (t.type === 'in') {
        monthlyData[monthYear].income += t.amount;
      } else {
        monthlyData[monthYear].expense += t.amount;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      return new Date(a) - new Date(b);
    });

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: 'Income',
          data: sortedMonths.map(m => monthlyData[m].income),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          label: 'Expense',
          data: sortedMonths.map(m => monthlyData[m].expense),
          backgroundColor: 'rgba(244, 63, 94, 0.7)',
          borderColor: '#f43f5e',
          borderWidth: 1,
          borderRadius: 6,
        }
      ],
    };
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-150 to-indigo-100 rounded-3xl">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-8 bg-gradient-to-r from-gray-800 to-indigo-900 rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-white">
              <h1 className="text-4xl font-black flex items-center gap-3 mb-2">
                <Wallet size={40} /> Financial Dashboard
              </h1>
              <p className="text-blue-100 text-lg">Complete overview of your financial activities</p>
            </div>
            <div className="flex bg-white/20 backdrop-blur-md border border-white/30 p-1.5 rounded-2xl shadow-lg">
              {['all', '1y', '6m', '3m', '1m'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    period === p ? 'bg-white text-blue-600 shadow-lg' : 'text-white hover:bg-white/10'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Income" amount={totalIn} color="emerald" icon={<ArrowDownCircle />} trend="+12.5%" />
          <StatCard title="Total Expenses" amount={totalOut} color="rose" icon={<ArrowUpCircle />} trend="-8.3%" />
          <StatCard title="Net Balance" amount={balance} color="blue" icon={<Wallet />} isBalance trend="+18.2%" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Transaction Trend - Dynamic Charts */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-slate-200 hover:shadow-2xl transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Calendar size={24} className="text-blue-600" /> Transaction Trend
              </h3>
              <div className="px-4 py-2 bg-blue-50 rounded-full">
                <span className="text-sm font-bold text-blue-600">Last {period === 'all' ? 'All Time' : period.toUpperCase()}</span>
              </div>
            </div>

            {/* Bar Chart - Full Width */}
            <div className="h-96">
              <Bar
                data={barChartData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { 
                      position: 'top', 
                      labels: { 
                        font: { size: 13, weight: 'bold' },
                        padding: 20,
                        usePointStyle: true
                      } 
                    },
                    tooltip: { 
                      backgroundColor: 'rgba(15, 23, 42, 0.92)', 
                      cornerRadius: 10,
                      padding: 12,
                      callbacks: {
                        label: function(context) {
                          return context.dataset.label + ': ₹' + context.parsed.y.toLocaleString('en-IN');
                        }
                      }
                    },
                  },
                  scales: {
                    y: { 
                      beginAtZero: true, 
                      grid: { color: 'rgba(0,0,0,0.06)' },
                      ticks: {
                        font: { size: 12, weight: '600' },
                        callback: (value) => '₹' + value
                      }
                    },
                    x: { 
                      grid: { display: false },
                      ticks: {
                        font: { size: 12, weight: '600' }
                      }
                    },
                  },
                  animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                  }
                }}
              />
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 hover:shadow-2xl transition-shadow">
            <h3 className="text-xl font-black text-slate-800 mb-6">Income vs Expenses</h3>
            <div className="h-64 w-full flex items-center justify-center">
              <Pie data={pieData} options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { font: { weight: 'bold', size: 13 }, padding: 20, usePointStyle: true } },
                  tooltip: { 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    padding: 12, 
                    cornerRadius: 8,
                    callbacks: {
                      label: function(context) {
                        return context.label + ': ₹' + context.parsed.toLocaleString('en-IN');
                      }
                    }
                  },
                }
              }} />
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">Savings Rate</span>
                <span className="text-lg font-black text-emerald-600">
                  {totalIn > 0 ? ((balance / totalIn) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <ListOrdered size={24} className="text-blue-600" /> Recent Transactions
            </h3>
            <span className="px-4 py-2 bg-white rounded-full text-sm font-bold text-slate-600 shadow-sm">
              {filteredData.length} Total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 uppercase text-xs font-black">
                <tr>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Type</th>
                  <th className="px-8 py-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.slice(0, 8).map((t, i) => (
                  <tr key={i} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200">
                    <td className="px-8 py-5 text-sm text-slate-600 font-bold">
                      {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm text-slate-800 font-black bg-slate-100 px-3 py-1 rounded-lg">
                        {t.category || 'General'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-sm ${
                        t.type === 'in'
                          ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {t.type === 'in' ? '↓ Credit' : '↑ Debit'}
                      </span>
                    </td>
                    <td className={`px-8 py-5 text-base font-black text-right ${t.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'in' ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredData.length > 8 && (
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                View All Transactions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, amount, color, icon, isBalance, trend }) => {
  const colorMap = {
    emerald: { bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', text: 'text-emerald-600', lightBg: 'bg-emerald-50', border: 'border-emerald-100' },
    rose: { bg: 'bg-gradient-to-br from-rose-500 to-rose-600', text: 'text-rose-600', lightBg: 'bg-rose-50', border: 'border-rose-100' },
    blue: { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', text: 'text-blue-600', lightBg: 'bg-blue-50', border: 'border-blue-100' }
  };

  const colors = colorMap[color];

  return (
    <div className={`bg-white p-8 rounded-3xl shadow-xl border-2 ${colors.border} hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-2xl"></div>
      <div className="relative">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-2xl ${colors.bg} shadow-lg`}>
            {React.cloneElement(icon, { size: 28, className: 'text-white' })}
          </div>
          {trend && (
            <div className={`px-3 py-1 rounded-full text-xs font-black ${
              trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {trend}
            </div>
          )}
        </div>
        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wide mb-2">{title}</h3>
        <p className={`text-4xl font-black ${colors.text} tracking-tight`}>
          ₹{amount.toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  );
};

export default Summary;