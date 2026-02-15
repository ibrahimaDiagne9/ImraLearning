import { Download, File } from 'lucide-react';

interface ResourcesTabProps {
    course: any;
}

export const ResourcesTab = ({ course }: ResourcesTabProps) => {
    const resources = course.resources || [];

    if (resources.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-[#0B0F1A] border border-white/5 rounded-3xl">
                <File className="w-12 h-12 text-gray-700 mb-4" />
                <p className="text-gray-500 font-medium">No resources available for this course yet.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0B0F1A] border border-white/5 rounded-3xl overflow-hidden p-8">
                <h3 className="text-xl font-bold text-white mb-6">Downloadable Resources</h3>
                <div className="space-y-4">
                    {resources.map((res: any) => {
                        const Icon = res.icon || File; // Assuming the backend might send an icon type, or we fallback to File. Ideally should map type to icon.
                        return (
                            <div key={res.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{res.title}</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase">{res.size || 'Unknown size'}</p>
                                    </div>
                                </div>
                                <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-500 hover:text-white transition-colors">
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};
