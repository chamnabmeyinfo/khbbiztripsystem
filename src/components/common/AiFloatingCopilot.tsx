import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { processAiPrompt, AiActionProposal, AiChatMessage } from '../../services/geminiService';
import {
  Sparkles,
  X,
  Send,
  Bot,
  Zap,
  CheckCircle2,
  Minimize2,
  Maximize2,
  Code,
  Plane,
  Building2,
  Receipt,
  TrendingUp,
  RefreshCw,
  Shield,
  HelpCircle
} from 'lucide-react';

const QUICK_ACTIONS = [
  { label: '✈️ New Tour', prompt: 'បង្កើតកញ្ចប់ដំណើរកម្សាន្តទៅបាងកក ៤ថ្ងៃ ៣យប់ តម្លៃ $320 B2B Expo' },
  { label: '🏢 Add Supplier', prompt: 'Add supplier: Grand Palace Hotel Bangkok, type hotel, Net 30, rating 5' },
  { label: '🧾 Log Expense', prompt: 'Log expense: $45 for VIP badge laminating and printouts' },
  { label: '📊 P&L Margin', prompt: 'គណនាប្រាក់ចំណេញសរុបលើកញ្ចប់ Vietnam B2B Trade Mission 2026' }
];

export const AiFloatingCopilot: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    packages,
    suppliers,
    costTemplates,
    purchaseOrders,
    expenses,
    addPackage,
    deletePackage,
    addSupplier,
    deleteSupplier,
    addExpense,
    createPurchaseOrder,
    systemSettings,
    addNotification,
    language
  } = useApp();

  const QUICK_ACTIONS = language === 'km' ? [
    { label: '✈️ កញ្ចប់ថ្មី', prompt: 'បង្កើតកញ្ចប់ដំណើរកម្សាន្តទៅបាងកក ៤ថ្ងៃ ៣យប់ តម្លៃ $320 B2B Expo' },
    { label: '🏢 ថែម Supplier', prompt: 'Add supplier: Grand Palace Hotel Bangkok, type hotel, Net 30, rating 5' },
    { label: '🧾 កត់ត្រាចំណាយ', prompt: 'Log expense: $45 for VIP badge laminating and printouts' },
    { label: '📊 វិភាគ P&L', prompt: 'គណនាប្រាក់ចំណេញសរុបលើកញ្ចប់ Vietnam B2B Trade Mission 2026' }
  ] : [
    { label: '✈️ New Tour', prompt: 'Create new tour package: Bangkok 4D3N $320 B2B Expo' },
    { label: '🏢 Add Supplier', prompt: 'Add supplier: Grand Palace Hotel Bangkok, type hotel, Net 30, rating 5' },
    { label: '🧾 Log Expense', prompt: 'Log expense: $45 for VIP badge laminating and printouts' },
    { label: '📊 P&L Analysis', prompt: 'Analyze profit margins and operational cost breakdown for 30 delegates' }
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'init_msg',
      sender: 'assistant',
      text: language === 'km'
        ? `✨ **ជម្រាបសួរ ${currentUser?.name || 'Administrator'}! ខ្ញុំជា KHB AI Back-Office Copilot**\n\nខ្ញុំអាចជួយលោកអ្នក **បង្កើត (Create), មើល (Read), កែសម្រួល (Update), និងលុប (Delete)** ទិន្នន័យ Tour Packages, Suppliers, POs, Expenses និង P&L ដោយស្វ័យប្រវត្តិ។`
        : `✨ **Hello ${currentUser?.name || 'Administrator'}! I am your KHB AI Back-Office Copilot**\n\nI can help you **Create, Read, Update, and Delete** Tour Packages, Suppliers, Purchase Orders, Expenses, and P&L calculations automatically.`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [expandedPayloadId, setExpandedPayloadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen, isMinimized]);

  // 🔒 CRITICAL REQUIREMENT: Show ONLY for Logged in Back-Office (Admin/Staff) users AND if feature enabled
  if (!currentUser || !isAdmin || (systemSettings && systemSettings.enableAiCopilot === false)) {
    return null;
  }

  const handleSend = async (customPrompt?: string) => {
    const query = customPrompt || inputText;
    if (!query.trim() || isThinking) return;

    const userMsg: AiChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsThinking(true);

    try {
      const res = await processAiPrompt(query, {
        packages,
        suppliers,
        costTemplates,
        purchaseOrders,
        expenses,
        currentUserEmail: currentUser?.email,
        language
      });

      const aiMsg: AiChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        text: res.text,
        proposals: res.proposals,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error('AI error:', e);
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: 'សូមអភ័យទោស មានបញ្ហាបច្ចេកទេសបន្តិចបន្តួច។',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleExecute = (prop: AiActionProposal, msgId: string) => {
    try {
      if (prop.type === 'create_package') {
        addPackage(prop.payload);
        addNotification('AI Package Created', prop.payload.title, 'booking');
      } else if (prop.type === 'create_supplier') {
        addSupplier(prop.payload);
        addNotification('AI Supplier Registered', prop.payload.name, 'system');
      } else if (prop.type === 'log_expense') {
        addExpense(prop.payload);
        addNotification('AI Expense Logged', `$${prop.payload.amountUSD}`, 'system');
      } else if (prop.type === 'create_purchase_order') {
        createPurchaseOrder(prop.payload);
        addNotification('AI PO Created', 'Purchase Order generated', 'system');
      } else if (prop.type === 'delete_package' && prop.payload.id) {
        deletePackage(prop.payload.id);
        addNotification('AI Package Removed', 'Moved to Data Recovery', 'system');
      } else if (prop.type === 'delete_supplier' && prop.payload.id) {
        deleteSupplier(prop.payload.id);
        addNotification('AI Supplier Removed', 'Moved to Data Recovery', 'system');
      }

      setMessages(prev =>
        prev.map(m =>
          m.id === msgId && m.proposals
            ? {
                ...m,
                proposals: m.proposals.map(p =>
                  p.id === prop.id ? { ...p, status: 'executed' } : p
                )
              }
            : m
        )
      );
    } catch (err) {
      console.error('Execution error:', err);
    }
  };

  return (
    <>
      {/* ── STICKY POP-UP TRIGGER (STICKY ON THE LEFT EDGE) ─────────── */}
      {!isOpen && (
        <aside
          aria-label="Staff AI Copilot Shortcut"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex items-center"
        >
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="group px-3 py-3 rounded-r-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white font-extrabold text-xs shadow-2xl shadow-indigo-600/50 hover:px-4.5 hover:bg-indigo-800 transition-all flex items-center gap-2 cursor-pointer border-y border-r border-indigo-400/30 backdrop-blur-md"
            title="KHB AI Operations Copilot (Staff Only)"
          >
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-500 text-white shadow-md group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-black tracking-tight text-amber-300">
                ✨ AI Copilot
              </span>
              <span className="text-[9px] text-slate-300 font-mono">
                Auto-CRUD Active
              </span>
            </div>
          </button>
        </aside>
      )}

      {/* ── LEFT POP-UP STICKY CHAT EXTENSION DRAWER ──────────────────── */}
      {isOpen && (
        <section
          aria-label="Staff AI Copilot Extension"
          className={`fixed left-4 z-50 transition-all duration-300 ${
            isMinimized
              ? 'bottom-6 w-80 h-14'
              : 'bottom-6 w-[410px] max-w-[95vw] h-[550px]'
          } bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-indigo-200 dark:border-indigo-900/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-6`}
        >
          {/* Header Ribbon */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-500 text-white shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">
                    KHB AI Copilot
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] font-mono border border-emerald-500/30">
                    Staff
                  </span>
                </div>
                <div className="text-[10px] text-slate-300">
                  Logged in as <span className="font-semibold text-amber-300">{currentUser?.name?.split(' ')[0] || 'Staff'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'reset_' + Date.now(),
                      sender: 'assistant',
                      text: '🔄 Session reset. How can I assist you with Back-Office operations?',
                      timestamp: new Date().toISOString()
                    }
                  ])
                }
                title="Reset Conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Close Drawer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Action Pills */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {QUICK_ACTIONS.map((qa, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(qa.prompt)}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-[11px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap shadow-2xs hover:scale-103 transition-all cursor-pointer"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>

              {/* Chat Message Scroll Area */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${
                      m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                        m.sender === 'user'
                          ? 'bg-slate-900 dark:bg-slate-700'
                          : 'bg-gradient-to-tr from-amber-500 to-indigo-600 shadow-sm'
                      }`}
                    >
                      {m.sender === 'user' ? '👤' : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 space-y-2 ${
                        m.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-xs shadow-md shadow-indigo-500/20'
                          : 'bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed text-[11.5px]">
                        {m.text}
                      </p>

                      {/* Proposal Action Cards */}
                      {m.proposals && m.proposals.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          {m.proposals.map(prop => {
                            const isExecuted = prop.status === 'executed';
                            const isExpanded = expandedPayloadId === prop.id;

                            return (
                              <div
                                key={prop.id}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  isExecuted
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                                    : 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 shadow-xs'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1.5">
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold text-[11px] text-slate-900 dark:text-white truncate">
                                      {prop.summary}
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                      {prop.explanation}
                                    </p>
                                  </div>

                                  <div className="shrink-0">
                                    {isExecuted ? (
                                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                                        <CheckCircle2 className="w-3 h-3" /> Done
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleExecute(prop, m.id)}
                                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs cursor-pointer"
                                      >
                                        <Zap className="w-2.5 h-2.5" /> Execute
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px]">
                                  <button
                                    onClick={() => setExpandedPayloadId(isExpanded ? null : prop.id)}
                                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <Code className="w-2.5 h-2.5" />
                                    <span>{isExpanded ? 'Hide Payload' : 'JSON Preview'}</span>
                                  </button>
                                </div>

                                {isExpanded && (
                                  <pre className="mt-1.5 p-2 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[9px] overflow-x-auto max-h-36">
                                    {JSON.stringify(prop.payload, null, 2)}
                                  </pre>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500">
                    <Bot className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    <span>AI Copilot is processing request...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Form */}
              <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Create tour, add supplier, log expense (Khmer/En)..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-indigo-500 shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isThinking}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white cursor-pointer transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
};
