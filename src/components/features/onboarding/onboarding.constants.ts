export const ENTITY_OPTIONS = [
  {
    value: "student",
    title: "Student",
    description: "Organize your learning, whether or not you have a teacher.",
    icon: "student",
  },
  {
    value: "educator",
    title: "Educator",
    description: "Bring your classes and teaching workflow together.",
    icon: "educator",
  },
  {
    value: "others",
    title: "Others",
    description: "Create flexible learning experiences for every learner.",
    icon: "others",
  },
] as const

export const EDUCATION_LEVELS = [
  { value: "high_school", label: "High school" },
  { value: "senior_high", label: "Senior high" },
  { value: "college", label: "College" },
  { value: "graduate", label: "Graduate" },
  { value: "self_learner", label: "Self-learner" },
  { value: "other", label: "Other" },
] as const

export const STUDY_GOALS = [
  { value: "stay_organized", label: "Stay organized" },
  { value: "prepare_for_exams", label: "Prepare for exams" },
  { value: "collaborate_with_peers", label: "Collaborate with peers" },
  { value: "improve_grades", label: "Improve grades" },
  { value: "learn_a_new_skill", label: "Learn a new skill" },
] as const

export const EDUCATOR_CONTEXTS = [
  { value: "school_teacher", label: "School teacher" },
  { value: "college_instructor", label: "College instructor" },
] as const

export const OTHERS_SUBTYPES = [
  { value: "esl_teacher", label: "ESL teacher" },
  { value: "online_tutor", label: "Online tutor" },
  { value: "freelance_educator", label: "Freelance educator" },
] as const

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const
export const GENERAL_LEARNER_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const
export const SESSION_FORMATS = [
  { value: "one_on_one", label: "One-on-one" },
  { value: "small_group", label: "Small group" },
  { value: "class", label: "Class" },
] as const

export const ONBOARDING_STEPS = [
  { id: "entity", label: "Your role", title: "Let's make Owlio yours", description: "First, tell us how you'll use Owlio." },
  { id: "profile", label: "Your profile", title: "A little about you", description: "Set up the basics for your Owlio profile." },
  { id: "details", label: "Your details", title: "Make it yours", description: "Add a few details to shape your Owlio experience." },
  { id: "review", label: "Review", title: "Take a look", description: "Review your details before you continue." },
] as const

export const STUDENT_DETAIL_FIELDS = ["educationLevel", "interests", "studyGoals", "classCode"] as const
export const EDUCATOR_DETAIL_FIELDS = ["teachingContext", "institutionName", "subjectsTaught", "gradeLevels"] as const
export const OTHERS_DETAIL_FIELDS = ["othersSubtype", "languagesOrSubjects", "learnerLevels", "sessionFormats", "availability"] as const
