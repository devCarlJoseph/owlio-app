import "@/styles/global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "@/pages/App";
import OnboardingPage from "@/pages/onboarding";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />

      <Route path="/" element={<HomePage />} />
    </Routes>
  </BrowserRouter>,
);
