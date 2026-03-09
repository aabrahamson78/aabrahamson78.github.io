import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ValidRegistration, RegistrationSummary } from '../types';
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

interface ChartsProps {
  regs: ValidRegistration[];
  fullTotals: { 
    totalValidRegistrations: number; 
    totalApprovedRegs: number; 
    ihpAmount: number;
    perDisaster?: Record<number, { totalValidRegistrations: number; ihpAmount: number }>;
  };
}

export const Charts: React.FC<ChartsProps> = ({ regs, fullTotals }) => {
  // Pre-calculate per-disaster sample totals for scaling
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
      label: 'Applicants (Estimated)',
      data: (Object.values(aggregated.ownRentMap) as number[]).map(v => Math.round(v)),
      backgroundColor: '#38bdf8',
      borderRadius: 8
    }]
  };

  const assistanceData = {
    labels: ['Housing Assistance (Est)', 'Other Needs (Est)'],
    datasets: [{
      data: [aggregated.haTotal, aggregated.onaTotal],
      backgroundColor: ['#818cf8', '#fb7185'],
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: { weight: 'bold' as const, size: 11 },
          color: '#495057'
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <h4 className="font-bold text-[#0044B5] uppercase tracking-wider text-xs mb-6">Homeowners vs Renters (Scaled)</h4>
        <div className="h-[280px]">
          <Bar data={ownRentData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
        </div>
      </div>
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <h4 className="font-bold text-[#0044B5] uppercase tracking-wider text-xs mb-6">Assistance Type Distribution (Scaled)</h4>
        <div className="h-[280px]">
          <Doughnut data={assistanceData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { position: 'bottom' as const } } }} />
        </div>
      </div>
    </div>
  );
};
