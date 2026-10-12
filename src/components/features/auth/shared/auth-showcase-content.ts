import { BookOpen, BookOpenCheck, ChartNoAxesCombined, ClipboardCheck, KeyRound, Languages, MailCheck, Presentation, ShieldCheck, Sparkles, Users, type LucideIcon } from "lucide-react"

export type AuthShowcaseContext = "login" | "register" | "forgot-password" | "email-verification" | "password-reset"

type Feature = {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  badge: string
}

type Question = {
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

type Guide = {
  icon: LucideIcon
  title: string
  steps: Array<{ title: string; description: string }>
}

type AuthShowcaseContent = {
  asideLabel: string
  features: Feature[]
  footer: string
  questionTitle?: string
  questions?: Question[]
  guide?: Guide
}

const loginFeatures: Feature[] = [
  { icon: Presentation, eyebrow: "Virtual classrooms", title: "Every class in one place.", description: "Join live lessons, follow along with materials, and keep your class discussions organized.", badge: "Live class at 10:00" },
  { icon: ClipboardCheck, eyebrow: "Quizzes & assessments", title: "Practice that feels like progress.", description: "Answer quizzes, submit assignments, and get feedback that shows you what to learn next.", badge: "Quiz · 9/10 correct" },
  { icon: ChartNoAxesCombined, eyebrow: "Learning progress", title: "Watch your growth add up.", description: "Track goals and lessons completed so every study session counts toward something bigger.", badge: "Weekly goal · 72%" },
  { icon: Languages, eyebrow: "Tutoring & ESL", title: "Learning that fits every teacher.", description: "Teachers, private tutors, and online ESL instructors guide learners in flexible spaces.", badge: "1:1 session today" },
]

const loginQuestions: Question[] = [
  { prompt: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter"], answer: 1, explanation: "Iron-rich dust gives Mars its reddish color." },
  { prompt: "What is 7 × 8?", options: ["54", "56", "64"], answer: 1, explanation: "Remember the sequence 5, 6, 7, 8: 56 = 7 × 8." },
  { prompt: "Which of these words is a verb?", options: ["Quickly", "Learn", "Bright"], answer: 1, explanation: "A verb is an action word, and learning is an action." },
  { prompt: "Which gas do plants absorb to make food?", options: ["Oxygen", "Carbon dioxide", "Nitrogen"], answer: 1, explanation: "Plants use carbon dioxide, water, and sunlight in photosynthesis." },
]

export const authShowcaseContent: Record<AuthShowcaseContext, AuthShowcaseContent> = {
  login: {
    asideLabel: "Discover Owlio",
    features: loginFeatures,
    footer: "For students · teachers · tutors",
    questionTitle: "Warm-up question",
    questions: loginQuestions,
  },
  register: {
    asideLabel: "Create your Owlio account",
    features: [
      { icon: Sparkles, eyebrow: "CREATE YOUR ACCOUNT", title: "Your learning space starts here.", description: "Sign up and choose the role that fits how you learn or teach with Owlio.", badge: "Account setup" },
      { icon: Users, eyebrow: "CHOOSE YOUR ROLE", title: "A workspace that fits you.", description: "Select student, teacher, or other to tailor your Owlio experience.", badge: "Made for your role" },
      { icon: BookOpenCheck, eyebrow: "GET STARTED", title: "Bring learning together.", description: "Keep lessons, resources, and learning goals organized in one place.", badge: "Ready to begin" },
    ],
    footer: "A learning space shaped around your role.",
    guide: {
      icon: Sparkles,
      title: "Create your Owlio account",
      steps: [
        { title: "Add your details", description: "Enter your name and email address." },
        { title: "Choose your role", description: "Tell Owlio how you learn or teach." },
        { title: "Set your password", description: "Create a secure password to finish." },
      ],
    },
  },
  "forgot-password": {
    asideLabel: "Password recovery guide",
    features: [
      { icon: KeyRound, eyebrow: "ACCOUNT RECOVERY", title: "Let’s get you back to learning.", description: "Use the email address linked to your Owlio account to request a reset link.", badge: "Recovery steps" },
      { icon: MailCheck, eyebrow: "CHECK YOUR INBOX", title: "Open your reset instructions.", description: "Find the password-reset email and follow its secure link.", badge: "Check your email" },
      { icon: BookOpen, eyebrow: "RETURN TO OWLIO", title: "Choose a new password.", description: "Reset your password and get back to your learning space.", badge: "Back to learning" },
    ],
    footer: "Your learning space will be here when you return.",
    guide: {
      icon: KeyRound,
      title: "Reset your password",
      steps: [
        { title: "Enter your account email", description: "Use the address connected to Owlio." },
        { title: "Open the reset email", description: "Follow the secure link in your inbox." },
        { title: "Choose a new password", description: "Then sign in to return to Owlio." },
      ],
    },
  },
  "email-verification": {
    asideLabel: "Email verification guide",
    features: [
      { icon: MailCheck, eyebrow: "VERIFY YOUR EMAIL", title: "Connect your Owlio account.", description: "Confirm your email address to keep your learning space secure.", badge: "Email confirmation" },
      { icon: KeyRound, eyebrow: "OPEN YOUR LINK", title: "One quick step to verify.", description: "Find the Owlio message and open its verification link.", badge: "Check your inbox" },
      { icon: BookOpenCheck, eyebrow: "READY TO LEARN", title: "Your space is waiting.", description: "After confirming your address, continue to your Owlio workspace.", badge: "Continue to Owlio" },
    ],
    footer: "A verified email keeps your account connected.",
    guide: {
      icon: MailCheck,
      title: "Verify your email",
      steps: [
        { title: "Check your inbox", description: "Look for a message from Owlio." },
        { title: "Open the verification link", description: "Confirm the address on your account." },
        { title: "Return to Owlio", description: "Continue setting up your learning space." },
      ],
    },
  },
  "password-reset": {
    asideLabel: "Password security guide",
    features: [
      { icon: KeyRound, eyebrow: "SET A NEW PASSWORD", title: "Secure your Owlio account.", description: "Choose a strong password you do not use for other accounts.", badge: "Account security" },
      { icon: ShieldCheck, eyebrow: "CONFIRM YOUR PASSWORD", title: "Make sure it matches.", description: "Enter your new password again to confirm it.", badge: "Quick confirmation" },
      { icon: BookOpen, eyebrow: "BACK TO YOUR SPACE", title: "Continue learning with confidence.", description: "Save your new password, then sign in to Owlio.", badge: "Ready to sign in" },
    ],
    footer: "A secure sign-in protects your learning space.",
    guide: {
      icon: ShieldCheck,
      title: "Choose a secure password",
      steps: [
        { title: "Create a strong password", description: "Follow the requirements shown on the form." },
        { title: "Confirm your password", description: "Enter the same password a second time." },
        { title: "Sign in to Owlio", description: "Use your new password to continue." },
      ],
    },
  },
}
