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
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    baseUrl = baseUrl.replace(/\/api\/?$/, ''); // get base domain

    let cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (!cleanPath.startsWith('/media/')) {
        cleanPath = `/media${cleanPath}`;
    }

    return `${baseUrl}${cleanPath}`;
};

export const getVideoSourceType = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    return 'file';
};
