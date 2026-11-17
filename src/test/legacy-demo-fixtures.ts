import type { TaskRecord } from '@/components/features/personal-workspace/tasks/utils/task-records'
import type { SubjectRecord } from '@/components/features/personal-workspace/subjects/utils/subject-records'
import type { NoteRecord } from '@/components/features/personal-workspace/notes/contents/note-records'
import type { StudySpaceRecord } from '@/components/features/personal-workspace/study-spaces/utils/study-spaces-records'
import type { LibraryResource } from '@/components/features/materials/types/library-types'
// Synthetic fixtures for UI and legacy-data migration tests only; never imported by app code.
export const sampleTasks: TaskRecord[] = [
  {
    "id": "sample-task-wave-problem-set",
    "title": "Finish wave problem set",
    "subject": "Physics I",
    "dueDate": "2026-10-16",
    "priority": "high",
    "status": "in-progress",
    "notes": "Questions 4 to 9 first, then review the interference diagram.",
    "createdAt": "2026-10-10T09:00:00.000Z"
  },
  {
    "id": "sample-task-chem-review",
    "title": "Review bonding flashcards",
    "subject": "Chemistry I",
    "dueDate": "2026-10-15",
    "priority": "medium",
    "status": "todo",
    "notes": "Focus on electron affinity trends.",
    "createdAt": "2026-10-11T14:20:00.000Z"
  },
  {
    "id": "sample-task-calculus-timed-paper",
    "title": "Timed past paper",
    "subject": "Mathematics",
    "dueDate": "2026-10-18",
    "priority": "high",
    "status": "todo",
    "notes": "Forty-five minutes, no notes allowed.",
    "createdAt": "2026-10-12T18:05:00.000Z"
  },
  {
    "id": "sample-task-essay-draft",
    "title": "Draft counter-argument paragraph",
    "subject": "English",
    "dueDate": "2026-10-14",
    "priority": "medium",
    "status": "done",
    "notes": "Drafted from the notes tagged #task.",
    "createdAt": "2026-10-08T12:00:00.000Z"
  },
  {
    "id": "sample-task-read-chapter",
    "title": "Read chapter 6 summary",
    "subject": "History",
    "dueDate": "",
    "priority": "low",
    "status": "todo",
    "notes": "",
    "createdAt": "2026-10-09T08:45:00.000Z"
  }
]

export const sampleSubjects: SubjectRecord[] = [
  {
    "id": "physics-1",
    "name": "Physics I",
    "code": "SCI-PHY1",
    "instructor": "Ramon Diaz",
    "coverColor": "blue",
    "coverImage": "/subject-covers/orbit.svg",
    "milestones": [
      {
        "id": "physics-m1",
        "title": "Motion and displacement",
        "status": "completed"
      },
      {
        "id": "physics-m2",
        "title": "Velocity and acceleration",
        "status": "completed"
      },
      {
        "id": "physics-m3",
        "title": "Newton's laws of motion",
        "status": "not-started"
      },
      {
        "id": "physics-m4",
        "title": "Work and energy",
        "status": "not-started"
      },
      {
        "id": "physics-m5",
        "title": "Waves",
        "status": "not-started"
      }
    ],
    "progressStarted": true,
    "createdAt": "2026-09-01T09:00:00.000Z",
    "updatedAt": "2026-10-12T09:15:00.000Z",
    "seeded": true
  },
  {
    "id": "chemistry-1",
    "name": "Chemistry I",
    "code": "SCI-CHM1",
    "instructor": "Amara Osei",
    "coverColor": "emerald",
    "coverImage": "/subject-covers/flask.svg",
    "milestones": [
      {
        "id": "chemistry-m1",
        "title": "Atomic structure",
        "status": "completed"
      },
      {
        "id": "chemistry-m2",
        "title": "Chemical bonding",
        "status": "completed"
      },
      {
        "id": "chemistry-m3",
        "title": "Reactions and moles",
        "status": "not-started"
      },
      {
        "id": "chemistry-m4",
        "title": "Lab safety and technique",
        "status": "not-started"
      }
    ],
    "progressStarted": true,
    "createdAt": "2026-09-01T09:10:00.000Z",
    "updatedAt": "2026-10-11T16:40:00.000Z",
    "seeded": true
  },
  {
    "id": "mathematics",
    "name": "Mathematics",
    "code": "SCI-MTH2",
    "instructor": "Alex Rivera",
    "coverColor": "violet",
    "coverImage": "/subject-covers/graph.svg",
    "milestones": [
      {
        "id": "math-m1",
        "title": "Algebra and functions",
        "status": "completed"
      },
      {
        "id": "math-m2",
        "title": "Geometry and trigonometry",
        "status": "completed"
      },
      {
        "id": "math-m3",
        "title": "Sequences and series",
        "status": "completed"
      },
      {
        "id": "math-m4",
        "title": "Limits and derivatives",
        "status": "completed"
      },
      {
        "id": "math-m5",
        "title": "Integration",
        "status": "completed"
      }
    ],
    "progressStarted": true,
    "createdAt": "2026-09-02T10:00:00.000Z",
    "updatedAt": "2026-10-10T11:05:00.000Z",
    "seeded": true
  },
  {
    "id": "computer-science",
    "name": "Computer Science",
    "code": "SCI-CS1",
    "instructor": "Priya Nair",
    "coverColor": "slate",
    "coverImage": "/subject-covers/atom.svg",
    "milestones": [],
    "progressStarted": false,
    "createdAt": "2026-09-02T10:20:00.000Z",
    "updatedAt": "2026-09-02T10:20:00.000Z",
    "seeded": true
  },
  {
    "id": "english",
    "name": "English",
    "code": "LAN-ENG1",
    "instructor": "Irene Eda",
    "coverColor": "rose",
    "coverImage": "/subject-covers/books.svg",
    "milestones": [
      {
        "id": "english-m1",
        "title": "Reading comprehension",
        "status": "completed"
      },
      {
        "id": "english-m2",
        "title": "Essay structure",
        "status": "completed"
      },
      {
        "id": "english-m3",
        "title": "Speaking practice",
        "status": "not-started"
      },
      {
        "id": "english-m4",
        "title": "Vocabulary building",
        "status": "not-started"
      }
    ],
    "progressStarted": true,
    "createdAt": "2026-09-03T08:30:00.000Z",
    "updatedAt": "2026-10-08T08:20:00.000Z",
    "seeded": true
  },
  {
    "id": "history",
    "name": "History",
    "code": "HUM-HIS1",
    "instructor": "Samuel Ortiz",
    "coverColor": "amber",
    "coverImage": "/subject-covers/globe.svg",
    "milestones": [
      {
        "id": "history-m1",
        "title": "Source analysis",
        "status": "completed"
      },
      {
        "id": "history-m2",
        "title": "Modern history",
        "status": "completed"
      },
      {
        "id": "history-m3",
        "title": "Essay writing",
        "status": "not-started"
      }
    ],
    "progressStarted": true,
    "createdAt": "2026-09-03T08:45:00.000Z",
    "updatedAt": "2026-10-09T19:30:00.000Z",
    "seeded": true
  }
]

export const sampleNotes: NoteRecord[] = [
  {
    "id": "sample-wave-checklist",
    "title": "Wave equation checklist",
    "body": "",
    "labels": [
      "exam",
      "physics"
    ],
    "updatedAt": "2026-10-12T09:15:00.000Z",
    "pinned": true,
    "kind": "checklist",
    "color": "blue",
    "items": [
      {
        "id": "sample-wave-speed",
        "text": "Speed, wavelength, and frequency",
        "done": true
      },
      {
        "id": "sample-wave-signs",
        "text": "Sign rules for the interference diagram",
        "done": true
      },
      {
        "id": "sample-wave-bands",
        "text": "Node and antinode positions",
        "done": false
      },
      {
        "id": "sample-wave-practice",
        "text": "Two past-paper questions",
        "done": false
      }
    ],
    "archived": false,
    "trashed": false
  },
  {
    "id": "sample-bonding-recap",
    "title": "Chemical bonding recap",
    "body": "Ionic versus covalent, electron affinity trends, and why lattice energy drives melting point.",
    "labels": [
      "chemistry"
    ],
    "updatedAt": "2026-10-11T16:40:00.000Z",
    "pinned": false,
    "kind": "text",
    "color": "green",
    "items": [],
    "archived": false,
    "trashed": false
  },
  {
    "id": "sample-lab-template",
    "title": "Lab report template",
    "body": "Aim, method, results, discussion. Keep the safety section short but present.",
    "labels": [
      "chemistry",
      "lab"
    ],
    "updatedAt": "2026-10-10T11:05:00.000Z",
    "pinned": false,
    "kind": "text",
    "color": "yellow",
    "items": [],
    "archived": false,
    "trashed": false
  },
  {
    "id": "sample-calculus-plan",
    "title": "Calculus study plan",
    "body": "Two practice sets before Friday, then one past paper under timed conditions.",
    "labels": [
      "math",
      "task"
    ],
    "updatedAt": "2026-10-09T19:30:00.000Z",
    "pinned": false,
    "kind": "text",
    "color": "purple",
    "items": [],
    "archived": false,
    "trashed": false
  },
  {
    "id": "sample-essay-outline",
    "title": "Essay intro outline",
    "body": "Thesis, two supporting points, counter-argument paragraph. Draft the counter-argument first.",
    "labels": [
      "english",
      "task"
    ],
    "updatedAt": "2026-10-08T08:20:00.000Z",
    "pinned": false,
    "kind": "checklist",
    "color": "orange",
    "items": [
      {
        "id": "sample-essay-thesis",
        "text": "Write the thesis in one sentence",
        "done": true
      },
      {
        "id": "sample-essay-points",
        "text": "Pick two supporting points",
        "done": false
      },
      {
        "id": "sample-essay-counter",
        "text": "Draft the counter-argument paragraph",
        "done": false
      }
    ],
    "archived": false,
    "trashed": false
  },
  {
    "id": "sample-vocabulary-set",
    "title": "Unit 3 vocabulary",
    "body": "Collect words I keep missing, with one example sentence each.",
    "labels": [],
    "updatedAt": "2026-10-07T13:15:00.000Z",
    "pinned": false,
    "kind": "text",
    "color": "teal",
    "items": [],
    "archived": false,
    "trashed": false
  }
]

export const sampleCreatedSpaces: StudySpaceRecord[] = [
  {
    "id": "sample-space-physics",
    "name": "Physics Group",
    "about": "Weekly problem sets and past paper review.",
    "role": "owner",
    "kind": "collaborative",
    "capacity": 6,
    "createdAt": "2026-09-28T09:00:00.000Z"
  },
  {
    "id": "sample-space-essay",
    "name": "Essay Writers",
    "about": "Peer review of argument outlines.",
    "role": "owner",
    "kind": "lounge",
    "capacity": 4,
    "createdAt": "2026-10-02T17:30:00.000Z"
  },
  {
    "id": "sample-space-maths",
    "name": "Maths Club",
    "about": "Calculus drills before Friday.",
    "role": "owner",
    "kind": "focused",
    "capacity": 6,
    "createdAt": "2026-10-09T13:10:00.000Z"
  }
]

export const sampleJoinedSpaces: StudySpaceRecord[] = [
  {
    "id": "sample-space-history",
    "name": "History Circle",
    "about": "Source analysis discussion.",
    "role": "member",
    "kind": "lounge",
    "capacity": 8,
    "createdAt": "2026-09-20T08:00:00.000Z"
  },
  {
    "id": "sample-space-language",
    "name": "Language Exchange",
    "about": "Conversation practice twice a week.",
    "role": "member",
    "kind": "collaborative",
    "capacity": 4,
    "createdAt": "2026-10-05T19:45:00.000Z"
  }
]

export const sampleDiscoverySpaces: StudySpaceRecord[] = [
  {
    "id": "discovery-reading-room",
    "name": "Reading Room",
    "about": "Quiet reading and review.",
    "role": "member",
    "kind": "lounge",
    "capacity": 6,
    "createdAt": "2026-08-12T09:00:00.000Z"
  },
  {
    "id": "discovery-calculus-circle",
    "name": "Calculus Circle",
    "about": "Problem sets and worked examples.",
    "role": "member",
    "kind": "focused",
    "capacity": 8,
    "createdAt": "2026-08-20T09:00:00.000Z"
  },
  {
    "id": "discovery-thesis-sprint",
    "name": "Thesis Sprint",
    "about": "Writing sprints and outline swaps.",
    "role": "member",
    "kind": "collaborative",
    "capacity": 4,
    "createdAt": "2026-09-03T09:00:00.000Z"
  },
  {
    "id": "discovery-language-corner",
    "name": "Language Corner",
    "about": "Relaxed conversation practice.",
    "role": "member",
    "kind": "lounge",
    "capacity": 4,
    "createdAt": "2026-09-10T09:00:00.000Z"
  },
  {
    "id": "discovery-quiet-floor",
    "name": "Quiet Floor",
    "about": "Silent independent study.",
    "role": "member",
    "kind": "focused",
    "capacity": 8,
    "createdAt": "2026-09-15T09:00:00.000Z"
  },
  {
    "id": "discovery-design-crit",
    "name": "Design Crit",
    "about": "Peer critique sessions.",
    "role": "member",
    "kind": "collaborative",
    "capacity": 6,
    "createdAt": "2026-09-22T09:00:00.000Z"
  }
]

export const previewLibraryResources: LibraryResource[] = [
  {
    "id": "preview-personal-wave",
    "title": "Wave equation checklist",
    "kind": "Note",
    "source": "personal",
    "owner": "You",
    "context": "Physics I",
    "contextHref": "/students/notes",
    "contextAction": "Open in Notes",
    "summary": "Speed, wavelength, and frequency, with the sign rules for interference diagrams.",
    "updated": "Edited 12 Oct",
    "availability": "available"
  },
  {
    "id": "preview-personal-bonding",
    "title": "Chemical bonding recap",
    "kind": "Note",
    "source": "personal",
    "owner": "You",
    "context": "Chemistry I",
    "contextHref": "/students/notes",
    "contextAction": "Open in Notes",
    "summary": "Ionic versus covalent, electron affinity trends, and what drives melting point.",
    "updated": "Edited 11 Oct",
    "availability": "available"
  },
  {
    "id": "preview-personal-lab-template",
    "title": "Lab report template",
    "kind": "Template",
    "source": "personal",
    "owner": "You",
    "context": "Chemistry I",
    "contextHref": "/students/subjects",
    "contextAction": "Open in My Learning",
    "summary": "Aim, method, results, and discussion, with a short safety section.",
    "updated": "Edited 10 Oct",
    "availability": "available"
  },
  {
    "id": "preview-personal-essay",
    "title": "Essay intro outline",
    "kind": "Template",
    "source": "personal",
    "owner": "You",
    "context": "English",
    "contextHref": "/students/notes",
    "contextAction": "Open in Notes",
    "summary": "Thesis, two supporting points, and a counter-argument paragraph to draft first.",
    "updated": "Edited 8 Oct",
    "availability": "available"
  },
  {
    "id": "preview-personal-titration",
    "title": "Titration walkthrough",
    "kind": "Note",
    "source": "personal",
    "owner": "You",
    "context": "Chemistry I",
    "contextHref": "/students/notes",
    "contextAction": "Open in Notes",
    "summary": "Endpoint colour, indicator choice, and how to read the burette.",
    "updated": "Edited 9 Oct",
    "availability": "available"
  },
  {
    "id": "preview-personal-trends",
    "title": "Periodic trends summary",
    "kind": "Template",
    "source": "personal",
    "owner": "You",
    "context": "Chemistry I",
    "contextHref": "/students/subjects",
    "contextAction": "Open in My Learning",
    "summary": "Blank table for radius, electronegativity, and ionisation energy.",
    "updated": "Edited 8 Oct",
    "availability": "available"
  },
  {
    "id": "preview-personal-safety",
    "title": "Lab safety checklist",
    "kind": "Template",
    "source": "personal",
    "owner": "You",
    "context": "Chemistry I",
    "contextHref": "/students/subjects",
    "contextAction": "Open in My Learning",
    "summary": "Goggles, gloves, waste disposal, and the spill procedure.",
    "updated": "Edited 7 Oct",
    "availability": "available"
  },
  {
    "id": "preview-personal-algebra",
    "title": "Algebra cheat sheet",
    "kind": "Template",
    "source": "personal",
    "owner": "You",
    "context": "Mathematics",
    "contextHref": "/students/subjects",
    "contextAction": "Open in My Learning",
    "summary": "Quadratics, simultaneous equations, and the identities worth memorising.",
    "updated": "Edited 6 Oct",
    "availability": "available"
  },
  {
    "id": "preview-personal-calculus",
    "title": "Calculus formula sheet",
    "kind": "Template",
    "source": "personal",
    "owner": "You",
    "context": "Mathematics",
    "contextHref": "/students/subjects",
    "contextAction": "Open in My Learning",
    "summary": "Product, quotient, and chain rule with worked limit patterns.",
    "updated": "Edited 5 Oct",
    "availability": "available"
  },
  {
    "id": "preview-personal-kinematics",
    "title": "Kinematics formula sheet",
    "kind": "Template",
    "source": "personal",
    "owner": "You",
    "context": "Physics I",
    "contextHref": "/students/subjects",
    "contextAction": "Open in My Learning",
    "summary": "SUVAT equations, projectile motion, and when to use each.",
    "updated": "Edited 4 Oct",
    "availability": "available"
  },
  {
    "id": "preview-personal-essay-guide",
    "title": "Essay structure guide",
    "kind": "Template",
    "source": "personal",
    "owner": "You",
    "context": "English",
    "contextHref": "/students/subjects",
    "contextAction": "Open in My Learning",
    "summary": "Thesis, evidence, counter-argument, and a conclusion that lands.",
    "updated": "Edited 3 Oct",
    "availability": "available"
  },
  {
    "id": "preview-personal-sources",
    "title": "Source analysis guide",
    "kind": "Note",
    "source": "personal",
    "owner": "You",
    "context": "History",
    "contextHref": "/students/subjects",
    "contextAction": "Open in My Learning",
    "summary": "How to weigh a primary source against the historian writing about it.",
    "updated": "Edited 2 Oct",
    "availability": "available"
  },
  {
    "id": "preview-classroom-ecosystem",
    "title": "Ecosystem field notes",
    "kind": "Document",
    "source": "classroom",
    "owner": "Morgan Chen",
    "context": "Biology 101",
    "contextHref": "/students/classrooms/biology-101",
    "contextAction": "Open class",
    "summary": "Class notes on energy flow, population change, and field observation prompts.",
    "updated": "Posted 20 Oct",
    "availability": "available"
  },
  {
    "id": "preview-classroom-foodwebs",
    "title": "Food webs overview",
    "kind": "Link",
    "source": "classroom",
    "owner": "Morgan Chen",
    "context": "Biology 101",
    "contextHref": "/students/classrooms/biology-101",
    "contextAction": "Open class",
    "summary": "Reference link for how energy moves through a food web.",
    "updated": "Posted 18 Oct",
    "availability": "available"
  },
  {
    "id": "preview-classroom-cells",
    "title": "Cell structure slides",
    "kind": "Slides",
    "source": "classroom",
    "owner": "Morgan Chen",
    "context": "Biology 101",
    "contextHref": "/students/classrooms/biology-101",
    "contextAction": "Open class",
    "summary": "Lesson slides comparing prokaryotic and eukaryotic cells.",
    "updated": "Posted 14 Oct",
    "availability": "available"
  },
  {
    "id": "preview-classroom-linear",
    "title": "Linear equations reference",
    "kind": "Document",
    "source": "classroom",
    "owner": "Alex Rivera",
    "context": "Math Study Group",
    "contextHref": "/students/classrooms/tutoring-math",
    "contextAction": "Open class",
    "summary": "Tutor-shared reference on solving and graphing linear equations.",
    "updated": "Posted 16 Oct",
    "availability": "available"
  },
  {
    "id": "preview-classroom-restricted",
    "title": "Restricted practice set",
    "kind": "Worksheet",
    "source": "classroom",
    "owner": "Alex Rivera",
    "context": "Math Study Group",
    "contextHref": "/students/classrooms/tutoring-math",
    "contextAction": "Open class",
    "summary": "",
    "updated": "",
    "availability": "unavailable"
  },
  {
    "id": "preview-space-waves",
    "title": "Problem set — waves week 3",
    "kind": "Worksheet",
    "source": "study-space",
    "owner": "Physics Group",
    "context": "Physics Group",
    "contextHref": "/students/study-spaces",
    "contextAction": "Open study spaces",
    "summary": "Peer problem set on superposition, with answers agreed in the space.",
    "updated": "Shared 19 Oct",
    "availability": "available"
  },
  {
    "id": "preview-classroom-microscope",
    "title": "Microscope use guide",
    "kind": "Reading",
    "source": "classroom",
    "owner": "Morgan Chen",
    "context": "Biology 101",
    "contextHref": "/students/classrooms/biology-101",
    "contextAction": "Open class",
    "summary": "Focusing, lighting, and the order of the slides in a wet mount.",
    "updated": "Posted 13 Oct",
    "availability": "available"
  },
  {
    "id": "preview-classroom-cell-division",
    "title": "Cell division worksheet",
    "kind": "Worksheet",
    "source": "classroom",
    "owner": "Morgan Chen",
    "context": "Biology 101",
    "contextHref": "/students/classrooms/biology-101",
    "contextAction": "Open class",
    "summary": "Mitosis stages with a labelled diagram to complete.",
    "updated": "Posted 12 Oct",
    "availability": "available"
  },
  {
    "id": "preview-classroom-quadratics",
    "title": "Quadratics practice set",
    "kind": "Worksheet",
    "source": "classroom",
    "owner": "Alex Rivera",
    "context": "Math Study Group",
    "contextHref": "/students/classrooms/tutoring-math",
    "contextAction": "Open class",
    "summary": "Factoring, completing the square, and the discriminant.",
    "updated": "Posted 15 Oct",
    "availability": "available"
  },
  {
    "id": "preview-space-interference",
    "title": "Interference problems",
    "kind": "Worksheet",
    "source": "study-space",
    "owner": "Physics Group",
    "context": "Physics Group",
    "contextHref": "/students/study-spaces",
    "contextAction": "Open study spaces",
    "summary": "Two-source interference with a path-difference diagram.",
    "updated": "Shared 18 Oct",
    "availability": "available"
  },
  {
    "id": "preview-space-energy",
    "title": "Energy worksheet",
    "kind": "Worksheet",
    "source": "study-space",
    "owner": "Physics Group",
    "context": "Physics Group",
    "contextHref": "/students/study-spaces",
    "contextAction": "Open study spaces",
    "summary": "Work-energy theorem, conservation, and a mixed set.",
    "updated": "Shared 17 Oct",
    "availability": "available"
  },
  {
    "id": "preview-space-vectors",
    "title": "Vector diagrams",
    "kind": "Link",
    "source": "study-space",
    "owner": "Physics Group",
    "context": "Physics Group",
    "contextHref": "/students/study-spaces",
    "contextAction": "Open study spaces",
    "summary": "Reference sheet for resolving vectors into components.",
    "updated": "Shared 16 Oct",
    "availability": "available"
  },
  {
    "id": "preview-space-pendulum",
    "title": "Pendulum lab writeup",
    "kind": "Template",
    "source": "study-space",
    "owner": "Physics Group",
    "context": "Physics Group",
    "contextHref": "/students/study-spaces",
    "contextAction": "Open study spaces",
    "summary": "Aim, method, uncertainty, and the conclusion we agreed on.",
    "updated": "Shared 15 Oct",
    "availability": "available"
  },
  {
    "id": "preview-space-argument",
    "title": "Argument outline examples",
    "kind": "Reading",
    "source": "study-space",
    "owner": "Essay Writers",
    "context": "Essay Writers",
    "contextHref": "/students/study-spaces",
    "contextAction": "Open study spaces",
    "summary": "Two peer outlines to review before the next writing session.",
    "updated": "Shared 17 Oct",
    "availability": "available"
  },
  {
    "id": "preview-space-calculus",
    "title": "Calculus drill set",
    "kind": "Worksheet",
    "source": "study-space",
    "owner": "Maths Club",
    "context": "Maths Club",
    "contextHref": "/students/study-spaces",
    "contextAction": "Open study spaces",
    "summary": "Short drills on limits and derivatives for Friday's review.",
    "updated": "Shared 15 Oct",
    "availability": "available"
  },
  {
    "id": "preview-space-sources",
    "title": "Source analysis guide",
    "kind": "Link",
    "source": "study-space",
    "owner": "History Circle",
    "context": "History Circle",
    "contextHref": "/students/study-spaces",
    "contextAction": "Open study spaces",
    "summary": "A peer checklist for reading and comparing primary sources.",
    "updated": "Shared 12 Oct",
    "availability": "available"
  }
]
