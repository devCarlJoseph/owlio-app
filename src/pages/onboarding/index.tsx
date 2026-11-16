import { RequireOnboarding } from "@/components/common/require-onboarding"
import { OnboardingView } from "@/components/features/onboarding/view/onboarding-view"

export default function OnboardingPage() {
  return (
    <RequireOnboarding needsOnboarding={true}>
      <OnboardingView />
    </RequireOnboarding>
  )
}
