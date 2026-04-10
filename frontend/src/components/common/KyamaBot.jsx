import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Sparkles, Loader2, Minus, Maximize2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const KyamaBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'bot', content: "Hello! I'm KyamaAI, your school assistant. How can I help you today? I can help you plan your tasks or set reminders." }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    useEffect(() => {
        if (isOpen && chatHistory.length === 1) {
            fetchHistory();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleOpenBot = (e) => {
            setIsOpen(true);
            setIsMinimized(false);
            if (e.detail?.initialMessage) {
                setMessage(e.detail.initialMessage);
            }
        };
        window.addEventListener('OPEN_KYAMABOT', handleOpenBot);
        return () => window.removeEventListener('OPEN_KYAMABOT', handleOpenBot);
    }, []);

    const fetchHistory = async () => {
        setIsLoadingInitial(true);
        try {
            const response = await api.get('/ai/chat/history');
            const history = response.data.data;
            if (history && history.length > 0) {
                // Formatting history replacing role names to match frontend UI mappings
                const formattedHistory = history.map(msg => ({
                    role: msg.role === 'bot' || msg.role === 'assistant' ? 'bot' : 'user',
                    content: msg.content
                }));
                // Combine default greeting with formatted history
                setChatHistory([chatHistory[0], ...formattedHistory]);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        } finally {
            setIsLoadingInitial(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMessage = message.trim();
        setMessage('');
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await api.post('/ai/chat', { message: userMessage });
            
            // Add a small artificial delay so the premium animation is actually visible
            // users hate blinking UI, and this makes the AI feel like it's "thinking"
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setChatHistory(prev => [...prev, { role: 'bot', content: response.data.data.reply }]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg = error.response?.data?.message || "I'm sorry, I'm having trouble connecting to my brain right now.";
            setChatHistory(prev => [...prev, { role: 'bot', content: errorMsg }]);
            toast.error('Failed to get a response from KyamaBot');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-[#476C63] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
            >
                <MessageSquare className="w-8 h-8 group-hover:hidden" />
                <Sparkles className="w-8 h-8 hidden group-hover:block animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce"></div>
            </button>
        );
    }

    return (
        <div 
            className={`fixed bottom-6 right-6 w-[400px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col z-50 transition-all duration-300 overflow-hidden ${
                isMinimized ? 'h-16' : 'h-[600px]'
            }`}
        >
            {/* Header */}
            <div className="bg-[#476C63] p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-wide">KyamaAI</h3>
                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                            Online
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    </button>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Chat Window */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                        {isLoadingInitial && (
                             <div className="flex justify-center text-xs text-gray-400 py-4 items-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin"/> Loading previous memories...
                             </div>
                        )}
                        {chatHistory.map((msg, idx) => (
                            <div 
                                key={idx} 
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                            >
                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                                        msg.role === 'user' ? 'bg-[#99CBB9] text-white' : 'bg-white text-[#476C63]'
                                    }`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                    </div>
                                    <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-[#476C63] text-white rounded-tr-none shadow-md' 
                                            : 'bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-in fade-in py-2">
                                <style>
                                    {`
                                        @keyframes ai-pulse-custom {
                                            0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
                                            50% { transform: scaleY(1.3); opacity: 1; }
                                        }
                                        .animate-ai-wave {
                                            animation: ai-pulse-custom 1.2s ease-in-out infinite;
                                        }
                                    `}
                                </style>
                                <div className="flex items-center gap-2 px-5 py-4 bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.05)] border-l-4 border-l-[#476C63]">
                                    <div className="flex items-center gap-[4px] h-6 px-1">
                                        {[
                                            '#431407', '#991b1b', '#ea580c', '#f59e0b', '#eab308', 
                                            '#0ea5e9', 
                                            '#eab308', '#f59e0b', '#ea580c', '#991b1b', '#431407'
                                        ].map((color, i) => (
                                            <div 
                                                key={i}
                                                className="w-1 rounded-full animate-ai-wave"
                                                style={{ 
                                                    backgroundColor: color,
                                                    height: i === 5 ? '100%' : (i === 4 || i === 6) ? '80%' : (i === 3 || i === 7) ? '60%' : '40%',
                                                    animationDelay: `${i * 0.1}s`,
                                                    boxShadow: i === 5 ? `0 0 10px ${color}` : 'none'
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-[#476C63] uppercase tracking-[0.2em] pl-2 animate-pulse">
                                        KyamaAI Processing
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 mt-auto">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell me something or ask for a reminder..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:ring-2 focus:ring-[#99CBB9]/20 focus:border-[#99CBB9] outline-none transition-all placeholder:text-gray-400"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || isLoading}
                                className="absolute right-2 p-2 bg-[#476C63] text-white rounded-xl hover:bg-[#39564f] disabled:opacity-50 disabled:grayscale transition-all shadow-md active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-2 text-center font-bold tracking-tight">
                            KyamaBot AI can help with daily planning & school task reminders.
                        </p>
                    </form>
                </>
            )}
        </div>
    );
};

export default KyamaBot;
