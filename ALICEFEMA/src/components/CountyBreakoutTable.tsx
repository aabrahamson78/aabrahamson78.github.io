import React from 'react';
import { RegistrationSummary, ValidRegistration } from '../types';
import { formatCurrency } from '../utils';
import { Table } from 'lucide-react';

interface CountyBreakoutTableProps {
  summaries: RegistrationSummary[];
  regSample: ValidRegistration[];
}

export const CountyBreakoutTable: React.FC<CountyBreakoutTableProps> = ({ summaries, regSample }) => {
  const countyData = React.useMemo(() => {
    const data: Record<string, {
      totalRegs: number;
      ihpAmount: number;
      approvedEst: number;
    }> = {};

    // Group summaries by county
    summaries.forEach(s => {
      const county = s.county || 'Unknown';
      if (!data[county]) {
        data[county] = { totalRegs: 0, ihpAmount: 0, approvedEst: 0 };
      }
      data[county].totalRegs += s.totalValidRegistrations || 0;
      data[county].ihpAmount += s.ihpAmount || 0;
    });

    // Estimate approved per county using sample data
    Object.keys(data).forEach(county => {
      const countySample = regSample.filter(r => r.county === county);
      if (countySample.length > 0) {
        const approvedInSample = countySample.filter(r => r.ihpEligible || r.ihpAmount > 0).length;
        const rate = approvedInSample / countySample.length;
        data[county].approvedEst = Math.round(data[county].totalRegs * rate);
      } else {
        // Fallback if no sample for this county
        data[county].approvedEst = 0;
      }
    });

    return Object.entries(data)
      .sort((a, b) => b[1].totalRegs - a[1].totalRegs);
  }, [summaries, regSample]);

  if (countyData.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Table className="h-4 w-4 text-[#0044B5]" />
          <h4 className="font-bold text-gray-700 uppercase tracking-widest text-[10px]">County Breakout Analysis</h4>
        </div>
        <span className="text-[10px] text-gray-400 uppercase">{countyData.length} Counties Impacted</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-[#0044B5] font-bold text-[10px] uppercase tracking-widest border-b border-gray-100">
              <th className="p-4">County</th>
              <th className="p-4 text-right">Total Regs</th>
              <th className="p-4 text-right">Approved (Est)</th>
              <th className="p-4 text-right">Total Assistance</th>
              <th className="p-4 text-right">Avg Assistance</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600">
            {countyData.map(([county, stats]) => (
              <tr key={county} className="border-b border-gray-100 hover:bg-[#f8f9ff] transition-colors">
                <td className="p-4 font-bold text-gray-800">{county}</td>
                <td className="p-4 text-right font-mono">{stats.totalRegs.toLocaleString()}</td>
                <td className="p-4 text-right font-mono text-emerald-600">{stats.approvedEst.toLocaleString()}</td>
                <td className="p-4 text-right font-bold text-gray-900">{formatCurrency(stats.ihpAmount)}</td>
                <td className="p-4 text-right text-gray-500">
                  {formatCurrency(stats.ihpAmount / (stats.approvedEst || 1))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
