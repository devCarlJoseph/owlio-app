import { z } from "zod";
import api from "@/lib/axios";
import { mutateApiWithCsrf, postApiWithCsrf } from "./auth.service";

const cursor = z.object({ beforeCreatedAt: z.string(), beforeId: z.uuid() });
const editedAt = z.iso.datetime().nullable();
const comment = z.object({
  id: z.uuid(),
  authorId: z.uuid(),
  authorName: z.string(),
  authorRole: z.enum(["student", "educator"]),
  body: z.string(),
  createdAt: z.string(),
  editedAt: editedAt.optional(),
});
const post = z.object({
  id: z.uuid(),
  authorId: z.uuid(),
  authorName: z.string(),
  body: z.string(),
  createdAt: z.string(),
  editedAt: editedAt.optional(),
  commentCount: z.number().int().nonnegative(),
  lastCommentAt: z.string().nullable(),
  repliers: z.array(z.object({ id: z.uuid(), name: z.string() })),
  reactions: z.array(
    z.object({
      emoji: z.string(),
      count: z.number().int().nonnegative(),
      mine: z.boolean(),
    }),
  ),
});
export type DiscussionPostRecord = z.infer<typeof post>;
export type DiscussionCommentRecord = z.infer<typeof comment>;
export type DiscussionCursor = z.infer<typeof cursor>;
type DiscussionEdit = { body: string; expectedEditedAt: string | null };
const path = (classroomId: string) =>
  `/api/v1/classrooms/${encodeURIComponent(classroomId)}/posts`;
const thread = (classroomId: string, postId: string) =>
  `${path(classroomId)}/${encodeURIComponent(postId)}`;

export async function getClassroomPosts(
  classroomId: string,
  before?: DiscussionCursor,
  signal?: AbortSignal,
) {
  return z
    .object({
      status: z.literal("success"),
      data: z.object({
        items: z.array(post),
        next: cursor.nullable(),
        readOnly: z.boolean(),
      }),
    })
    .parse(
      (
        await api.get<unknown>(path(classroomId), {
          params: { limit: 20, ...before },
          signal,
        })
      ).data,
    ).data;
}
export async function createClassroomPost(
  classroomId: string,
  requestId: string,
  body: string,
) {
  return post.parse(
    await postApiWithCsrf(path(classroomId), { requestId, body }),
  );
}
export async function editClassroomPost(classroomId: string, postId: string, input: DiscussionEdit) {
  return post.extend({ editedAt }).parse(
    await mutateApiWithCsrf("PATCH", thread(classroomId, postId), input),
  );
}
export async function getClassComments(
  classroomId: string,
  postId: string,
  before?: DiscussionCursor,
  signal?: AbortSignal,
) {
  return z
    .object({
      status: z.literal("success"),
      data: z.object({ items: z.array(comment), next: cursor.nullable() }),
    })
    .parse(
      (
        await api.get<unknown>(`${thread(classroomId, postId)}/comments`, {
          params: { limit: 50, ...before },
          signal,
        })
      ).data,
    ).data;
}
export async function addClassComment(
  classroomId: string,
  postId: string,
  requestId: string,
  body: string,
) {
  return comment.parse(
    await postApiWithCsrf(`${thread(classroomId, postId)}/comments`, {
      requestId,
      body,
    }),
  );
}
export async function setClassReaction(
  classroomId: string,
  postId: string,
  emoji: string,
  active: boolean,
) {
  return post.parse(
    await postApiWithCsrf(`${thread(classroomId, postId)}/reactions`, {
      emoji,
      active,
    }),
  );
}
export async function editClassComment(classroomId: string, postId: string, commentId: string, input: DiscussionEdit) {
  return comment.extend({ editedAt }).parse(
    await mutateApiWithCsrf("PATCH", `${thread(classroomId, postId)}/comments/${encodeURIComponent(commentId)}`, input),
  );
}
