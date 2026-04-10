
import React from 'react';
import { Edit2, MoreVertical, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-200 h-12 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-gray-900">Comprehensive Project Oversight and Coordination Contract</h1>
        <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded tracking-wider">Draft</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-semibold">Save and exit</span>
        </button>
        <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
