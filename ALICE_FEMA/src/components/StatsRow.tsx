import React from 'react';
import { Users, CheckCircle, Banknote, ClipboardCheck } from 'lucide-react';
import { formatCurrency } from '../utils';

interface StatsRowProps {
  totalRegs: number;
  totalApprovedRegs: number;
  totalApprovedAmount: number;
  avgAssistance: number;
}

export const StatsRow: React.FC<StatsRowProps> = ({ 
  totalRegs, 
  totalApprovedRegs, 
  totalApprovedAmount, 
  avgAssistance 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white border-t-4 border-t-[#0044B5] p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0044B5]">Total Registrations</span>
          <Users className="w-4 h-4 text-[#0044B5]/40" />
        </div>
        <div className="text-3xl font-bold text-gray-900">{totalRegs.toLocaleString()}</div>
        <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Valid IHP Registrations</div>
      </div>

      <div className="bg-white border-t-4 border-t-[#FFBA00] p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0044B5]">Approved Registrations</span>
          <ClipboardCheck className="w-4 h-4 text-[#FFBA00]/40" />
        </div>
        <div className="text-3xl font-bold text-gray-900">{totalApprovedRegs.toLocaleString()}</div>
        <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Households Receiving Aid</div>
      </div>
      
      <div className="bg-white border-t-4 border-t-[#0044B5] p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0044B5]">Total Approved</span>
          <CheckCircle className="w-4 h-4 text-[#0044B5]/40" />
        </div>
        <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalApprovedAmount)}</div>
        <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Total IHP Expenditure</div>
      </div>
      
      <div className="bg-white border-t-4 border-t-[#0044B5] p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0044B5]">Avg Assistance</span>
          <Banknote className="w-4 h-4 text-[#0044B5]/40" />
        </div>
        <div className="text-3xl font-bold text-gray-900">{formatCurrency(avgAssistance)}</div>
        <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Per Approved Household</div>
      </div>
    </div>
  );
};
