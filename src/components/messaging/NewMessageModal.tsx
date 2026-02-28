import { useState, useEffect } from 'react';
import { X, Search, User, Loader2, Send } from 'lucide-react';
import { searchUsers } from '../../services/api';
import { useMessages } from '../../context/MessageContext';

interface NewMessageModalProps {
    onClose: () => void;
}

export const NewMessageModal = ({ onClose }: NewMessageModalProps) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { createConversation, setActiveConversationId } = useMessages();

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            try {
                const data = await searchUsers(query);
                setResults(data);
            } catch (error) {
                console.error('Failed to search users', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleStartConversation = async (userId: string) => {
        const convId = await createConversation(userId);
        if (convId) {
            setActiveConversationId(convId);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0B0F1A] border border-gray-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">New Message</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Start a conversation</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by username..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : results.length > 0 ? (
                            results.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => handleStartConversation(user.id.toString())}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-gray-800"
                                >
                                    <div className="w-12 h-12 rounded-full border border-gray-800 flex items-center justify-center bg-gray-900 group-hover:border-blue-500/50 transition-colors">
                                        <User className="w-6 h-6 text-gray-500 group-hover:text-blue-400" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">{user.username}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.role}</span>
                                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">• Lvl {user.level_num || 1}</span>
                                        </div>
                                    </div>
                                    <Send className="w-5 h-5 text-gray-700 ml-auto group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                                </button>
                            ))
                        ) : query.length >= 2 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="font-medium">No users found matching "{query}"</p>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-sm font-medium">Type at least 2 characters to search</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
