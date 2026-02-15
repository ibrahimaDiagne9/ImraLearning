import { useState, useEffect } from 'react';
import { Loader2, Layout } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CourseSettingsModal } from './CourseSettingsModal';
import { StudioHeader } from './StudioHeader';
import { StudioSidebar } from './StudioSidebar';
import { LessonEditor } from './LessonEditor';
import { useStudioState } from './hooks/useStudioState';
import { useCourseDetail, useSaveCourse } from '../../hooks/useCourseQueries';
import type { LessonType } from './StudioTypes';

export const InstructorStudio = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const { showToast } = useToast();
    const { data: courseData, isLoading } = useCourseDetail(courseId);
    const saveMutation = useSaveCourse();

    // Curriculum State Hook
    const {
        sections,
        setSections,
        activeLessonId,
        setActiveLessonId,
        toggleSection,
        addSection,
        addLesson,
        updateSectionTitle,
        deleteSection,
        deleteLesson,
        moveSection,
        moveLesson,
        updateLesson,
        setLessonType
    } = useStudioState();

    // Course Metadata State
    const [courseTitle, setCourseTitle] = useState('New UI Mastery Course');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Design');
    const [level, setLevel] = useState('beginner');
    const [price, setPrice] = useState('0.00');
    const [durationHours, setDurationHours] = useState('0');

    // UI & Local State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

    // Sync query data to local editing state
    useEffect(() => {
        if (courseData) {
            setCourseTitle(courseData.title);
            setDescription(courseData.description);
            setCategory(courseData.category);
            setLevel(courseData.level);
            setPrice(courseData.price || '0.00');
            setDurationHours((courseData.duration_hours ?? 0).toString());
            setSections((courseData.sections ?? []).map((s: any) => ({ ...s, isOpen: true })));

            if (courseData.sections.length > 0 && courseData.sections[0].lessons.length > 0 && !activeLessonId) {
                setActiveLessonId(courseData.sections[0].lessons[0].id);
            }
        } else if (courseId === 'new') {
            // Initial blank state for new course
            setSections([
                {
                    id: 'temp-s1',
                    title: 'Welcome & Fundamentals',
                    order: 0,
                    isOpen: true,
                    lessons: [{ id: 'temp-l1', title: 'Course Introduction', lesson_type: 'video', order: 0 }]
                }
            ]);
            setActiveLessonId('temp-l1');
        }
    }, [courseData, courseId]);

    const handleSave = async (publish = false) => {
        const payload = {
            title: courseTitle,
            description: description || 'No description provided.',
            category, level, price,
            duration_hours: parseFloat(durationHours),
            is_published: publish,
            sections: sections.map((s, sIdx) => ({
                ...s,
                id: typeof s.id === 'number' ? s.id : undefined,
                order: sIdx,
                lessons: s.lessons.map((l, lIdx) => ({
                    ...l,
                    id: typeof l.id === 'number' ? l.id : undefined,
                    order: lIdx
                }))
            }))
        };

        saveMutation.mutate(
            { courseId, payload },
            {
                onSuccess: (data) => {
                    showToast(courseId === 'new' ? 'Course created.' : 'Course updated.', 'success');
                    if (courseId === 'new') navigate(`/studio/${data.id}`);
                    setSections(data.sections.map((s: any) => ({ ...s, isOpen: true })));
                },
                onError: () => {
                    showToast('Failed to save.', 'error');
                }
            }
        );
    };

    const handleVideoUpload = async (file: File) => {
        if (!activeLessonId || (typeof activeLessonId === 'string' && activeLessonId.startsWith('temp'))) {
            showToast('Save draft before uploading video.', 'warning');
            return;
        }
        const formData = new FormData();
        formData.append('video_file', file);
        try {
            setUploadProgress(prev => ({ ...prev, [activeLessonId]: 0 }));
            const res = await api.post(`/lessons/${activeLessonId}/video/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (p) => setUploadProgress(prev => ({ ...prev, [activeLessonId]: Math.round((p.loaded * 100) / (p.total || 1)) }))
            });
            updateLesson(activeLessonId, { video_url: res.data.video_url });
            showToast('Video uploaded.', 'success');
        } catch (e) {
            showToast('Upload failed.', 'error');
        } finally {
            setTimeout(() => setUploadProgress(prev => {
                const next = { ...prev };
                delete next[activeLessonId];
                return next;
            }), 1000);
        }
    };

    const handleAddResource = async (file: File) => {
        if (!activeLessonId || (typeof activeLessonId === 'string' && activeLessonId.startsWith('temp'))) {
            showToast('Save draft first.', 'warning');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        formData.append('file_type', file.name.split('.').pop() || '');
        formData.append('file_size', `${(file.size / (1024 * 1024)).toFixed(1)} MB`);
        try {
            const res = await api.post(`/lessons/${activeLessonId}/resources/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const currentLesson = sections.flatMap(s => s.lessons).find(l => l.id === activeLessonId);
            updateLesson(activeLessonId, { resources: [...(currentLesson?.resources || []), res.data] });
            showToast('Resource attached.', 'success');
        } catch (e) {
            showToast('Resource failed.', 'error');
        }
    };

    const handleDeleteResource = async (resourceId: number) => {
        if (!activeLessonId) return;
        try {
            await api.delete(`/resources/${resourceId}/`);
            const currentLesson = sections.flatMap(s => s.lessons).find(l => l.id === activeLessonId);
            updateLesson(activeLessonId, { resources: currentLesson?.resources?.filter(r => r.id !== resourceId) });
            showToast('Resource deleted.', 'info');
        } catch (e) { console.error(e); }
    };

    if (isLoading) return <div className="h-full flex items-center justify-center bg-[#020617]"><Loader2 className="w-12 h-12 text-blue-500 animate-spin" /></div>;

    const activeLesson = sections.flatMap(s => s.lessons).find(l => l.id === activeLessonId);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[#020617] overflow-hidden">
            <StudioHeader
                courseId={courseId}
                courseTitle={courseTitle}
                setCourseTitle={setCourseTitle}
                isSaving={saveMutation.isPending}
                onPreview={() => courseId === 'new' ? showToast('Please save your course as a draft before previewing.', 'warning') : navigate(`/learn/${courseId}`, { state: { fromStudio: true } })}
                onSave={handleSave}
            />

            <div className="flex flex-1 overflow-hidden">
                <StudioSidebar
                    sections={sections}
                    activeLessonId={activeLessonId}
                    setActiveLessonId={setActiveLessonId}
                    toggleSection={toggleSection}
                    addSection={addSection}
                    addLesson={addLesson}
                    updateSectionTitle={updateSectionTitle}
                    deleteSection={deleteSection}
                    deleteLesson={deleteLesson}
                    moveSection={moveSection}
                    moveLesson={moveLesson}
                />

                <main className="flex-1 bg-[#020617] overflow-y-auto custom-scrollbar p-12">
                    {activeLesson ? (
                        <LessonEditor
                            lesson={activeLesson}
                            uploadProgress={uploadProgress[activeLessonId!]}
                            onUpdate={(updates) => updateLesson(activeLessonId!, updates)}
                            onSetType={(type: LessonType) => setLessonType(activeLessonId!, type)}
                            onVideoUpload={handleVideoUpload}
                            onAddResource={handleAddResource}
                            onDeleteResource={handleDeleteResource}
                            onDeleteLesson={() => deleteLesson(activeLessonId!)}
                            onOpenSettings={() => setIsSettingsOpen(true)}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-900 rounded-3xl flex items-center justify-center text-gray-700">
                                <Layout className="w-10 h-10" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Select a lesson to edit</h2>
                            <p className="text-sm text-gray-500 max-w-xs">Use the curriculum sidebar to navigate between your course sections and lessons.</p>
                        </div>
                    )}
                </main>
            </div>

            <CourseSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                isSaving={saveMutation.isPending}
                data={{ description, category, level, price, durationHours }}
                onUpdate={(field, value) => {
                    if (field === 'description') setDescription(value);
                    if (field === 'category') setCategory(value);
                    if (field === 'level') setLevel(value);
                    if (field === 'price') setPrice(value);
                    if (field === 'durationHours') setDurationHours(value);
                }}
                onSave={() => { handleSave(false); setIsSettingsOpen(false); }}
            />
        </div>
    );
};
