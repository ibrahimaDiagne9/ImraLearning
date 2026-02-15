import { MessageSquare, Search, Plus, Loader2 } from 'lucide-react';
import { DiscussionItem } from './DiscussionItem';
import { useState, useEffect } from 'react';
import { getDiscussions, likeDiscussion } from '../../services/api';
import { DiscussionDetailModal } from './DiscussionDetailModal';

export const DiscussionsPage = ({ onOpenModal }: { onOpenModal: () => void }) => {
    const [discussions, setDiscussions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchDiscussions();
    }, []);

    const fetchDiscussions = async () => {
        try {
            const data = await getDiscussions();
            setDiscussions(data);
        } catch (error) {
            console.error('Failed to fetch discussions', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLike = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        try {
            const data = await likeDiscussion(id);
            setDiscussions(prev => prev.map(d =>
                d.id === id ? { ...d, likes_count: data.likes_count, is_liked: data.is_liked } : d
            ));
        } catch (error) {
            console.error('Failed to like', error);
        }
    };

    const filteredDiscussions = discussions.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.author.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Community Discussions</h1>
                    <p className="text-gray-400">Join the conversation, ask questions, and share knowledge.</p>
                </div>
                <button
                    onClick={onOpenModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 self-start transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    New Discussion
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search discussions by title, topic, or author..."
                    className="w-full bg-[#111827] border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    <div className="text-center py-20 grayscale opacity-50">
                        <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-500" />
                        <p className="text-gray-400">Loading community feed...</p>
                    </div>
                ) : filteredDiscussions.length === 0 ? (
                    <div className="text-center py-20 bg-[#111827] rounded-3xl border border-dashed border-gray-800">
                        <MessageSquare className="w-12 h-12 mx-auto text-gray-700 mb-4" />
                        <h3 className="text-xl font-bold text-gray-500">No discussions found</h3>
                        <p className="text-gray-600 mt-2">Try adjusting your search or start a new discussion.</p>
                    </div>
                ) : (
                    filteredDiscussions.map((discussion) => (
                        <DiscussionItem
                            key={discussion.id}
                            {...discussion}
                            onClick={() => setSelectedId(discussion.id)}
                            onLike={(e) => handleLike(e, discussion.id)}
                        />
                    ))
                )}
            </div>

            {selectedId !== null && (
                <DiscussionDetailModal
                    isOpen={selectedId !== null}
                    onClose={() => {
                        setSelectedId(null);
                        fetchDiscussions();
                    }}
                    discussionId={selectedId}
                />
            )}
        </div>
    );
};
