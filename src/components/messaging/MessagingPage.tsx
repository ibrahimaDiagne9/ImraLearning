import { useState, useRef, useEffect } from 'react';
import {
    Search, Filter, Send, Phone, Video, Info,
    Smile, ArrowLeft, MessageSquare, CheckCheck, Paperclip
} from 'lucide-react';
import { useMessages } from '../../context/MessageContext';

export const MessagingPage = () => {
    const { conversations, activeConversationId, setActiveConversationId, sendMessage, markAsRead } = useMessages();
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const activeConv = conversations.find(c => c.id === activeConversationId);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeConv?.messages]);

    useEffect(() => {
        if (activeConversationId) {
            markAsRead(activeConversationId);
        }
    }, [activeConversationId]);

    const handleSend = () => {
        if (messageInput.trim()) {
            sendMessage(messageInput);
            setMessageInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const filteredConversations = conversations.filter(c =>
        c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#020617] overflow-hidden">
            {/* Conversations Sidebar */}
            <aside className={`w-full md:w-80 lg:w-96 border-r border-gray-800 flex flex-col bg-[#0B0F1A] ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-black text-white uppercase tracking-tighter">Messages</h1>
                        <button className="p-2 hover:bg-white/5 rounded-full text-blue-400">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 pb-4">
                    {filteredConversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => setActiveConversationId(conv.id)}
                            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group ${activeConversationId === conv.id ? 'bg-blue-600/10 border border-blue-500/20' : 'hover:bg-white/5 border border-transparent'}`}
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 rounded-full border border-gray-800 overflow-hidden">
                                    <img src={conv.participantAvatar} alt={conv.participantName} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#0B0F1A] rounded-full"></div>
                            </div>

                            <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h3 className={`text-sm font-bold truncate ${activeConversationId === conv.id ? 'text-blue-400' : 'text-gray-200'}`}>
                                        {conv.participantName}
                                    </h3>
                                    <span className="text-[10px] text-gray-500 font-medium">{conv.lastMessageTime}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs text-gray-400 truncate font-medium">{conv.lastMessage}</p>
                                    {conv.unreadCount > 0 && (
                                        <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-blue-900/20">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Chat Window */}
            <main className={`flex-1 flex flex-col bg-[#020617] ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
                {activeConv ? (
                    <>
                        {/* Chat Header */}
                        <header className="h-20 flex items-center justify-between px-6 bg-[#0B0F1A]/80 backdrop-blur-xl border-b border-gray-800/50">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setActiveConversationId(null)}
                                    className="md:hidden p-2 hover:bg-white/5 rounded-full text-gray-400"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="w-10 h-10 rounded-full border border-gray-800 overflow-hidden">
                                    <img src={activeConv.participantAvatar} alt={activeConv.participantName} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-white tracking-tight">{activeConv.participantName}</h2>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Online Now</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                    <Video className="w-5 h-5" />
                                </button>
                                <div className="w-px h-6 bg-gray-800 mx-1"></div>
                                <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                    <Info className="w-5 h-5" />
                                </button>
                            </div>
                        </header>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
                        >
                            <div className="flex justify-center mb-8">
                                <span className="bg-gray-800/50 text-gray-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-gray-800">
                                    Today
                                </span>
                            </div>

                            {activeConv.messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[80%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-gray-800 overflow-hidden mt-1">
                                            <img src={msg.isMe ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Professor' : msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" />
                                        </div>
                                        <div className={`space-y-1.5 ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed border ${msg.isMe
                                                ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none shadow-lg shadow-blue-900/20'
                                                : 'bg-gray-900 border-gray-800 text-gray-200 rounded-tl-none'
                                                }`}>
                                                {msg.text}
                                            </div>
                                            <div className="flex items-center gap-2 px-1">
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{msg.timestamp}</span>
                                                {msg.isMe && <CheckCheck className="w-3 h-3 text-blue-400" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <footer className="p-6 bg-[#0B0F1A]/50 border-t border-gray-800/50">
                            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-2 flex items-center gap-2 focus-within:border-blue-500/50 transition-all shadow-xl">
                                <button className="p-2 text-gray-500 hover:text-blue-400 transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none py-2 px-2"
                                />
                                <button className="p-2 text-gray-500 hover:text-blue-400 transition-colors">
                                    <Smile className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={!messageInput.trim()}
                                    className={`p-3 rounded-xl transition-all ${messageInput.trim()
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 hover:scale-105 active:scale-95'
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <Send className="w-5 h-5 fill-current" />
                                </button>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-10 h-10 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Your Conversation Hub</h2>
                        <p className="text-gray-400 max-w-xs mx-auto text-sm leading-relaxed">
                            Select a conversation from the sidebar to start collaborating with your instructors and peers.
                        </p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20">
                            New Message
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};
