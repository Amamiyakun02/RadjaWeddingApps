import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, X, Bot, User, Heart, 
  Crown, ShoppingBag, ArrowRight, MessageCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatIDR } from '../utils/formatters';

export default function KiranaChatModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Sampurasun & Halo! Saya **Kirana**, Asisten Konsultan Pernikahan AI dari Radja Wedding 🌸.\n\nAda yang bisa saya bantu hari ini? Anda dapat menanyakan rekomendasi paket busana adat (Sunda, Jawa, Minang), gaun modern bridal, tata rias MUA, atau kalkulasi anggaran pernikahan Anda!',
      suggestions: [
        'Rekomendasikan paket adat Sunda lengkap',
        'Berapa estimasi biaya rias dan gaun modern bridal?',
        'Apa saja isi Paket Ratu Kencana?',
        'Jelaskan cara reservasi dan sistem DP'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (msgText) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const newMsgs = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMsgs);
    setInputMessage('');
    setLoading(true);

    try {
      const history = newMsgs.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.kiranaChat(textToSend, history);
      
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: res.reply,
          suggestedProducts: res.suggested_products,
          suggestedBundles: res.suggested_bundles
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: 'Maaf, terjadi gangguan pada koneksi AI. Namun Anda dapat langsung menghubungi stylist kami via WhatsApp!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full sm:max-w-xl h-[90vh] sm:h-[650px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden border border-maroon-200 animate-slideUp">
        
        {/* Header with mobile handle */}
        <div className="bg-gradient-to-r from-maroon-900 via-maroon-800 to-[#2E0711] p-4 sm:p-5 text-white flex flex-col shadow-md">
          {/* Mobile Drag Indicator */}
          <div className="sm:hidden w-10 h-1 bg-white/30 rounded-full mx-auto mb-2" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-maroon-950 flex items-center justify-center font-bold shadow-md">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-amber-200">Kirana Wedding AI</h3>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">Konsultan Busana & Rias Pernikahan Radja Wedding</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Tutup Konsultasi"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Message Bubble Container */}
        <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-4 bg-[#FCFAF9]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 sm:gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-maroon-100 text-maroon-800 flex items-center justify-center shrink-0 mt-1 border border-maroon-200 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              )}

              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                  m.role === 'user'
                    ? 'bg-maroon-800 text-white rounded-tr-none shadow-md shadow-maroon-800/10 font-medium'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line">
                  {m.content}
                </div>

                {/* Suggestions Pills (Horizontal scrollable on mobile) */}
                {m.suggestions && (
                  <div className="pt-2 flex flex-wrap sm:flex-wrap gap-1.5 overflow-x-auto no-scrollbar">
                    {m.suggestions.map((s, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(s)}
                        className="text-[11px] bg-maroon-50 text-maroon-900 hover:bg-maroon-100 px-3 py-1.5 rounded-full border border-maroon-200 font-semibold transition-colors text-left shrink-0 active:scale-95"
                      >
                        ✨ {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-maroon-800 bg-maroon-50 p-3 rounded-2xl border border-maroon-200 w-fit animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin text-maroon-700" />
              <span>Kirana sedang meracik rekomendasi...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with safe bottom padding */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 pb-safe">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tanyakan rekomendasi busana, rias, harga..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-3 sm:px-5 sm:py-3 bg-maroon-800 hover:bg-maroon-900 text-white rounded-2xl shadow-md shadow-maroon-800/20 disabled:opacity-50 transition-all shrink-0 active:scale-95 flex items-center justify-center"
              aria-label="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
