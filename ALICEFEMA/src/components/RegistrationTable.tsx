import React from 'react';
import { ValidRegistration } from '../types';
import { formatCurrency, getALICECategory } from '../utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RegistrationTableProps {
  regs: ValidRegistration[];
}

export const RegistrationTable: React.FC<RegistrationTableProps> = ({ regs }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const sample = regs.slice(0, 50);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center hover:bg-gray-100 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-gray-700 uppercase tracking-widest text-[10px]">Anonymized Registration Sample (Top 50)</h4>
          <span className="text-[10px] text-gray-400 uppercase">Total Sample Size: {regs.length.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-[#0044B5] font-bold text-[10px] uppercase tracking-widest">
          {isExpanded ? 'Collapse' : 'Expand Sample'}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      
      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[#0044B5] font-bold text-[10px] uppercase tracking-widest">
                  <th className="p-4">City/Zip</th>
                  <th className="p-4">Income Band</th>
                  <th className="p-4">ALICE Category</th>
                  <th className="p-4">Residence</th>
                  <th className="p-4">IHP Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {sample.map((r, i) => {
                  const category = getALICECategory(r);
                  const isApproved = r.ihpEligible || r.ihpAmount > 0;
                  
                  return (
                    <tr key={i} className="border-b border-gray-100 hover:bg-[#f8f9ff] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{r.damagedCity || 'Unknown'}</div>
                        <div className="text-[10px] text-gray-400">{r.zipCode}</div>
                      </td>
                      <td className="p-4">{r.grossIncome || 'Not Reported'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          category === 'Poverty' ? 'bg-red-100 text-red-600' :
                          category === 'ALICE' ? 'bg-amber-100 text-amber-600' :
                          category === 'Above ALICE' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {category}
                        </span>
                      </td>
                      <td className="p-4 text-xs">
                        {r.ownRent === 'O' ? 'Owner' : 'Renter'} • {r.residenceType || 'N/A'}
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        {formatCurrency(r.ihpAmount)}
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center gap-1.5 ${isApproved ? 'text-emerald-600' : 'text-gray-400'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {isApproved ? 'Approved' : 'Ineligible'}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {regs.length > 50 && (
            <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Showing 50 of {regs.length.toLocaleString()} records in current sample</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
