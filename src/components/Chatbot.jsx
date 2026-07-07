import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon, HelpCircle } from 'lucide-react';

export default function Chatbot({ stationId, currentLocationNodeId, lightMode = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am your AI RailNav System Guide. 🚆\n\nI can help you find station facilities, navigate to platforms, check crowd density, or answer general station queries. \n\nHow can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          stationId,
          currentLocationNodeId
        })
      });

      const data = await response.json();
      
      const botMsg = {
        id: Math.random().toString(),
        sender: 'bot',
        text: data.reply || "I apologize, but I couldn't understand that query. Please try again or locate our emergency assistance tab.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const botErrorMsg = {
        id: Math.random().toString(),
        sender: 'bot',
        text: "I am experiencing communication issues right now. However, you can access all facilities and shortest route pathfinders directly using the panel on your screen!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botErrorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (query) => {
    handleSend(query);
  };

  const suggestions = [
    "Where is the restroom?",
    "How to get to Platform 4?",
    "Where is the wheelchair elevator?",
    "Are coffee stores open?"
  ];

  // Theme styling helpers
  const cardBgClass = lightMode
    ? "bg-white border border-slate-100 w-[380px] h-[520px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-up"
    : "bg-[#080f21] border border-[#1e2d52]/80 w-[380px] h-[520px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-up";

  const chatAreaClass = lightMode
    ? "flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 text-slate-800"
    : "flex-1 overflow-y-auto p-4 space-y-4 bg-[#050a17] text-slate-100";

  const botBubbleClass = lightMode
    ? "bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-100 shadow-xs"
    : "bg-[#111e3f]/90 text-slate-200 rounded-2xl rounded-tl-none border border-[#1e2d52]/30";

  const suggestionAreaClass = lightMode
    ? "px-4 py-3 bg-slate-50 border-t border-slate-100"
    : "px-4 py-3 bg-[#050a17] border-t border-[#1e2d52]/20";

  const suggestionBtnClass = lightMode
    ? "text-[10px] bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-600 border border-slate-200/60 rounded-xl px-3 py-1.5 transition-all shadow-xs cursor-pointer font-semibold"
    : "text-[10px] bg-[#111e3f]/80 hover:bg-[#15254d] text-slate-300 hover:text-white border border-[#1e2d52]/50 rounded-xl px-3 py-1.5 transition-all shadow-sm cursor-pointer font-semibold";

  const footerClass = lightMode
    ? "p-3 bg-white border-t border-slate-100 flex items-center space-x-2"
    : "p-3 bg-[#0c162e] border-t border-[#1e2d52]/40 flex items-center space-x-2";

  const inputClass = lightMode
    ? "flex-1 bg-slate-50 text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
    : "flex-1 bg-[#111e3f] text-white placeholder-slate-500 rounded-xl border border-[#1e2d52]/60 px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-all font-medium";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" id="ai-chatbot-system">
      {/* Floating Action Button to open chatbot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white p-4 rounded-full shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center border border-white/10 cursor-pointer"
          title="Open AI Station Guide"
          id="chatbot-trigger-fab"
        >
          <MessageSquare size={20} className="animate-pulse" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className={cardBgClass} id="chatbot-card">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between shadow-md" id="chatbot-header">
            <div className="flex items-center space-x-3">
              <div className="bg-white/15 p-2 rounded-xl text-white">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-white text-xs font-extrabold uppercase tracking-wider">AI Station Guide</h3>
                <p className="text-blue-100 text-[9px] font-medium mt-0.5">Real-time Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              id="chatbot-close"
            >
              <X size={15} />
            </button>
          </div>

          {/* Messages Body */}
          <div className={chatAreaClass} id="chatbot-messages-box">
            {messages.map(msg => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isBot ? 'justify-start' : 'justify-end'} space-x-2.5 max-w-[85%] ${
                    isBot ? 'mr-auto' : 'ml-auto'
                  }`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-full bg-blue-600/10 text-blue-500 border border-blue-500/15 flex items-center justify-center shrink-0">
                      <Bot size={12} />
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <div className={`px-3.5 py-2.5 text-xs whitespace-pre-line leading-relaxed shadow-xs ${
                      isBot ? botBubbleClass : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-none'
                    }`}>
                      {msg.text}
                    </div>
                    <p className={`text-[8px] font-mono text-slate-400 ${!isBot ? 'text-right' : ''}`}>{msg.timestamp}</p>
                  </div>

                  {!isBot && (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold border ${
                      lightMode 
                        ? 'bg-slate-100 text-slate-600 border-slate-200' 
                        : 'bg-[#111e3f] text-slate-300 border-[#1e2d52]/40'
                    }`}>
                      <UserIcon size={12} />
                    </div>
                  )}
                </div>
              );
            })}
            
            {loading && (
              <div className="flex justify-start space-x-2.5 max-w-[85%] mr-auto">
                <div className="w-7 h-7 rounded-full bg-blue-600/10 text-blue-500 border border-blue-500/15 flex items-center justify-center shrink-0">
                  <Bot size={12} />
                </div>
                <div className={`${botBubbleClass} px-3.5 py-2.5 text-xs flex items-center space-x-1 shadow-xs`}>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions list */}
          {messages.length < 5 && (
            <div className={suggestionAreaClass} id="chatbot-suggestions">
              <p className="text-[10px] text-slate-400 flex items-center space-x-1 font-bold mb-2">
                <HelpCircle size={10} className="text-blue-500" />
                <span>Suggested Questions</span>
              </p>
              <div className="flex flex-wrap gap-1.5" id="chatbot-suggestion-chips">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(s)}
                    className={suggestionBtnClass}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form input bottom row */}
          <div className={footerClass} id="chatbot-input-footer">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Type your question..."
              className={inputClass}
              id="chatbot-text-input"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm shadow-blue-500/10"
              id="chatbot-send"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
