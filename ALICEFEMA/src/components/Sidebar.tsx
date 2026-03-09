import React from 'react';
import { DisasterDeclaration } from '../types';
import { List, MapPin } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  disasters: DisasterDeclaration[];
  selectedIds: string[];
  onSelect: (disaster: DisasterDeclaration) => void;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ disasters, selectedIds, onSelect, isLoading }) => {
  return (
    <aside className="lg:col-span-1 space-y-4">
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 h-[calc(100vh-250px)] lg:h-[800px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-[#0044B5]" />
            <h3 className="font-bold uppercase text-xs tracking-wider text-gray-500">Declared Disasters</h3>
          </div>
          {selectedIds.length > 0 && (
            <span className="bg-[#0044B5] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {selectedIds.length}
            </span>
          )}
          {isLoading && (
            <div className="h-3 w-3 animate-spin border-2 border-gray-200 border-t-[#0044B5] rounded-full"></div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {disasters.length === 0 && !isLoading ? (
            <div className="text-gray-500 text-center py-8">No results found.</div>
          ) : (
            disasters.map((d) => {
              const isSelected = selectedIds.includes(d.id);
              return (
                <div
                  key={d.id}
                  onClick={() => onSelect(d)}
                  className={cn(
                    "bg-white border border-gray-200 p-5 rounded-2xl transition-all cursor-pointer hover:border-[#0044B5] hover:bg-[#f1f5ff] relative",
                    isSelected && "border-[#0044B5] bg-[#eef2ff] border-l-4 border-l-[#0044B5]"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-[#0044B5] rounded-full shadow-[0_0_8px_rgba(0,68,181,0.5)]"></div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500">#{d.disasterNumber}</span>
                    <span className="text-[10px] text-gray-500 font-bold">
                      {new Date(d.declarationDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 line-clamp-1">{d.declarationTitle}</h4>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 font-medium">
                    <MapPin className="h-3 w-3" />
                    {d.state}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};
