
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  HelpCircle, 
  Accessibility, 
  LayoutGrid, 
  Bell, 
  Globe, 
  ChevronDown, 
  FileText, 
  MoreVertical, 
  Plus, 
  Check,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Type,
  Link,
  Image as ImageIcon,
  List,
  ListOrdered,
  AlignLeft,
  Zap,
  MoreHorizontal,
  X,
  Edit2,
  LogOut,
  Hand,
  PenTool,
  Calendar,
  Square,
  User,
  GripVertical,
  ChevronLeft,
  FileDown,
  Sparkles,
  Trash2,
  Copy
} from 'lucide-react';
import { Recipient, Document } from './types';

// Components
import { Header } from './components/Header';
import { Card } from './components/Card';
import { RecipientCard } from './components/RecipientCard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'setup' | 'tagging'>('setup');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [signingOrder, setSigningOrder] = useState(false);
  const [subject, setSubject] = useState('Action required for this document');
  const [activeDocMenu, setActiveDocMenu] = useState<string | null>(null);
  const [isAutoTagged, setIsAutoTagged] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [selectedModalRecipient, setSelectedModalRecipient] = useState<string>('');
  
  // Tagging View specific state
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [taggingStep, setTaggingStep] = useState<number>(0); 
  const [hasShownSettingsOnboarding, setHasShownSettingsOnboarding] = useState(false);
  const [hasShownDragOnboarding, setHasShownDragOnboarding] = useState(false);
  // 0: none, 1: Insert fields tip (on button), 2: Switch Recipients (Step 1), 3: Drag fields (Step 2), 4: Field settings (on tag)
  
  const firstFieldRef = useRef<HTMLDivElement>(null);
  const prevSelectedFieldId = useRef<string | null>(null);

  // Coach mark states for setup view
  const [showCoachmark, setShowCoachmark] = useState(false);
  const [hasShownCoachmark, setHasShownCoachmark] = useState(false);
  const [showDragCoachmark, setShowDragCoachmark] = useState(false);
  const [hasShownDragCoachmark, setHasShownDragCoachmark] = useState(false);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [dropMode, setDropMode] = useState<'move' | 'merge'>('move');

  // Logic for Setup View Coach marks
  useEffect(() => {
    const isSecondRecipientFilled = recipients.length >= 2 && recipients[1].name.trim().length > 0;
    if (isSecondRecipientFilled && !signingOrder && !hasShownCoachmark && currentView === 'setup') {
      setShowCoachmark(true);
      setHasShownCoachmark(true);
    }
    if (signingOrder) setShowCoachmark(false);
  }, [recipients, signingOrder, hasShownCoachmark, currentView]);

  useEffect(() => {
    if (signingOrder && !hasShownDragCoachmark && currentView === 'setup' && recipients.length >= 2) {
      setShowDragCoachmark(true);
      setHasShownDragCoachmark(true);
    }
    if (!signingOrder) setShowDragCoachmark(false);
  }, [signingOrder, hasShownDragCoachmark, currentView, recipients]);

  // Handle entering tagging view
  const handleContinue = () => {
    if (!isContinueDisabled) {
      setCurrentView('tagging');
      setShowInsertModal(true);
      if (recipients.length > 0) {
        setSelectedModalRecipient(recipients[0].id);
      }
    }
  };

  // Trigger Field Settings coach mark after tagging
  useEffect(() => {
    if (isAutoTagged && currentView === 'tagging' && !hasShownSettingsOnboarding) {
      setTaggingStep(4);
    }
  }, [isAutoTagged, currentView, hasShownSettingsOnboarding]);

  // Logic to show drag-and-drop onboarding when side panel is closed
  useEffect(() => {
    if (currentView === 'tagging' && prevSelectedFieldId.current !== null && selectedFieldId === null) {
      if (!hasShownDragOnboarding) {
        setTaggingStep(3);
        setHasShownDragOnboarding(true);
      }
    }
    prevSelectedFieldId.current = selectedFieldId;
  }, [selectedFieldId, hasShownDragOnboarding, currentView]);

  // Recalculate steps whenever the list or signingOrder toggle changes
  useEffect(() => {
    if (signingOrder) {
      setRecipients(prev => {
        let currentStep = 1;
        return prev.map((r, idx, arr) => {
          if (idx > 0 && r.step === arr[idx - 1].step && r.step !== undefined) {
            return { ...r, step: currentStep };
          }
          if (idx > 0) currentStep++;
          return { ...r, step: r.step || currentStep };
        });
      });
    } else {
      setRecipients(prev => prev.map(r => ({ ...r, step: undefined })));
    }
  }, [signingOrder]);

  const addRecipient = () => {
    const newId = String(Date.now());
    const lastStep = recipients.length > 0 ? (Math.max(...recipients.map(r => r.step || 0))) : 0;
    const nextStep = lastStep + 1;
    setRecipients([...recipients, { 
      id: newId, 
      name: '', 
      role: 'Needs to complete', 
      email: '',
      step: signingOrder ? nextStep : undefined
    }]);
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
  };

  const addDocument = () => {
    const newId = String(Date.now());
    setDocuments([...documents, { id: newId, name: 'Untitled Document' }]);
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    setShowDragCoachmark(false);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const threshold = rect.height * 0.3; 
    setHoveredIndex(index);
    if (y > threshold && y < rect.height - threshold) {
      setDropMode('merge');
    } else {
      setDropMode('move');
    }
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newRecipients = [...recipients];
    const draggedItem = { ...newRecipients[draggedIndex] };
    if (dropMode === 'merge') {
      draggedItem.step = newRecipients[index].step;
      newRecipients.splice(draggedIndex, 1);
      newRecipients.splice(index, 0, draggedItem);
    } else {
      draggedItem.step = undefined; 
      newRecipients.splice(draggedIndex, 1);
      newRecipients.splice(index, 0, draggedItem);
    }
    let stepCounter = 1;
    const cleaned = newRecipients.map((r, i, arr) => {
      if (i > 0 && r.step !== undefined && r.step === arr[i-1].step) return { ...r, step: stepCounter };
      if (i > 0) stepCounter++;
      return { ...r, step: stepCounter };
    });
    setRecipients(cleaned);
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  const handleApplyAutoTags = () => {
    setIsAutoTagged(true);
    setShowInsertModal(false);
    setTaggingStep(0);
  };

  const dismissSettingsOnboarding = () => {
    setTaggingStep(0);
    setHasShownSettingsOnboarding(true);
  };

  const dismissDragOnboarding = () => {
    setTaggingStep(0);
    setHasShownDragOnboarding(true);
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveDocMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const isSigningOrderDisabled = recipients.length <= 1;
  const isAddRecipientDisabled = recipients.length > 0 && !recipients[0].name.trim();
  const isContinueDisabled = documents.length === 0 || recipients.length === 0;

  // Render the Tagging View
  if (currentView === 'tagging') {
    const activeRecipient = recipients.find(r => r.id === selectedModalRecipient) || recipients[0];
    const activeRecipientName = activeRecipient?.name || 'Recipient 1';
    
    const FieldTag = ({ label, id, isFirst }: { label: string; id: string; isFirst?: boolean }) => {
      const isSelected = selectedFieldId === id;
      const isCoachMarkActive = isFirst && taggingStep === 4;

      return (
        <div 
          ref={isFirst ? firstFieldRef : null}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFieldId(id);
            if (taggingStep === 4) dismissSettingsOnboarding();
          }}
          className={`inline-flex flex-col gap-0.5 px-3 py-1.5 mx-1 bg-white border rounded-md shadow-sm min-w-[120px] transition-all cursor-pointer group relative
            ${isSelected ? 'border-[#7A005D] ring-2 ring-[#7A005D]/20 z-20' : 'border-gray-200 hover:border-gray-400'}
            ${isCoachMarkActive ? 'ring-4 ring-[#00C2A7]/30 border-[#00C2A7] z-[210]' : ''}`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold text-gray-700 truncate max-w-[80px] uppercase tracking-tighter">{label}</span>
            <X className="w-2.5 h-2.5 text-gray-300 cursor-pointer hover:text-gray-500" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
            <span className="text-[8px] font-medium text-gray-400 truncate">{activeRecipientName}</span>
          </div>

          {/* Step 4 Coach mark: Field settings */}
          {isCoachMarkActive && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 z-[300] w-[320px] animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-white rounded-2xl shadow-[0_15px_45px_rgb(0,0,0,0.15)] border border-gray-100 p-6 relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45"></div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-[17px] font-bold text-[#0F172A]">Field settings</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissSettingsOnboarding();
                    }} 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[#475569] text-sm leading-relaxed mb-8 text-left font-normal">
                  Once there are any fields in the canvas, you can click on any field to change its settings.
                </p>
                <div className="flex justify-end">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFieldId(id); // Select field to open sidebar
                      dismissSettingsOnboarding();
                    }}
                    className="bg-[#7A005D] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#5E0048] transition-all transform active:scale-95 shadow-md"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    const BlankLine = ({ label, id, isFirst, className = "" }: { label: string; id: string; isFirst?: boolean; className?: string }) => (
      isAutoTagged ? <FieldTag label={label} id={id} isFirst={isFirst} /> : <span className={`border-b border-gray-300 inline-block min-w-[200px] h-4 mx-1 ${className}`}></span>
    );

    return (
      <div className="flex flex-col h-screen bg-[#F0F2F5]">
        {/* Drag Ghost Helper for Sidebar Fields */}
        <div id="drag-ghost" className="fixed -top-[1000px] left-0 pointer-events-none">
          <div className="inline-flex flex-col gap-0.5 px-3 py-1.5 bg-white border border-[#7A005D] rounded-md shadow-xl min-w-[120px]">
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-gray-700 uppercase">Field</span>
              <X className="w-2.5 h-2.5 text-gray-300" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
              <span className="text-[8px] font-medium text-gray-400">{activeRecipientName}</span>
            </div>
          </div>
        </div>

        {/* Onboarding Modals & Overlays */}
        {showInsertModal && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-full max-md overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
              <div className="p-8 text-center relative">
                <button 
                  onClick={() => {
                    setShowInsertModal(false);
                    setTaggingStep(1); // Point to button if dismissed
                  }} 
                  className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 bg-[#7A005D]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#7A005D]">
                  <Sparkles className="w-8 h-8 fill-current" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#0F172A] mb-3">Insert fields automatically?</h2>
                <p className="text-[#64748B] text-sm leading-relaxed mb-8">
                  We detected empty lines in your document. Would you like to automatically insert signature and text fields for a recipient?
                </p>
                <div className="space-y-4 text-left">
                  <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider ml-1">Select Recipient</label>
                  <div className="relative">
                    <select 
                      value={selectedModalRecipient}
                      onChange={(e) => setSelectedModalRecipient(e.target.value)}
                      className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-5 text-sm font-bold text-[#0F172A] appearance-none focus:ring-2 focus:ring-[#7A005D]/20 outline-none transition-all cursor-pointer"
                    >
                      {recipients.map(r => <option key={r.id} value={r.id}>{r.name || 'Untitled Recipient'}</option>)}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-6 flex flex-col gap-3">
                <button onClick={handleApplyAutoTags} className="w-full bg-[#7A005D] text-white h-14 rounded-2xl font-bold text-base shadow-lg shadow-[#7A005D]/20 hover:bg-[#5E0048] transform active:scale-[0.98] transition-all">Insert fields</button>
                <button 
                  onClick={() => {
                    setShowInsertModal(false);
                    setTaggingStep(1); 
                  }} 
                  className="w-full h-14 rounded-2xl font-bold text-base text-[#64748B] hover:bg-gray-100 transition-all"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Header */}
        <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-900">[Envelope Name]</span>
            <Edit2 className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          <div className="flex items-center gap-5">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-bold">Save and exit</span>
            </button>
            <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
          </div>
        </header>

        {/* Toolbar */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-6 z-40">
          <div className="flex items-center gap-1 border-r border-gray-100 pr-6 ml-2 cursor-pointer group">
            <span className="text-xs font-bold text-gray-800">256%</span>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </div>
          <div className="flex items-center gap-4 border-r border-gray-100 pr-6">
            <button className="text-gray-400 hover:text-gray-600 font-bold text-xl">─</button>
            <button className="text-gray-400 hover:text-gray-600 font-bold text-xl">+</button>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Hand className="w-5 h-5" />
          </button>
          <div className="flex-1"></div>
          <Search className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 mr-2" />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Fields */}
          <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col pt-6 px-4 shrink-0">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Fields</h3>
            
            <div className="mb-4 relative">
              <div className="relative">
                <button 
                  onClick={() => handleApplyAutoTags()}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-[#7A005D] border border-[#7A005D]/20 bg-[#7A005D]/5 rounded-xl hover:bg-[#7A005D]/10 transition-all mb-3 relative ${taggingStep === 1 ? 'z-50 border-[#7A005D] ring-2 ring-[#7A005D]/20 shadow-md' : ''}`}
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Insert fields
                </button>

                {taggingStep === 1 && (
                  <div className="absolute left-full ml-6 top-1/2 -translate-y-1/2 z-[200] w-[320px] animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="bg-white rounded-2xl shadow-[0_15px_45px_rgb(0,0,0,0.15)] border border-gray-100 p-6 relative">
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l border-b border-gray-100 rotate-45"></div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-[17px] font-bold text-[#0F172A] text-left">Insert fields</h3>
                        <button onClick={() => setTaggingStep(0)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                      </div>
                      <p className="text-[#475569] text-sm leading-relaxed mb-8 text-left font-normal">
                        If you've dismissed the automatic tagging, you can always click here later to insert fields for any recipient.
                      </p>
                      <div className="flex justify-end">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setTaggingStep(0); }}
                          className="bg-[#7A005D] text-white px-8 py-2 rounded-lg text-sm font-bold hover:bg-[#5E0048] transition-all transform active:scale-95 shadow-md"
                        >
                          Got it
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recipient Selector */}
              <div className="relative mb-6">
                <div className={`flex items-center gap-3 w-full border-2 border-[#10B981] rounded-xl px-4 py-2.5 bg-white cursor-pointer shadow-sm relative group`}>
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <span className="text-xs font-bold text-gray-800 truncate">{activeRecipientName}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
                </div>
              </div>
            </div>

            {/* Field Types */}
            <div className="space-y-3 relative">
              {[
                { icon: Type, label: 'Text' },
                { icon: PenTool, label: 'Signature' },
                { icon: Calendar, label: 'Date signed' },
                { icon: Square, label: 'Checkbox' }
              ].map((field) => (
                <div 
                  key={field.label} 
                  draggable
                  onDragStart={(e) => {
                    const ghost = document.getElementById('drag-ghost');
                    if (ghost) {
                      const labelEl = ghost.querySelector('span:first-child');
                      if (labelEl) labelEl.textContent = field.label;
                      e.dataTransfer.setDragImage(ghost, 60, 20);
                    }
                  }}
                  className={`flex items-center justify-between border border-gray-100 rounded-xl p-4 bg-white hover:border-gray-200 transition-all cursor-grab active:cursor-grabbing shadow-sm ${taggingStep === 3 ? 'z-[210] border-[#00C2A7] ring-4 ring-[#00C2A7]/20 shadow-md' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <field.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-bold text-gray-800">{field.label}</span>
                  </div>
                  <GripVertical className="w-4 h-4 text-gray-200" />
                </div>
              ))}

              {taggingStep === 3 && (
                <div className="absolute left-full ml-6 top-12 z-[300] w-[320px] animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="bg-white rounded-2xl shadow-[0_15px_45px_rgb(0,0,0,0.15)] border border-gray-100 p-6 relative">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l border-b border-gray-100 rotate-45"></div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-[17px] font-bold text-[#0F172A] text-left">Drag and drop fields</h3>
                      <button onClick={dismissDragOnboarding} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </div>
                    <p className="text-[#475569] text-sm leading-relaxed mb-8 text-left font-normal">
                      Indicated below are the field types you can drag onto the PDF document to finish the setup.
                    </p>
                    <div className="flex justify-end items-center">
                      <button 
                        onClick={dismissDragOnboarding}
                        className="bg-[#7A005D] text-white px-8 py-2 rounded-lg text-sm font-bold hover:bg-[#5E0048] transition-all transform active:scale-95 shadow-md"
                      >
                        Got it
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Middle: Document Canvas */}
          <main 
            onClick={() => setSelectedFieldId(null)}
            className="flex-1 overflow-auto bg-[#F0F2F5] p-12 flex flex-col items-center gap-8"
          >
            {/* Page 1 */}
            <div className="w-[850px] bg-white shadow-[0_15px_60px_rgba(0,0,0,0.08)] min-h-[1100px] px-20 py-24 relative flex flex-col items-start font-serif">
              <div className="w-full text-center mb-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 uppercase">NON-DISCLOSURE AGREEMENT (NDA)</h1>
              </div>

              <div className="text-[14px] text-gray-800 leading-[1.8] w-full space-y-6">
                <p>
                  This Nondisclosure Agreement or ("Agreement") has been entered into on the date of 
                  <BlankLine label="Date signed" id="date1" isFirst={true} /> and is by and between:
                </p>
                <div>
                  <p className="font-bold">Party Disclosing Information: <BlankLine label="Full name" id="name1" className="min-w-[300px]" /> with a mailing address of</p>
                  <p className="pl-4"><BlankLine label="Address" id="addr1" className="w-full" /> (“Disclosing Party”).</p>
                </div>
                <div>
                  <p className="font-bold">Party Receiving Information: <BlankLine label="Full name" id="name2" className="min-w-[300px]" /> with a mailing address of</p>
                  <p className="pl-4"><BlankLine label="Address" id="addr2" className="w-full" /> (“Receiving Party”).</p>
                </div>
                <p>For the purpose of preventing the unauthorized disclosure of Confidential Information as defined below. The parties agree to enter into a confidential relationship concerning the disclosure of certain proprietary and confidential information ("Confidential Information").</p>
                <p><span className="font-bold">1. Definition of Confidential Information.</span> For purposes of this Agreement, "Confidential Information" shall include all information or material that has or could have commercial value or other utility in the business in which Disclosing Party is engaged. If Confidential Information is in written form, the Disclosing Party shall label or stamp the materials with the word "Confidential" or some similar warning. If Confidential Information is transmitted orally, the Disclosing Party shall promptly provide writing indicating that such oral communication constituted Confidential Information.</p>
                <p><span className="font-bold">2. Exclusions from Confidential Information.</span> Receiving Party's obligations under this Agreement do not extend to information that is: (a) publicly known at the time of disclosure or subsequently becomes publicly known through no fault of the Receiving Party; (b) discovered or created by the Receiving Party before disclosure by Disclosing Party; (c) learned by the Receiving Party through legitimate means other than from the Disclosing Party or Disclosing Party's representatives; or (d) is disclosed by Receiving Party with Disclosing Party's prior written approval.</p>
                <p><span className="font-bold">3. Obligations of Receiving Party.</span> Receiving Party shall hold and maintain the Confidential Information in strictest confidence for the sole and exclusive benefit of the Disclosing Party. Receiving Party shall carefully restrict access to Confidential Information to employees, contractors and third parties as is reasonably required and shall require those persons to sign nondisclosure restrictions at least as protective as those in this Agreement. Receiving Party shall not, without the prior written approval of Disclosing Party, use for Receiving Party's benefit, publish, copy, or otherwise disclose to others, or permit the use by others for their benefit or to the detriment of Disclosing Party, any Confidential Information. Receiving Party shall return to Disclosing Party any and all records, notes, and other written, printed, or tangible materials in its possession pertaining to Confidential Information immediately if Disclosing Party requests it in writing.</p>
                <p className="mt-8 text-xs text-gray-400 text-center w-full pt-12 border-t border-gray-50 italic">Copyright © 2020 NonDisclosureAgreement.com. All Rights Reserved. Page 1 of 2</p>
              </div>
            </div>

            {/* Page 2 */}
            <div className="w-[850px] bg-white shadow-[0_15px_60px_rgba(0,0,0,0.08)] min-h-[1100px] px-20 py-24 relative flex flex-col items-start font-serif">
              <div className="text-[14px] text-gray-800 leading-[1.8] w-full space-y-8">
                <p><span className="font-bold">5. Relationships.</span> Nothing contained in this Agreement shall be deemed to constitute either party a partner, joint venture or employee of the other party for any purpose.</p>
                <p><span className="font-bold">6. Severability.</span> If a court finds any provision of this Agreement invalid or unenforceable, the remainder of this Agreement shall be interpreted so as best to affect the intent of the parties.</p>
                <p><span className="font-bold">7. Integration.</span> This Agreement expresses the complete understanding of the parties with respect to the subject matter and supersedes all prior proposals, agreements, representations, and understandings. This Agreement may not be amended except in writing signed by both parties.</p>
                <p><span className="font-bold">8. Waiver.</span> The failure to exercise any right provided in this Agreement shall not be a waiver of prior or subsequent rights.</p>
                
                <div className="space-y-4 pt-12">
                  <h3 className="font-bold uppercase tracking-tight">DISCLOSING PARTY</h3>
                  <div className="flex items-end gap-2">
                    <span className="shrink-0 mb-1">Signature:</span>
                    <BlankLine label="Signature" id="sig1" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex items-end gap-2 flex-1">
                      <span className="shrink-0 mb-1">Typed or Printed Name:</span>
                      <BlankLine label="Full name" id="name3" className="flex-1" />
                    </div>
                    <div className="flex items-end gap-2 w-48">
                      <span className="shrink-0 mb-1">Date:</span>
                      <BlankLine label="Date signed" id="date2" className="flex-1" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-12">
                  <h3 className="font-bold uppercase tracking-tight">RECEIVING PARTY</h3>
                  <div className="flex items-end gap-2">
                    <span className="shrink-0 mb-1">Signature:</span>
                    <BlankLine label="Signature" id="sig2" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex items-end gap-2 flex-1">
                      <span className="shrink-0 mb-1">Typed or Printed Name:</span>
                      <BlankLine label="Full name" id="name4" className="flex-1" />
                    </div>
                    <div className="flex items-end gap-2 w-48">
                      <span className="shrink-0 mb-1">Date:</span>
                      <BlankLine label="Date signed" id="date3" className="flex-1" />
                    </div>
                  </div>
                </div>

                <p className="mt-auto pt-24 text-xs text-gray-400 text-center w-full italic">Copyright © 2020 NonDisclosureAgreement.com. All Rights Reserved. Page 2 of 2</p>
              </div>
            </div>
          </main>

          {/* Right Sidebar: Field Settings */}
          <aside className={`w-80 bg-white border-l border-gray-200 overflow-y-auto flex flex-col pt-4 shrink-0 transition-all duration-300 ${selectedFieldId ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
            <div className="px-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">1 selected</span>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-[#7A005D] hover:bg-[#7A005D]/5 rounded-lg transition-all"><Copy className="w-4 h-4" /></button>
                <button 
                  onClick={() => setSelectedFieldId(null)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Recipient Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between cursor-pointer">
                  <h4 className="text-xs font-bold text-gray-900 tracking-tight">Recipient</h4>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-3 w-full border border-gray-200 rounded-xl px-4 py-2 bg-white cursor-pointer group hover:border-gray-300 transition-all">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                      <img src={`https://picsum.photos/seed/${activeRecipientName}/32/32`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 truncate">{activeRecipientName}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-400 ring-4 ring-yellow-400/10"></div>
                  </div>
                </div>
                <label className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-5 h-5 border-2 border-[#7A005D] rounded bg-[#7A005D] flex items-center justify-center transition-all">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <input type="checkbox" className="hidden" defaultChecked />
                  <span className="text-sm font-bold text-gray-800">Required</span>
                </label>
              </div>

              {/* Location Section */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between cursor-pointer">
                  <h4 className="text-xs font-bold text-gray-900 tracking-tight">Location</h4>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div className="relative flex items-center justify-between border border-gray-200 rounded-lg h-12 px-4 bg-white group focus-within:border-[#7A005D] focus-within:ring-2 focus-within:ring-[#7A005D]/10 transition-all">
                    <span className="text-sm text-gray-400 font-medium">Page number</span>
                    <span className="text-sm font-bold text-gray-900">1</span>
                  </div>
                  <div className="relative flex items-center justify-between border border-gray-200 rounded-lg h-12 px-4 bg-white group focus-within:border-[#7A005D] focus-within:ring-2 focus-within:ring-[#7A005D]/10 transition-all">
                    <span className="text-sm font-bold text-gray-900">334 px</span>
                    <span className="text-xs text-gray-400 font-medium">px from left</span>
                  </div>
                  <div className="relative flex items-center justify-between border border-gray-200 rounded-lg h-12 px-4 bg-white group focus-within:border-[#7A005D] focus-within:ring-2 focus-within:ring-[#7A005D]/10 transition-all">
                    <span className="text-sm font-bold text-gray-900">316 px</span>
                    <span className="text-xs text-gray-400 font-medium">px from right</span>
                  </div>
                  <div className="relative flex items-center justify-between border border-gray-200 rounded-lg h-12 px-4 bg-white group focus-within:border-[#7A005D] focus-within:ring-2 focus-within:ring-[#7A005D]/10 transition-all">
                    <span className="text-sm font-bold text-gray-900">150 px</span>
                    <span className="text-xs text-gray-400 font-medium">px wide</span>
                  </div>
                  <div className="relative flex items-center justify-between border border-gray-200 rounded-lg h-12 px-4 bg-white group focus-within:border-[#7A005D] focus-within:ring-2 focus-within:ring-[#7A005D]/10 transition-all">
                    <span className="text-sm font-bold text-gray-900">40 px</span>
                    <span className="text-xs text-gray-400 font-medium">px tall</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Tagging Footer */}
        <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-between px-6 z-50">
          <button 
            onClick={() => setCurrentView('setup')}
            className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button className="bg-[#7A005D] text-white px-12 py-3 rounded-xl font-bold shadow-lg shadow-[#7A005D]/20 hover:bg-[#5E0048] transform active:scale-95 transition-all">
            Send
          </button>
        </footer>
      </div>
    );
  }

  // Setup View (Current UI)
  return (
    <div className="min-h-screen pb-24 bg-[#f8f9fa]">
      {/* Top Navbar */}
      <nav className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center text-[#7A005D]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
              <span className="text-sm font-medium text-gray-700">Tools</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="relative w-full max-w-xl hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search or jump to" 
              className="w-[450px] bg-gray-100 border-none rounded-md py-1.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-gray-300 transition-all outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-gray-200">
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><HelpCircle className="w-5 h-5" /></button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><Accessibility className="w-5 h-5" /></button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><LayoutGrid className="w-5 h-5" /></button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><Globe className="w-5 h-5" /></button>
          </div>
          <div className="flex items-center gap-2 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-gray-900 leading-none">Acme</p>
            </div>
            <img src="https://picsum.photos/seed/admin/32/32" alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />
          </div>
        </div>
      </nav>

      <Header />

      <main className="max-w-3xl mx-auto px-4 mt-8 space-y-6">
        <Card title="Documents" isOpen={true} onToggle={() => {}}>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className={`flex items-center justify-between p-3 border border-gray-200 rounded-md hover:border-gray-300 transition-colors group relative ${activeDocMenu === doc.id ? 'z-[60]' : 'z-10'}`}>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                </div>
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setActiveDocMenu(activeDocMenu === doc.id ? null : doc.id); }} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {activeDocMenu === doc.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] py-2 animate-in fade-in zoom-in duration-100 origin-top-right">
                      <button className="w-full text-left px-5 py-3 text-base font-normal text-gray-900 hover:bg-gray-50 transition-colors">Preview</button>
                      <button className="w-full text-left px-5 py-3 text-base font-normal text-gray-900 hover:bg-gray-50 transition-colors">Rename</button>
                      <button className="w-full text-left px-5 py-3 text-base font-normal text-gray-900 hover:bg-gray-50 transition-colors">Edit</button>
                      <button className="w-full text-left px-5 py-3 text-base font-normal text-red-600 hover:bg-red-50 transition-colors" onClick={() => removeDocument(doc.id)}>Remove</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button onClick={addDocument} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors mt-2">
              <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></div>
              Add document
            </button>
          </div>
        </Card>

        <Card title="Add recipients" subtitle="Add people to send documents to" isOpen={true} onToggle={() => {}}>
          <div className="mb-4 flex items-center justify-between relative">
            <div className="flex items-center gap-4 relative">
              <label className={`flex items-center gap-2 ${isSigningOrderDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                <div 
                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${!isSigningOrderDisabled && signingOrder ? 'bg-[#7A005D]' : 'border-2 border-gray-300'}`}
                  onClick={() => !isSigningOrderDisabled && setSigningOrder(!signingOrder)}
                >
                  {!isSigningOrderDisabled && signingOrder && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-sm text-gray-700 font-medium">Set signing order</span>
              </label>

              {showCoachmark && (
                <div className="absolute left-full ml-6 top-1/2 -translate-y-1/2 z-50 w-[340px] animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-6 relative">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l border-b border-gray-100 rotate-45"></div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-[17px] font-bold text-[#0F172A]">Set signing order</h3>
                      <button onClick={() => setShowCoachmark(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                    <p className="text-[#475569] text-sm leading-relaxed mb-8">Enable this to specify the sequence in which recipients receive and sign documents.</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-[#94A3B8] tracking-widest uppercase">Step 1 of 2</span>
                      <button onClick={() => setShowCoachmark(false)} className="bg-[#7A005D] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#5E0048] shadow-md transition-all">Next</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button className={`text-sm font-semibold text-gray-900 ${isSigningOrderDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:underline'}`}>View order</button>
          </div>

          <div className="space-y-0 relative">
            {recipients.map((recipient, idx) => (
              <div key={recipient.id} onDragOver={(e) => signingOrder && handleDragOver(e, idx)} onDrop={() => signingOrder && handleDrop(idx)} onDragEnd={handleDragEnd} className="relative">
                {hoveredIndex === idx && dropMode === 'move' && <div className="absolute -top-[1px] left-0 right-0 h-1 bg-[#7A005D] z-[70] rounded-full shadow-sm" />}
                <RecipientCard 
                  recipient={recipient} 
                  index={signingOrder ? (recipient.step || idx + 1) : idx + 1}
                  onUpdate={(updated) => { const newR = [...recipients]; newR[idx] = { ...newR[idx], ...updated }; setRecipients(newR); }}
                  onRemove={() => removeRecipient(recipient.id)}
                  isDraggable={signingOrder}
                  onDragStart={() => handleDragStart(idx)}
                  isHovered={hoveredIndex === idx}
                  dropMode={hoveredIndex === idx ? dropMode : undefined}
                  isFirstInGroup={idx === 0 || recipients[idx].step !== recipients[idx-1].step}
                  isLastInGroup={idx === recipients.length - 1 || recipients[idx].step !== recipients[idx+1].step}
                />
                {idx === 0 && showDragCoachmark && (
                  <div className="absolute left-[38px] top-1/2 -translate-y-1/2 z-[100] w-[340px] animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="bg-white rounded-2xl shadow-[0_15px_45px_rgb(0,0,0,0.15)] border border-gray-100 p-6 relative">
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l border-b border-gray-100 rotate-45"></div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-[17px] font-bold text-[#0F172A]">Change signing order</h3>
                        <button onClick={() => setShowDragCoachmark(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                      <p className="text-[#475569] text-sm leading-relaxed mb-8">Drag and drop recipients to set their order. Group them in one box for simultaneous signing, or separate boxes for sequential flow.</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-[#94A3B8] tracking-widest uppercase">Step 2 of 2</span>
                        <button onClick={() => setShowDragCoachmark(false)} className="bg-[#7A005D] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#5E0048] shadow-md transition-all">Done</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button disabled={isAddRecipientDisabled} onClick={addRecipient} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-md transition-all mt-6 ${isAddRecipientDisabled ? 'text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isAddRecipientDisabled ? 'border-gray-200' : 'border-gray-400'}`}><Plus className="w-3.5 h-3.5" /></div>
              Add recipient
            </button>
          </div>
        </Card>

        <Card title="Add custom message" subtitle="Insert a custom note for the recipient(s)" isOpen={true} onToggle={() => {}}>
          <div className="bg-gray-100 p-1 rounded-md flex mb-6">
            <button className="flex-1 py-1.5 text-sm font-medium bg-[#7A005D] text-white rounded shadow-sm">Edit</button>
            <button className="flex-1 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors">Preview</button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Subject<span className="text-red-500">*</span></label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:ring-1 focus:ring-gray-300 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Body<span className="text-red-500">*</span></label>
              <div className="border border-gray-200 rounded-md">
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                  <div className="flex gap-1 pr-2 border-r border-gray-200"><button className="p-1 hover:bg-white rounded transition-colors"><Undo2 className="w-4 h-4 text-gray-600" /></button><button className="p-1 hover:bg-white rounded transition-colors"><Redo2 className="w-4 h-4 text-gray-600" /></button></div>
                  <div className="flex gap-1 px-2 border-r border-gray-200"><button className="p-1 hover:bg-white rounded transition-colors"><Bold className="w-4 h-4 text-gray-600" /></button><button className="p-1 hover:bg-white rounded transition-colors"><Italic className="w-4 h-4 text-gray-600" /></button><button className="p-1 hover:bg-white rounded transition-colors"><MoreHorizontal className="w-4 h-4 text-gray-600" /></button></div>
                  <div className="flex gap-1 px-2 border-r border-gray-200"><button className="p-1 hover:bg-white rounded transition-colors"><Type className="w-4 h-4 text-gray-600" /></button><div className="h-6 w-px bg-gray-300 mx-1"></div></div>
                  <div className="flex gap-2 px-2 border-r border-gray-200 items-center"><span className="text-xs font-medium">Normal text</span><div className="h-4 w-px bg-gray-300 mx-1"></div><div className="flex items-center gap-1.5"><button className="w-4 h-4 flex items-center justify-center">-</button><span className="text-xs w-6 text-center border border-gray-300 rounded">15</span><button className="w-4 h-4 flex items-center justify-center">+</button></div></div>
                  <div className="flex gap-1 px-2 border-r border-gray-200"><button className="p-1 hover:bg-white rounded transition-colors"><AlignLeft className="w-4 h-4 text-gray-600" /></button></div>
                  <div className="flex gap-1 px-2 border-r border-gray-200"><button className="p-1 hover:bg-white rounded transition-colors"><List className="w-4 h-4 text-gray-600" /></button><button className="p-1 hover:bg-white rounded transition-colors"><ListOrdered className="w-4 h-4 text-gray-600" /></button><button className="p-1 hover:bg-white rounded transition-colors"><MoreHorizontal className="w-4 h-4 text-gray-600" /></button></div>
                  <div className="flex gap-1 px-2"><button className="p-1 hover:bg-white rounded transition-colors"><Link className="w-4 h-4 text-gray-600" /></button><button className="p-1 hover:bg-white rounded transition-colors"><ImageIcon className="w-4 h-4 text-gray-600" /></button><button className="p-1 hover:bg-white rounded transition-colors"><Plus className="w-4 h-4 text-gray-600" /></button></div>
                  <button className="ml-auto flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold uppercase text-gray-600 hover:bg-gray-50 transition-colors"><Zap className="w-3 h-3 text-[#7A005D] fill-current" />Insert variable</button>
                </div>
                <div className="p-4 min-h-[120px] text-sm text-gray-600"><p>Please review and send the documents</p><ul className="list-disc ml-5 mt-2 text-gray-400"><li>{`{Document names}`}</li></ul></div>
              </div>
            </div>
          </div>
        </Card>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-6 flex justify-end z-[90]">
        <button disabled={isContinueDisabled} onClick={handleContinue} className={`px-10 py-2.5 font-semibold rounded-lg shadow-sm transition-all transform active:scale-95 ${isContinueDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60' : 'bg-[#7A005D] hover:bg-[#5E0048] text-white'}`}>Continue</button>
      </footer>
    </div>
  );
};

export default App;
