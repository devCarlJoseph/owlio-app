import type { MeetingRoomScreenProps } from './meeting-room-types'
import { ClassroomMeetingScreen } from './classroom-meeting-screen'
import { CoachingMeetingScreen } from './coaching-meeting-screen'

export function MeetingRoomScreen(props: MeetingRoomScreenProps) {
  const coaching = props.role === 'esl' || props.role === 'tutors'
    || (props.role === 'students' && (props.meetingCategory === 'esl' || props.meetingCategory === 'tutors'))
  return coaching ? <CoachingMeetingScreen {...props} /> : <ClassroomMeetingScreen {...props} />
}
