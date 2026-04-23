import React, { useState, useRef, useEffect } from 'react';
import { getInventory } from '../services/storage';
import { chatWithPantryAI } from '../services/ai';
import { useNavigate } from 'react-router-dom';

export default function AIChat() {
  const [messages, setMessages] = useState([{ role: "model", text: "Hello! I'm your AI Chef. What's on your mind? You can ask me what we have in the pantry, or what we can cook today!" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    
    const newMessages = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    const items = getInventory();
    
    // Call AI
    const reply = await chatWithPantryAI(newMessages, userMsg, items);
    
    setMessages([...newMessages, { role: "model", ...reply }]);
    setLoading(false);
  };

  return (
    <div className="pt-24 pb-32 px-6 max-w-2xl mx-auto flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 w-full z-50 bg-[#fafaf5]/90 backdrop-blur-md flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
          </div>
          <h1 className="text-xl font-bold font-headline text-on-surface">PantryPal AI</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto mb-4 space-y-6 pr-2 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-3xl p-5 shadow-sm border ${msg.role === 'user' ? 'bg-primary text-white border-primary rounded-br-sm' : 'bg-surface-container-lowest text-on-surface border-outline-variant/30 rounded-bl-sm'}`}>
              <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.text}</p>
              {msg.actionLink && (
                 <button 
                    onClick={() => navigate(msg.actionLink)} 
                    className="mt-4 px-5 py-3 w-full bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
                 >
                    {msg.actionText || 'View Details'}
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                 </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-container-lowest text-on-surface border border-outline-variant/30 rounded-3xl rounded-bl-sm p-5 flex gap-2 items-center shadow-sm">
               <div className="w-2.5 h-2.5 rounded-full bg-primary-fixed animate-bounce"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-primary-fixed animate-bounce" style={{animationDelay: '150ms'}}></div>
               <div className="w-2.5 h-2.5 rounded-full bg-primary-fixed animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="fixed bottom-24 left-0 w-full px-4 max-w-2xl mx-auto right-0 z-40">
        <form onSubmit={handleSend} className="bg-surface-container-lowest rounded-full p-2 flex items-center gap-2 shadow-xl border border-outline-variant/20 ring-4 ring-background/50">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask your AI Chef..."
            className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-on-surface outline-none placeholder:text-on-surface-variant/50 font-medium"
          />
          <button type="submit" disabled={loading || !input.trim()} className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-container text-white flex items-center justify-center disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all flex-shrink-0 shadow-md">
            <span className="material-symbols-outlined ml-1">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
