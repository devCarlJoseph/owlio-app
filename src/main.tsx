import '@/styles/global.css'
import { createRoot } from 'react-dom/client'
import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router'
import RegisterPage from '@/pages/auth/register'
import LoginPage from '@/pages/auth/login'
import EmailVerificationPage from '@/pages/auth/email-verification'
import ForgotPasswordPage from '@/pages/auth/forgot-password'
import PasswordResetPage from '@/pages/auth/password-reset'
import GoogleOAuthCallbackPage from '@/pages/auth/google-oauth-callback'
import PlatformLayout from '@/pages/dashboard/layout'
import AccountSecurityPage from '@/pages/dashboard/account-security'
import ClassroomsPage from '@/pages/dashboard/classroom'
import ClassroomDetailPage from '@/pages/dashboard/classroom/detail'
import ClassroomActivityPage from '@/pages/dashboard/classroom/activity'
import MeetingRoomPage from '@/pages/dashboard/classroom/meeting-room.lazy'
import { AuthRouteRedirect } from '@/components/common/auth-route-redirect'
import { AuthSessionProvider } from '@/components/features/auth/auth-session-provider'
import { RequireAuth } from '@/components/features/auth/require-auth'
import { RequireGuest } from '@/components/features/auth/require-guest'
import { RequireRole } from '@/components/features/auth/require-role'
import { NoWorkspaceView } from '@/components/features/auth/no-workspace-view'
import { initializeTheme } from '@/lib/theme'
import { ThemeController } from '@/components/common/theme-controller'

initializeTheme()
const workspaces = [['students', 'STUDENT'], ['educators', 'EDUCATOR'], ['tutors', 'TUTOR'], ['esl', 'ESL']] as const

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeController />
    <AuthSessionProvider>
      <Routes>
        <Route element={<RequireGuest />}>
          <Route path="/onboarding" element={<Navigate to="/register" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/email-verification" element={<EmailVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/password-reset" element={<PasswordResetPage />} />
          <Route path="/auth/*" element={<AuthRouteRedirect />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>
        <Route path="/oauth/google/callback" element={<GoogleOAuthCallbackPage />} />
        <Route path="/access-denied" element={<NoWorkspaceView />} />
        <Route element={<RequireAuth><Outlet /></RequireAuth>}>
          {workspaces.map(([path, role]) => <Route key={role} path={'/' + path} element={<RequireRole role={role}><PlatformLayout /></RequireRole>}>
            <Route index element={null} />
            <Route path="subjects/:subjectId" element={null} />
            <Route path="classrooms" element={<ClassroomsPage />} />
            <Route path="classrooms/meeting-room" element={<Suspense fallback={<p role="status">Loading meeting room…</p>}><MeetingRoomPage /></Suspense>} />
            <Route path="classrooms/:classroomId" element={<ClassroomDetailPage />} />
            <Route path="classrooms/:classroomId/classwork/:activityId" element={<ClassroomActivityPage />} />
            <Route path="account/security" element={<AccountSecurityPage />} />
            <Route path="*" element={null} />
          </Route>)}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthSessionProvider>
  </BrowserRouter>,
)
