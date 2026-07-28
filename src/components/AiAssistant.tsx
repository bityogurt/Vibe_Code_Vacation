import React, { useState } from 'react';
import { Bot, Send, Loader2 } from 'lucide-react';
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
      text: 'Salutare! Sunt Ghidul vostru AI pentru Kefalonia (20-26 Septembrie 2026, cazare Villa Louke, 5 persoane, 2 mașini). Cu ce vă pot ajuta? Vă pot da sfaturi de drum, restaurante bune și trasee!'
    }
  ]);

  const presetQuestions = [
    '🍽️ Taverne ieftine și excelente lângă Villa Louke',
    '🚗 Parcare Myrtos pentru 2 mașini',
    '🌊 Plaje ascunse liniștite',
    '💰 Împărțire cheltuieli pentru 5 persoane'
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
      setChatLog(prev => [...prev, { sender: 'ai', text: 'Nu am putut conecta la serverul AI. Verificați conexiunea.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3 pb-6">
      
      {/* Header */}
      <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-lg flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">Ghid AI Kefalonia</h2>
          <p className="text-[11px] text-slate-400">Asistent virtual pentru trasee, taverne și 2 mașini</p>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {presetQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(q)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium whitespace-nowrap transition shrink-0 hover:text-white hover:border-sky-500/40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 min-h-[340px] max-h-[460px] overflow-y-auto space-y-3 flex flex-col justify-between shadow-lg">
        <div className="space-y-2.5">
          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-500 text-slate-950 font-bold rounded-tr-none'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sky-400 text-xs p-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Gândesc cel mai bun răspuns...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Întreabă ceva despre Kefalonia..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
            disabled={loading}
            className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 focus:outline-none"
          />

          <button
            onClick={() => handleSendPrompt()}
            disabled={loading || !prompt.trim()}
            className="p-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
