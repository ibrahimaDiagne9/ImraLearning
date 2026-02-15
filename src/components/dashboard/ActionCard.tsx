import type { LucideIcon } from 'lucide-react';

interface ActionCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    primary?: boolean;
    onClick?: () => void;
}

export const ActionCard = ({ title, description, icon: Icon, primary = false, onClick }: ActionCardProps) => {
    return (
        <div
            className={`
                relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer group
                ${primary
                    ? 'bg-blue-600 border-blue-500 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-900/20'
                    : 'bg-surface border-gray-800 hover:border-gray-600 hover:bg-surface/80'
                }
            `}
            onClick={onClick}
        >
            <div className={`
                w-12 h-12 rounded-full flex items-center justify-center mb-4
                ${primary ? 'bg-white/20' : 'bg-surface border border-gray-700 group-hover:border-gray-500'}
            `}>
                <Icon className={`w-6 h-6 ${primary ? 'text-white' : 'text-blue-400'}`} />
            </div>

            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-100 transition-colors">
                {title}
            </h3>
            <p className={`text-sm ${primary ? 'text-blue-100' : 'text-gray-400'}`}>
                {description}
            </p>
        </div>
    );
};
