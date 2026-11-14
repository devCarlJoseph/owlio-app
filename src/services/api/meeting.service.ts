import { z } from "zod";
import type { AxiosResponse } from "axios";
import api from "@/lib/axios";
import { postApiWithCsrf } from "./auth.service";

const id = (value: string) => z.uuid().parse(value);
const path = (sessionId: string) =>
  "/api/v1/sessions/" + id(sessionId) + "/native-meeting";
const roomResult = z.object({
  id: z.uuid(),
  status: z.enum(["OPEN", "ENDING", "ENDED"]),
});
const joinResult = z.object({
  meetingId: z.uuid(),
  participantId: z.uuid(),
  url: z.url(),
  token: z.string().min(1),
  expiresIn: z.number().positive(),
});
const ownParticipant = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  status: z.enum(["WAITING", "ADMITTED", "DENIED", "REMOVED"]),
  handRaisedAt: z.string().nullable(),
  version: z.number().int(),
});
const roomState = z.object({
  id: z.uuid(),
  title: z.string(),
  isHost: z.boolean(),
  canJoin: z.boolean(),
  chatEnabled: z.boolean(),
  screenShareEnabled: z.boolean(),
  ownParticipant: ownParticipant.nullable(),
  raisedHands: z.array(z.object({ userId: z.uuid(), raisedAt: z.string() })),
});
const directory = z.object({
  items: z.array(
    z.object({
      id: z.uuid(),
      userId: z.uuid(),
      name: z.string(),
      mediaIdentity: z.string(),
    }),
  ),
});
const chatMessage = z.object({
  id: z.uuid(),
  authorId: z.uuid(),
  authorName: z.string(),
  body: z.string(),
  createdAt: z.string(),
});
export type MeetingJoin = z.infer<typeof joinResult>;
export type NativeRoomState = z.infer<typeof roomState>;
export type MeetingDirectory = z.infer<typeof directory>["items"];
export type NativeMessage = z.infer<typeof chatMessage>;
const envelope = <T>(schema: z.ZodType<T>, payload: unknown) =>
  z.object({ status: z.literal("success"), data: schema }).parse(payload).data;

export async function createMeeting(sessionId: string) {
  return roomResult.parse(await postApiWithCsrf(path(sessionId), {}));
}
export async function joinMeeting(sessionId: string) {
  return joinResult.parse(await postApiWithCsrf(path(sessionId) + "/join", {}));
}
export async function endMeeting(sessionId: string) {
  return roomResult.parse(await postApiWithCsrf(path(sessionId) + "/end", {}));
}
export async function getMeetingState(sessionId: string, signal?: AbortSignal) {
  return envelope(
    roomState,
    (await api.get<unknown>(path(sessionId), { signal })).data,
  );
}
export async function getMeetingParticipants(
  sessionId: string,
  signal?: AbortSignal,
) {
  return envelope(
    directory,
    (await api.get<unknown>(path(sessionId) + "/participants", { signal }))
      .data,
  ).items;
}
export async function getMeetingMessages(
  sessionId: string,
  signal?: AbortSignal,
) {
  // Latest 50 messages in chronological order. Older history is not loaded by the in-call panel.
  return envelope(
    z.object({
      items: z.array(chatMessage),
      next: z
        .object({ beforeCreatedAt: z.string(), beforeId: z.uuid() })
        .nullable(),
    }),
    (
      await api.get<unknown>(path(sessionId) + "/messages", {
        params: { limit: 50 },
        signal,
      })
    ).data,
  ).items;
}
export async function sendMeetingMessage(
  sessionId: string,
  requestId: string,
  body: string,
) {
  return chatMessage.parse(
    await postApiWithCsrf(path(sessionId) + "/messages", {
      requestId: id(requestId),
      body,
    }),
  );
}
export async function setMeetingHand(
  sessionId: string,
  raised: boolean,
  expectedVersion: number,
) {
  return z
    .object({
      id: z.uuid(),
      handRaisedAt: z.string().nullable(),
      version: z.number().int(),
    })
    .parse(
      await postApiWithCsrf(path(sessionId) + "/hand", {
        raised,
        expectedVersion,
      }),
    );
}

const session = z.object({
  id: z.uuid(),
  title: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  mode: z.enum(["ONLINE", "IN_PERSON", "HYBRID"]),
  status: z.enum(["SCHEDULED", "CANCELLED"]),
  version: z.number().int(),
});
export type ScheduledSession = z.infer<typeof session>;
export async function getClassroomSessions(
  classroomId: string,
  from: string,
  to: string,
  signal?: AbortSignal,
) {
  const items: ScheduledSession[] = [];
  const seen = new Set<string>();
  let cursor: { afterStartsAt: string; afterId: string } | null = null;
  do {
    const response: AxiosResponse<unknown> = await api.get<unknown>(
      "/api/v1/classrooms/" + id(classroomId) + "/sessions",
      { params: { from, to, limit: 100, ...cursor }, signal },
    );
    const page: {
      items: ScheduledSession[];
      nextCursor: { afterStartsAt: string; afterId: string } | null;
    } = envelope(
      z.object({
        items: z.array(session),
        nextCursor: z
          .object({ afterStartsAt: z.string(), afterId: z.uuid() })
          .nullable(),
      }),
      response.data,
    );
    items.push(...page.items);
    cursor = page.nextCursor;
    if (cursor) {
      const key = cursor.afterStartsAt + ":" + cursor.afterId;
      if (seen.has(key))
        throw new Error("The schedule repeated a page. Please reload.");
      seen.add(key);
    }
  } while (cursor);
  return items;
}
export async function scheduleClassroomSession(
  classroomId: string,
  input: {
    title: string;
    startsAt: string;
    endsAt: string;
    timeZone: string;
    mode: "ONLINE" | "IN_PERSON" | "HYBRID";
  },
) {
  return session.parse(
    await postApiWithCsrf(
      "/api/v1/classrooms/" + id(classroomId) + "/sessions",
      { ...input, lessonId: null },
    ),
  );
}
