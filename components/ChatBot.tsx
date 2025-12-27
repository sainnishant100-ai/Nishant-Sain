import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const stream = await GeminiService.chat(input, []);
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].text = fullResponse;
          return newMsgs;
        });
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: 'Error connecting to intelligence nexus.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="w-80 h-96 mb-4 glass-panel rounded-3xl flex flex-col border border-white/10 shadow-2xl animate-fade-up overflow-hidden">
          <div className="bg-white/5 px-5 py-4 flex items-center justify-between border-b border-white/5">
            <span className="font-brand text-sm tracking-widest text-white/80">LUMINA AI</span>
            <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.length === 0 && (
              <p className="text-[10px] text-white/20 text-center font-black uppercase tracking-[0.3em] mt-20">Awaiting Inquiry</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] text-white/30 animate-pulse font-bold tracking-widest">THINKING...</div>}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-black/40 border-t border-white/5">
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full bg-transparent text-xs text-white placeholder-white/20 focus:outline-none px-2"
            />
          </form>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group"
      >
        <i className={`fa-solid ${isOpen ? 'fa-comment-slash' : 'fa-comment-dots'} text-xl group-hover:rotate-12 transition-transform`}></i>
      </button>
    </div>
  );
};

export default ChatBot;