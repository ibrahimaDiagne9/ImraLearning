export const getVideoUrl = (video_url?: string, video_file?: string): string | null => {
    let path = video_url || video_file;
    if (!path) return null;

    // Handle explicit external URLs (YouTube, Vimeo, blobs)
    if (path.includes('youtube.com') || path.includes('youtu.be') || path.includes('vimeo.com') || path.startsWith('blob:')) {
        return path;
    }

    // Strip hardcoded localhost origin if it was saved to DB by mistake
    try {
        if (path.startsWith('http')) {
            const urlObj = new URL(path);
            if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
                path = urlObj.pathname;
            }
        }
    } catch (e) {
        // Ignore invalid URLs
    }

    // If it's still an absolute HTTP URL from a cloud provider (e.g. S3), use it
    if (path.startsWith('http')) return path;

    // Resolve relative media paths using the current API environment URL
    let baseUrl = import.meta.env.VITE_API_URL || 'https://api.imraedu.com/api';
    baseUrl = baseUrl.replace(/\/api\/?$/, ''); // get base domain

    // Force HTTPS for production API URLs if they come back as http
    if (baseUrl.includes('imraedu.com') && baseUrl.startsWith('http:')) {
        baseUrl = baseUrl.replace('http:', 'https:');
    }

    let cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Safety check: if path already contains the baseUrl or domain, don't prefix it again
    if (cleanPath.includes('imraedu.com') || cleanPath.includes('localhost')) {
        return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    }

    if (!cleanPath.startsWith('/media/')) {
        cleanPath = `/media${cleanPath}`;
    }

    return `${baseUrl}${cleanPath}`;
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
