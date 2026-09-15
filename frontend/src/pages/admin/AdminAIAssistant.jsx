import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Bot, User, Database, 
  CheckCircle2, Terminal, Layers, ArrowRight, DollarSign 
} from 'lucide-react';
import { api } from '../../services/api';
import { formatIDR } from '../../utils/formatters';

export default function AdminAIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Selamat datang di **Admin AI Executive Assistant** ⚡.\nSaya terhubung langsung dengan database internal Radja Wedding melalui **MCP Tools**. Anda dapat menanyakan ringkasan analitik atau memerintahkan aksi database langsung dengan teks biasa.',
      actionType: 'welcome'
    }
  ]);
  const [inputCommand, setInputCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const sampleCommands = [
    'Tampilkan total pemasukan dari booking terkonfirmasi bulan ini.',
    'Ubah status booking atas nama Amamiya menjadi Confirmed.',
    'Tambahkan produk dekorasi baru namanya Lampu Gantung Peri, harga sewa 50 ribu per hari.',
    'Berapa jumlah booking baru yang menunggu konfirmasi?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendCommand = async (cmdText) => {
    const cmd = (cmdText || inputCommand).trim();
    if (!cmd || loading) return;

    const newMsgs = [...messages, { role: 'user', content: cmd }];
    setMessages(newMsgs);
    setInputCommand('');
    setLoading(true);

    try {
      const res = await api.adminAICommand(cmd);
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: res.reply,
          actionType: res.action_type,
          executionResult: res.execution_result
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: '⚠️ Terjadi kesalahan saat memproses perintah MCP: ' + (err.message || 'Error internal server'),
          actionType: 'error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-4 sm:space-y-6 text-slate-800 h-[calc(100vh-5rem)] lg:h-[calc(100vh-2rem)] flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-maroon-100 pb-3 sm:pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-maroon-900 to-maroon-700 flex items-center justify-center text-amber-200 font-bold shadow-md shadow-maroon-900/20 shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-base sm:text-xl font-bold text-slate-900">Admin AI Assistant (MCP Engine)</h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-maroon-50 text-maroon-800 border border-maroon-200">
                Tool Calling Active
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500">Natural Language Query (NLQ) & Database Mutation</p>
          </div>
        </div>
      </div>

      {/* Chat & Execution Console */}
      <div className="flex-1 bg-white rounded-3xl border border-maroon-100 p-4 sm:p-6 overflow-y-auto space-y-4 shadow-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-2.5 sm:gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-maroon-100 text-maroon-800 border border-maroon-200 flex items-center justify-center shrink-0 mt-1">
                <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            )}

            <div className={`max-w-[88%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
              m.role === 'user'
                ? 'bg-gradient-to-r from-maroon-800 to-maroon-900 text-white font-semibold rounded-tr-none shadow-md'
                : 'bg-[#FAF2F4] text-slate-800 border border-maroon-100 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-line">
                {m.content}
              </div>

              {/* Execution Result Card if available */}
              {m.executionResult && (
                <div className="p-3 bg-white rounded-xl border border-maroon-200 text-xs font-mono text-maroon-900 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px]">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Database Mutation Output:</span>
                  </div>
                  <pre className="text-[11px] overflow-x-auto text-slate-800 pt-1">
                    {JSON.stringify(m.executionResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-maroon-50 text-maroon-800 border border-maroon-200 flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-maroon-900 bg-maroon-50 p-3 rounded-2xl border border-maroon-200 w-fit">
            <Sparkles className="w-4 h-4 animate-spin text-maroon-700" />
            <span>AI sedang mengeksekusi MCP Tool...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {sampleCommands.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendCommand(prompt)}
            className="text-[10px] sm:text-[11px] text-slate-700 bg-white hover:bg-maroon-50 hover:text-maroon-900 px-3 py-1.5 rounded-full shrink-0 border border-maroon-100 transition-colors shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendCommand();
        }}
        className="flex items-center gap-2 sm:gap-3 bg-white p-1.5 sm:p-2 rounded-2xl border border-maroon-200 shadow-xs"
      >
        <input
          type="text"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          placeholder="Ketik perintah (misal: 'Berapa total omset bulan ini')..."
          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-transparent text-slate-900 text-xs sm:text-sm focus:outline-none placeholder-slate-400 font-medium"
        />
        <button
          type="submit"
          disabled={!inputCommand.trim() || loading}
          className="px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-900 hover:from-maroon-900 hover:to-maroon-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-maroon-900/20 disabled:opacity-50 transition-all shrink-0 active:scale-95"
        >
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Kirim Perintah</span>
        </button>
      </form>

    </div>
  );
}
