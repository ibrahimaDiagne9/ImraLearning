import { useState, useEffect } from 'react';
import { PostCard } from './PostCard';
import { Filter, Zap, Loader2 } from 'lucide-react';
import { getDiscussions } from '../../services/api';

export const Feed = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await getDiscussions();
                // Map API data to PostCard props
                const mappedPosts = data.map((d: any) => ({
                    id: d.id,
                    author: d.author.username,
                    time: new Date(d.created_at).toLocaleDateString(),
                    title: d.title,
                    content: d.content,
                    likes: d.likes_count,
                    comments: d.replies_count,
                    tags: d.course_name ? [d.course_name] : ["General"]
                }));
                setPosts(mappedPosts);
            } catch (error) {
                console.error("Failed to fetch discussions", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto py-32 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-gray-400 animate-pulse">Loading community discussions...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-400 fill-current" />
                    Community Feed
                </h1>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-surface border border-gray-700 rounded-full text-sm font-medium hover:border-primary text-gray-300 hover:text-white transition-all active:bg-primary active:text-white">
                        Latest
                    </button>
                    <button className="px-4 py-2 bg-surface border border-gray-700 rounded-full text-sm font-medium hover:border-primary text-gray-300 hover:text-white transition-all">
                        Top
                    </button>
                    <button className="p-2 bg-surface border border-gray-700 rounded-full hover:border-primary text-gray-300 hover:text-white transition-all">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard key={post.id} {...post} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-surface border border-gray-800 rounded-2xl">
                        <p className="text-gray-500">No discussions yet. Be the first to start one!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
