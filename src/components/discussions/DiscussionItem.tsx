import { MessageSquare, ThumbsUp, Mail } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useMessages } from '../../context/MessageContext';

export interface DiscussionProps {
    id: number;
    title: string;
    content: string;
    author: {
        id: number;
        username: string;
        role: string;
        avatarColor?: string;
    };
    created_at: string;
    course_name?: string;
    replies_count: number;
    likes_count: number;
    is_liked?: boolean;
    is_resolved?: boolean;
    onClick?: () => void;
    onLike?: (e: React.MouseEvent) => void;
}

const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-emerald-500'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

export const DiscussionItem = ({
    title,
    content,
    author,
    created_at,
    course_name,
    replies_count,
    likes_count,
    is_liked,
    is_resolved,
    onClick,
    onLike
}: DiscussionProps) => {
    const navigate = useNavigate();
    const { createConversation, setActiveConversationId } = useMessages();

    const handleMessageAuthor = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const convId = await createConversation(author.id.toString());
        if (convId) {
            setActiveConversationId(convId);
            navigate('/messages');
        }
    };
    return (
        <div
            onClick={onClick}
            className="bg-surface border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${author.avatarColor || getAvatarColor(author.username)}`}>
                        {author.username.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">
                            {title}
                            {is_resolved && (
                                <span className="ml-3 text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-medium border border-green-500/20">
                                    Resolved
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-2 text-xs mt-1">
                            <Link
                                to={`/profile/${author.id}`}
                                className="text-blue-400 font-medium hover:underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {author.username}
                            </Link>
                            <span className="text-gray-600">•</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${author.role === 'teacher' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-gray-700 text-gray-400 border border-gray-600'
                                }`}>
                                {author.role}
                            </span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-500">{new Date(created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <span className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded border border-blue-800">
                    {course_name || 'General'}
                </span>
            </div>

            <p className="text-gray-400 text-sm mb-4 ml-13 pl-13 line-clamp-2">
                {content}
            </p>

            <div className="flex items-center justify-between border-t border-gray-800/50 pt-4 mt-2">
                <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-2 hover:text-gray-300">
                        <MessageSquare className="w-4 h-4" />
                        <span>{replies_count} replies</span>
                    </div>
                    <button
                        onClick={onLike}
                        className={`flex items-center gap-2 transition-colors ${is_liked ? 'text-blue-400' : 'hover:text-gray-300'}`}
                    >
                        <ThumbsUp className={`w-4 h-4 ${is_liked ? 'fill-current' : ''}`} />
                        <span>{likes_count} likes</span>
                    </button>
                </div>
                <button
                    onClick={handleMessageAuthor}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20 transition-all"
                >
                    <Mail className="w-3.5 h-3.5" />
                    Message Author
                </button>
            </div>
        </div>
    );
};
