import { useState, useEffect } from 'react';
import { getAnalytics } from '../../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import {
    Users, DollarSign, Download, Filter,
    ArrowUpRight, ArrowDownRight, Award, Sparkles
} from 'lucide-react';


const ENGAGEMENT_DATA = [
    { name: '00:00', value: 12 },
    { name: '04:00', value: 5 },
    { name: '08:00', value: 45 },
    { name: '12:00', value: 88 },
    { name: '16:00', value: 92 },
    { name: '20:00', value: 75 },
];

const SOURCE_DATA = [
    { name: 'Direct', value: 400, color: '#3B82F6' },
    { name: 'Social', value: 300, color: '#8B5CF6' },
    { name: 'Referral', value: 200, color: '#EC4899' },
    { name: 'Organic', value: 100, color: '#10B981' },
];

export const AnalyticsDashboard = () => {
    const [timeRange, setTimeRange] = useState('7d');
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const result = await getAnalytics();
                setData(result);
            } catch (error) {
                console.error('Failed to fetch analytics', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (isLoading || !data) {
        return (
            <div className="h-full flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        Business <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Intelligence</span>
                    </h1>
                    <p className="text-gray-400 font-medium italic">Comprehensive insights for your teaching empire.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-surface border border-gray-800 rounded-xl p-1 flex items-center gap-1">
                        {['24h', '7d', '30d', '1y'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === range
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {range.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-bold border border-gray-700 transition-all">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: `$${data.total_revenue.toLocaleString()}`, trend: '+0%', trendUp: true, icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Active Students', value: data.total_students.toString(), trend: '+0%', trendUp: true, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Completion Rate', value: `${data.avg_completion_rate}%`, trend: '+0%', trendUp: true, icon: Award, color: 'text-green-400', bg: 'bg-green-500/10' },
                    { label: 'Platform XP', value: '42k', trend: '+0%', trendUp: true, icon: Sparkles, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-surface border border-gray-800 p-6 rounded-3xl hover:border-gray-700 transition-all group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon className="w-20 h-20" />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.bg} p-2.5 rounded-xl`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-green-400' : 'text-red-400'}`}>
                                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.trend}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                            <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-surface border border-gray-800 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-white">Revenue Performance</h3>
                            <p className="text-gray-500 text-sm">Real-time earnings tracking across your courses.</p>
                        </div>
                        <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenue_data}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickFormatter={(val) => `$${val / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Traffic Source Pie */}
                <div className="bg-surface border border-gray-800 rounded-3xl p-8 flex flex-col justify-between">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white">Student Origins</h3>
                        <p className="text-gray-500 text-sm">Where your audience is coming from.</p>
                    </div>
                    <div className="h-[250px] w-full my-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={SOURCE_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {SOURCE_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                        {SOURCE_DATA.map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-gray-400 text-sm font-medium">{item.name}</span>
                                </div>
                                <span className="text-white text-sm font-bold">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Heatmaps & Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hourly Engagement */}
                <div className="bg-surface border border-gray-800 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            Activity Heatmap
                            <Sparkles className="w-4 h-4 text-blue-400" />
                        </h3>
                        <button className="text-xs font-bold text-blue-400 hover:underline">View Heatmap</button>
                    </div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ENGAGEMENT_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }} />
                                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Course Leaderboard */}
                <div className="bg-surface border border-gray-800 rounded-3xl p-8 space-y-6">
                    <h3 className="text-xl font-bold text-white">Top Performing Courses</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Advanced UI Systems', revenue: '$12,400', enrollments: 450, growth: '+22%' },
                            { name: 'React Architecture 2024', revenue: '$8,200', enrollments: 320, growth: '+15%' },
                            { name: 'Motion Design Fundamentals', revenue: '$4,250', enrollments: 180, growth: '+8%' },
                        ].map((course, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-transparent hover:border-gray-700">
                                <div className="space-y-1">
                                    <h4 className="text-white font-bold">{course.name}</h4>
                                    <p className="text-gray-400 text-xs">{course.enrollments} Students Enrolled</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-blue-400 font-black">{course.revenue}</p>
                                    <p className="text-green-400 text-[10px] font-bold">{course.growth}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
