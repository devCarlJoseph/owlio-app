import type { MeetingRoomScreenProps } from './meeting-room-types'
import { ClassroomMeetingScreen } from './classroom-meeting-screen'
import { CoachingMeetingScreen } from './coaching-meeting-screen'

export function MeetingRoomScreen(props: MeetingRoomScreenProps) {
  return props.role === 'students' || props.role === 'educators'
    ? <ClassroomMeetingScreen {...props} />
    : <CoachingMeetingScreen {...props} />
}
