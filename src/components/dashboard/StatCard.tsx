import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    trendValue?: string; // e.g., "+12%"
    icon: LucideIcon;
    iconColorClass?: string;
    iconBgClass?: string;
}

export const StatCard = ({ title, value, trendValue, icon: Icon, iconColorClass = "text-blue-400", iconBgClass = "bg-blue-500/10" }: StatCardProps) => {
    return (
        <div className="bg-surface border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${iconBgClass}`}>
                    <Icon className={`w-6 h-6 ${iconColorClass}`} />
                </div>
                {trendValue && (
                    <span className="text-green-400 text-sm font-semibold bg-green-500/10 px-2 py-1 rounded-full">
                        {trendValue}
                    </span>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-3xl font-bold text-white">{value}</h3>
                <p className="text-gray-400 text-sm">{title}</p>
            </div>
        </div>
    );
};
