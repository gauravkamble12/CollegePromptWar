import React, { useState } from 'react';
import { Bot, Send, Sparkles, ShieldCheck, AlertTriangle, RefreshCw, User } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: any[];
  places?: any[];
  cautionNotes?: string[];
  confidenceScore?: number;
}

const PRESET_QUERIES = [
  "Plan a one-day Pune trip under ₹1,000.",
  "Suggest historical places I can visit in four hours.",
  "Find affordable restaurants and street food.",
  "Find accessible attractions for someone who cannot use stairs.",
  "What are the best places to visit if it rains?"
];

export const AIAssistant: React.FC<{ onSelectPlace?: (place: any) => void }> = ({ onSelectPlace }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your City Life AI Assistant. I provide evidence-grounded recommendations strictly derived from verified municipal datasets, business listings, and corroborated community reports. What would you like to explore today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    const userMsg: Message = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAI({ query: q });
      const assistantMsg: Message = {
        role: 'assistant',
        content: res.answer,
        citations: res.grounded_citations,
        places: res.recommended_places,
        cautionNotes: res.caution_notes,
        confidenceScore: res.confidence_score
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (_err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I encountered an error querying the intelligence engine. Please ensure backend services are operating."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[750px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">AI City Assistant (Evidence-Grounded RAG)</h2>
            <p className="text-xs text-slate-500">Strictly grounded in verified municipal and business registries</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" /> Anti-Hallucination Active
        </span>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="p-3 bg-slate-50/60 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-bold text-slate-500 uppercase tracking-wider shrink-0 text-[10px]">Try:</span>
        {PRESET_QUERIES.map((preset, i) => (
          <button
            key={i}
            onClick={() => handleSend(preset)}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shrink-0 transition-colors shadow-2xs"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30" aria-live="polite" aria-label="Assistant conversation">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] space-y-3 ${isUser ? 'items-end' : ''}`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Grounded Citations */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs space-y-1.5">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Verified Sources Cited:
                    </div>
                    {msg.citations.map((cite, ci) => (
                      <div key={ci} className="flex items-center justify-between text-slate-600 pl-2 border-l-2 border-indigo-500">
                        <span className="font-medium text-slate-800">{cite.title}</span>
                        <span className="text-[11px] text-slate-500">{cite.source_attribution} ({cite.data_timestamp})</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommended Place Mini-Cards */}
                {!isUser && msg.places && msg.places.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.places.map((place, pi) => (
                      <div
                        key={pi}
                        onClick={() => onSelectPlace && onSelectPlace(place)}
                        className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer shadow-2xs transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900 text-xs">{place.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 font-bold">
                            {place.trust_score}% Trust
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">{place.address}</div>
                        <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                          {place.cost_inr > 0 ? `₹${place.cost_inr} est.` : 'Free'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Caution Notes / Uncertainty Warning */}
                {!isUser && msg.cautionNotes && msg.cautionNotes.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Cautionary Notice:</span>
                      <ul className="list-disc list-inside">
                        {msg.cautionNotes.map((cn, cni) => (
                          <li key={cni}>{cn}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic p-3">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>Retrieving verified city records & calculating evidence grounding...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything (e.g. Plan a one-day Pune trip under ₹1,000)..."
          aria-label="Ask the city assistant"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 focus:outline-hidden"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shadow-xs"
          aria-label="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
