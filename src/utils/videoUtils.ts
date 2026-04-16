export const getVideoUrl = (lesson: { video_url?: string; video_file?: string; video_file_url?: string }): string | null => {
    if (!lesson) return null;
    
    // Prioritize absolute video_file_url from backend if available
    let path = lesson.video_file_url || lesson.video_url || lesson.video_file;
    if (!path) return null;

    // Handle explicit external URLs (YouTube, Vimeo, blobs)
    if (path.includes('youtube.com') || path.includes('youtu.be') || path.includes('vimeo.com') || path.startsWith('blob:')) {
        return path;
    }

    // Force HTTPS for any absolute URLs pointing to our domain
    if (path.startsWith('http')) {
        if (path.includes('imraedu.com') && path.startsWith('http:')) {
            return path.replace('http:', 'https:');
        }
        return path;
    }

    // Resolve relative media paths using the current API environment URL
    let baseUrl = import.meta.env.VITE_API_URL || 'https://api.imraedu.com/api';
    // Remove /api or /api/ suffix to get the root domain
    baseUrl = baseUrl.replace(/\/api\/?$/, ''); 

    // Ensure the path is clean (no double slashes when joining)
    let cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Ensure the path references /media/
    if (!cleanPath.startsWith('/media/')) {
        cleanPath = `/media${cleanPath}`;
    }

    // Combine and remove any potential double slashes in the middle
    const fullUrl = `${baseUrl}${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
    return fullUrl;
};

export const getVideoSourceType = (url: string) => {
    if (!url) return 'file';
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
    if (lowerUrl.includes('vimeo.com')) return 'vimeo';
    if (lowerUrl.includes('twitch.tv')) return 'twitch';
    if (lowerUrl.includes('dailymotion.com') || lowerUrl.includes('dai.ly')) return 'dailymotion';

    // Check for direct video file extensions
    if (lowerUrl.match(/\.(mp4|webm|ogg|mov|m4v)($|\?)/)) return 'file';

    // Default to file if it starts with http but isn't a known service (likely a direct link or cloud storage)
    return 'file';
};
