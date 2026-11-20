import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import api from "@/lib/axios"
import { mutateApiWithCsrf } from "./auth.service"
import {
  beginPrivateUpload,
  completePrivateUpload,
  listPrivateFiles,
  privateFileUrl,
  renamePrivateFile,
  transferPrivateUpload,
} from "./private-files.service"
vi.mock("@/lib/axios", () => ({ default: { get: vi.fn() } }))
vi.mock("./auth.service", () => ({ mutateApiWithCsrf: vi.fn() }))
const scope = { kind: "locker" as const, id: "space" }
const at = "2099-01-01T00:00:00.000Z"
const file = {
  id: "file",
  fileName: "lesson.pdf",
  contentType: "application/pdf",
  sizeBytes: 8,
  createdAt: at,
}
const reservation = {
  fileId: "file",
  uploadUrl: "https://storage.example.test/upload",
  uploadExpiresAt: at,
  completeBefore: at,
  headers: { "Content-Type": "application/pdf" },
}
beforeEach(() => vi.resetAllMocks())
afterEach(() => vi.unstubAllGlobals())
describe("account private files", () => {
  it("loads persisted ready metadata using a cancellable owner-scoped route", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { status: "success", data: { items: [file] } },
    })
    const controller = new AbortController()
    expect(await listPrivateFiles(scope, controller.signal)).toEqual([file])
    expect(api.get).toHaveBeenCalledWith(
      "/api/v1/study-spaces/space/locker/files",
      { signal: controller.signal },
    )
  })
  it("separates signed byte transfer from CSRF-protected initiation and completion", async () => {
    vi.mocked(mutateApiWithCsrf)
      .mockResolvedValueOnce(reservation)
      .mockResolvedValueOnce(file)
    const bytes = new File(["%PDF-abc"], file.fileName, {
      type: file.contentType,
    })
    const transfer = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal("fetch", transfer)
    const upload = await beginPrivateUpload(scope, bytes)
    expect(mutateApiWithCsrf).toHaveBeenCalledTimes(1)
    await transferPrivateUpload(upload, bytes)
    expect(transfer).toHaveBeenCalledWith(new URL(reservation.uploadUrl), {
      method: "PUT",
      credentials: "omit",
      headers: reservation.headers,
      body: bytes,
      referrerPolicy: "no-referrer",
    })
    expect(await completePrivateUpload(scope, upload)).toEqual(file)
    expect(mutateApiWithCsrf).toHaveBeenLastCalledWith(
      "POST",
      "/api/v1/study-spaces/space/locker/files/file/complete",
      {},
    )
  })
  it("does not silently finalize a failed byte transfer", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))
    await expect(
      transferPrivateUpload(reservation, new File(["pdf"], "lesson.pdf")),
    ).rejects.toThrow("not been finalized")
    expect(mutateApiWithCsrf).not.toHaveBeenCalled()
  })
  it("rejects unsupported input before reserving a slot and validates renames", async () => {
    await expect(
      beginPrivateUpload(
        scope,
        new File(["script"], "x.js", { type: "text/javascript" }),
      ),
    ).rejects.toThrow("PDF, PNG, or JPEG")
    await expect(renamePrivateFile(scope, file, "lesson.png")).rejects.toThrow(
      "match the file type",
    )
    vi.mocked(mutateApiWithCsrf).mockResolvedValue({
      ...file,
      fileName: "renamed.pdf",
    })
    expect((await renamePrivateFile(scope, file, "renamed.pdf")).fileName).toBe(
      "renamed.pdf",
    )
    expect(mutateApiWithCsrf).toHaveBeenCalledTimes(1)
  })
  it("requests fresh inline viewing URLs without persisting them in metadata", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        status: "success",
        data: { url: "https://storage.example.test/file", expiresIn: 60 },
      },
    })
    await privateFileUrl({ kind: "classroom", id: "room" }, "file", true)
    expect(api.get).toHaveBeenCalledWith(
      "/api/v1/classrooms/room/material-files/file/download",
      { params: { disposition: "inline" } },
    )
  })
})
