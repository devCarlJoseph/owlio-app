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
import DashboardPage from "@/pages/dashboard/dashboard-page";
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
      <Route path="/workspace" element={<PlatformLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="educators" element={<EducatorsPage />} />
        <Route path="tutors" element={<TutorsPage />} />
        <Route path="esl" element={<EslPage />} />
      </Route>

      <Route path="/" element={<HomePage />} />
    </Routes>
  </BrowserRouter>,
);
