import { z } from "zod"
import api from "@/lib/axios"
import { mutateApiWithCsrf } from "./auth.service"
import { requestOperation } from "./contract-client"
import { fileMetadata, putStorage } from "./academic.service"

export type FileScope = {
  kind: "classroom" | "locker" | "classwork"
  id: string
}
export const privateFileSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  contentType: z.string(),
  sizeBytes: z.number().int().positive(),
  createdAt: z.string().datetime({ offset: true }),
})
export type PrivateFile = z.infer<typeof privateFileSchema>
const reservationSchema = z.object({
  fileId: z.string(),
  uploadUrl: z.string().url(),
  uploadExpiresAt: z.string().datetime({ offset: true }),
  completeBefore: z.string().datetime({ offset: true }),
  headers: z.object({ "Content-Type": z.string() }),
})
export type FileReservation = z.infer<typeof reservationSchema>
function base(scope: FileScope) {
  const id = encodeURIComponent(scope.id)
  return scope.kind === "classroom"
    ? `/api/v1/classrooms/${id}/material-files`
    : scope.kind === "locker"
      ? `/api/v1/study-spaces/${id}/locker/files`
      : `/api/v1/classwork/${id}/files`
}
export async function listPrivateFiles(scope: FileScope, signal?: AbortSignal) {
  const response = await api.get<unknown>(base(scope), { signal })
  return z
    .object({
      status: z.literal("success"),
      data: z.object({ items: z.array(privateFileSchema) }),
    })
    .parse(response.data).data.items
}
export async function beginPrivateUpload(scope: FileScope, file: File) {
  return reservationSchema.parse(
    await mutateApiWithCsrf(
      "POST",
      `${base(scope)}/uploads`,
      fileMetadata(file),
    ),
  )
}
export const transferPrivateUpload = putStorage
export async function completePrivateUpload(
  scope: FileScope,
  reservation: FileReservation,
) {
  return privateFileSchema.parse(
    await mutateApiWithCsrf(
      "POST",
      `${base(scope)}/${encodeURIComponent(reservation.fileId)}/complete`,
      {},
    ),
  )
}
export async function privateFileUrl(
  scope: FileScope,
  id: string,
  preview = false,
) {
  const response = await api.get<unknown>(
    `${base(scope)}/${encodeURIComponent(id)}/download`,
    { params: preview ? { disposition: "inline" } : undefined },
  )
  return z
    .object({
      status: z.literal("success"),
      data: z.object({ url: z.string().url(), expiresIn: z.number() }),
    })
    .parse(response.data).data
}
export async function renamePrivateFile(
  scope: FileScope,
  file: PrivateFile,
  name: string,
) {
  const metadata = fileMetadata({
    name,
    type: file.contentType,
    size: file.sizeBytes,
  })
  return privateFileSchema.parse(
    await mutateApiWithCsrf(
      "PATCH",
      `${base(scope)}/${encodeURIComponent(file.id)}`,
      { fileName: metadata.fileName },
    ),
  )
}
export async function removePrivateFile(scope: FileScope, id: string) {
  await mutateApiWithCsrf(
    "DELETE",
    `${base(scope)}/${encodeURIComponent(id)}`,
    {},
  )
}
export const listClassroomLinks = (classroomId: string, signal?: AbortSignal) =>
  requestOperation("GET /api/v1/classrooms/{classroomId}/materials", {
    params: { classroomId },
    signal,
    query: { limit: 50 },
  })
