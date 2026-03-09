import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  ClipboardCheck, 
  Banknote, 
  CheckCircle, 
  TrendingUp,
  Home,
  PieChart,
  ShieldCheck
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ValidRegistration } from '../types';
import { formatCurrency } from '../utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface BentoOverviewProps {
  regs: ValidRegistration[];
  fullTotals: { 
    totalValidRegistrations: number; 
    totalApprovedRegs: number; 
    ihpAmount: number;
    perDisaster?: Record<number, { totalValidRegistrations: number; ihpAmount: number }>;
  };
}

export const BentoOverview: React.FC<BentoOverviewProps> = ({ regs, fullTotals }) => {
  const { totalValidRegistrations, totalApprovedRegs, ihpAmount } = fullTotals;
  const avgAssistance = ihpAmount / (totalApprovedRegs || 1);

  // Data processing (same as in Charts.tsx)
  const sampleTotals = regs.reduce((acc: Record<number, { count: number; ihpAmount: number }>, r) => {
    if (!acc[r.disasterNumber]) acc[r.disasterNumber] = { count: 0, ihpAmount: 0 };
    acc[r.disasterNumber].count++;
    acc[r.disasterNumber].ihpAmount += (Number(r.ihpAmount) || 0);
    return acc;
  }, {});

  const disastersInSample = new Set(regs.map(r => r.disasterNumber));
  const totalInSample = (Array.from(disastersInSample) as number[]).reduce((acc: number, dn: number) => acc + (fullTotals.perDisaster?.[dn]?.totalValidRegistrations || 0), 0);
  const globalBoost = totalInSample > 0 ? fullTotals.totalValidRegistrations / totalInSample : 1;

  const aggregated = regs.reduce((acc, r) => {
    const dn = r.disasterNumber;
    const trueTotals = fullTotals.perDisaster?.[dn];
    const sample = sampleTotals[dn];
    
    if (!trueTotals || !sample) return acc;

    const countScale = (trueTotals.totalValidRegistrations / (sample.count || 1)) * globalBoost;
    const amountScale = trueTotals.ihpAmount / (sample.ihpAmount || 1);

    const key = r.ownRent || 'Unknown';
    acc.ownRentMap[key] = (acc.ownRentMap[key] || 0) + countScale;
    
    acc.haTotal += (Number(r.haAmount) || 0) * amountScale;
    acc.onaTotal += (Number(r.onaAmount) || 0) * amountScale;
    
    return acc;
  }, { 
    ownRentMap: {} as Record<string, number>, 
    haTotal: 0, 
    onaTotal: 0 
  });

  const ownRentData = {
    labels: Object.keys(aggregated.ownRentMap).map(k => k === 'O' ? 'Owners' : (k === 'R' ? 'Renters' : k)),
    datasets: [{
      label: 'Applicants',
      data: (Object.values(aggregated.ownRentMap) as number[]).map(v => Math.round(v)),
      backgroundColor: ['#0044B5', '#FFBA00'],
      borderRadius: 6,
      barThickness: 40
    }]
  };

  const assistanceData = {
    labels: ['Housing Assistance', 'Other Needs'],
    datasets: [{
      data: [aggregated.haTotal, aggregated.onaTotal],
      backgroundColor: ['#0044B5', '#FFBA00'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: { font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: 'bold' as const } }
      }
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[500px]"
    >
      {/* Main Stat: Total Registrations */}
      <motion.div 
        variants={item}
        className="md:col-span-1 md:row-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between"
      >
        <div className="flex justify-between items-start">
          <div className="p-3 bg-[#0044B5]/5 rounded-2xl">
            <Users className="w-6 h-6 text-[#0044B5]" />
          </div>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Registrations</h3>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{totalValidRegistrations.toLocaleString()}</p>
        </div>
      </motion.div>

      {/* Main Chart: Ownership */}
      <motion.div 
        variants={item}
        className="md:col-span-2 md:row-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-[#0044B5]/5 rounded-xl">
            <Home className="w-5 h-5 text-[#0044B5]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Ownership Distribution</h3>
        </div>
        <div className="flex-1 min-h-[200px]">
          <Bar data={ownRentData} options={chartOptions} />
        </div>
        <div className="mt-6 flex gap-6">
          {ownRentData.labels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ownRentData.datasets[0].backgroundColor[i] }}></div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stat: Approved Amount */}
      <motion.div 
        variants={item}
        className="md:col-span-1 md:row-span-1 bg-[#0044B5] p-6 rounded-3xl shadow-lg flex flex-col justify-between text-white"
      >
        <div className="p-3 bg-white/10 rounded-2xl self-start">
          <Banknote className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-1">Total Approved</h3>
          <p className="text-3xl font-black tracking-tighter">{formatCurrency(ihpAmount)}</p>
        </div>
      </motion.div>

      {/* Stat: Approved Count */}
      <motion.div 
        variants={item}
        className="md:col-span-1 md:row-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between"
      >
        <div className="p-3 bg-[#FFBA00]/10 rounded-2xl self-start">
          <ClipboardCheck className="w-6 h-6 text-[#FFBA00]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Approved Households</h3>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">{totalApprovedRegs.toLocaleString()}</p>
        </div>
      </motion.div>

      {/* Secondary Chart: Assistance Type */}
      <motion.div 
        variants={item}
        className="md:col-span-1 md:row-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col"
      >
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-4 h-4 text-[#0044B5]" />
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Assistance Split</h3>
        </div>
        <div className="flex-1 relative">
          <Doughnut 
            data={assistanceData} 
            options={{ 
              ...chartOptions, 
              cutout: '70%',
              plugins: { ...chartOptions.plugins, tooltip: { enabled: true } } 
            }} 
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Avg</span>
            <span className="text-sm font-black text-gray-900">{formatCurrency(avgAssistance)}</span>
          </div>
        </div>
      </motion.div>

      {/* Data Health / Sample Coverage */}
      <motion.div 
        variants={item}
        className="md:col-span-1 md:row-span-1 bg-gray-900 p-6 rounded-3xl shadow-lg flex flex-col justify-between text-white"
      >
        <div className="flex justify-between items-start">
          <div className="p-3 bg-white/10 rounded-2xl">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded-md">Reliable</span>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-1">Sample Fidelity</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black tracking-tighter">
              {Math.min((regs.length / (totalValidRegistrations || 1)) * 100, 100).toFixed(1)}%
            </p>
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Coverage</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-emerald-400 rounded-full" 
              style={{ width: `${Math.min((regs.length / (totalValidRegistrations || 1)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
