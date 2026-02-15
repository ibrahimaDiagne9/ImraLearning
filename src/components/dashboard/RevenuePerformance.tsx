import { TrendingUp, DollarSign, Users, ArrowUpRight, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AnalyticsData } from '../../hooks/useAnalytics';

interface RevenuePerformanceProps {
    data: AnalyticsData | null;
}


export const RevenuePerformance = ({ data }: RevenuePerformanceProps) => {
    const navigate = useNavigate();
    const revenueData = data?.revenue_data || [];
    const totalRevenue = data?.total_revenue || 0;
    const topCourses = data?.top_courses || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-2xl p-6 lg:p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <TrendingUp className="w-64 h-64 text-emerald-500" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-400 mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Revenue Growth</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            <span className="text-emerald-400 font-medium">+15.4%</span> vs last month
                        </p>
                    </div>

                    <div className="flex bg-[#1F2937]/50 rounded-lg p-1 border border-gray-800">
                        {['7D', '1M', '3M', '1Y'].map((range) => (
                            <button
                                key={range}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${range === '7D' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dynamic SVG Chart */}
                <div className="h-[200px] w-full relative group/chart">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        {revenueData.length > 1 ? (
                            <>
                                <path
                                    d={`M0,200 ${revenueData.map((d, i) => `L${(i / (revenueData.length - 1)) * 1000},${200 - (d.revenue / (Math.max(...revenueData.map(rd => rd.revenue)) || 1)) * 150}`).join(' ')} L1000,200 Z`}
                                    fill="url(#chartGradient)"
                                    className="transition-all duration-1000"
                                />
                                <path
                                    d={`M0,${200 - (revenueData[0].revenue / (Math.max(...revenueData.map(rd => rd.revenue)) || 1)) * 150} ${revenueData.slice(1).map((d, i) => `L${((i + 1) / (revenueData.length - 1)) * 1000},${200 - (d.revenue / (Math.max(...revenueData.map(rd => rd.revenue)) || 1)) * 150}`).join(' ')}`}
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="3"
                                    vectorEffect="non-scaling-stroke"
                                    className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                />
                            </>
                        ) : (
                            <path
                                d="M0,180 Q100,160 200,170 Q300,180 400,120 Q500,100 600,110 Q700,120 800,40 Q900,20 1000,50 L1000,200 L0,200 Z"
                                fill="url(#chartGradient)"
                                className="transition-all duration-1000"
                            />
                        )}
                    </svg>

                    {/* Y-Axis Labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-500 font-bold -translate-x-full pr-4">
                        <span>${(Math.max(...revenueData.map(d => d.revenue)) * 1.2 || 15000).toLocaleString()}</span>
                        <span>${(Math.max(...revenueData.map(d => d.revenue)) * 0.6 || 7500).toLocaleString()}</span>
                        <span>0</span>
                    </div>
                </div>

                {/* X-Axis Labels */}
                <div className="flex justify-between mt-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest px-2">
                    {revenueData.length > 0 ? revenueData.map(d => (
                        <span key={d.name}>{d.name}</span>
                    )) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}
                </div>
            </div>

            {/* Performance Sidebar */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 lg:p-8">
                <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-blue-400" />
                    Top Performing
                </h4>

                <div className="space-y-6">
                    {topCourses.length > 0 ? topCourses.map((course, i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                    {course.title}
                                </span>
                                <span className="text-xs text-emerald-400 font-bold">{course.growth}</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <Users className="w-3 h-3" />
                                        <span className="text-[10px] font-medium">{course.sales} Students</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <DollarSign className="w-3 h-3" />
                                        <span className="text-[10px] font-medium">${course.revenue.toLocaleString()} Earned</span>
                                    </div>
                                </div>
                                <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                    <PlayCircle className="w-5 h-5" />
                                </div>
                            </div>
                            {i !== topCourses.length - 1 && (
                                <div className="h-px w-full bg-gray-800/50 mt-4" />
                            )}
                        </div>
                    )) : (
                        <div className="text-center py-8">
                            <p className="text-xs text-gray-500 italic">No sales data yet</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => navigate('/analytics')}
                    className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all"
                >
                    Full Report
                </button>
            </div>
        </div>
    );
};
