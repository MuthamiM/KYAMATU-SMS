import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Sparkles, Loader2, Minus, Maximize2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const KyamaBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'bot', content: "Hello! I'm KyamaBot, your school assistant. How can I help you today? I can help you plan your tasks or set reminders." }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMessage = message.trim();
        setMessage('');
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await api.post('/ai/chat', { message: userMessage });
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
                        <h3 className="font-bold text-sm tracking-wide">KyamaBot</h3>
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
                            <div className="flex justify-start animate-in fade-in">
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-white text-[#476C63] flex items-center justify-center border border-gray-100 shadow-sm">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    </div>
                                    <div className="p-3 bg-white text-gray-400 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-[10px] font-bold uppercase tracking-widest italic">
                                        Thinking...
                                    </div>
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
