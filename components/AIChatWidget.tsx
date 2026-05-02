'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { sendChatMessage } from '@/features/insights/actions';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  "Bagaimana kondisi keuangan saya bulan ini?",
  "Apa kategori pengeluaran terbesar saya?",
  "Berikan saran untuk berhemat.",
  "Cek status budget saya."
];

export default function AIChatWidget() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Halo! Saya asisten keuangan Anda. Ada yang bisa saya bantu analisis hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!mounted) return null;

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const result = await sendChatMessage(userMsg);

    setIsLoading(false);
    if (result.success && result.response) {
      setMessages(prev => [...prev, { role: 'assistant', content: result.response! }]);
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan. Coba lagi nanti.' }]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-24 lg:bottom-8 right-6 z-[60] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90",
          isOpen
            ? "bg-[var(--bg-card)] text-[var(--text-primary)] rotate-90"
            : "bg-gradient-to-br from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/40"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-[var(--bg-primary)] rounded-full animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      <div className={cn(
        "fixed bottom-40 lg:bottom-24 right-6 z-[60] w-[calc(100%-3rem)] sm:w-[400px] max-h-[500px] rounded-3xl flex flex-col shadow-2xl transition-all duration-500 origin-bottom-right border border-white/10",
        "bg-[var(--bg-secondary)]/95 backdrop-blur-2xl", // Increased opacity to 95%
        isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-10 pointer-events-none"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Tanya AI</h3>
              <p className="text-[10px] text-emerald-400 font-medium">● Online & Siap Membantu</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-[var(--text-muted)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] scroll-smooth no-scrollbar"
        >
          {messages.map((m, i) => (
            <div key={i} className={cn("flex items-start gap-3", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                m.role === 'assistant' ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-500/20 text-emerald-400"
              )}>
                {m.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={cn(
                "max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                m.role === 'assistant'
                  ? "bg-white/10 text-[var(--text-primary)] rounded-tl-none border border-white/10"
                  : "bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20"
              )}>
                {m.content.split('\n').map((line, j) => {
                  // Handle Headers
                  if (line.startsWith('###')) {
                    return <h4 key={j} className="font-bold text-sm mb-2 mt-1 text-indigo-300">{line.replace('###', '').trim()}</h4>;
                  }

                  // Handle Bold and Italic (Basic Regex)
                  const formattedLine = line
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>');

                  return (
                    <p
                      key={j}
                      className={cn(
                        "mb-1.5 last:mb-0",
                        line.startsWith('*') || line.startsWith('•') ? "pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-400" : ""
                      )}
                      dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[\*•]\s?/, '') }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                <span className="text-[10px] text-[var(--text-muted)]">AI sedang berpikir...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="text-[10px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="relative"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya sesuatu..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 pr-12 text-xs focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            <button
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50 disabled:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
