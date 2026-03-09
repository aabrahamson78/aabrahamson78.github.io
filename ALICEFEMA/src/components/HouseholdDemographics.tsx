import React, { useMemo } from 'react';
import { ValidRegistration } from '../types';
import { Users, Home, Shield, Activity } from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';

interface HouseholdDemographicsProps {
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
  gray: '#E9ECEF',
  lightBlue: '#E7F0FF',
  darkBlue: '#00338A',
};

export const HouseholdDemographics: React.FC<HouseholdDemographicsProps> = ({ regs, fullTotals }) => {
  const stats = useMemo(() => {
    const ageDist: Record<string, number> = {};
    const resType: Record<string, number> = {};
    const composition: Record<string, number> = {};
    const insurance = { homeowners: 0, flood: 0, total: regs.length };

    // Calculate per-disaster scaling factor to be more precise
    const disasterCounts = regs.reduce((acc: Record<number, number>, r) => {
      acc[r.disasterNumber] = (acc[r.disasterNumber] || 0) + 1;
      return acc;
    }, {});

    const disastersInSample = new Set(regs.map(r => r.disasterNumber));
    const totalInSample = (Array.from(disastersInSample) as number[]).reduce((acc: number, dn: number) => acc + (fullTotals.perDisaster?.[dn]?.totalValidRegistrations || 0), 0);
    const globalBoost = totalInSample > 0 ? fullTotals.totalValidRegistrations / totalInSample : 1;

    regs.forEach(r => {
      const disasterTotal = (fullTotals as any).perDisaster?.[r.disasterNumber]?.totalValidRegistrations || 0;
      const disasterSampleCount = disasterCounts[r.disasterNumber];
      const countScale = disasterSampleCount > 0 ? (disasterTotal / disasterSampleCount) * globalBoost : 0;

      // Age
      const age = r.applicantAge || 'Unknown';
      ageDist[age] = (ageDist[age] || 0) + countScale;

      // Residence Type
      const typeMap: Record<string, string> = {
        'A': 'Apartment', 'B': 'Boat', 'C': 'Condo', 'H': 'House/Duplex', 
        'M': 'Mobile Home', 'N': 'Non-Traditional', 'O': 'Other', 
        'TH': 'Townhouse', 'T': 'Travel Trailer', 'ALF': 'Assisted Living',
        'MIL': 'Military', 'CD': 'Dorm', 'CF': 'Correctional'
      };
      const type = typeMap[r.residenceType || ''] || 'Other/Unknown';
      resType[type] = (resType[type] || 0) + countScale;

      // Composition
      const comp = r.householdComposition || 'Unknown';
      composition[comp] = (composition[comp] || 0) + countScale;

      // Insurance
      if (r.homeOwnersInsurance) insurance.homeowners += countScale;
      if (r.floodInsurance) insurance.flood += countScale;
    });

    // Remainder adjustment for Age
    const ageKeys = Object.keys(ageDist).sort();
    let ageRunning = 0;
    ageKeys.forEach((k, idx) => {
      if (idx === ageKeys.length - 1) {
        ageDist[k] = Math.max(0, fullTotals.totalValidRegistrations - ageRunning);
      } else {
        ageDist[k] = Math.round(ageDist[k]);
        ageRunning += ageDist[k];
      }
    });

    // Remainder adjustment for Residence Type
    const resKeys = Object.keys(resType).sort();
    let resRunning = 0;
    resKeys.forEach((k, idx) => {
      if (idx === resKeys.length - 1) {
        resType[k] = Math.max(0, fullTotals.totalValidRegistrations - resRunning);
      } else {
        resType[k] = Math.round(resType[k]);
        resRunning += resType[k];
      }
    });

    // Remainder adjustment for Composition
    const compKeys = Object.keys(composition).sort();
    let compRunning = 0;
    compKeys.forEach((k, idx) => {
      if (idx === compKeys.length - 1) {
        composition[k] = Math.max(0, fullTotals.totalValidRegistrations - compRunning);
      } else {
        composition[k] = Math.round(composition[k]);
        compRunning += composition[k];
      }
    });

    return { ageDist, resType, composition, insurance };
  }, [regs, fullTotals]);

  const ageChartData = {
    labels: Object.keys(stats.ageDist).sort(),
    datasets: [{
      label: 'Applicants',
      data: Object.keys(stats.ageDist).sort().map(k => stats.ageDist[k]),
      backgroundColor: BRAND_COLORS.blue,
      borderRadius: 8,
    }]
  };

  const resTypeData = {
    labels: Object.keys(stats.resType),
    datasets: [{
      data: Object.values(stats.resType),
      backgroundColor: [
        BRAND_COLORS.blue, BRAND_COLORS.yellow, '#4dabf7', '#74c0fc', '#a5d8ff', '#d0ebff'
      ],
      borderWidth: 0,
    }]
  };

  const compData = {
    labels: Object.keys(stats.composition).sort(),
    datasets: [{
      label: 'Households',
      data: Object.keys(stats.composition).sort().map(k => stats.composition[k]),
      backgroundColor: BRAND_COLORS.yellow,
      borderRadius: 8,
    }]
  };

  if (regs.length === 0) return null;

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-[#FFBA00]/10 rounded-lg">
          <Users className="h-6 w-6 text-[#FFBA00]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 uppercase">Household Demographics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-full">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Homeowners Ins.</p>
            <p className="text-xl font-bold text-gray-800">
              {((stats.insurance.homeowners / (stats.insurance.total || 1)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-cyan-50 rounded-full">
            <Activity className="h-6 w-6 text-cyan-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Flood Insurance</p>
            <p className="text-xl font-bold text-gray-800">
              {((stats.insurance.flood / (stats.insurance.total || 1)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-full">
            <Home className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Residence</p>
            <p className="text-xl font-bold text-gray-800">
              {((regs.filter(r => r.ihpEligible).length / (regs.length || 1)) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-full">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Household Size</p>
            <p className="text-xl font-bold text-gray-800">
              {(regs.reduce((acc, r) => acc + (parseInt(r.householdComposition || '0') || 0), 0) / (regs.length || 1)).toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h4 className="font-bold text-[#0044B5] uppercase tracking-wider text-xs mb-6">Applicant Age Distribution</h4>
          <div className="h-[250px]">
            <Bar data={ageChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h4 className="font-bold text-[#0044B5] uppercase tracking-wider text-xs mb-6">Residence Type Breakdown</h4>
          <div className="h-[250px]">
            <Pie data={resTypeData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 10 } } } } }} />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h4 className="font-bold text-[#0044B5] uppercase tracking-wider text-xs mb-6">Household Composition</h4>
          <div className="h-[250px]">
            <Bar data={compData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};
