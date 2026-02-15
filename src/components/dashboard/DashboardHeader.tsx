import { useAuth } from '../../context/AuthContext';

export const DashboardHeader = () => {
    const { user, userRole } = useAuth();

    return (
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.username || (userRole === 'teacher' ? 'Teacher' : 'Student')}!
            </h1>
            <p className="text-gray-400">
                {userRole === 'teacher'
                    ? "Here's what's happening with your courses today."
                    : "Continue your learning journey today."}
            </p>
        </div>
    );
};
