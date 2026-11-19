import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { ActiveFilters, ChatMessage, CollegeRecord } from '../types/college';

interface StarterCard {
  title: string;
  subtitle: string;
  prompt: string;
}

const GUIDED_STARTER_CARDS: StarterCard[] = [
  {
    title: 'IIT Pathways: JEE Adv, GATE & JAM',
    subtitle: 'Compare IIT Bombay, Delhi, Madras & Jodhpur fees & ROI',
    prompt:
      'Compare IIT Bombay, IIT Delhi, IIT Madras, and IIT Jodhpur across UG (JEE Advanced via JoSAA) and PG (M.Tech via GATE/COAP, M.Sc via IIT JAM, MBA via CAT). Show exact fee ranges, placement highlights, fee recovery ROI, and Official / Admission Portal links.',
  },
  {
    title: 'Compare M.Tech & M.Sc ROI (GATE / JAM)',
    subtitle: 'PG payback across IITs, MNIT Jaipur, LNMIIT & private campuses',
    prompt:
      'Compare Postgraduate M.Tech and M.Sc ROI via GATE and IIT JAM across IIT Bombay, IIT Delhi, IIT Madras, IIT Jodhpur, MNIT Jaipur, and LNMIIT. Show PG total fees, entrance pathways, average placement packages, and Official / Admission Portal links.',
  },
  {
    title: 'Find best B.Tech in Jaipur under ₹10L',
    subtitle: 'Compare MNIT, JECRC, Poornima & Amity Jaipur ROI',
    prompt:
      'Find the best B.Tech colleges in Jaipur with total UG fees under ₹10L (including MNIT Jaipur, JECRC University, Poornima University, and Amity Jaipur). Compare fees, entrance exams, average placements, and Official / Admission Portal links.',
  },
  {
    title: 'Admissions without JEE Adv / GATE',
    subtitle: 'JEE Main, CAT, CUET, VITMEE, NMAT, SNAP & Merit routes',
    prompt:
      'Which colleges in the portal offer strong B.Tech, M.Tech, MBA, or MCA admissions without requiring JEE Advanced or GATE (e.g., via JEE Main, CAT, NMAT, SNAP, VITMEE, MET, CUET, or Merit)? List exact exams and Official / Admission Portal links.',
  },
];

function isSafeHttpUrl(url?: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function findMentionedColleges(content: string, allColleges: CollegeRecord[]): CollegeRecord[] {
  if (!content.trim()) return [];
  const lower = content.toLowerCase();

  return allColleges.filter((college) => {
    if (college.portalUrl && lower.includes(college.portalUrl.toLowerCase())) {
      return true;
    }
    const baseName = college.name.split('(')[0].trim().toLowerCase();
    if (baseName.length >= 6 && lower.includes(baseName)) {
      return true;
    }
    if (college.name.toLowerCase() && lower.includes(college.name.toLowerCase())) {
      return true;
    }
    const paren = college.name.match(/\(([^)]+)\)/);
    if (paren && paren[1]) {
      const code = paren[1].trim();
      if (code.length >= 3) {
        const regex = new RegExp(`\\b${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(content)) return true;
      }
    }
    if (college.id === 'jecrc-jaipur' && /\bjecrc\b/i.test(content)) return true;
    if (college.id === 'nmims-mumbai' && /\bnmims\b/i.test(content)) return true;
    if (college.id === 'srmist-chennai' && /\bsrm(?:ist)?\b/i.test(content)) return true;
    if (college.id === 'symbiosis-pune' && /\b(?:symbiosis|sibm|sit pune|siu)\b/i.test(content))
      return true;
    if (college.id === 'pes-bengaluru' && /\bpes\b/i.test(content)) return true;
    if (college.id === 'poornima-jaipur' && /\bpoornima\b/i.test(content)) return true;
    if (college.id === 'iit-jodhpur' && /\biit[\s-]*j(?:odhpur)?\b/i.test(content)) return true;
    if (college.id === 'iit-bombay' && /\biit[\s-]*b(?:ombay)?\b/i.test(content)) return true;
    if (college.id === 'iit-delhi' && /\biit[\s-]*d(?:elhi)?\b/i.test(content)) return true;
    if (college.id === 'iit-madras' && /\biit[\s-]*m(?:adras)?\b/i.test(content)) return true;
    return false;
  });
}

interface CounsellorPanelProps {
  allColleges: CollegeRecord[];
  filteredColleges: CollegeRecord[];
  filters: ActiveFilters;
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (promptText: string, scopeToFiltered: boolean) => void;
  onClearChat: () => void;
  onRetryLast: () => void;
  compact?: boolean;
  onClosePanel?: () => void;
}

export const CounsellorPanel: React.FC<CounsellorPanelProps> = ({
  allColleges,
  filteredColleges,
  filters,
  messages,
  isStreaming,
  onSendMessage,
  onClearChat,
  onRetryLast,
  compact = false,
  onClosePanel,
}) => {
  const [input, setInput] = useState('');
  const [scopeToFiltered, setScopeToFiltered] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasActiveFilter =
    filters.degreeLevels.length > 0 ||
    filters.locations.length > 0 ||
    filters.institutionTypes.length > 0 ||
    filters.programs.length > 0 ||
    filters.search.trim().length > 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput('');
    onSendMessage(trimmed, scopeToFiltered && hasActiveFilter);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  const activeScopeCount =
    scopeToFiltered && hasActiveFilter ? filteredColleges.length : allColleges.length;

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] dark:bg-slate-950 transition-colors">
      {/* Header */}
      <div
        className={`bg-white dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-800 shrink-0 transition-colors ${
          compact ? 'px-4 py-3' : 'px-5 sm:px-8 py-4'
        }`}
      >
        <div
          className={`${compact ? '' : 'max-w-5xl mx-auto'} flex flex-wrap items-center justify-between gap-2.5`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#2563EB] shrink-0" />
              <h2
                className={`font-display font-bold text-[#1E1B4B] dark:text-slate-100 tracking-tight truncate ${
                  compact ? 'text-sm' : 'text-lg sm:text-xl'
                }`}
              >
                AI Admissions Counsellor
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-mono tabular-nums font-semibold text-[#1E1B4B] dark:text-slate-200">
                {activeScopeCount}
              </span>{' '}
              {activeScopeCount === 1 ? 'college' : 'colleges'} in context
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasActiveFilter && (
              <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-[#E2E8F0] dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setScopeToFiltered(false)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    !scopeToFiltered
                      ? 'bg-white dark:bg-slate-900 text-[#1E1B4B] dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  All ({allColleges.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScopeToFiltered(true)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    scopeToFiltered
                      ? 'bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Filtered ({filteredColleges.length})
                </button>
              </div>
            )}

            {messages.length > 0 && (
              <button
                type="button"
                onClick={onClearChat}
                disabled={isStreaming}
                title="Clear conversation"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {!compact && <span>Clear Chat</span>}
              </button>
            )}

            {onClosePanel && (
              <button
                type="button"
                onClick={onClosePanel}
                aria-label="Close AI Counsellor panel"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Conversation Area */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto scrollbar-thin ${
          compact ? 'px-4 py-4' : 'px-4 sm:px-8 py-6'
        }`}
      >
        <div className={`${compact ? '' : 'max-w-5xl mx-auto'} space-y-4`}>
          {messages.length === 0 ? (
            <div className="animate-fade-slide space-y-4">
              {/* Warm Guided Welcome Message */}
              <div className="bg-gradient-to-br from-[#EEF2FF] via-white to-[#ECFDF5]/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border border-[#C7D2FE] dark:border-slate-800 rounded-xl p-5 space-y-2">
                <h3 className="font-display text-base font-semibold text-[#1E1B4B] dark:text-slate-100">
                  Welcome to Admit Bridge! How can I guide your UG or PG shortlist today?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ask me about JEE Advanced (JoSAA), GATE, IIT JAM, JEE Main, CAT, CUET, or
                  non-exam entry routes, fee recovery ROI, or side-by-side campus comparisons across{' '}
                  {allColleges.length} institutions. Pick a quick starter below to begin:
                </p>
              </div>

              {/* 4 Clickable Starter Cards */}
              <div
                className={`grid gap-2.5 ${
                  compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                }`}
              >
                {GUIDED_STARTER_CARDS.map((card, idx) => {
                  const accentBorders = [
                    'hover:border-[#2563EB] hover:bg-[#F5F8FF]',
                    'hover:border-emerald-500 hover:bg-emerald-50/50',
                    'hover:border-indigo-500 hover:bg-indigo-50/50',
                    'hover:border-amber-500 hover:bg-amber-50/50',
                  ];
                  return (
                    <button
                      key={card.title}
                      type="button"
                      disabled={isStreaming}
                      onClick={() =>
                        onSendMessage(card.prompt, scopeToFiltered && hasActiveFilter)
                      }
                      className={`group text-left p-4 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 ${accentBorders[idx % accentBorders.length]} dark:hover:border-blue-500 dark:hover:bg-slate-800/80 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150 cursor-pointer flex items-start justify-between gap-3`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-[#1E1B4B] dark:text-slate-100 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                          {card.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                          {card.subtitle}
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-indigo-400 group-hover:text-[#2563EB] shrink-0 mt-0.5 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const mentionedColleges =
                msg.role === 'assistant' && !msg.isError && msg.content
                  ? findMentionedColleges(msg.content, allColleges).filter((c) =>
                      isSafeHttpUrl(c.portalUrl)
                    )
                  : [];

              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'user' ? (
                    <div className="max-w-[88%] bg-gradient-to-r from-[#1E1B4B] to-[#2563EB] dark:from-[#2563EB] dark:to-blue-600 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs">
                      {msg.content}
                    </div>
                  ) : (
                    <div
                      className={`w-full rounded-xl border transition-colors ${
                        compact ? 'p-4' : 'p-5 sm:p-6'
                      } ${
                        msg.isError
                          ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900 text-red-900 dark:text-red-200'
                          : 'bg-white dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-[#1E1B4B] dark:text-slate-300">
                          {msg.isError ? 'Counsellor Notice' : 'Admissions Counsellor'}
                        </span>
                        <div className="flex items-center gap-2">
                          {msg.isError ? (
                            <button
                              type="button"
                              onClick={onRetryLast}
                              className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-300 hover:underline cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Retry</span>
                            </button>
                          ) : (
                            msg.content && (
                              <button
                                type="button"
                                onClick={() => handleCopy(msg.id, msg.content)}
                                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                aria-label="Copy response"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-emerald-700 dark:text-emerald-400">
                                      Copied
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {msg.isError ? (
                        <div className="flex items-start gap-2 text-xs sm:text-sm">
                          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                          <span>{msg.content}</span>
                        </div>
                      ) : msg.content ? (
                        <>
                          <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-2.5">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({ children }) => (
                                  <h2 className="font-display text-base font-semibold text-[#1E1B4B] dark:text-slate-100 mt-3.5 mb-1.5 first:mt-0">
                                    {children}
                                  </h2>
                                ),
                                h2: ({ children }) => (
                                  <h3 className="font-display text-sm sm:text-base font-semibold text-[#1E1B4B] dark:text-slate-100 mt-3.5 mb-1.5 first:mt-0">
                                    {children}
                                  </h3>
                                ),
                                h3: ({ children }) => (
                                  <h4 className="font-display text-xs sm:text-sm font-semibold text-[#1E1B4B] dark:text-slate-100 mt-2.5 mb-1">
                                    {children}
                                  </h4>
                                ),
                                p: ({ children }) => (
                                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1.5 first:mt-0 last:mb-0">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-1.5">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal pl-5 space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-1.5">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="leading-relaxed">{children}</li>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-[#1E1B4B] dark:text-white">
                                    {children}
                                  </strong>
                                ),
                                a: ({ href, children }) =>
                                  isSafeHttpUrl(href) ? (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-[#2563EB] text-white hover:bg-blue-700 no-underline transition-colors align-baseline whitespace-nowrap"
                                    >
                                      <span>{children}</span>
                                      <ExternalLink className="w-3 h-3 shrink-0" />
                                    </a>
                                  ) : (
                                    <span className="font-medium text-[#2563EB] dark:text-blue-400">
                                      {children}
                                    </span>
                                  ),
                                code: ({ children }) => (
                                  <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded">
                                    {children}
                                  </code>
                                ),
                                table: ({ children }) => (
                                  <div className="overflow-x-auto my-2.5 border border-[#E2E8F0] dark:border-slate-700 rounded-lg">
                                    <table className="w-full border-collapse text-xs">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                thead: ({ children }) => (
                                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-[#E2E8F0] dark:border-slate-700">
                                    {children}
                                  </thead>
                                ),
                                th: ({ children }) => (
                                  <th className="px-3 py-2 text-left font-semibold text-[#1E1B4B] dark:text-slate-200 whitespace-nowrap">
                                    {children}
                                  </th>
                                ),
                                td: ({ children }) => (
                                  <td className="px-3 py-2 border-t border-[#E2E8F0] dark:border-slate-800 text-slate-700 dark:text-slate-300 tabular-nums align-top">
                                    {children}
                                  </td>
                                ),
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>

                          {mentionedColleges.length > 0 && (
                            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                Official / Admission Portals ({mentionedColleges.length})
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {mentionedColleges.map((c) => (
                                  <a
                                    key={c.id}
                                    href={c.portalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#F8FAFC] dark:bg-slate-800 text-[#1E1B4B] dark:text-slate-100 border border-[#E2E8F0] dark:border-slate-700 hover:border-[#2563EB] hover:text-[#2563EB] dark:hover:text-blue-300 transition-colors whitespace-nowrap"
                                  >
                                    <span>{c.shortName}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        /* Animated Typing Dots while Gemini AI generates */
                        <div
                          className="flex items-center gap-3 py-1"
                          aria-live="polite"
                          aria-label="Gemini AI is typing"
                        >
                          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700">
                            <span className="typing-dot bg-[#2563EB] dark:bg-blue-400" />
                            <span className="typing-dot bg-[#2563EB] dark:bg-blue-400" />
                            <span className="typing-dot bg-[#2563EB] dark:bg-blue-400" />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Analyzing fees, cutoffs & ROI...
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Prompts + Composer Footer */}
      <div
        className={`bg-white dark:bg-slate-900 border-t border-[#E2E8F0] dark:border-slate-800 shrink-0 transition-colors ${
          compact ? 'px-4 py-3' : 'px-4 sm:px-8 py-4'
        }`}
      >
        <div className={`${compact ? '' : 'max-w-5xl mx-auto'} space-y-2.5`}>
          {messages.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {GUIDED_STARTER_CARDS.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  disabled={isStreaming}
                  onClick={() =>
                    onSendMessage(card.prompt, scopeToFiltered && hasActiveFilter)
                  }
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#F8FAFC] dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700 hover:border-[#2563EB] hover:text-[#2563EB] dark:hover:text-blue-300 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {card.title}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                rows={compact ? 2 : 2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about UG/PG fees, JEE Advanced, GATE, IIT JAM, CAT cutoffs, ROI..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-600/15 resize-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#2563EB] text-white hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {!compact && (
                <span className="hidden sm:inline">
                  {isStreaming ? 'Thinking...' : 'Send'}
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
