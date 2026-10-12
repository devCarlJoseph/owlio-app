import "@/styles/global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import HomePage from "@/pages/App";
import OnboardingPage from "@/pages/onboarding";
import RegisterPage from "@/pages/auth/register";
import LoginPage from "@/pages/auth/login";
import EmailVerificationPage from "@/pages/auth/email-verification";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import PasswordResetPage from "@/pages/auth/password-reset";
import PlatformLayout from "@/pages/dashboard/layout";
import DashboardOverviewPage from "@/pages/dashboard";
import StudentsPage from "@/pages/dashboard/students";
import EducatorsPage from "@/pages/dashboard/educators";
import TutorsPage from "@/pages/dashboard/tutors";
import EslPage from "@/pages/dashboard/esl";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/*Auth Pages */}
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/email-verification" element={<EmailVerificationPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/password-reset" element={<PasswordResetPage />} />

      {/*App Pages */}
      <Route element={<PlatformLayout />}>
        <Route path="/workspace">
          <Route index element={<DashboardOverviewPage />} />
          <Route path="students" element={<Navigate to="/students" replace />} />
          <Route path="educators" element={<Navigate to="/educators" replace />} />
          <Route path="tutors" element={<Navigate to="/tutors" replace />} />
          <Route path="esl" element={<Navigate to="/esl" replace />} />
        </Route>
        <Route path="/students">
          <Route index element={<StudentsPage />} />
        </Route>
        <Route path="/educators">
          <Route index element={<EducatorsPage />} />
        </Route>
        <Route path="/tutors">
          <Route index element={<TutorsPage />} />
        </Route>
        <Route path="/esl">
          <Route index element={<EslPage />} />
        </Route>
      </Route>

      <Route path="/" element={<HomePage />} />
    </Routes>
  </BrowserRouter>,
);
