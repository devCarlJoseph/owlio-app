import "@/styles/global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "@/pages/App";
import OnboardingPage from "@/pages/onboarding";
import RegisterPage from "@/pages/auth/register";
import LoginPage from "@/pages/auth/login";
import EmailVerificationPage from "@/pages/auth/email-verification";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import PasswordResetPage from "@/pages/auth/password-reset";
import PlatformLayout from "@/pages/dashboard/layout";
import StudentsPage from "@/pages/dashboard/students";
import EducatorsPage from "@/pages/dashboard/educators";
import TutorsPage from "@/pages/dashboard/tutors";
import EslPage from "@/pages/dashboard/esl";
import StudentSubjectsPage from "@/pages/dashboard/students/subjects";
import StudentTasksPage from "@/pages/dashboard/students/tasks";
import StudentNotesPage from "@/pages/dashboard/students/notes";
import StudentStudySpacesPage from "@/pages/dashboard/students/study-spaces";
import StudentClassworkPage from "@/pages/dashboard/students/classwork";
import EducatorClassworkPage from "@/pages/dashboard/educators/classwork";
import EducatorAttendancePage from "@/pages/dashboard/educators/attendance";
import EducatorLearnersPage from "@/pages/dashboard/educators/learners";
import TutorSessionsPage from "@/pages/dashboard/tutors/sessions";
import TutorClassworkPage from "@/pages/dashboard/tutors/classwork";
import TutorAttendancePage from "@/pages/dashboard/tutors/attendance";
import TutorLearnersPage from "@/pages/dashboard/tutors/learners";
import EslLessonsPage from "@/pages/dashboard/esl/lessons";
import EslClassworkPage from "@/pages/dashboard/esl/classwork";
import EslAttendancePage from "@/pages/dashboard/esl/attendance";
import EslLearnersPage from "@/pages/dashboard/esl/learners";
import ClassroomsPage from "@/pages/dashboard/classroom";
import SchedulePage from "@/pages/dashboard/schedule";
import MaterialsPage from "@/pages/dashboard/materials";
import CommunicationPage from "@/pages/dashboard/communication";
import NotificationsPage from "@/pages/dashboard/notifications";
import ProgressPage from "@/pages/dashboard/progress";
import AiAssistantPage from "@/pages/dashboard/ai-assistant";
import { AuthRouteRedirect } from "@/components/common/auth-route-redirect";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/*Auth Pages */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/email-verification" element={<EmailVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/password-reset" element={<PasswordResetPage />} />
      <Route path="/auth/*" element={<AuthRouteRedirect />} />

      {/*App Pages */}
      <Route element={<PlatformLayout />}>
        <Route path="/students">
          <Route index element={<StudentsPage />} />
          <Route path="subjects" element={<StudentSubjectsPage />} />
          <Route path="tasks" element={<StudentTasksPage />} />
          <Route path="notes" element={<StudentNotesPage />} />
          <Route path="study-spaces" element={<StudentStudySpacesPage />} />
          <Route path="classwork" element={<StudentClassworkPage />} />
        </Route>
        <Route path="/educators">
          <Route index element={<EducatorsPage />} />
          <Route path="classwork" element={<EducatorClassworkPage />} />
          <Route path="attendance" element={<EducatorAttendancePage />} />
          <Route path="learners" element={<EducatorLearnersPage />} />
        </Route>
        <Route path="/tutors">
          <Route index element={<TutorsPage />} />
          <Route path="sessions" element={<TutorSessionsPage />} />
          <Route path="classwork" element={<TutorClassworkPage />} />
          <Route path="attendance" element={<TutorAttendancePage />} />
          <Route path="learners" element={<TutorLearnersPage />} />
        </Route>
        <Route path="/esl">
          <Route index element={<EslPage />} />
          <Route path="lessons" element={<EslLessonsPage />} />
          <Route path="classwork" element={<EslClassworkPage />} />
          <Route path="attendance" element={<EslAttendancePage />} />
          <Route path="learners" element={<EslLearnersPage />} />
        </Route>
        <Route path="/classrooms" element={<ClassroomsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/communication" element={<CommunicationPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/ai-assistant" element={<AiAssistantPage />} />
      </Route>

      <Route path="/" element={<HomePage />} />
    </Routes>
  </BrowserRouter>,
);
