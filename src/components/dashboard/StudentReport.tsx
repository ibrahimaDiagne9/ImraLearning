import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell
} from 'recharts';
import {
    Download, Award, BookOpen, CheckCircle,
    ArrowLeft, TrendingUp, HelpCircle, FileText
} from 'lucide-react';
import { getStudentReport } from '../../services/api';

interface StudentReportProps {
    onBack?: () => void;
}

export const StudentReport = ({ onBack }: StudentReportProps) => {
    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const data = await getStudentReport();
                setReportData(data);
            } catch (error) {
                console.error("Failed to fetch student report", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReport();
    }, []);

    const exportToCSV = () => {
        if (!reportData) return;

        // Simple CSV generation for Course Progress
        const headers = ["Course", "Progress (%)", "Enrolled At"];
        const rows = reportData.course_progress.map((c: any) => [
            c.course_title,
            c.progress,
            new Date(c.enrolled_at).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((r: any) => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "my_learning_report.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!reportData) return null;

    const { summary, course_progress, quiz_performance, certificates } = reportData;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-white">Learning Performance Report</h1>
                        <p className="text-sm text-gray-400">Detailed breakdown of your academic progress and achievements.</p>
                    </div>
                </div>

                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 bg-[#1e293b] hover:bg-[#334155] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-gray-800"
                >
                    <Download className="w-4 h-4" />
                    Export Data (CSV)
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-surface border border-gray-800 p-5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-sm text-gray-400 font-medium">Courses</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{summary.total_courses}</span>
                        <span className="text-xs text-gray-500">Enrolled</span>
                    </div>
                </div>

                <div className="bg-surface border border-gray-800 p-5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-sm text-gray-400 font-medium">Completed</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{summary.completed_courses}</span>
                        <span className="text-xs text-gray-500">Finished</span>
                    </div>
                </div>

                <div className="bg-surface border border-gray-800 p-5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Award className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-sm text-gray-400 font-medium">Certificates</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{summary.total_certificates}</span>
                        <span className="text-xs text-gray-500">Earned</span>
                    </div>
                </div>

                <div className="bg-surface border border-gray-800 p-5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-yellow-400" />
                        </div>
                        <span className="text-sm text-gray-400 font-medium">Avg Score</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{summary.avg_quiz_score}%</span>
                        <span className="text-xs text-gray-500">Quizzes</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Course Progress Chart */}
                <div className="bg-surface border border-gray-800 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-6">Course Progress</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={course_progress}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis
                                    dataKey="course_title"
                                    stroke="#4b5563"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#9ca3af' }}
                                />
                                <YAxis
                                    stroke="#4b5563"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#9ca3af' }}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderColor: '#1e293b',
                                        color: '#fff',
                                        fontSize: '12px',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar
                                    dataKey="progress"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                >
                                    {course_progress.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.progress === 100 ? '#10b981' : '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quiz Performance List */}
                <div className="bg-surface border border-gray-800 p-6 rounded-2xl flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6">Quiz Performance</h3>
                    <div className="space-y-4 overflow-y-auto max-h-64 pr-2 custom-scrollbar">
                        {quiz_performance.length > 0 ? (
                            quiz_performance.map((quiz: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-gray-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-900 rounded-lg">
                                            <HelpCircle className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-white line-clamp-1">{quiz.quiz_title}</h4>
                                            <p className="text-[10px] text-gray-500">{new Date(quiz.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-bold ${quiz.percentage >= 80 ? 'text-green-400' : 'text-blue-400'}`}>
                                            {quiz.score}/{quiz.total}
                                        </div>
                                        <div className="text-[10px] text-gray-500">{quiz.percentage}%</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                                <FileText className="w-10 h-10 mb-2 opacity-20" />
                                <p className="text-xs italic">No quiz attempts recorded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Certificates Section */}
            <div className="bg-surface border border-gray-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-6">Recent Certificates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {certificates.length > 0 ? (
                        certificates.map((cert: any) => (
                            <div key={cert.id} className="p-4 rounded-xl bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 flex flex-col gap-3">
                                <Award className="w-8 h-8 text-blue-400" />
                                <div>
                                    <h4 className="text-sm font-bold text-white">{cert.course_title}</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">ID: {cert.id}</p>
                                    <p className="text-xs text-gray-400">Issued on {new Date(cert.issued_at).toLocaleDateString()}</p>
                                </div>
                                <button className="mt-2 text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors uppercase tracking-widest">
                                    View Certificate
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="lg:col-span-3 text-center py-10 text-gray-500 border border-gray-800 border-dashed rounded-xl">
                            <p className="text-xs italic">Earn your first certificate by completing a course!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
