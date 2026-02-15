export interface Resource {
    id: number;
    title: string;
    file: string;
    file_type?: string;
    file_size?: string;
}

export interface Choice {
    id?: number | string;
    text: string;
    is_correct: boolean;
}

export interface Question {
    id?: number | string;
    text: string;
    choices: Choice[];
    explanation?: string;
}

export interface Quiz {
    id?: number | string;
    title: string;
    xp_reward: number;
    questions: Question[];
}

export type LessonType = 'video' | 'article' | 'quiz' | 'assignment';

export interface Lesson {
    id?: number | string;
    title: string;
    lesson_type: LessonType;
    video_url?: string;
    video_file?: string;
    content?: string;
    duration?: string;
    order: number;
    resources?: Resource[];
    quiz?: Quiz;
    assignment?: {
        id?: number;
        instructions: string;
        total_points: number;
        due_date?: string;
    };
}

export interface Section {
    id?: number | string;
    title: string;
    order: number;
    lessons: Lesson[];
    isOpen?: boolean; // UI state only
}

export interface CourseData {
    id?: number | string;
    title: string;
    description: string;
    category: string;
    level: string;
    price: string;
    duration_hours: number;
    is_published?: boolean;
    sections: Section[];
}
