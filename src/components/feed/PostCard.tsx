
import { MessageSquare, Heart, Share2, MoreHorizontal } from 'lucide-react';

interface PostProps {
    author: string;
    time: string;
    title: string;
    content: string;
    likes: number;
    comments: number;
    tags: string[];
}

export const PostCard = ({ author, time, title, content, likes, comments, tags }: PostProps) => {
    return (
        <div className="bg-surface rounded-xl p-6 border border-gray-700 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/10">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {author[0]}
                    </div>
                    <div>
                        <h3 className="font-semibold text-white hover:text-primary cursor-pointer transition-colors">{author}</h3>
                        <span className="text-xs text-gray-400">{time}</span>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <h2 className="text-xl font-bold mb-2 text-white hover:text-primary cursor-pointer transition-colors">{title}</h2>
            <p className="text-gray-300 mb-4 line-clamp-3">{content}</p>

            <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-surface border border-gray-600 rounded-full text-xs font-medium text-secondary hover:bg-gray-700 cursor-pointer transition-colors">
                        #{tag}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors group">
                        <Heart className="w-5 h-5 group-hover:fill-current" />
                        <span className="text-sm font-medium">{likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-sm font-medium">{comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span className="text-sm font-medium">Share</span>
                    </button>
                </div>

                <button className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-primary/25 flex items-center gap-2">
                    Join Discussion
                    <MessageSquare className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
