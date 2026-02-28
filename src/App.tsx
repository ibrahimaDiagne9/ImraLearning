import { useState, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { VerifyEmailPage } from './components/auth/VerifyEmailPage';
import { CreateCourseModal } from './components/modals/CreateCourseModal';
import { CreateAssignmentModal } from './components/modals/CreateAssignmentModal';
import { InviteStudentModal } from './components/modals/InviteStudentModal';
import { GoLiveModal } from './components/modals/GoLiveModal';
import { AddProjectModal } from './components/modals/AddProjectModal';
import { CreateDiscussionModal } from './components/modals/CreateDiscussionModal';
import { Loader2 } from 'lucide-react';

const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const CoursesPage = lazy(() => import('./components/courses/CoursesPage').then(m => ({ default: m.CoursesPage })));
const DiscussionsPage = lazy(() => import('./components/discussions/DiscussionsPage').then(m => ({ default: m.DiscussionsPage })));
const GradebookPage = lazy(() => import('./components/gradebook/GradebookPage').then(m => ({ default: m.GradebookPage })));
const ProfilePage = lazy(() => import('./components/profile/ProfilePage').then(m => ({ default: m.ProfilePage })));
const MembershipPage = lazy(() => import('./components/membership/MembershipPage').then(m => ({ default: m.MembershipPage })));
const TeacherMembershipPage = lazy(() => import('./components/membership/TeacherMembershipPage').then(m => ({ default: m.TeacherMembershipPage })));
const CheckoutPage = lazy(() => import('./components/membership/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const PaymentSuccessPage = lazy(() => import('./components/membership/PaymentSuccessPage').then(m => ({ default: m.PaymentSuccessPage })));
const CoursePaymentSuccess = lazy(() => import('./components/courses/CoursePaymentSuccess').then(m => ({ default: m.CoursePaymentSuccess })));
const InstructorStudio = lazy(() => import('./components/studio/InstructorStudio').then(m => ({ default: m.InstructorStudio })));
const AnalyticsDashboard = lazy(() => import('./components/analytics/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const LessonPlayer = lazy(() => import('./components/learning/LessonPlayer').then(m => ({ default: m.LessonPlayer })));
const MessagingPage = lazy(() => import('./components/messaging/MessagingPage').then(m => ({ default: m.MessagingPage })));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
    <span className="text-gray-400 font-medium">Loading Module...</span>
  </div>
);

export type ActiveModal = 'create-course' | 'create-assignment' | 'invite-student' | 'go-live' | 'add-project' | 'create-discussion' | null;

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  fee?: string;
  description: string;
  features: string[];
  color: string;
  isPopular?: boolean;
}

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, logout, setIsPro } = useAuth();
  const { showToast } = useToast();
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onSignup={() => navigate('/signup')} />} />
        <Route path="/signup" element={<SignupPage onLogin={() => navigate('/login')} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <MainLayout
        onLogout={logout}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <Dashboard
                userRole={userRole}
                onOpenModal={(m: string) => setActiveModal(m as ActiveModal)}
                onNavigate={(path: string) => navigate(`/${path}`)}
              />
            } />
            <Route path="/courses" element={<CoursesPage userRole={userRole} />} />
            <Route path="/learn/:courseId" element={<LessonPlayer onBack={() => navigate('/courses')} />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/discussions" element={
              <DiscussionsPage
                onOpenModal={() => setActiveModal('create-discussion')}
              />
            } />
            <Route path="/gradebook" element={<GradebookPage onBack={() => navigate('/dashboard')} />} />
            <Route path="/messages" element={<MessagingPage />} />
            <Route path="/studio" element={<InstructorStudio />} />
            <Route path="/studio/:courseId" element={<InstructorStudio />} />
            <Route path="/profile" element={
              <ProfilePage
                userRole={userRole}
                onBack={() => navigate('/dashboard')}
              />
            } />
            <Route path="/profile/:userId" element={
              <ProfilePage
                userRole={userRole}
                onBack={() => navigate(-1)}
              />
            } />
            <Route path="/memberships" element={
              userRole === 'teacher' ? (
                <TeacherMembershipPage
                  onSelectPlan={(plan) => {
                    setCheckoutPlan(plan);
                    navigate('/checkout');
                  }}
                  onBack={() => navigate('/dashboard')}
                />
              ) : (
                <MembershipPage
                  onSelectPlan={(plan) => {
                    setCheckoutPlan(plan);
                    navigate('/checkout');
                  }}
                  onBack={() => navigate('/dashboard')}
                />
              )
            } />
            <Route path="/checkout" element={
              <CheckoutPage
                plan={checkoutPlan!}
                onBack={() => navigate('/memberships')}
                onSuccess={() => {
                  setIsPro(true);
                  navigate('/success');
                  showToast('Account upgraded to Pro!', 'success');
                }}
              />
            } />
            <Route path="/success" element={<PaymentSuccessPage onFinish={() => navigate('/dashboard')} />} />
            <Route path="/payment-success/:orderId" element={<CoursePaymentSuccess />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </MainLayout>

      {/* Global Modals */}
      <CreateCourseModal
        isOpen={activeModal === 'create-course'}
        onClose={() => {
          setActiveModal(null);
          showToast('Course created successfully!', 'success');
        }}
      />
      <CreateAssignmentModal
        isOpen={activeModal === 'create-assignment'}
        onClose={() => {
          setActiveModal(null);
          showToast('Assignment added successfully!', 'success');
        }}
      />
      <InviteStudentModal
        isOpen={activeModal === 'invite-student'}
        onClose={() => {
          setActiveModal(null);
          showToast('Invitation sent to student!', 'success');
        }}
      />
      <GoLiveModal
        isOpen={activeModal === 'go-live'}
        onClose={() => {
          setActiveModal(null);
          showToast('Live session started!', 'info');
        }}
      />
      <AddProjectModal
        isOpen={activeModal === 'add-project'}
        onClose={() => {
          setActiveModal(null);
          showToast('Project added to portfolio!', 'success');
        }}
      />
      <CreateDiscussionModal
        isOpen={activeModal === 'create-discussion'}
        onClose={() => setActiveModal(null)}
        onSubmit={async (title: string, content: string, course: string | null) => {
          try {
            const { createDiscussion } = await import('./services/api');
            await createDiscussion({ title, content, course });
            setActiveModal(null);
            showToast('Discussion posted successfully!', 'success');
            window.location.reload();
          } catch (e) {
            // Error toast is now handled globally in apiClient
            console.error(e);
          }
        }}
      />
    </>
  )
}

export default App
