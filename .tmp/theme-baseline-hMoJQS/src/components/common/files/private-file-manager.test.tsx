import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import * as service from "@/services/api/private-files.service"
import { PrivateFileManager } from "./private-file-manager"
vi.mock("@/services/api/private-files.service", () => ({
  listPrivateFiles: vi.fn(),
  beginPrivateUpload: vi.fn(),
  transferPrivateUpload: vi.fn(),
  completePrivateUpload: vi.fn(),
  privateFileUrl: vi.fn(),
  renamePrivateFile: vi.fn(),
  removePrivateFile: vi.fn(),
}))
const at = "2099-01-01T00:00:00.000Z"
const saved = {
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
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(service.listPrivateFiles).mockResolvedValue([])
  vi.mocked(service.beginPrivateUpload).mockResolvedValue(reservation)
  vi.mocked(service.transferPrivateUpload).mockResolvedValue(undefined)
  vi.mocked(service.completePrivateUpload).mockResolvedValue(saved)
})
afterEach(cleanup)
function view(canUpload = true) {
  return render(
    <PrivateFileManager
      kind="locker"
      id="space"
      canUpload={canUpload}
      title="Locker files"
    />,
  )
}
async function choose() {
  await screen.findByText("No files yet.")
  fireEvent.change(screen.getByLabelText("Choose file for Locker files"), {
    target: {
      files: [
        new File(["%PDF-abc"], "lesson.pdf", { type: "application/pdf" }),
      ],
    },
  })
}
describe("private file manager", () => {
  it("shows persisted files after mounting and exposes viewing without upload access", async () => {
    vi.mocked(service.listPrivateFiles).mockResolvedValue([saved])
    view(false)
    expect(await screen.findByText("lesson.pdf")).toBeTruthy()
    expect(screen.getByRole("button", { name: "View lesson.pdf" })).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Add file" })).toBeNull()
    expect(
      screen.queryByRole("button", { name: "Remove lesson.pdf" }),
    ).toBeNull()
  })
  it("waits for finalization before displaying successful upload metadata", async () => {
    let complete!: (value: typeof saved) => void
    vi.mocked(service.completePrivateUpload).mockImplementation(
      () =>
        new Promise((resolve) => {
          complete = resolve
        }),
    )
    view()
    await choose()
    await waitFor(() =>
      expect(service.completePrivateUpload).toHaveBeenCalled(),
    )
    expect(screen.queryByRole("button", { name: "View lesson.pdf" })).toBeNull()
    complete(saved)
    expect(
      await screen.findByRole("button", { name: "View lesson.pdf" }),
    ).toBeTruthy()
    expect(await screen.findByRole("status")).toHaveProperty(
      "textContent",
      "lesson.pdf uploaded and saved.",
    )
  })
  it("retries finalization without re-uploading bytes or reserving another file", async () => {
    vi.mocked(service.completePrivateUpload)
      .mockRejectedValueOnce(new Error("Confirmation failed"))
      .mockResolvedValueOnce(saved)
    view()
    await choose()
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Confirmation failed",
    )
    await userEvent.click(screen.getByRole("button", { name: "Retry upload" }))
    expect(
      await screen.findByRole("button", { name: "View lesson.pdf" }),
    ).toBeTruthy()
    expect(service.beginPrivateUpload).toHaveBeenCalledTimes(1)
    expect(service.transferPrivateUpload).toHaveBeenCalledTimes(1)
    expect(service.completePrivateUpload).toHaveBeenCalledTimes(2)
  })
  it("keeps errors visible rather than reporting an empty locker", async () => {
    vi.mocked(service.listPrivateFiles).mockRejectedValueOnce(
      new Error("Unable to load locker"),
    )
    view()
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Unable to load lockerReload files",
    )
    expect(screen.queryByText("No files yet.")).toBeNull()
    await userEvent.click(screen.getByRole("button", { name: "Reload files" }))
    expect(await screen.findByText("No files yet.")).toBeTruthy()
  })
  it("keeps a listed file if removal fails", async () => {
    vi.mocked(service.listPrivateFiles).mockResolvedValue([saved])
    vi.mocked(service.removePrivateFile).mockRejectedValue(
      new Error("Removal failed"),
    )
    view()
    await userEvent.click(
      await screen.findByRole("button", { name: "Remove lesson.pdf" }),
    )
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Removal failedReload files",
    )
    expect(screen.getByRole("button", { name: "View lesson.pdf" })).toBeTruthy()
  })
})
