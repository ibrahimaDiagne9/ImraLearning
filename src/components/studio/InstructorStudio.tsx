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
    const [shortDescription, setShortDescription] = useState('');
    const [requirements, setRequirements] = useState('');
    const [outcomes, setOutcomes] = useState('');
    const [category, setCategory] = useState('Design');
    const [level, setLevel] = useState('beginner');
    const [price, setPrice] = useState('0.00');
    const [durationHours, setDurationHours] = useState('0');
    const [thumbnail, setThumbnail] = useState<string | File>('');

    // UI & Local State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

    // Sync query data to local editing state
    useEffect(() => {
        if (courseData) {
            setCourseTitle(courseData.title);
            setDescription(courseData.description);
            setShortDescription(courseData.short_description || '');
            setRequirements(courseData.requirements || '');
            setOutcomes(courseData.outcomes || '');
            setCategory(courseData.category);
            setLevel(courseData.level);
            setPrice(courseData.price || '0.00');
            setDurationHours((courseData.duration_hours ?? 0).toString());
            setThumbnail(courseData.thumbnail || '');
            setSections((courseData.sections ?? []).map((s: any) => ({ ...s, isOpen: true })));

            if (courseData.sections.length > 0 && courseData.sections[0].lessons.length > 0 && !activeLessonId) {
                setActiveLessonId(courseData.sections[0].lessons[0].id);
            }
        } else if (courseId === 'new') {
            // ... lines 68-81
        }
    }, [courseData, courseId]);

    const handleSave = async (publish = false) => {
        let currentThumbnail = thumbnail as string;

        if (thumbnail && typeof thumbnail !== 'string' && courseId !== 'new') {
            try {
                const formData = new FormData();
                formData.append('thumbnail', thumbnail);
                const res = await api.post(`/courses/${courseId}/thumbnail/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                currentThumbnail = res.data.thumbnail_url;
                setThumbnail(currentThumbnail);
            } catch (e) {
                console.error('Thumbnail upload failed:', e);
                showToast('Thumbnail upload failed.', 'error');
                return;
            }
        }

        const parsedPrice = parseFloat(price);
        const parsedDuration = parseFloat(durationHours);

        const payload = {
            title: courseTitle,
            description: description || 'No description provided.',
            short_description: shortDescription,
            requirements,
            outcomes,
            category,
            level,
            price: isNaN(parsedPrice) ? '0.00' : parsedPrice.toFixed(2),
            duration_hours: isNaN(parsedDuration) ? 0 : Math.round(parsedDuration),
            is_published: publish,
            sections: sections.map((s, sIdx) => ({
                id: typeof s.id === 'number' ? s.id : undefined,
                title: s.title,
                order: sIdx,
                lessons: s.lessons.map((l, lIdx) => ({
                    id: typeof l.id === 'number' ? l.id : undefined,
                    title: l.title,
                    lesson_type: l.lesson_type,
                    order: lIdx,
                    video_url: l.video_url,
                    content: l.content,
                    duration: l.duration,
                    summary: l.summary,
                    is_preview: l.is_preview,
                    quiz: l.quiz ? {
                        id: typeof l.quiz.id === 'number' ? l.quiz.id : undefined,
                        title: l.quiz.title || l.title,
                        xp_reward: l.quiz.xp_reward,
                        questions: (l.quiz.questions || []).map(q => ({
                            id: typeof q.id === 'number' ? q.id : undefined,
                            text: q.text,
                            explanation: q.explanation,
                            choices: (q.choices || []).map(c => ({
                                id: typeof c.id === 'number' ? c.id : undefined,
                                text: c.text,
                                is_correct: c.is_correct
                            }))
                        }))
                    } : undefined,
                    assignment: l.assignment ? {
                        id: typeof l.assignment.id === 'number' ? l.assignment.id : undefined,
                        title: l.assignment.title || l.title,
                        instructions: l.assignment.instructions,
                        total_points: l.assignment.total_points,
                        due_date: l.assignment.due_date
                    } : undefined
                }))
            }))
        };

        saveMutation.mutate(
            { courseId, payload: payload as any },
            {
                onSuccess: (data) => {
                    const isNew = courseId === 'new';

                    // Handle delayed thumbnail upload for new courses
                    if (isNew && thumbnail && typeof thumbnail !== 'string') {
                        const formData = new FormData();
                        formData.append('thumbnail', thumbnail);
                        api.post(`/courses/${data.id}/thumbnail/`, formData, {
                        }).then(res => {
                            setThumbnail(res.data.thumbnail_url);
                        }).catch(err => {
                            console.error('New course thumbnail upload failed:', err);
                        });
                    }

                    showToast(isNew ? 'Course created successfully!' : 'Course updated successfully.', 'success');
                    if (isNew) {
                        navigate(`/studio/${data.id}`, { replace: true });
                    }
                    if (data.sections) {
                        setSections(data.sections.map((s: any) => ({ ...s, isOpen: true })));
                    }
                },
                onError: (error: any) => {
                    const errorData = error.response?.data;
                    let message = 'Failed to save.';

                    if (errorData) {
                        if (typeof errorData === 'object') {
                            // Backend structured error: { success: false, message: "...", errors: { ... } }
                            if (errorData.message) {
                                message = errorData.message;
                                // If there are field errors, append the first one
                                if (errorData.errors && typeof errorData.errors === 'object') {
                                    const firstErrorField = Object.keys(errorData.errors)[0];
                                    const fieldError = errorData.errors[firstErrorField];
                                    const errorString = Array.isArray(fieldError) ? fieldError[0] : fieldError;
                                    if (errorString) {
                                        message += ` (${firstErrorField}: ${errorString})`;
                                    }
                                }
                            } else {
                                // Fallback for raw DRF errors: { field: ["error"] }
                                const firstKey = Object.keys(errorData)[0];
                                if (firstKey) {
                                    const val = errorData[firstKey];
                                    message = `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
                                }
                            }
                        } else if (typeof errorData === 'string') {
                            message = errorData;
                        }
                    } else if (error.message) {
                        message = error.message;
                    }

                    console.error('Save failed:', errorData || error.message);
                    showToast(message, 'error');
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
            const res = await api.post(`/lessons/${activeLessonId}/resources/`, formData);
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
                data={{ description, category, level, price, durationHours, thumbnail }}
                onUpdate={(field, value) => {
                    if (field === 'description') setDescription(value);
                    if (field === 'category') setCategory(value);
                    if (field === 'level') setLevel(value);
                    if (field === 'price') setPrice(value);
                    if (field === 'durationHours') setDurationHours(value);
                    if (field === 'thumbnailFile') setThumbnail(value);
                }}
                onSave={() => { handleSave(false); setIsSettingsOpen(false); }}
            />
        </div>
    );
};
