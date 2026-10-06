import "@/styles/global.css";


import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import GuestHomePage from "@/pages/guest/home";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import EmailVerificationPage from "@/pages/auth/email-verification";
import PasswordResetPage from "@/pages/auth/password-reset";


createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<GuestHomePage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/email-verification" element={<EmailVerificationPage />} />
      <Route path="/auth/password-reset" element={<PasswordResetPage />} />
    </Routes>
  </BrowserRouter>,
)
