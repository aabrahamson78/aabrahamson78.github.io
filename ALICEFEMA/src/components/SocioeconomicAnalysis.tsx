import React, { useMemo } from 'react';
import { ValidRegistration, ALICECategory, SocioeconomicData } from '../types';
import { getALICECategory, formatCurrency } from '../utils';
import { ShieldCheck } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';

interface SocioeconomicAnalysisProps {
  regs: ValidRegistration[];
  fullTotals: { 
    totalValidRegistrations: number; 
    totalApprovedRegs: number; 
    ihpAmount: number;
    perDisaster?: Record<number, { totalValidRegistrations: number; ihpAmount: number }>;
  };
}

const BRAND_COLORS = {
  blue: '#0044B5',
  yellow: '#FFBA00',
  actionBlue: '#005191',
  gray: '#E9ECEF',
  poverty: '#ef4444',
};

export const SocioeconomicAnalysis: React.FC<SocioeconomicAnalysisProps> = ({ regs, fullTotals }) => {
  const groups: ALICECategory[] = ['Above ALICE', 'ALICE', 'Poverty', 'Unknown'];

  const data = useMemo(() => {
    const initialData = groups.reduce((acc: Record<string, SocioeconomicData>, g) => {
      acc[g] = {
        total: 0, approved: 0, denied: 0, ihpAmount: 0, haAmount: 0, onaAmount: 0,
        rentalAmount: 0, repairAmount: 0, personalPropertyAmount: 0, otherAmount: 0,
        rentalCount: 0, repairCount: 0, propCount: 0, otherCount: 0,
        ownerAmount: 0, renterAmount: 0, ownerCount: 0, renterCount: 0
      };
      return acc;
    }, {});

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

    regs.forEach(r => {
      let g = getALICECategory(r);
      if (!initialData[g]) g = 'Unknown';
      
      const dn = r.disasterNumber;
      const trueTotals = fullTotals.perDisaster?.[dn];
      const sample = sampleTotals[dn];
      
      if (!trueTotals || !sample) return;

      const countScale = (trueTotals.totalValidRegistrations / (sample.count || 1)) * globalBoost;
      const amountScale = trueTotals.ihpAmount / (sample.ihpAmount || 1);

      initialData[g].total += countScale;
      
      const isApproved = r.ihpEligible || r.ihpAmount > 0;
      if (isApproved) {
        initialData[g].approved += countScale;
      } else {
        initialData[g].denied += countScale;
      }

      const ihpAmt = (Number(r.ihpAmount) || 0) * amountScale;
      initialData[g].ihpAmount += ihpAmt;

      initialData[g].haAmount += (Number(r.haAmount) || 0) * amountScale;
      initialData[g].onaAmount += (Number(r.onaAmount) || 0) * amountScale;

      // Rent
      const rentAmt = (Number(r.rentalAssistanceAmount) || 0) * amountScale;
      if (rentAmt > 0) {
        initialData[g].rentalAmount += rentAmt;
        initialData[g].rentalCount += countScale;
      }

      // Repair (includes Repair + Replacement)
      const repairAmt = ((Number(r.repairAmount) || 0) + (Number(r.replacementAmount) || 0)) * amountScale;
      if (repairAmt > 0) {
        initialData[g].repairAmount += repairAmt;
        initialData[g].repairCount += countScale;
      }

      // Personal Property (subset of ONA)
      const propAmt = (Number(r.personalPropertyAmount) || 0) * amountScale;
      if (propAmt > 0) {
        initialData[g].personalPropertyAmount += propAmt;
        initialData[g].propCount += countScale;
      }

      // Other ONA (ONA minus Personal Property)
      const totalOna = (Number(r.onaAmount) || 0) * amountScale;
      const otherOnaAmt = Math.max(0, totalOna - propAmt);
      if (otherOnaAmt > 0) {
        initialData[g].otherAmount += otherOnaAmt;
        initialData[g].otherCount += countScale;
      }

      if (r.ownRent === 'O') {
        initialData[g].ownerAmount += ihpAmt;
        initialData[g].ownerCount += countScale;
      } else if (r.ownRent === 'R') {
        initialData[g].renterAmount += ihpAmt;
        initialData[g].renterCount += countScale;
      }
    });

    // Round counts and adjust last group to match official totals to prevent drift
    const groupsWithData = groups.filter(g => initialData[g].total > 0);
    let runningTotal = 0;
    let runningApproved = 0;
    let runningDenied = 0;

    groupsWithData.forEach((g, idx) => {
      const d = initialData[g];
      if (idx === groupsWithData.length - 1) {
        // Last group gets the remainder to ensure perfect sum
        d.total = Math.max(0, fullTotals.totalValidRegistrations - runningTotal);
        d.approved = Math.max(0, fullTotals.totalApprovedRegs - runningApproved);
        d.denied = Math.max(0, (fullTotals.totalValidRegistrations - fullTotals.totalApprovedRegs) - runningDenied);
        
        d.rentalCount = Math.round(d.rentalCount);
        d.repairCount = Math.round(d.repairCount);
        d.propCount = Math.round(d.propCount);
        d.otherCount = Math.round(d.otherCount);
        d.ownerCount = Math.round(d.ownerCount);
        d.renterCount = Math.round(d.renterCount);
      } else {
        d.total = Math.round(d.total);
        d.approved = Math.round(d.approved);
        d.denied = Math.round(d.denied);
        d.rentalCount = Math.round(d.rentalCount);
        d.repairCount = Math.round(d.repairCount);
        d.propCount = Math.round(d.propCount);
        d.otherCount = Math.round(d.otherCount);
        d.ownerCount = Math.round(d.ownerCount);
        d.renterCount = Math.round(d.renterCount);
        
        runningTotal += d.total;
        runningApproved += d.approved;
        runningDenied += d.denied;
      }
    });

    return initialData;
  }, [regs, fullTotals, groups]);

  const visibleGroups = useMemo(() => {
    return groups.filter(g => data[g].total > 0);
  }, [groups, data]);

  const statusByCategoryData = {
    labels: visibleGroups,
    datasets: [
      { label: 'Approved (Est)', data: visibleGroups.map(g => data[g].approved), backgroundColor: BRAND_COLORS.blue },
      { label: 'Ineligible (Est)', data: visibleGroups.map(g => data[g].denied), backgroundColor: BRAND_COLORS.gray }
    ]
  };

  const assistanceBreakdownData = {
    labels: visibleGroups,
    datasets: [
      { label: 'Rental', data: visibleGroups.map(g => data[g].rentalCount > 0 ? data[g].rentalAmount / data[g].rentalCount : 0), backgroundColor: BRAND_COLORS.blue },
      { label: 'Repair', data: visibleGroups.map(g => data[g].repairCount > 0 ? data[g].repairAmount / data[g].repairCount : 0), backgroundColor: BRAND_COLORS.yellow },
      { label: 'Other', data: visibleGroups.map(g => data[g].otherCount > 0 ? data[g].onaAmount / data[g].otherCount : 0), backgroundColor: BRAND_COLORS.gray }
    ]
  };

  const butterflyData = {
    labels: visibleGroups,
    datasets: [
      { label: 'Owners (Est)', data: visibleGroups.map(g => data[g].ownerAmount), backgroundColor: BRAND_COLORS.blue },
      { label: 'Renters (Est)', data: visibleGroups.map(g => -data[g].renterAmount), backgroundColor: BRAND_COLORS.yellow }
    ]
  };

  const shareDonutData = {
    labels: visibleGroups,
    datasets: [{
      data: visibleGroups.map(g => data[g].ihpAmount),
      backgroundColor: [BRAND_COLORS.blue, BRAND_COLORS.yellow, BRAND_COLORS.poverty, BRAND_COLORS.gray],
      borderWidth: 0
    }]
  };

  const totalApps = visibleGroups.reduce((s, g) => s + data[g].total, 0);
  const totalIhp = visibleGroups.reduce((s, g) => s + data[g].ihpAmount, 0);
  const totalApproved = visibleGroups.reduce((s, g) => s + data[g].approved, 0);

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-[#0044B5]/5 rounded-lg">
          <ShieldCheck className="h-6 w-6 text-[#0044B5]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 uppercase">Socioeconomic Analysis (ALICE)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleGroups.map((g, i) => {
          const rate = data[g].total > 0 ? (data[g].approved / data[g].total) * 100 : 0;
          const colors = { 'Above ALICE': BRAND_COLORS.blue, 'ALICE': BRAND_COLORS.yellow, 'Poverty': BRAND_COLORS.poverty, 'Unknown': BRAND_COLORS.gray };
          return (
            <div key={g} className="bg-white border-t-4 border-t-[#0044B5] p-6 rounded-xl shadow-sm flex flex-col items-center text-center">
              <div className="relative w-20 h-20 mb-3">
                <svg viewBox="0 0 100 100" className="w-20 h-20">
                  <path d="M50 10 L90 45 V90 H10 V45 Z" fill="#f1f3f5" />
                  <clipPath id={`clip-${i}`}><rect x="0" y={100 - rate} width="100" height={rate} /></clipPath>
                  <path d="M50 10 L90 45 V90 H10 V45 Z" fill={colors[g as keyof typeof colors]} clipPath={`url(#clip-${i})`} />
                  <path d="M50 10 L90 45 V90 H10 V45 Z" fill="none" stroke={colors[g as keyof typeof colors]} strokeWidth="2" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pt-5">
                  <span className="text-lg font-bold text-gray-800">{rate.toFixed(0)}%</span>
                </div>
              </div>
              <h4 className="font-bold text-gray-700 uppercase tracking-widest text-[10px]">{g}</h4>
              <p className="text-[9px] text-gray-400 uppercase mt-1">Approval Rate</p>
            </div>
          );
        })}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h4 className="font-bold text-[#0044B5] uppercase tracking-wider text-xs mb-6">Application Status by Category</h4>
          <div className="h-[280px]">
            <Bar data={statusByCategoryData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }} />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h4 className="font-bold text-[#0044B5] uppercase tracking-wider text-xs mb-6">Assistance Breakdown (Mean Amount)</h4>
          <div className="h-[280px]">
            <Bar data={assistanceBreakdownData} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h4 className="font-bold text-[#0044B5] uppercase tracking-wider text-xs mb-6">Funding Distribution: Owners vs Renters</h4>
          <div className="h-[280px]">
            <Bar data={butterflyData} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${formatCurrency(Math.abs(c.raw as number))}` } } } }} />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h4 className="font-bold text-[#0044B5] uppercase tracking-wider text-xs mb-6">Assistance by Category (Share)</h4>
          <div className="h-[280px]">
            <Doughnut data={shareDonutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h4 className="font-bold text-gray-700 uppercase tracking-widest text-[10px]">Assistance Details by Type and ALICE Income Group</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#0044B5] font-bold text-[10px] uppercase tracking-widest">
                <th className="p-4">Group</th>
                <th className="p-4 text-center">Rent Count</th>
                <th className="p-4 text-center">Avg Rent</th>
                <th className="p-4 text-center">Repair Count</th>
                <th className="p-4 text-center">Avg Repair</th>
                <th className="p-4 text-center">Prop Count</th>
                <th className="p-4 text-center">Avg Prop</th>
                <th className="p-4 text-center">Other Count</th>
                <th className="p-4 text-center">Avg Other</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {visibleGroups.map(g => {
                const d = data[g];
                return (
                  <tr key={g} className="border-b border-gray-100 hover:bg-[#f8f9ff]">
                    <td className="p-4 font-bold text-gray-800">{g}</td>
                    <td className="p-4 text-center">{d.rentalCount.toLocaleString()}</td>
                    <td className="p-4 text-center">{formatCurrency(d.rentalCount > 0 ? d.rentalAmount / d.rentalCount : 0)}</td>
                    <td className="p-4 text-center">{d.repairCount.toLocaleString()}</td>
                    <td className="p-4 text-center">{formatCurrency(d.repairCount > 0 ? d.repairAmount / d.repairCount : 0)}</td>
                    <td className="p-4 text-center">{d.propCount.toLocaleString()}</td>
                    <td className="p-4 text-center">{formatCurrency(d.propCount > 0 ? d.personalPropertyAmount / d.propCount : 0)}</td>
                    <td className="p-4 text-center">{d.otherCount.toLocaleString()}</td>
                    <td className="p-4 text-center">{formatCurrency(d.otherCount > 0 ? d.otherAmount / d.otherCount : 0)}</td>
                  </tr>
                );
              })}
              <tr className="bg-[#0044B5] text-white font-bold">
                <td className="p-4">All Groups</td>
                <td className="p-4 text-center">{visibleGroups.reduce((s, g) => s + data[g].rentalCount, 0).toLocaleString()}</td>
                <td className="p-4 text-center">
                  {formatCurrency(
                    visibleGroups.reduce((s, g) => s + data[g].rentalCount, 0) > 0 
                    ? visibleGroups.reduce((s, g) => s + data[g].rentalAmount, 0) / visibleGroups.reduce((s, g) => s + data[g].rentalCount, 0) 
                    : 0
                  )}
                </td>
                <td className="p-4 text-center">{visibleGroups.reduce((s, g) => s + data[g].repairCount, 0).toLocaleString()}</td>
                <td className="p-4 text-center">
                  {formatCurrency(
                    visibleGroups.reduce((s, g) => s + data[g].repairCount, 0) > 0 
                    ? visibleGroups.reduce((s, g) => s + data[g].repairAmount, 0) / visibleGroups.reduce((s, g) => s + data[g].repairCount, 0) 
                    : 0
                  )}
                </td>
                <td className="p-4 text-center">{visibleGroups.reduce((s, g) => s + data[g].propCount, 0).toLocaleString()}</td>
                <td className="p-4 text-center">
                  {formatCurrency(
                    visibleGroups.reduce((s, g) => s + data[g].propCount, 0) > 0 
                    ? visibleGroups.reduce((s, g) => s + data[g].personalPropertyAmount, 0) / visibleGroups.reduce((s, g) => s + data[g].propCount, 0) 
                    : 0
                  )}
                </td>
                <td className="p-4 text-center">{visibleGroups.reduce((s, g) => s + data[g].otherCount, 0).toLocaleString()}</td>
                <td className="p-4 text-center">
                  {formatCurrency(
                    visibleGroups.reduce((s, g) => s + data[g].otherCount, 0) > 0 
                    ? visibleGroups.reduce((s, g) => s + data[g].otherAmount, 0) / visibleGroups.reduce((s, g) => s + data[g].otherCount, 0) 
                    : 0
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h4 className="font-bold text-gray-700 uppercase tracking-widest text-[10px]">Detailed Summary by Group</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#0044B5] font-bold text-[10px] uppercase tracking-widest">
                <th className="p-4">Group</th>
                <th className="p-4">Total Apps</th>
                <th className="p-4">% of Apps</th>
                <th className="p-4">Approved (Est)</th>
                <th className="p-4">Approval Rate</th>
                <th className="p-4">Total Funding</th>
                <th className="p-4">Avg. Assistance</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {visibleGroups.map(g => {
                const d = data[g];
                const pctOfApps = totalApps > 0 ? (d.total / totalApps * 100).toFixed(1) : 0;
                const appRate = d.total > 0 ? (d.approved / d.total * 100).toFixed(1) : 0;
                const avgAsst = d.approved > 0 ? d.ihpAmount / d.approved : 0;
                return (
                  <tr key={g} className="border-b border-gray-100 hover:bg-[#f8f9ff]">
                    <td className="p-4 font-bold text-gray-800">{g}</td>
                    <td className="p-4">{d.total.toLocaleString()}</td>
                    <td className="p-4 text-gray-500">{pctOfApps}%</td>
                    <td className="p-4">{d.approved.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#0044B5]" style={{ width: `${appRate}%` }}></div>
                        </div>
                        <span>{appRate}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-[#0044B5] font-bold">{formatCurrency(d.ihpAmount)}</td>
                    <td className="p-4">{formatCurrency(avgAsst)}</td>
                  </tr>
                );
              })}
              <tr className="bg-[#0044B5] text-white font-bold">
                <td className="p-4">All Groups</td>
                <td className="p-4">{fullTotals.totalValidRegistrations.toLocaleString()}</td>
                <td className="p-4">100%</td>
                <td className="p-4">{fullTotals.totalApprovedRegs.toLocaleString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white" style={{ width: `${(fullTotals.totalApprovedRegs / fullTotals.totalValidRegistrations * 100).toFixed(1)}%` }}></div>
                    </div>
                    <span>{(fullTotals.totalApprovedRegs / fullTotals.totalValidRegistrations * 100).toFixed(1)}%</span>
                  </div>
                </td>
                <td className="p-4">{formatCurrency(fullTotals.ihpAmount)}</td>
                <td className="p-4">{formatCurrency(fullTotals.totalApprovedRegs > 0 ? fullTotals.ihpAmount / fullTotals.totalApprovedRegs : 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
