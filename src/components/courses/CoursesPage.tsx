import { StudentCoursesPage } from './StudentCoursesPage';
import { TeacherCoursesPage } from './TeacherCoursesPage';

interface CoursesPageProps {
    userRole: 'teacher' | 'student';
}

export const CoursesPage = ({ userRole }: CoursesPageProps) => {
    if (userRole === 'teacher') {
        return <TeacherCoursesPage />;
    }
    return <StudentCoursesPage />;
};
