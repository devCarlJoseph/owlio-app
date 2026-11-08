import type { CoachingSamplePerson } from './coaching-meeting-preview'

export const classroomSessionPreview: { title: string; people: CoachingSamplePerson[] } = {
  title: 'Grade 10 Science · Photosynthesis',
  people: [
    { identity: 'sample-class-host', name: 'Ms. Elena Cruz', detail: 'Educator · Host', micOn: true, cameraOn: true },
    { identity: 'sample-class-1', name: 'Noah Reyes', detail: 'Student', micOn: false, cameraOn: true },
    { identity: 'sample-class-2', name: 'Bea Santos', detail: 'Student', micOn: false, cameraOn: true, raised: true },
    { identity: 'sample-class-3', name: 'Liam Garcia', detail: 'Student', micOn: false, cameraOn: false },
    { identity: 'sample-class-4', name: 'Mia Tan', detail: 'Student', micOn: true, cameraOn: true },
    { identity: 'sample-class-5', name: 'Ethan Lim', detail: 'Student', micOn: false, cameraOn: true },
    { identity: 'sample-class-6', name: 'Chloe Ramos', detail: 'Student', micOn: false, cameraOn: false },
    { identity: 'sample-class-7', name: 'Lucas Mendoza', detail: 'Student', micOn: false, cameraOn: true },
    { identity: 'sample-class-8', name: 'Ava Villanueva', detail: 'Student', micOn: false, cameraOn: true },
    { identity: 'sample-class-9', name: 'Jacob Navarro', detail: 'Student', micOn: false, cameraOn: false },
    { identity: 'sample-class-10', name: 'Sofia Aquino', detail: 'Student', micOn: false, cameraOn: true },
  ],
}
