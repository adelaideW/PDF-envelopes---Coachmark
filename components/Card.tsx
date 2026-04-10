
import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CardProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, isOpen, children }) => {
  const [isExpanded, setIsExpanded] = useState(isOpen);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
      <div 
        className="px-6 py-5 flex items-start justify-between cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <button className="p-1 text-gray-400 group-hover:text-gray-600 transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="px-6 pb-6 pt-1 border-t border-gray-50 animate-in fade-in duration-300">
          {children}
        </div>
      )}
    </div>
  );
};
