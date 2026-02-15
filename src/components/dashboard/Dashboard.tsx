import { TeacherDashboard } from './TeacherDashboard';
import { StudentDashboard } from './StudentDashboard';

interface DashboardProps {
    userRole?: 'teacher' | 'student';
    onOpenModal?: (modal: string) => void;
    onNavigate?: (page: string) => void;
}

export const Dashboard = ({ userRole = 'teacher', onOpenModal, onNavigate }: DashboardProps) => {
    if (userRole === 'student') {
        return <StudentDashboard onOpenModal={onOpenModal} />;
    }
    return <TeacherDashboard onOpenModal={onOpenModal} onNavigate={onNavigate} />;
};
