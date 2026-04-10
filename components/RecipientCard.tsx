
import React, { useState, useEffect } from 'react';
import { User, MoreVertical, ChevronDown, GripVertical, Link as LinkIcon } from 'lucide-react';
import { Recipient, RecipientRole } from '../types';

interface RecipientCardProps {
  recipient: Recipient;
  index: number;
  onUpdate: (data: Partial<Recipient>) => void;
  onRemove: () => void;
  isDraggable?: boolean;
  onDragStart?: () => void;
  isHovered?: boolean;
  dropMode?: 'move' | 'merge';
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
}

// Limited roles as requested by the user
const ROLES: RecipientRole[] = [
  'Needs to complete',
  'CC recipient'
];

export const RecipientCard: React.FC<RecipientCardProps> = ({ 
  recipient, 
  index, 
  onUpdate, 
  onRemove,
  isDraggable = false,
  onDragStart,
  isHovered = false,
  dropMode,
  isFirstInGroup = true,
  isLastInGroup = true
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
      setIsRoleMenuOpen(false);
    };
    if (isMenuOpen || isRoleMenuOpen) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen, isRoleMenuOpen]);

  const showGroupVisuals = isDraggable && (!isFirstInGroup || !isLastInGroup);

  return (
    <div 
      draggable={isDraggable}
      onDragStart={onDragStart}
      className={`p-5 border relative transition-all bg-white group
        ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
        ${isHovered && dropMode === 'move' ? 'opacity-50' : ''}
        ${isHovered && dropMode === 'merge' ? 'border-[#7A005D] border-dashed bg-[#7A005D]/5 ring-2 ring-[#7A005D]/20' : 'border-gray-200'}
        ${showGroupVisuals ? 'border-l-4 border-l-[#7A005D]' : ''}
        ${!isFirstInGroup ? 'rounded-t-none -mt-px border-t-[#7A005D]/10' : 'rounded-t-xl mt-4'}
        ${!isLastInGroup ? 'rounded-b-none' : 'rounded-b-xl mb-4'}
        ${(isMenuOpen || isRoleMenuOpen) ? 'z-[60]' : 'z-10'}`}
    >
      {/* Merge Indicator */}
      {isHovered && dropMode === 'merge' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#7A005D]/10 rounded-xl z-20 pointer-events-none">
          <div className="bg-[#7A005D] text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl animate-in zoom-in duration-200">
            <LinkIcon className="w-3.5 h-3.5" />
            Set parallel signing
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 min-w-[40px]">
          {isDraggable && (
            <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
          )}
          <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-all
            ${showGroupVisuals ? 'bg-[#7A005D] text-white scale-110 shadow-sm' : 'bg-blue-50 text-blue-600'}`}>
            {index}
          </div>
        </div>
        
        <div className="flex-1 flex gap-3">
          {/* Name Input Group */}
          <div className="flex-1 relative">
            <label className="absolute -top-2 left-2 px-1 bg-white text-[10px] font-bold text-gray-500 uppercase z-10">
              Recipient<span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3 w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/30">
              {recipient.avatar ? (
                <img src={recipient.avatar} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                </div>
              )}
              <input 
                type="text" 
                value={recipient.name}
                placeholder="Name"
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="flex-1 bg-transparent text-sm font-medium outline-none"
              />
            </div>
          </div>

          {/* Role Selection Group */}
          <div className="w-56 relative">
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setIsRoleMenuOpen(!isRoleMenuOpen);
                setIsMenuOpen(false);
              }}
              className="flex items-center justify-between w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/30 cursor-pointer hover:border-gray-300 transition-colors"
            >
              <span className="text-sm text-gray-700 font-medium">{recipient.role}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isRoleMenuOpen ? 'rotate-180' : ''}`} />
            </div>

            {isRoleMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] py-2 animate-in fade-in zoom-in duration-100 origin-top">
                {ROLES.map((role) => (
                  <button 
                    key={role}
                    className={`w-full text-left px-5 py-3 text-base font-normal transition-colors ${recipient.role === role ? 'text-[#7A005D] bg-gray-50 font-semibold' : 'text-gray-900 hover:bg-gray-50'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate({ role });
                      setIsRoleMenuOpen(false);
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Menu (Three Dots) */}
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
                setIsRoleMenuOpen(false);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] py-2 animate-in fade-in zoom-in duration-100 origin-top-right">
                <button 
                  className="w-full text-left px-5 py-3 text-base font-normal text-gray-900 hover:bg-gray-50 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                >
                  Edit
                </button>
                <button 
                  className="w-full text-left px-5 py-3 text-base font-normal text-gray-900 hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (recipient.customMessage === undefined) {
                      onUpdate({ customMessage: '' });
                    }
                    setIsMenuOpen(false);
                  }}
                >
                  Add private message
                </button>
                <button 
                  className="w-full text-left px-5 py-3 text-base font-normal text-red-600 hover:bg-red-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                    setIsMenuOpen(false);
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {recipient.customMessage !== undefined && (
        <div className="mt-4 pl-14 space-y-2 animate-in slide-in-from-top-2 duration-300">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Custom message<span className="text-red-500">*</span>
          </label>
          <textarea 
            value={recipient.customMessage}
            onChange={(e) => onUpdate({ customMessage: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm min-h-[80px] focus:ring-1 focus:ring-gray-300 outline-none transition-all resize-none"
            placeholder="Type a message..."
          />
        </div>
      )}
    </div>
  );
};
