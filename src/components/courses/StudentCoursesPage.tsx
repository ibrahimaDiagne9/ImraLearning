import { useState, useEffect } from 'react';
import { Search, BookOpen, Sparkles, SlidersHorizontal, ArrowRight, Star, Globe } from 'lucide-react';
import { StudentCourseCard } from './StudentCourseCard';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { PaymentModal } from './PaymentModal';

export const StudentCoursesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [courses, setCourses] = useState<any[]>([]);
    const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'enrolled' | 'available'>('all');
    const [selectedCourseForPayment, setSelectedCourseForPayment] = useState<any | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    const [paymentStatusMessage, setPaymentStatusMessage] = useState('');

    const searchQuery = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const level = searchParams.get('level') || '';

    useEffect(() => {
        fetchCourses();
    }, [searchQuery, category, level]);

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (category) params.append('category', category);
            if (level) params.append('level', level);

            const [allResp, featuredResp] = await Promise.all([
                api.get(`/courses/?${params.toString()}`),
                api.get('/courses/?is_featured=true')
            ]);

            setCourses(allResp.data);
            setFeaturedCourses(featuredResp.data);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnroll = async (id: number) => {
        const course = courses.find(c => c.id === id) || featuredCourses.find(c => c.id === id);
        if (!course) return;

        const isFree = parseFloat(course.price || '0') === 0;

        try {
            if (isFree) {
                await api.post(`/courses/${id}/enroll/`);
                addNotification({
                    type: 'course',
                    title: 'Successfully Enrolled!',
                    description: 'You can now start learning this course.'
                });
                fetchCourses();
            } else {
                setSelectedCourseForPayment(course);
                setIsPaymentModalOpen(true);
            }
        } catch (error: any) {
            console.error('Enrollment failed', error);
            const errorMessage = error.response?.data?.error || (isFree ? 'Failed to enroll.' : 'Failed to initialize payment.');
            addNotification({ type: 'system', title: 'Error', description: errorMessage });
        }
    };

    const handleConfirmPayment = async (method: string, phoneNumber?: string) => {
        if (!selectedCourseForPayment) return;

        try {
            if (method === 'card') {
                const response = await api.post('/payments/paydunya/checkout/', { course_id: selectedCourseForPayment.id });
                if (response.data.checkout_url) {
                    window.location.href = response.data.checkout_url;
                }
                return;
            }

            setPaymentStatus('processing');
            setPaymentStatusMessage('Veuillez confirmer le paiement sur votre application Wave/Orange Money.');

            const channel = method === 'wave' ? 'wave-senegal' : 'orange-money-senegal';
            await api.post('/payments/paydunya/direct-initiate/', {
                course_id: selectedCourseForPayment.id,
                phone_number: phoneNumber,
                channel: channel
            });

            // Start polling for enrollment status
            const pollInterval = setInterval(async () => {
                try {
                    const checkResp = await api.get(`/courses/${selectedCourseForPayment.id}/`);
                    if (checkResp.data.is_enrolled) {
                        clearInterval(pollInterval);
                        setPaymentStatus('success');
                        setPaymentStatusMessage('Félicitations ! Votre inscription est confirmée.');
                        fetchCourses(); // Refresh list in background
                    }
                } catch (e) {
                    console.error('Polling error', e);
                }
            }, 3000);

            // Cleanup polling after 2 minutes to avoid infinite loop if user cancels
            setTimeout(() => clearInterval(pollInterval), 120000);

        } catch (error: any) {
            console.error('Payment initiation failed', error);
            setPaymentStatus('idle');
            const errorMessage = error.response?.data?.error || 'Failed to initiate payment.';
            addNotification({ type: 'system', title: 'Erreur de paiement', description: errorMessage });
            throw error;
        }
    };

    const updateSearchParams = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        setSearchParams(newParams);
    };

    const handleContinue = (id: number) => {
        navigate(`/learn/${id}`);
    };

    const filteredCourses = courses.filter(course => {
        const matchesFilter = filter === 'all' ||
            (filter === 'enrolled' && course.is_enrolled) ||
            (filter === 'available' && !course.is_enrolled);
        return matchesFilter;
    });

    if (isLoading) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 text-blue-400 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#03060E] text-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-20 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-20 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[80%] bg-blue-600 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[70%] bg-indigo-600 rounded-full blur-[100px] animate-pulse delay-700" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="flex-1 space-y-8 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
                                <Sparkles className="w-4 h-4" />
                                Master New Skills
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight">
                                Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Potential</span>
                            </h1>
                            <p className="text-lg text-gray-400 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                                Join 100,000+ students learning world-class skills from industry leading experts.
                                High-definition courses designed for your career growth.
                            </p>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                                <div className="relative group w-full max-w-md">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
                                    <div className="relative flex items-center bg-[#0B0F1A]/80 backdrop-blur-xl border border-white/5 rounded-2xl px-5 py-2">
                                        <Search className="w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="What do you want to learn today?"
                                            value={searchQuery}
                                            onChange={(e) => updateSearchParams('search', e.target.value)}
                                            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 py-3 px-4 outline-none font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bento Style Category/Stats Card */}
                        <div className="w-full lg:w-auto grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-white/5 backdrop-blur-xl flex flex-col justify-between aspect-square group hover:scale-[1.02] transition-transform duration-500">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:rotate-12 transition-transform">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-white">24+</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Languages</p>
                                </div>
                            </div>
                            <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-white/5 backdrop-blur-xl flex flex-col justify-between aspect-square group hover:scale-[1.02] transition-transform duration-500 mt-8">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:rotate-12 transition-transform">
                                    <Star className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-white">4.9/5</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Trust Score</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter Section */}
            <div className="sticky top-0 z-40 bg-[#03060E]/80 backdrop-blur-md border-y border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 justify-between items-center">
                    <div className="flex items-center gap-2 self-start lg:self-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-2xl border border-white/10">
                            {(['all', 'enrolled', 'available'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === f
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {f === 'all' ? 'Discovery' : f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="flex-1 lg:flex-none flex items-center gap-3 px-4 py-2.5 bg-white/5 rounded-2xl border border-white/10 group focus-within:border-blue-500/50 transition-colors cursor-pointer">
                            <SlidersHorizontal className="w-4 h-4 text-gray-500 group-focus-within:text-blue-400" />
                            <select
                                value={category}
                                onChange={(e) => updateSearchParams('category', e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-xs font-black uppercase tracking-widest text-gray-400 outline-none cursor-pointer"
                            >
                                <option value="">Categories</option>
                                {['Design', 'Development', 'Business', 'Marketing'].map(cat => (
                                    <option key={cat} value={cat} className="bg-[#0B0F1A] text-white">{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 lg:flex-none flex items-center gap-3 px-4 py-2.5 bg-white/5 rounded-2xl border border-white/10 group focus-within:border-blue-500/50 transition-colors cursor-pointer">
                            <Globe className="w-4 h-4 text-gray-500 group-focus-within:text-blue-400" />
                            <select
                                value={level}
                                onChange={(e) => updateSearchParams('level', e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-xs font-black uppercase tracking-widest text-gray-400 outline-none cursor-pointer"
                            >
                                <option value="">Difficulty</option>
                                {['beginner', 'intermediate', 'advanced'].map(lvl => (
                                    <option key={lvl} value={lvl} className="bg-[#0B0F1A] text-white capitalize">{lvl}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <main className="max-w-7xl mx-auto px-6 py-12 space-y-20">
                {/* Featured Section */}
                {featuredCourses.length > 0 && !searchQuery && (
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight">Featured <span className="text-blue-500">Selection</span></h2>
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Handpicked by our expert curators</p>
                            </div>
                            <button className="hidden sm:flex items-center gap-2 group text-blue-400 font-bold text-sm tracking-widest uppercase">
                                View all
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredCourses.map(course => (
                                <StudentCourseCard
                                    key={`featured-${course.id}`}
                                    id={course.id}
                                    title={course.title}
                                    instructor={course.instructor_name}
                                    description={course.short_description || course.description}
                                    icon={BookOpen}
                                    stats={{
                                        students: course.enrollment_count || 0,
                                        rating: course.average_rating || 5.0,
                                        hours: course.duration_hours || 0
                                    }}
                                    level={(course.level || 'beginner').charAt(0).toUpperCase() + (course.level || 'beginner').slice(1) as any}
                                    price={parseFloat(course.price || '0') === 0 ? 'Free' : `$${course.price || '0'}`}
                                    isEnrolled={course.is_enrolled}
                                    sections={course.sections}
                                    onEnroll={handleEnroll}
                                    onContinue={handleContinue}
                                    isFeatured
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Main Library Section */}
                <section className="space-y-8">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black tracking-tight">All <span className="text-blue-500">Courses</span></h2>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Explore our full catalog of expert-led content</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.map(course => (
                            <StudentCourseCard
                                key={course.id}
                                id={course.id}
                                title={course.title}
                                instructor={course.instructor_name}
                                description={course.short_description || course.description}
                                icon={BookOpen}
                                stats={{
                                    students: course.enrollment_count || 0,
                                    rating: course.average_rating || 4.9,
                                    hours: course.duration_hours || 0
                                }}
                                level={(course.level || 'beginner').charAt(0).toUpperCase() + (course.level || 'beginner').slice(1) as any}
                                price={parseFloat(course.price || '0') === 0 ? 'Free' : `$${course.price || '0'}`}
                                isEnrolled={course.is_enrolled}
                                sections={course.sections}
                                onEnroll={handleEnroll}
                                onContinue={handleContinue}
                            />
                        ))}
                    </div>

                    {filteredCourses.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5">
                            <div className="w-20 h-20 rounded-3xl bg-gray-900 border border-white/10 flex items-center justify-center text-gray-500 mb-6">
                                <Search className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">No matching courses</h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest">Try adjusting your filters or search terms</p>
                        </div>
                    )}
                </section>
            </main>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setPaymentStatus('idle');
                    setPaymentStatusMessage('');
                }}
                courseTitle={selectedCourseForPayment?.title || ''}
                amount={selectedCourseForPayment?.price || '0'}
                onConfirm={handleConfirmPayment}
                status={paymentStatus}
                statusMessage={paymentStatusMessage}
            />
        </div>
    );
};
