import React from 'react';
import { X, Calendar, Info, DollarSign, MapPin } from 'lucide-react';
import { DisasterDeclaration } from '../types';
import { formatCurrency } from '../utils';

interface DisasterDetailCardProps {
  disaster: DisasterDeclaration;
  totalAssistance: number;
  onClose: () => void;
}

export const DisasterDetailCard: React.FC<DisasterDetailCardProps> = ({ 
  disaster, 
  totalAssistance,
  onClose 
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#0044B5]" />
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Disaster Details</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location & ID</span>
          </div>
          <h4 className="text-lg font-bold text-gray-900 leading-tight">
            {disaster.state} - {disaster.declarationTitle}
          </h4>
          <p className="text-sm text-gray-500 mt-1 font-mono">#{disaster.disasterNumber}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Info className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Type</span>
            </div>
            <p className="text-sm font-bold text-gray-800">{disaster.incidentType || 'N/A'}</p>
          </div>
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3 h-3 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Assistance</span>
            </div>
            <p className="text-sm font-bold text-gray-800">{formatCurrency(totalAssistance)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timeline</span>
          </div>
          <div className="relative pl-4 border-l-2 border-gray-100 space-y-4">
            <div>
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-300"></div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Incident Start</p>
              <p className="text-sm font-medium text-gray-700">
                {disaster.incidentBeginDate ? new Date(disaster.incidentBeginDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-300"></div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Incident End</p>
              <p className="text-sm font-medium text-gray-700">
                {disaster.incidentEndDate ? new Date(disaster.incidentEndDate).toLocaleDateString() : 'Active / Ongoing'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 leading-relaxed italic">
          Data sourced from OpenFEMA. Assistance totals reflect IHP approved amounts for the selected disaster.
        </p>
      </div>
    </div>
  );
};
