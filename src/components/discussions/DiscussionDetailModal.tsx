import { Modal } from '../ui/Modal';
import { MessageSquare, ThumbsUp, Send, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getDiscussionDetails, postReply, likeDiscussion, likeReply } from '../../services/api';

interface Reply {
    id: number;
    author: {
        username: string;
        role: string;
    };
    content: string;
    created_at: string;
    likes_count: number;
    is_liked: boolean;
}

interface Discussion {
    id: number;
    title: string;
    content: string;
    author: {
        username: string;
        role: string;
    };
    course_name?: string; // We might need to handle course name if not returned as string
    created_at: string;
    likes_count: number;
    is_liked: boolean;
    replies: Reply[];
    is_resolved: boolean;
}

interface DiscussionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    discussionId: number | null;
}

export const DiscussionDetailModal = ({ isOpen, onClose, discussionId }: DiscussionDetailModalProps) => {
    const [discussion, setDiscussion] = useState<Discussion | null>(null);
    const [newReply, setNewReply] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && discussionId) {
            fetchDetails();
        }
    }, [isOpen, discussionId]);

    const fetchDetails = async () => {
        if (!discussionId) return;
        setIsLoading(true);
        try {
            const data = await getDiscussionDetails(discussionId);
            setDiscussion(data);
        } catch (error) {
            console.error('Failed to fetch discussion details', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!discussionId || !newReply.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await postReply(discussionId, newReply);
            setNewReply('');
            await fetchDetails(); // Refresh to show new reply
        } catch (error) {
            console.error('Failed to post reply', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLikeDiscussion = async () => {
        if (!discussionId) return;
        try {
            const data = await likeDiscussion(discussionId);
            if (discussion) {
                setDiscussion({
                    ...discussion,
                    likes_count: data.likes_count,
                    is_liked: data.is_liked
                });
            }
        } catch (error) {
            console.error('Failed to like discussion', error);
        }
    };

    const handleLikeReply = async (replyId: number) => {
        try {
            const data = await likeReply(replyId);
            if (discussion) {
                setDiscussion({
                    ...discussion,
                    replies: discussion.replies.map(r =>
                        r.id === replyId ? { ...r, likes_count: data.likes_count, is_liked: data.is_liked } : r
                    )
                });
            }
        } catch (error) {
            console.error('Failed to like reply', error);
        }
    };

    const handleToggleResolve = async () => {
        if (!discussionId || !discussion) return;
        try {
            const data = await import('../../services/api').then(m => m.resolveDiscussion(discussionId, !discussion.is_resolved));
            setDiscussion({
                ...discussion,
                is_resolved: data.is_resolved
            });
        } catch (error) {
            console.error('Failed to toggle discussion resolution', error);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Discussion Thread"
            icon={<MessageSquare className="w-5 h-5 text-blue-400" />}
            maxWidth="max-w-3xl"
        >
            <div className="flex flex-col h-[70vh]">
                {isLoading && !discussion ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : discussion ? (
                    <>
                        {/* Discussion Main Content */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                            {discussion.author.username.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white leading-tight">
                                                {discussion.title}
                                            </h2>
                                            <div className="flex items-center gap-2 text-xs mt-1">
                                                <span className="text-blue-400 font-medium">{discussion.author.username}</span>
                                                <span className="text-gray-600">•</span>
                                                <span className="text-gray-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(discussion.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {discussion.is_resolved && (
                                            <span className="bg-green-500/10 text-green-400 text-[10px] uppercase font-bold px-2 py-1 rounded border border-green-500/20">
                                                Resolved
                                            </span>
                                        )}
                                        <button
                                            onClick={handleToggleResolve}
                                            className="text-[10px] uppercase font-bold px-2 py-1 rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                                        >
                                            {discussion.is_resolved ? 'Reopen' : 'Resolve'}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                                    {discussion.content}
                                </p>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handleLikeDiscussion}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${discussion.is_liked
                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 border border-transparent'
                                            }`}
                                    >
                                        <ThumbsUp className={`w-4 h-4 ${discussion.is_liked ? 'fill-current' : ''}`} />
                                        <span>{discussion.likes_count} Likes</span>
                                    </button>
                                    <div className="text-gray-500 text-sm font-medium flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{discussion.replies.length} Replies</span>
                                    </div>
                                </div>
                            </div>

                            {/* Replies Section */}
                            <div className="space-y-4 mb-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
                                    Responses
                                </h3>
                                {discussion.replies.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
                                        <p className="text-gray-500 text-sm">No replies yet. Be the first to join the conversation!</p>
                                    </div>
                                ) : (
                                    discussion.replies.map((reply) => (
                                        <div key={reply.id} className="bg-gray-900/40 rounded-xl p-4 border border-gray-800 ml-4 relative">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">
                                                    {reply.author.username.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-blue-400 text-xs font-bold">{reply.author.username}</span>
                                                            <span className="text-gray-600 text-[10px]">•</span>
                                                            <span className="text-gray-500 text-[10px]">{new Date(reply.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleLikeReply(reply.id)}
                                                            className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${reply.is_liked
                                                                ? 'text-blue-400 bg-blue-400/10'
                                                                : 'text-gray-500 hover:text-gray-300'
                                                                }`}
                                                        >
                                                            <ThumbsUp className={`w-3 h-3 ${reply.is_liked ? 'fill-current' : ''}`} />
                                                            <span>{reply.likes_count}</span>
                                                        </button>
                                                    </div>
                                                    <p className="text-gray-300 text-xs leading-relaxed">
                                                        {reply.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Reply Input */}
                        <div className="pt-4 border-t border-gray-800">
                            <form onSubmit={handlePostReply} className="relative">
                                <textarea
                                    value={newReply}
                                    onChange={(e) => setNewReply(e.target.value)}
                                    placeholder="Write a response..."
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none pr-12"
                                    rows={2}
                                />
                                <button
                                    type="submit"
                                    disabled={!newReply.trim() || isSubmitting}
                                    className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <p>Discussion not found.</p>
                        <button onClick={onClose} className="mt-4 text-blue-400 hover:underline">Go back</button>
                    </div>
                )}
            </div>
        </Modal>
    );
};
