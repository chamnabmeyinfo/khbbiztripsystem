import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  processAiPrompt,
  AiChatMessage,
  AiActionProposal,
  AiThoughtTrace,
  AiPersonaRole
} from '../../services/geminiService';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  CheckCircle2,
  Code,
  Plane,
  Building2,
  Receipt,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Brain,
  Layers,
  ShieldAlert,
  Lightbulb,
  CheckCheck,
  Compass,
  DollarSign,
  Briefcase
} from 'lucide-react';

export const AiCopilotSection: React.FC = () => {
  const {
    packages,
    suppliers,
    costTemplates,
    purchaseOrders,
    expenses,
    bookings,
    addPackage,
    updatePackage,
    deletePackage,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addExpense,
    createPurchaseOrder,
    currentUser,
    addNotification,
    language
  } = useApp();

  const [activePersonaFilter, setActivePersonaFilter] = useState<'auto' | 'finance' | 'architect' | 'procurement' | 'crud'>('auto');

  const QUICK_PROMPTS = language === 'km' ? [
    {
      icon: Sparkles,
      label: '✨ Auto-Input: វិភាគអត្ថបទបង្កើត Tour',
      prompt: 'វិភាគ និងបង្កើត Tour Package ពីអត្ថបទនេះដោយស្វ័យប្រវត្តិ:\n"ដំណើរទស្សនៈកិច្ចពាណិជ្ជកម្មពិសេស: តែ កាហ្វេ ដុតនំ ការលក់រាយ & Franchise នៅវៀតណាម (ហូជីមិញ + កោះត្រល់) តម្លៃ $299 (ធម្មតា $350) រយៈពេល 4 ថ្ងៃ 3 យប់ ចុះឈ្មោះមុន 31/08/2026 រួមបញ្ចូលសណ្ឋាគារ 4 ផ្កាយ យន្តហោះក្នុងស្រុក និងកប៉ាល់មកកំពត"',
      personaHint: 'AI Text-to-Package Architect'
    },
    {
      icon: Layers,
      label: 'រៀបចំ Mission ពេញលេញ (End-to-End)',
      prompt: 'រៀបចំ Business Mission ទៅបាងកក ៤ថ្ងៃ $480: បង្កើតកញ្ចប់ដំណើរកម្សាន្ត + ចុះឈ្មោះសណ្ឋាគារ + ចេញប័ណ្ណកម្ម៉ង់ទិញ PO ក្នុងពេលតែមួយ',
      personaHint: 'Multi-Entity Workflow Orchestrator'
    },
    {
      icon: Plane,
      label: 'បង្កើតកញ្ចប់ដំណើរកម្សាន្តថ្មី',
      prompt: 'បង្កើតកញ្ចប់ដំណើរកម្សាន្តថ្មីទៅ Tokyo & Osaka ៥ថ្ងៃ ៤យប់ តម្លៃ $850 សម្រាប់ Japan Innovation Expo 2026',
      personaHint: 'Chief Travel Architect'
    },
    {
      icon: TrendingUp,
      label: 'វិភាគប្រាក់ចំណេញ & Cash Runway',
      prompt: 'វិភាគប្រាក់ចំណេញដុល (Gross Margin), លំហូរសាច់ប្រាក់ (Cash Flow), និងបំណុល POs ដែលមិនទាន់ទូទាត់',
      personaHint: 'Chief Financial Officer'
    },
    {
      icon: Building2,
      label: 'ចុះឈ្មោះ Supplier សណ្ឋាគារ VIP',
      prompt: 'Add supplier: Grand Palace Hotel Bangkok, type hotel, contact Somchai, Net 30 terms, rating 5',
      personaHint: 'Procurement Director'
    }
  ] : [
    {
      icon: Sparkles,
      label: '✨ Auto-Input Tour Package from Pasted Text',
      prompt: 'Analyze and auto-create a tour package from this raw text:\n"Special Trade Mission: Coffee, Tea, Bakery, Retail & Franchise Expo (Ho Chi Minh & Phu Quoc), Price $299 USD (regular $350), 4 Days 3 Nights, includes 4-star hotel, domestic flight & high-speed ferry to Kampot"',
      personaHint: 'AI Text-to-Package Architect'
    },
    {
      icon: Layers,
      label: 'Orchestrate Full Mission (End-to-End)',
      prompt: 'Create 4-Day Bangkok Trade Mission $480: build tour package + onboard partner hotel + issue initial PO simultaneously',
      personaHint: 'Multi-Entity Workflow Orchestrator'
    },
    {
      icon: Plane,
      label: 'Design Tour Package',
      prompt: 'Create new tour package to Tokyo & Osaka 5D4N price $850 for Japan Innovation Expo 2026',
      personaHint: 'Chief Travel Architect'
    },
    {
      icon: TrendingUp,
      label: 'P&L & Cash Runway Audit',
      prompt: 'Analyze gross profit margins, cash flow runway, and outstanding PO supplier liabilities',
      personaHint: 'Chief Financial Officer'
    },
    {
      icon: Building2,
      label: 'Onboard Hospitality Partner',
      prompt: 'Add new supplier: Grand Palace Hotel Bangkok, type hotel, contact Somchai, Net 30 terms, rating 5',
      personaHint: 'Procurement Director'
    }
  ];

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: language === 'km'
        ? `👋 **ជម្រាបសួរ! ខ្ញុំជា KHB Autonomous Operations Copilot**\n\nខ្ញុំត្រូវបានបំពាក់ដោយ **Adaptive Cognitive Reasoning** ដើម្បីគិត និងសម្របខ្លួនតាមតម្រូវការជាក់ស្ដែងរបស់អ្នក៖\n\n` +
          `• 🧠 **គិត និងវិភាគស៊ីជម្រៅ (Transparent Thought Trace)**: បង្ហាញជំហានគិត ហេតុផលយុទ្ធសាស្ត្រ និងការគណនាតម្លៃដើមមុននឹងឆ្លើយ\n` +
          `• 🚀 **Orchestrate Multi-Entity Actions**: បង្កើតកញ្ចប់ដំណើរកម្សាន្ត + ចុះឈ្មោះសណ្ឋាគារ + ចេញប័ណ្ណកម្ម៉ង់ទិញ PO ក្នុងពេលតែមួយ (1-Click Execute All)\n` +
          `• 📊 **Financial & Margin Optimization**: គណនាប្រាក់ចំណេញដុល វិភាគលំហូរសាច់ប្រាក់ និងកំណត់តម្លៃ Early-Bird\n` +
          `• 🌐 **គាំទ្រ ២ ភាសាពេញលេញ (Khmer & English)**\n\n` +
          `សូមជ្រើសរើស Quick Action ខាងក្រោម ឬសរសេរសំណើរបស់អ្នកមកកាន់ខ្ញុំ!`
        : `👋 **Hello! I am your KHB Autonomous Operations Copilot**\n\nI am enhanced with **Adaptive Cognitive Reasoning** to think, calculate, and execute based on your exact input:\n\n` +
          `• 🧠 **Transparent Thought Trace**: View step-by-step cognitive reasoning, logistics formulas, and margin calculations\n` +
          `• 🚀 **Multi-Entity Workflow Orchestration**: Create tour packages, onboard suppliers, and issue procurement POs in a single unified turn\n` +
          `• 📊 **Financial Yield Intelligence**: Audit P&L gross margins, break-even delegates, and cash flow runway\n` +
          `• 🌐 **Bilingual Fluency**: Native support for Khmer (ភាសាខ្មែរ) and English\n\n` +
          `Choose an adaptive action below or type your operational prompt!`,
      thoughtTrace: {
        adaptedPersona: 'Autonomous Operations Lead',
        detectedIntent: 'System Initialization & Standby',
        confidence: 100,
        steps: [
          {
            phase: 'context_retrieval',
            title: 'Live ERP Database Initialized',
            detail: `Synchronized ${packages.length} tour packages, ${suppliers.length} suppliers, and ${purchaseOrders.length} purchase orders.`,
            metrics: [
              { label: 'Packages', value: `${packages.length}`, trend: 'up' },
              { label: 'Suppliers', value: `${suppliers.length}`, trend: 'neutral' },
              { label: 'Active POs', value: `${purchaseOrders.length}`, trend: 'up' },
            ]
          }
        ]
      },
      timestamp: new Date().toISOString()
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStage, setThinkingStage] = useState('Deconstructing user prompt...');
  const [expandedThoughtIds, setExpandedThoughtIds] = useState<Record<string, boolean>>({ msg_welcome: true });
  const [expandedPayloadId, setExpandedPayloadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle stage animation while thinking
  useEffect(() => {
    if (!isThinking) return;
    const stages = [
      language === 'km' ? 'កំពុងវិភាគសំណួរ និងទាញយកទិន្នន័យ ERP...' : 'Deconstructing intent & extracting constraints...',
      language === 'km' ? 'កំពុងផ្ទៀងផ្ទាត់ Suppliers និងគណនាតម្លៃដើម...' : 'Cross-referencing supplier directory & cost models...',
      language === 'km' ? 'កំពុងគណនាប្រាក់ចំណេញ និងបង្កើនប្រសិទ្ធភាព...' : 'Simulating yield margins & logistics schedules...',
      language === 'km' ? 'កំពុងរៀបចំ Live Actions សម្រាប់អនុវត្ត...' : 'Synthesizing live actionable system mutations...'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % stages.length;
      setThinkingStage(stages[idx]);
    }, 800);
    return () => clearInterval(interval);
  }, [isThinking, language]);

  const toggleThought = (msgId: string) => {
    setExpandedThoughtIds(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleSendPrompt = async (promptToSend?: string) => {
    const query = promptToSend || inputPrompt;
    if (!query.trim() || isThinking) return;

    const userMsg: AiChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!promptToSend) setInputPrompt('');
    setIsThinking(true);

    try {
      const result = await processAiPrompt(query, {
        packages,
        suppliers,
        costTemplates,
        purchaseOrders,
        expenses,
        bookings,
        currentUserEmail: currentUser?.email,
        language,
        copilotMode: activePersonaFilter
      });

      const aiMsgId = 'msg_ai_' + Date.now();
      const aiMsg: AiChatMessage = {
        id: aiMsgId,
        sender: 'assistant',
        text: result.text,
        thoughtTrace: result.thoughtTrace,
        proposals: result.proposals,
        timestamp: new Date().toISOString()
      };

      // Auto-expand thought trace on new messages
      setExpandedThoughtIds(prev => ({ ...prev, [aiMsgId]: true }));
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI Processing error:', err);
      const errMsg: AiChatMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'assistant',
        text: language === 'km'
          ? 'សូមអភ័យទោស មានបញ្ហាបច្ចេកទេសបន្តិចបន្តួច។ សូមសាកល្បងម្ដងទៀត។'
          : 'Encountered a transient processing error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  // Execute single action proposal
  const handleExecuteProposal = (proposal: AiActionProposal, messageId: string) => {
    try {
      switch (proposal.type) {
        case 'create_package':
          addPackage(proposal.payload);
          addNotification('AI Action Complete', `Tour Package "${proposal.payload.title}" created!`, 'booking');
          break;

        case 'create_supplier':
          addSupplier(proposal.payload);
          addNotification('AI Action Complete', `Supplier "${proposal.payload.name}" registered!`, 'system');
          break;

        case 'log_expense':
          addExpense(proposal.payload);
          addNotification('AI Action Complete', `Expense of $${proposal.payload.amountUSD} logged!`, 'system');
          break;

        case 'create_purchase_order':
          createPurchaseOrder(proposal.payload);
          addNotification('AI Action Complete', `Purchase Order "${proposal.payload.poNumber}" created!`, 'system');
          break;

        case 'delete_package':
          if (proposal.payload.id) deletePackage(proposal.payload.id);
          addNotification('AI Action Complete', 'Package moved to Data Recovery', 'system');
          break;

        case 'delete_supplier':
          if (proposal.payload.id) deleteSupplier(proposal.payload.id);
          addNotification('AI Action Complete', 'Supplier moved to Data Recovery', 'system');
          break;

        default:
          addNotification('Action Acknowledged', proposal.summary, 'system');
      }

      // Mark proposal as executed
      setMessages(prev =>
        prev.map(msg => {
          if (msg.id === messageId && msg.proposals) {
            return {
              ...msg,
              proposals: msg.proposals.map(p =>
                p.id === proposal.id ? { ...p, status: 'executed' } : p
              )
            };
          }
          return msg;
        })
      );
    } catch (err) {
      console.error('Error executing proposal:', err);
    }
  };

  // Execute ALL proposals in message
  const handleExecuteAllProposals = (proposals: AiActionProposal[], messageId: string) => {
    proposals.forEach(p => {
      if (p.status !== 'executed') {
        handleExecuteProposal(p, messageId);
      }
    });
  };

  const getPersonaBadgeColor = (persona?: AiPersonaRole) => {
    switch (persona) {
      case 'Chief Financial Officer & Yield Strategist':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'Chief Travel & Itinerary Architect':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      case 'Procurement & Vendor Director':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Multi-Entity Workflow Orchestrator':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      default:
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Executive Ribbon ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-500/30">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <span>KHB AI Adaptive Operations Copilot</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Adaptive Cognitive Engine Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Auto-adapts its cognitive role based on your input: generates complete tour itineraries, onboards vendors with Net 30 terms, audits cash runways, and executes multi-entity workflows.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMessages([
                {
                  id: 'msg_welcome',
                  sender: 'assistant',
                  text: '🔄 Session reset. How can I assist you with KHB Trip management today?',
                  timestamp: new Date().toISOString()
                }
              ]);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Session</span>
          </button>
        </div>
      </div>

      {/* ── Adaptive Role Selection Tabs ─────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-indigo-500" />
          <span>Role Focus:</span>
        </span>
        {[
          { id: 'auto', label: '⚡ Auto-Adaptive (AI Chooses)', icon: Brain },
          { id: 'architect', label: '✈️ Travel Architect', icon: Plane },
          { id: 'finance', label: '📊 Financial Yield / P&L', icon: DollarSign },
          { id: 'procurement', label: '🏢 Procurement & POs', icon: Briefcase },
          { id: 'crud', label: '🎯 Instant CRUD', icon: Layers }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActivePersonaFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activePersonaFilter === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Quick Action Prompt Chips ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_PROMPTS.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendPrompt(qp.prompt)}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {qp.label}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  "{qp.prompt}"
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                <span>{qp.personaHint}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Main Chat & Thought Workspace ─────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-md flex flex-col h-[640px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map(msg => {
            const hasThoughts = msg.thoughtTrace && msg.thoughtTrace.steps.length > 0;
            const isThoughtOpen = !!expandedThoughtIds[msg.id];
            const hasPendingProposals = msg.proposals && msg.proposals.some(p => p.status !== 'executed');

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 dark:bg-slate-700'
                      : 'bg-gradient-to-tr from-amber-500 via-indigo-600 to-teal-600'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[90%] sm:max-w-[80%] rounded-3xl p-4 sm:p-5 text-xs space-y-3.5 ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-md shadow-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {/* ── Adaptive Cognitive Thought Trace Accordion ── */}
                  {msg.sender === 'assistant' && msg.thoughtTrace && (
                    <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/50 dark:bg-indigo-950/30 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleThought(msg.id)}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="p-1 rounded-lg bg-indigo-500 text-white">
                            <Brain className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            Cognitive Thought & Adaptive Analysis
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPersonaBadgeColor(msg.thoughtTrace.adaptedPersona)}`}>
                            {msg.thoughtTrace.adaptedPersona}
                          </span>
                          {msg.thoughtTrace.confidence && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {msg.thoughtTrace.confidence}% confidence
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                          <span className="text-[11px] font-semibold hidden sm:inline">
                            {isThoughtOpen ? 'Collapse Trace' : 'View Trace'}
                          </span>
                          {isThoughtOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isThoughtOpen && (
                        <div className="p-3.5 space-y-3 border-t border-indigo-100 dark:border-indigo-900/60 bg-white/60 dark:bg-slate-900/80">
                          {/* Identified Intent */}
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                            <span className="text-slate-400">Intent:</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {msg.thoughtTrace.detectedIntent}
                            </span>
                          </div>

                          {/* Reasoning Steps */}
                          <div className="space-y-2">
                            {msg.thoughtTrace.steps.map((st, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5"
                              >
                                <div className="flex items-center justify-between text-[11px]">
                                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[9px] font-mono">
                                      {sIdx + 1}
                                    </span>
                                    <span>{st.title}</span>
                                  </div>
                                  <span className="text-[9px] font-mono uppercase text-slate-400">
                                    {st.phase.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-5">
                                  {st.detail}
                                </p>

                                {st.insights && st.insights.length > 0 && (
                                  <div className="pl-5 pt-1 flex flex-wrap gap-1.5">
                                    {st.insights.map((ins, iIdx) => (
                                      <span
                                        key={iIdx}
                                        className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium"
                                      >
                                        ✓ {ins}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {st.metrics && st.metrics.length > 0 && (
                                  <div className="pl-5 pt-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {st.metrics.map((m, mIdx) => (
                                      <div key={mIdx} className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                                        <div className="text-[9px] text-slate-400">{m.label}</div>
                                        <div className="text-xs font-bold text-slate-800 dark:text-white font-mono">{m.value}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Risk / Opportunity Alerts */}
                          {msg.thoughtTrace.riskOrOpportunityAlerts && msg.thoughtTrace.riskOrOpportunityAlerts.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              {msg.thoughtTrace.riskOrOpportunityAlerts.map((al, aIdx) => (
                                <div
                                  key={aIdx}
                                  className={`p-2.5 rounded-xl border flex items-start gap-2 text-[11px] ${
                                    al.type === 'opportunity'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-300'
                                      : al.type === 'risk'
                                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-300'
                                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-300'
                                  }`}
                                >
                                  {al.type === 'opportunity' ? (
                                    <Lightbulb className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                                  ) : (
                                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                                  )}
                                  <span>{al.message}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Main Message Text ── */}
                  <div className="whitespace-pre-line leading-relaxed font-sans text-xs">
                    {msg.text}
                  </div>

                  {/* ── AI Proposed Live Actions ── */}
                  {msg.proposals && msg.proposals.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>Live System Mutations ({msg.proposals.length})</span>
                        </div>

                        {msg.proposals.length > 1 && hasPendingProposals && (
                          <button
                            type="button"
                            onClick={() => handleExecuteAllProposals(msg.proposals!, msg.id)}
                            className="px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 hover:opacity-90 text-white font-bold text-[11px] shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Execute All Actions ({msg.proposals.filter(p => p.status !== 'executed').length})</span>
                          </button>
                        )}
                      </div>

                      {msg.proposals.map(proposal => {
                        const isExecuted = proposal.status === 'executed';
                        const isExpanded = expandedPayloadId === proposal.id;

                        return (
                          <div
                            key={proposal.id}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              isExecuted
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
                                : 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800/80 shadow-sm'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono uppercase">
                                    {proposal.type.replace('_', ' ')}
                                  </span>
                                  <span>{proposal.summary}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                  {proposal.explanation}
                                </p>
                              </div>

                              {/* Execution Button */}
                              <div className="shrink-0">
                                {isExecuted ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Executed</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleExecuteProposal(proposal, msg.id)}
                                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
                                  >
                                    <Zap className="w-3.5 h-3.5" />
                                    <span>Execute Now</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Raw Payload Preview Toggle */}
                            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                              <button
                                type="button"
                                onClick={() => setExpandedPayloadId(isExpanded ? null : proposal.id)}
                                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Code className="w-3 h-3" />
                                <span>{isExpanded ? 'Hide Payload' : 'Inspect ERP Payload'}</span>
                              </button>
                              <span className="text-slate-400 font-mono">
                                {new Date(proposal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {isExpanded && (
                              <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-48 border border-slate-800">
                                {JSON.stringify(proposal.payload, null, 2)}
                              </pre>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* ── Active Thinking Animation ── */}
          {isThinking && (
            <div className="flex items-start gap-3 animate-in fade-in duration-200">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Brain className="w-4 h-4 animate-spin" />
              </div>
              <div className="px-5 py-4 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    Cognitive Thinking & Adaptive Engine Running...
                  </span>
                </div>
                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">
                  → {thinkingStage}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Bar ── */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-700">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={
                language === 'km'
                  ? "សរសេរប្រាប់ AI: បង្កើតកញ្ចប់, ចុះឈ្មោះសណ្ឋាគារ, ចេញ PO, ឬគណនាប្រាក់ចំណេញ (Khmer / English)..."
                  : "Instruct AI: create tours, onboard suppliers, issue POs, or audit P&L yield (English / Khmer)..."
              }
              className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
            />

            <button
              type="submit"
              disabled={!inputPrompt.trim() || isThinking}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-teal-600 hover:from-indigo-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send Prompt</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
