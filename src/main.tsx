import "@/styles/global.css";

import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "@/pages/App";
import OnboardingPage from "@/pages/onboarding";
import RegisterPage from "@/pages/auth/register";
import LoginPage from "@/pages/auth/login";
import EmailVerificationPage from "@/pages/auth/email-verification";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import PasswordResetPage from "@/pages/auth/password-reset";
import GoogleOAuthCallbackPage from "@/pages/auth/google-oauth-callback";
import PlatformLayout from "@/pages/dashboard/layout";
import AccountSecurityPage from "@/pages/dashboard/account-security";
import StudentsPage from "@/pages/dashboard/students";
import EducatorsPage from "@/pages/dashboard/educators";
import TutorsPage from "@/pages/dashboard/tutors";
import EslPage from "@/pages/dashboard/esl";
import StudentSubjectsPage from "@/pages/dashboard/students/subjects";
import StudentSubjectDetailPage from "@/pages/dashboard/students/subjects/detail";
import StudentTasksPage from "@/pages/dashboard/students/tasks";
import StudentNotesPage from "@/pages/dashboard/students/notes";
import StudentStudySpacesPage from "@/pages/dashboard/students/study-spaces";
import StudentStudySpaceDetailPage from "@/pages/dashboard/students/study-spaces/detail/lazy";
import StudentClassworkPage from "@/pages/dashboard/students/classwork";
import StudentMaterialsPage from "@/pages/dashboard/students/materials";
import StudentPersonalMaterialsPage from "@/pages/dashboard/students/materials/personal";
import StudentClassroomMaterialsPage from "@/pages/dashboard/students/materials/classroom";
import StudentStudySpaceMaterialsPage from "@/pages/dashboard/students/materials/study-spaces";
import EducatorClassworkPage from "@/pages/dashboard/educators/classwork";
import EducatorAttendancePage from "@/pages/dashboard/educators/attendance";
import EducatorLearnersPage from "@/pages/dashboard/educators/learners";
import TutorSessionsPage from "@/pages/dashboard/tutors/sessions";
import TutorClassworkPage from "@/pages/dashboard/tutors/classwork";
import TutorAttendancePage from "@/pages/dashboard/tutors/attendance";
import TutorLearnersPage from "@/pages/dashboard/tutors/learners";
import TutorLearnerDetailPage from "@/pages/dashboard/tutors/learners/detail";
import TutorLearningPlansPage from "@/pages/dashboard/tutors/learning-plans";
import TutorSessionNotesPage from "@/pages/dashboard/tutors/session-notes";
import TutorAnnouncementsPage from "@/pages/dashboard/tutors/announcements";
import TutorMaterialsPage from "@/pages/dashboard/tutors/materials";
import TutorProgressPage from "@/pages/dashboard/tutors/progress";
import TutorCommunicationPage from "@/pages/dashboard/tutors/communication";
import TutorNotificationsPage from "@/pages/dashboard/tutors/notifications";
import TutorAiAssistantPage from "@/pages/dashboard/tutors/ai-assistant";
import TutorSettingsPage from "@/pages/dashboard/tutors/settings";
import EslLessonsPage from "@/pages/dashboard/esl/lessons";
import EslClassworkPage from "@/pages/dashboard/esl/classwork";
import EslAttendancePage from "@/pages/dashboard/esl/attendance";
import EslLearnersPage from "@/pages/dashboard/esl/learners";
import EslMaterialContextPage from "@/pages/dashboard/esl/materials";
import ClassroomsPage from "@/pages/dashboard/classroom";
import ClassroomDetailPage from "@/pages/dashboard/classroom/detail";
import ClassroomActivityPage from "@/pages/dashboard/classroom/activity";
import MeetingRoomPage from "@/pages/dashboard/classroom/meeting-room.lazy";
import SchedulePage from "@/pages/dashboard/schedule";
import MaterialsPage from "@/pages/dashboard/materials";
import CommunicationPage from "@/pages/dashboard/communication";
import NotificationsPage from "@/pages/dashboard/notifications";
import ProgressPage from "@/pages/dashboard/progress";
import AiAssistantPage from "@/pages/dashboard/ai-assistant";
import { AuthRouteRedirect } from "@/components/common/auth-route-redirect";
import { AuthSessionProvider } from "@/components/features/auth/auth-session-provider";
import { RequireAuth } from "@/components/features/auth/require-auth";
import { API_INTEGRATION_ENABLED } from "@/lib/api-mode";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthSessionProvider>
      {!API_INTEGRATION_ENABLED && (
        <div role="status" className="bg-amber-100 px-4 py-2 text-center text-xs font-medium text-amber-950">
          UI preview mode: API integrations are paused. API-backed actions are unavailable and changes are not saved.
        </div>
      )}
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/*Auth Pages */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/email-verification" element={<EmailVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="/oauth/google/callback" element={<GoogleOAuthCallbackPage />} />
        <Route path="/auth/*" element={<AuthRouteRedirect />} />

        {/*App Pages */}
        <Route
          element={
            API_INTEGRATION_ENABLED ? (
              <RequireAuth>
                <PlatformLayout />
              </RequireAuth>
            ) : (
              <PlatformLayout />
            )
          }
        >
          <Route path="/students">
            <Route index element={<StudentsPage />} />
            <Route path="subjects" element={<StudentSubjectsPage />} />
            <Route path="subjects/:subjectId" element={<StudentSubjectDetailPage />} />
            <Route path="tasks" element={<StudentTasksPage />} />
            <Route path="notes" element={<StudentNotesPage />} />
            <Route path="study-spaces" element={<StudentStudySpacesPage />} />
            <Route
              path="study-spaces/:spaceId"
              element={
                <Suspense
                  fallback={
                    <p className="p-6 text-sm text-slate-500">
                      Loading study space…
                    </p>
                  }
                >
                  <StudentStudySpaceDetailPage />
                </Suspense>
              }
            />
            <Route path="classwork" element={<StudentClassworkPage />} />
            <Route path="classrooms" element={<ClassroomsPage />} />
            <Route
              path="classrooms/meeting-room"
              element={
                <Suspense
                  fallback={
                    <p className="p-6 text-sm text-slate-500">
                      Loading meeting room…
                    </p>
                  }
                >
                  <MeetingRoomPage />
                </Suspense>
              }
            />
            <Route
              path="classrooms/:classroomId"
              element={<ClassroomDetailPage />}
            />
            <Route
              path="classrooms/:classroomId/classwork/:activityId"
              element={<ClassroomActivityPage />}
            />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="materials" element={<StudentMaterialsPage />} />
            <Route path="materials/personal" element={<StudentPersonalMaterialsPage />} />
            <Route path="materials/classroom" element={<StudentClassroomMaterialsPage />} />
            <Route path="materials/study-spaces" element={<StudentStudySpaceMaterialsPage />} />
            <Route path="communication" element={<CommunicationPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="ai-assistant" element={<AiAssistantPage />} />
            <Route path="account/security" element={<AccountSecurityPage />} />
          </Route>
          <Route path="/educators">
            <Route index element={<EducatorsPage />} />
            <Route path="classwork" element={<EducatorClassworkPage />} />
            <Route path="attendance" element={<EducatorAttendancePage />} />
            <Route path="learners" element={<EducatorLearnersPage />} />
            <Route path="classrooms" element={<ClassroomsPage />} />
            <Route
              path="classrooms/meeting-room"
              element={
                <Suspense
                  fallback={
                    <p className="p-6 text-sm text-slate-500">
                      Loading meeting room…
                    </p>
                  }
                >
                  <MeetingRoomPage />
                </Suspense>
              }
            />
            <Route
              path="classrooms/:classroomId"
              element={<ClassroomDetailPage />}
            />
            <Route
              path="classrooms/:classroomId/classwork/:activityId"
              element={<ClassroomActivityPage />}
            />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="materials" element={<MaterialsPage />} />
            <Route path="communication" element={<CommunicationPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="ai-assistant" element={<AiAssistantPage />} />
            <Route path="account/security" element={<AccountSecurityPage />} />
          </Route>
          <Route path="/tutors">
            <Route index element={<TutorsPage />} />
            <Route path="sessions" element={<TutorSessionsPage />} />
            <Route path="classwork" element={<TutorClassworkPage />} />
            <Route path="attendance" element={<TutorAttendancePage />} />
            <Route path="learners" element={<TutorLearnersPage />} />
            <Route path="learners/detail/:learnerId" element={<TutorLearnerDetailPage />} />
            <Route path="learning-plans" element={<TutorLearningPlansPage />} />
            <Route path="session-notes" element={<TutorSessionNotesPage />} />
            <Route path="announcements" element={<TutorAnnouncementsPage />} />
            <Route path="classrooms" element={<ClassroomsPage />} />
            <Route
              path="classrooms/meeting-room"
              element={
                <Suspense
                  fallback={
                    <p className="p-6 text-sm text-slate-500">
                      Loading meeting room…
                    </p>
                  }
                >
                  <MeetingRoomPage />
                </Suspense>
              }
            />
            <Route
              path="classrooms/:classroomId"
              element={<ClassroomDetailPage />}
            />
            <Route
              path="classrooms/:classroomId/classwork/:activityId"
              element={<ClassroomActivityPage />}
            />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="materials" element={<TutorMaterialsPage />} />
            <Route path="communication" element={<TutorCommunicationPage />} />
            <Route path="notifications" element={<TutorNotificationsPage />} />
            <Route path="progress" element={<TutorProgressPage />} />
            <Route path="ai-assistant" element={<TutorAiAssistantPage />} />
            <Route path="settings" element={<TutorSettingsPage />} />
            <Route path="account/security" element={<AccountSecurityPage />} />
          </Route>
          <Route path="/esl">
            <Route index element={<EslPage />} />
            <Route path="lessons" element={<EslLessonsPage />} />
            <Route path="classwork" element={<EslClassworkPage />} />
            <Route path="attendance" element={<EslAttendancePage />} />
            <Route path="learners" element={<EslLearnersPage />} />
            <Route path="classrooms" element={<ClassroomsPage />} />
            <Route
              path="classrooms/meeting-room"
              element={
                <Suspense
                  fallback={
                    <p className="p-6 text-sm text-slate-500">
                      Loading meeting room…
                    </p>
                  }
                >
                  <MeetingRoomPage />
                </Suspense>
              }
            />
            <Route
              path="classrooms/:classroomId"
              element={<ClassroomDetailPage />}
            />
            <Route
              path="classrooms/:classroomId/classwork/:activityId"
              element={<ClassroomActivityPage />}
            />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="materials" element={<MaterialsPage />} />
            <Route path="materials/:context" element={<EslMaterialContextPage />} />
            <Route path="communication" element={<CommunicationPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="ai-assistant" element={<AiAssistantPage />} />
            <Route path="account/security" element={<AccountSecurityPage />} />
          </Route>
        </Route>

        <Route path="/" element={<HomePage />} />
      </Routes>
    </AuthSessionProvider>
  </BrowserRouter>,
);
