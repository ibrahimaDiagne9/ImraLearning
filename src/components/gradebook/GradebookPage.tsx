import { useState, useEffect } from 'react';
import { Search, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { getSubmissions, gradeSubmission } from '../../services/api';

interface GradeItem {
    id: number;
    student_name: string;
    student: number;
    assignment_title: string;
    assignment: number;
    submitted_at: string;
    grade?: number;
    status: 'Pending' | 'Graded';
    feedback?: string;
}

export const GradebookPage = ({ onBack }: { onBack: () => void }) => {
    const [submissions, setSubmissions] = useState<GradeItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Graded'>('All');
    const [gradingId, setGradingId] = useState<number | null>(null);
    const [gradeValue, setGradeValue] = useState<string>('');

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setIsLoading(true);
        try {
            const data = await getSubmissions();
            // Map backend data to local structure
            const mapped = data.map((s: any) => ({
                id: s.id,
                student_name: s.student_name,
                student: s.student,
                assignment_title: s.assignment_title || 'Untitled Assignment',
                assignment: s.assignment,
                submitted_at: new Date(s.submitted_at).toLocaleDateString(),
                grade: s.grade,
                status: s.grade !== null ? 'Graded' : 'Pending',
                feedback: s.feedback
            }));
            setSubmissions(mapped);
        } catch (error) {
            console.error("Failed to fetch submissions", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGrade = async (id: number) => {
        const grade = parseInt(gradeValue);
        if (isNaN(grade)) return;

        try {
            await gradeSubmission(id, { grade });
            setGradingId(null);
            setGradeValue('');
            fetchSubmissions();
        } catch (error) {
            console.error("Failed to grade submission", error);
        }
    };

    const filteredSubmissions = submissions.filter(s => {
        const matchesSearch = s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.assignment_title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || s.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Gradebook</h1>
                    <p className="text-gray-400">Review and grade student submissions</p>
                </div>

                <div className="flex gap-3">
                    <button className="bg-blue-900/40 text-blue-400 px-4 py-2 rounded-lg font-medium text-sm border border-blue-800 hover:bg-blue-900/60 transition-colors">
                        {submissions.filter(s => s.status === 'Pending').length} Pending Review
                    </button>
                    <button className="bg-surface border border-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="bg-surface flex-1 border border-gray-800 rounded-lg flex items-center gap-3 px-4 py-2.5">
                    <Search className="w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search students, assignments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:outline-none text-gray-300 w-full placeholder:text-gray-600 text-sm"
                    />
                </div>

                <div className="flex bg-surface border border-gray-800 rounded-lg p-1">
                    {(['All', 'Pending', 'Graded'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/50 text-gray-400 text-sm">
                                <th className="p-4 font-medium">Student</th>
                                <th className="p-4 font-medium">Assignment</th>
                                <th className="p-4 font-medium">Submitted</th>
                                <th className="p-4 font-medium">Grade</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredSubmissions.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-blue-600`}>
                                                {item.student_name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-white text-sm">{item.student_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300 text-sm">{item.assignment_title}</td>
                                    <td className="p-4 text-gray-400 text-sm">{item.submitted_at}</td>
                                    <td className="p-4">
                                        {gradingId === item.id ? (
                                            <input
                                                type="number"
                                                autoFocus
                                                value={gradeValue}
                                                onChange={(e) => setGradeValue(e.target.value)}
                                                className="w-16 bg-[#1F2937] border border-gray-700 rounded px-2 py-1 text-sm text-white"
                                            />
                                        ) : (
                                            <span className="font-bold text-white text-sm">{item.grade !== null ? item.grade : '-'}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1 ${item.status === 'Graded' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {gradingId === item.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleGrade(item.id)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setGradingId(null)}
                                                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setGradingId(item.id)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                                                >
                                                    {item.status === 'Graded' ? 'Edit' : 'Grade'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
