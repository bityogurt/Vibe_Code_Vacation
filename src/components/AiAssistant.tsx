import React, { useState } from 'react';
import { Bot, Send, Sparkles, MapPin, Car, Compass, Loader2 } from 'lucide-react';
import { RoomState } from '../types';

interface AiAssistantProps {
  roomState: RoomState;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ roomState }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    {
      sender: 'ai',
      text: 'Salutare! Sunt Ghidul vostru AI pentru vacanța în Kefalonia (20-26 Iulie 2026, cazare la Villa Louke, 5 persoane și 2 mașini). Cu ce vă pot ajuta? Vă pot da sfaturi de condus, taverne autentice la preț bun sau adaptări de traseu!'
    }
  ]);

  const presetQuestions = [
    '🍽️ Taverne ieftine și excelente lângă Villa Louke',
    '🚗 Sfaturi parcare și traseu optim Myrtos pentru 2 mașini',
    '🌊 Cele mai liniștite plaje ascunse din Kefalonia',
    '💰 Cum să împărțim cheltuielile de drum și mâncare pentru 5 oameni'
  ];

  const handleSendPrompt = async (textToSend?: string) => {
    const messageText = textToSend || prompt;
    if (!messageText.trim() || loading) return;

    setPrompt('');
    setChatLog(prev => [...prev, { sender: 'user', text: messageText }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: messageText,
          lockedItineraries: roomState.itineraries,
          roomMembers: roomState.members
        })
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setChatLog(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setChatLog(prev => [...prev, { sender: 'ai', text: 'Eroare la procesare: ' + (data.error || 'Server indisponibil.') }]);
      }
    } catch (err: any) {
      setChatLog(prev => [...prev, { sender: 'ai', text: 'Nu am putut conecta la serverul AI. Verificați conexiunea la internet.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/80 via-slate-900 to-indigo-900/80 p-5 rounded-3xl border border-purple-500/20 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 font-bold">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Kefalonia AI Advisor</h2>
            <p className="text-xs text-slate-300">Ghidul tău inteligent local pentru trasee, parcare 2 mașini și opțiuni ieftine de mâncare.</p>
          </div>
        </div>
      </div>

      {/* Preset Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {presetQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(q)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/40 text-xs font-medium whitespace-nowrap transition shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 min-h-[380px] max-h-[500px] overflow-y-auto space-y-3 flex flex-col justify-between">
        <div className="space-y-3">
          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-purple-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-purple-400 text-xs p-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gândesc cel mai bun răspuns pentru Kefalonia...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Întreabă ceva despre Kefalonia (plaje, drumuri, restaurante)..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
            disabled={loading}
            className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />

          <button
            onClick={() => handleSendPrompt()}
            disabled={loading || !prompt.trim()}
            className="p-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl shadow-md transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
