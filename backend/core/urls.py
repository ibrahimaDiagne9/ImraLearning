from django.urls import path
from .views import auth_views, course_views, learning_views, community_views, business_views, analytics_views, utility_views

urlpatterns = [
    # Auth & Profile
    path('auth/register/', auth_views.RegisterView.as_view(), name='register'),
    path('auth/profile/', auth_views.UserDetailView.as_view(), name='profile'),
    
    # Courses
    path('courses/', course_views.CourseListView.as_view(), name='course-list'),
    path('courses/<int:pk>/', course_views.CourseDetailView.as_view(), name='course-detail'),
    path('courses/invite/', course_views.InvitationView.as_view(), name='invite-student'),
    path('lessons/', course_views.LessonCreateView.as_view(), name='lesson-create'),
    path('lessons/<int:pk>/video/', course_views.LessonVideoUploadView.as_view(), name='lesson-video-upload'),
    path('lessons/<int:lesson_pk>/resources/', course_views.ResourceCreateView.as_view(), name='resource-create'),
    path('resources/<int:pk>/', course_views.ResourceDeleteView.as_view(), name='resource-delete'),

    # Learning & Progress
    path('courses/<int:pk>/enroll/', learning_views.EnrollView.as_view(), name='enroll'),
    path('learning/add-xp/', learning_views.AddXPView.as_view(), name='add-xp'),
    path('lessons/<int:pk>/toggle-completion/', learning_views.ToggleLessonCompletionView.as_view(), name='toggle-completion'),
    path('quizzes/<int:pk>/submit/', learning_views.SubmitQuizView.as_view(), name='quiz-submit'),
    path('certificates/', learning_views.CertificateListView.as_view(), name='certificate-list'),
    path('certificates/<str:certificate_id>/', learning_views.CertificateDetailView.as_view(), name='certificate-detail'),
    path('lessons/<int:lesson_pk>/assignment/', learning_views.AssignmentCreateView.as_view(), name='assignment-create'),
    path('assignments/<int:pk>/submit/', learning_views.SubmitAssignmentView.as_view(), name='assignment-submit'),
    path('assignments/submissions/', learning_views.SubmissionListView.as_view(), name='submission-list'),
    path('submissions/<int:pk>/grade/', learning_views.GradeAssignmentView.as_view(), name='assignment-grade'),

    # Community & Messaging
    path('discussions/', community_views.DiscussionListView.as_view(), name='discussion-list'),
    path('discussions/<int:pk>/', community_views.DiscussionDetailView.as_view(), name='discussion-detail'),
    path('discussions/<int:pk>/reply/', community_views.ReplyCreateView.as_view(), name='reply-create'),
    path('discussions/<int:pk>/like/', community_views.LikeDiscussionView.as_view(), name='like-discussion'),
    path('replies/<int:pk>/like/', community_views.LikeReplyView.as_view(), name='like-reply'),
    path('leaderboard/', community_views.LeaderboardView.as_view(), name='leaderboard'),
    path('courses/<int:course_pk>/reviews/', community_views.ReviewListView.as_view(), name='course-reviews'),
    path('conversations/', community_views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>/messages/', community_views.MessageListView.as_view(), name='message-list'),
    path('conversations/<int:pk>/read/', community_views.MarkMessagesReadView.as_view(), name='mark-messages-read'),

    # Business & Sessions
    path('membership/upgrade/', business_views.UpgradeMembershipView.as_view(), name='upgrade-membership'),
    path('live-sessions/', business_views.LiveSessionListView.as_view(), name='live-session-list'),
    path('live-sessions/<int:pk>/', business_views.LiveSessionDetailView.as_view(), name='live-session-detail'),
    path('live-sessions/<int:pk>/start/', business_views.StartLiveSessionView.as_view(), name='live-session-start'),
    path('live-sessions/<int:pk>/end/', business_views.EndLiveSessionView.as_view(), name='live-session-end'),
    path('orders/', business_views.OrderListCreateView.as_view(), name='order-list-create'),
    path('payments/create-intent/', business_views.CreatePaymentIntentView.as_view(), name='payment-create-intent'),
    path('payments/confirm/', business_views.ConfirmPaymentView.as_view(), name='payment-confirm'),
    path('payments/paydunya/checkout/', business_views.CreatePayDunyaCheckoutView.as_view(), name='paydunya-checkout'),
    path('payments/paydunya/direct-initiate/', business_views.InitiateDirectPaymentView.as_view(), name='paydunya-direct-initiate'),
    path('payments/paydunya/ipn/', business_views.PayDunyaIPNView.as_view(), name='paydunya-ipn'),

    # Analytics & Reports
    path('analytics/', analytics_views.AnalyticsView.as_view(), name='analytics'),
    path('dashboard/student-report/', analytics_views.StudentReportView.as_view(), name='student-report'),
    path('dashboard/recent-activity/', analytics_views.RecentActivityView.as_view(), name='recent-activity'),
    path('quizzes/student-analytics/', analytics_views.StudentAnalyticsView.as_view(), name='student-analytics'),

    # Utility
    path('notifications/', utility_views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', utility_views.MarkNotificationReadView.as_view(), name='mark-notification-read'),
    path('notifications/mark-all-read/', utility_views.MarkAllNotificationsReadView.as_view(), name='mark-all-read'),
    path('notifications/clear/', utility_views.ClearNotificationsView.as_view(), name='clear-notifications'),
    path('dashboard/pending-tasks/', utility_views.PendingTasksView.as_view(), name='pending-tasks'),
    path('dashboard/upcoming-classes/', business_views.UpcomingClassesView.as_view(), name='upcoming-classes'),
]
