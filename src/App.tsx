import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { CoursesPage } from './components/courses/CoursesPage';
import { DiscussionsPage } from './components/discussions/DiscussionsPage';
import { GradebookPage } from './components/gradebook/GradebookPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { MembershipPage } from './components/membership/MembershipPage';
import { TeacherMembershipPage } from './components/membership/TeacherMembershipPage';
import { CheckoutPage } from './components/membership/CheckoutPage';
import { PaymentSuccessPage } from './components/membership/PaymentSuccessPage';
import { CoursePaymentSuccess } from './components/courses/CoursePaymentSuccess';
import { CreateCourseModal } from './components/modals/CreateCourseModal';
import { CreateAssignmentModal } from './components/modals/CreateAssignmentModal';
import { InviteStudentModal } from './components/modals/InviteStudentModal';
import { GoLiveModal } from './components/modals/GoLiveModal';
import { AddProjectModal } from './components/modals/AddProjectModal';
import { InstructorStudio } from './components/studio/InstructorStudio';
import { CreateDiscussionModal } from './components/modals/CreateDiscussionModal';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { LessonPlayer } from './components/learning/LessonPlayer';
import { MessagingPage } from './components/messaging/MessagingPage';

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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <MainLayout
        onLogout={logout}
      >
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
