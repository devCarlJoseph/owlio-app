import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import {
  ArrowLeft,
  Captions,
  Check,
  Copy,
  Focus,
  Hand,
  MessageCircle,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Send,
  Video,
  VideoOff,
  X,
} from "lucide-react"
import { Link, useLocation } from "react-router"
import { getDashboardRole } from "@/components/common/dashboard-navigation"

type RoomMessage = {
  id: number
  text: string
}

type RoomPanel = "chat" | "people"
type FaceDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ boundingBox: { width: number; height: number } }>>
}
type FaceDetectorConstructor = new (options?: { fastMode?: boolean; maxDetectedFaces?: number }) => FaceDetectorLike

const demoParticipants = [
  { id: "demo-01", name: "Demo participant 01", initials: "D1", color: "from-[#8caa9e] to-[#35584d]" },
  { id: "demo-02", name: "Demo participant 02", initials: "D2", color: "from-[#d6a873] to-[#765643]" },
  { id: "demo-03", name: "Demo participant 03", initials: "D3", color: "from-[#7997ad] to-[#384d63]" },
]

export default function MeetingRoomPage() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? "students"
  const classroomPath = `/${role}/classrooms`
  const [joined, setJoined] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const [raisedHand, setRaisedHand] = useState(false)
  const [captionsOn, setCaptionsOn] = useState(false)
  const [autoFrame, setAutoFrame] = useState(true)
  const [faceFraming, setFaceFraming] = useState(false)
  const [faceDetectionFailed, setFaceDetectionFailed] = useState(false)
  const [panel, setPanel] = useState<RoomPanel>("chat")
  const [chatOpen, setChatOpen] = useState(true)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [notice, setNotice] = useState("")
  const [mediaError, setMediaError] = useState("")
  const cameraRef = useRef<HTMLVideoElement>(null)
  const screenRef = useRef<HTMLVideoElement>(null)
  const FaceDetector = (window as Window & { FaceDetector?: FaceDetectorConstructor }).FaceDetector
  const faceDetectionAvailable = typeof FaceDetector === "function"
  const canAutoDetectFace = faceDetectionAvailable && !faceDetectionFailed
  const shouldZoomOut = autoFrame && (!canAutoDetectFace || faceFraming)

  useEffect(() => {
    if (cameraRef.current) cameraRef.current.srcObject = cameraStream
  }, [cameraStream, joined])

  useEffect(() => {
    if (screenRef.current) screenRef.current.srcObject = screenStream
  }, [screenStream, joined])

  useEffect(() => {
    if (!cameraOn || !cameraStream || !autoFrame || !FaceDetector || faceDetectionFailed) return
    const detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 1 })
    let stopped = false
    let timer = 0
    const inspectFrame = async () => {
      const video = cameraRef.current
      if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
        try {
          const [face] = await detector.detect(video)
          if (!stopped) {
            const faceHeight = face ? face.boundingBox.height / video.videoHeight : 0
            const faceWidth = face ? face.boundingBox.width / video.videoWidth : 0
            setFaceFraming(faceHeight > 0.4 || faceWidth > 0.32)
          }
        } catch {
          if (!stopped) {
            stopped = true
            setFaceFraming(false)
            setFaceDetectionFailed(true)
          }
        }
      }
      if (!stopped) timer = window.setTimeout(() => void inspectFrame(), 800)
    }

    void inspectFrame()
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [FaceDetector, autoFrame, cameraOn, cameraStream, faceDetectionFailed, joined, screenStream])

  useEffect(() => () => {
    cameraStream?.getTracks().forEach((track) => track.stop())
  }, [cameraStream])

  useEffect(() => () => {
    screenStream?.getTracks().forEach((track) => track.stop())
  }, [screenStream])

  const toggleCamera = async () => {
    setMediaError("")
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
      setCameraOn(false)
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError("Camera preview is not supported by this browser.")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      setCameraStream(stream)
      setCameraOn(true)
    } catch {
      setMediaError("Camera access was not available. Check your browser permission and try again.")
      setCameraOn(false)
    }
  }

  const startPresenting = async () => {
    setMediaError("")
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setMediaError("Screen preview is not supported by this browser.")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      stream.getVideoTracks()[0].addEventListener("ended", () => setScreenStream(null), { once: true })
      setScreenStream(stream)
      setNotice("Screen preview is local to this device. It is not being broadcast.")
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setNotice("Screen sharing was cancelled.")
      } else {
        setMediaError("Could not start a screen preview. Please try again.")
      }
    }
  }

  const stopPresenting = () => {
    screenStream?.getTracks().forEach((track) => track.stop())
    setScreenStream(null)
    setNotice("Screen preview stopped.")
  }

  const leaveRoom = () => {
    cameraStream?.getTracks().forEach((track) => track.stop())
    screenStream?.getTracks().forEach((track) => track.stop())
    setCameraStream(null)
    setScreenStream(null)
    setCameraOn(false)
    setMicOn(false)
    setJoined(false)
    setRaisedHand(false)
    setNotice("You left the local room preview.")
  }

  const copyPreviewUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setNotice("Preview URL copied. It is not an invitation to a live meeting.")
    } catch {
      setNotice("Clipboard access is unavailable. Copy the URL from your browser address bar.")
    }
  }

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = message.trim()
    if (!text) return
    setMessages((current) => [...current, { id: Date.now(), text }])
    setMessage("")
  }

  return (
    <main className="fixed inset-0 z-50 flex min-h-svh flex-col overflow-hidden bg-[#111817] text-white">
      <header className="flex min-h-[4.5rem] shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#151d1b] px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link
            to={classroomPath}
            aria-label="Back to classrooms"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
          </Link>
          <div className="hidden h-8 w-px bg-white/10 sm:block" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight sm:text-base">Classroom room</p>
            <p className="mt-0.5 truncate text-[11px] text-slate-400">Local preview · no live meeting</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-amber-200/20 bg-amber-100/10 px-3 py-1.5 text-[11px] font-medium text-amber-100 sm:inline-flex">
            <span className="size-1.5 rounded-full bg-amber-300" />
            Prototype room
          </span>
          <button
            type="button"
            onClick={() => void copyPreviewUrl()}
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:size-auto sm:gap-2 sm:px-3"
            aria-label="Copy preview URL"
            title="Copy preview URL"
          >
            <Copy aria-hidden="true" className="size-4" />
            <span className="hidden text-xs sm:inline">Copy preview URL</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        {!joined ? (
          <section className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4 sm:p-8" aria-labelledby="prejoin-heading">
            <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)]">
              <div className="relative flex min-h-[17rem] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#202a28] sm:min-h-[25rem]">
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(103,157,128,0.25),transparent_45%),linear-gradient(145deg,#263431,#151c1b)]" />
                {cameraOn && cameraStream ? (
                  <video ref={cameraRef} autoPlay muted playsInline className={`absolute inset-0 size-full ${shouldZoomOut ? "object-contain" : "object-cover"}`} aria-label="Your local camera preview" />
                ) : (
                  <div className="relative flex flex-col items-center gap-3 text-center">
                    <div className="flex size-24 items-center justify-center rounded-full border border-white/10 bg-white/5 text-3xl font-semibold text-emerald-100 shadow-2xl">You</div>
                    <p className="text-sm text-slate-300">Camera is off</p>
                  </div>
                )}
                <span className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1.5 text-xs text-white">Your preview · visible only to you</span>
                {cameraOn && autoFrame && (
                  <span className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1.5 text-[11px] text-emerald-100">
                    {canAutoDetectFace ? (faceFraming ? "Fitting a wider frame" : "Auto framing on") : "Full-frame fit · face detection unavailable"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => void toggleCamera()}
                  className="absolute bottom-3 right-3 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
                >
                  {cameraOn ? <Video aria-hidden="true" className="size-5" /> : <VideoOff aria-hidden="true" className="size-5" />}
                </button>
              </div>

              <div className="flex flex-col justify-center rounded-3xl border border-white/10 bg-[#192220] p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Before you enter</p>
                <h1 id="prejoin-heading" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Ready to join?</h1>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Check your camera and microphone controls, then enter this local room preview.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMicOn((current) => !current)}
                    aria-pressed={micOn}
                    className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${micOn ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}
                  >
                    {micOn ? <Mic aria-hidden="true" className="size-4" /> : <MicOff aria-hidden="true" className="size-4" />}
                    Microphone {micOn ? "on" : "off"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleCamera()}
                    aria-pressed={cameraOn}
                    className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${cameraOn ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}
                  >
                    {cameraOn ? <Video aria-hidden="true" className="size-4" /> : <VideoOff aria-hidden="true" className="size-4" />}
                    Camera {cameraOn ? "on" : "off"}
                  </button>
                </div>
                {mediaError && <p role="alert" className="mt-3 text-xs leading-5 text-rose-300">{mediaError}</p>}
                <button
                  type="button"
                  onClick={() => {
                    setJoined(true)
                    setNotice("You entered the local room preview. No other participants can see or hear you.")
                  }}
                  className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#b5ddbd] px-5 text-sm font-semibold text-[#10221a] transition hover:bg-[#cae9cf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#192220]"
                >
                  Join room preview
                  <Check aria-hidden="true" className="size-4" />
                </button>
                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Joining changes this page only. It does not create a classroom, contact anyone, or start a live call.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="flex min-h-0 flex-1 flex-col" aria-label="Local meeting room preview">
              <div className="relative flex min-h-0 flex-1 gap-3 p-3 sm:gap-4 sm:p-5">
              <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#18211f]">
                <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">Learning room</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">Local preview · 3 mock participants</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 rounded-full border border-amber-200/15 bg-amber-100/5 px-2.5 py-1.5 text-[10px] text-amber-100 sm:text-xs">
                    <span className="size-1.5 rounded-full bg-amber-300" />Not broadcasting
                  </div>
                </div>
                <div className="relative m-2 mt-0 min-h-0 flex-1 overflow-hidden rounded-xl bg-[#202a28] p-2">
                  {screenStream ? (
                    <div className="relative flex size-full items-center justify-center overflow-hidden rounded-lg bg-[#111817]">
                      <video ref={screenRef} autoPlay muted playsInline className="absolute inset-0 size-full object-contain" aria-label="Your local screen preview" />
                      <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white">Screen preview · local only</div>
                      {cameraOn && cameraStream && (
                        <div className="absolute bottom-3 right-3 size-24 overflow-hidden rounded-xl border border-white/30 bg-[#263431] shadow-xl sm:size-36">
                          <video ref={cameraRef} autoPlay muted playsInline className={`size-full ${shouldZoomOut ? "object-contain" : "object-cover"}`} aria-label="Your local camera preview" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid size-full grid-cols-2 grid-rows-2 gap-2">
                      <div className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-lg bg-[#202a28]">
                        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(111,166,135,0.2),transparent_35%),linear-gradient(145deg,#263431,#151c1b)]" />
                        {cameraOn && cameraStream ? (
                          <video ref={cameraRef} autoPlay muted playsInline className={`absolute inset-0 size-full ${shouldZoomOut ? "object-contain" : "object-cover"}`} aria-label="Your local camera preview" />
                        ) : (
                          <div className="relative flex size-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-semibold text-emerald-100 sm:size-20 sm:text-2xl">You</div>
                        )}
                        <span className="absolute bottom-2 left-2 max-w-[calc(100%-4rem)] truncate rounded-full bg-black/55 px-2.5 py-1 text-[10px] text-white sm:bottom-3 sm:left-3 sm:text-xs">You · local preview</span>
                        {cameraOn && autoFrame && (
                          <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[9px] text-emerald-100 sm:right-3 sm:top-3 sm:text-[10px]">
                            {canAutoDetectFace ? (faceFraming ? "Auto fit" : "Auto frame") : "Full-frame fit"}
                          </span>
                        )}
                        {!cameraOn && <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[9px] text-slate-300 sm:right-3 sm:top-3 sm:text-[10px]">Camera off</span>}
                      </div>
                      {demoParticipants.map((participant) => <DemoParticipantTile key={participant.id} participant={participant} />)}
                    </div>
                  )}
                  {raisedHand && !screenStream && <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-950"><Hand aria-hidden="true" className="size-3.5" />Hand raised</span>}
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 pb-3 pt-1 text-[11px] text-slate-400 sm:px-5">
                  <span>Mock participant tiles are for layout only; no one else is connected.</span>
                  {mediaError && <span role="alert" className="text-rose-300">{mediaError}</span>}
                </div>
              </div>

              {chatOpen && (
                <aside className="absolute inset-x-3 bottom-3 top-[52%] z-10 flex w-auto flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#f7f8f5] text-slate-900 shadow-2xl sm:relative sm:inset-auto sm:z-auto sm:w-[min(21rem,42vw)] sm:shrink-0 sm:shadow-none" aria-label={panel === "chat" ? "Room chat" : "Room participants"}>
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div className="flex gap-1 rounded-lg bg-slate-100 p-1" role="group" aria-label="Room panel">
                      <button type="button" aria-pressed={panel === "chat"} onClick={() => setPanel("chat")} className={`rounded-md px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${panel === "chat" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                        Chat
                      </button>
                      <button type="button" aria-pressed={panel === "people"} onClick={() => setPanel("people")} className={`rounded-md px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${panel === "people" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                        People
                      </button>
                    </div>
                    <button type="button" onClick={() => setChatOpen(false)} aria-label="Close room panel" className="flex size-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
                      <X aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                  {panel === "chat" ? (
                    <>
                      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
                        <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900">
                          Preview chat is private to this browser tab. Messages are not sent to participants or saved.
                        </p>
                        {messages.length === 0 ? (
                          <div className="m-auto max-w-48 text-center">
                            <MessageCircle aria-hidden="true" className="mx-auto size-5 text-slate-400" />
                            <p className="mt-3 text-sm font-medium text-slate-700">No messages yet</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">Try the chat interaction. It stays on this device.</p>
                          </div>
                        ) : (
                          <ul className="space-y-3" aria-label="Local preview messages">
                            {messages.map(({ id, text }) => (
                              <li key={id} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                                <p className="text-[11px] font-semibold text-slate-500">You · local preview</p>
                                <p className="mt-1 break-words text-sm leading-5 text-slate-800">{text}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <form onSubmit={sendMessage} className="border-t border-slate-200 p-3">
                        <label className="sr-only" htmlFor="room-message">Write a preview message</label>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 focus-within:ring-2 focus-within:ring-emerald-700/30">
                          <input id="room-message" value={message} onChange={(event) => setMessage(event.currentTarget.value)} placeholder="Write a message…" className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-slate-400" />
                          <button type="submit" disabled={!message.trim()} aria-label="Add local preview message" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#164b3a] text-white hover:bg-[#24634e] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
                            <Send aria-hidden="true" className="size-4" />
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="flex min-h-0 flex-1 flex-col p-4">
                      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">Three mock tiles are shown for layout only. They are not connected users.</p>
                      <div className="mt-4 flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                        <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-900">You</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800">You</p>
                          <p className="text-xs text-slate-500">{micOn ? "Microphone control on" : "Microphone control off"} · local only</p>
                        </div>
                        {micOn ? <Mic aria-hidden="true" className="size-4 text-slate-500" /> : <MicOff aria-hidden="true" className="size-4 text-slate-500" />}
                      </div>
                      <ul className="mt-3 space-y-2 overflow-y-auto" aria-label="Mock participants">
                        {demoParticipants.map(({ id, name, initials, color }) => (
                          <li key={id} className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                            <span className={`flex size-9 items-center justify-center rounded-full bg-gradient-to-br ${color} text-[10px] font-semibold text-white`}>{initials}</span>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{name}</span>
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500">Mock</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-xs text-slate-500">A live participant list requires the meeting service.</p>
                    </div>
                  )}
                </aside>
              )}
            </div>

            <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#151d1b] px-3 py-3 sm:px-5">
              <p className="hidden min-w-32 text-xs text-slate-400 lg:block">Room preview controls</p>
              <div className="mx-auto flex max-w-full items-center gap-2 overflow-x-auto px-1 sm:gap-3">
                <ControlButton label={micOn ? "Turn microphone off" : "Turn microphone on"} active={micOn} onClick={() => setMicOn((current) => !current)} icon={micOn ? <Mic /> : <MicOff />} />
                <ControlButton label={cameraOn ? "Turn camera off" : "Turn camera on"} active={cameraOn} onClick={() => void toggleCamera()} icon={cameraOn ? <Video /> : <VideoOff />} />
                <ControlButton
                  label={autoFrame ? "Turn auto framing off" : "Turn auto framing on"}
                  active={autoFrame}
                  onClick={() => {
                    const enabled = !autoFrame
                    setAutoFrame(enabled)
                    if (!enabled) {
                      setFaceFraming(false)
                      setNotice("Automatic face framing turned off.")
                    } else if (canAutoDetectFace) {
                      setNotice("Automatic face framing is on. Face detection stays on this device.")
                    } else {
                      setNotice("Face detection is unavailable; the preview will fit the full camera frame instead.")
                    }
                  }}
                  icon={<Focus />}
                />
                {screenStream ? (
                  <ControlButton label="Stop presenting" active onClick={stopPresenting} icon={<MonitorUp />} />
                ) : (
                  <ControlButton label="Preview screen share" onClick={() => void startPresenting()} icon={<MonitorUp />} />
                )}
                <ControlButton label={raisedHand ? "Lower hand" : "Raise hand"} active={raisedHand} onClick={() => setRaisedHand((current) => !current)} icon={<Hand />} />
                <ControlButton
                  label={captionsOn ? "Turn captions off" : "Turn captions on"}
                  active={captionsOn}
                  onClick={() => {
                    setCaptionsOn((current) => !current)
                    setNotice(captionsOn ? "Captions preview turned off." : "Captions are a control preview. Live transcription is not connected.")
                  }}
                  icon={<Captions />}
                />
                <ControlButton label={chatOpen ? "Close chat and people panel" : "Open chat and people panel"} active={chatOpen} onClick={() => setChatOpen((current) => !current)} icon={chatOpen ? <X /> : <MessageCircle />} />
                <button
                  type="button"
                  onClick={leaveRoom}
                  className="ml-1 flex h-11 items-center gap-2 rounded-full bg-[#d84b4b] px-4 text-xs font-semibold text-white transition hover:bg-[#ec5c5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#151d1b]"
                  aria-label="Leave room preview"
                >
                  <PhoneOff aria-hidden="true" className="size-4" />
                  <span className="hidden sm:inline">Leave</span>
                </button>
              </div>
              <span className="hidden min-w-32 justify-end text-[11px] text-slate-500 lg:flex">{screenStream ? "Local screen preview active" : "Not connected"}</span>
            </footer>
          </section>
        )}
      </div>

      {notice && (
        <div role="status" className="fixed bottom-24 left-1/2 z-[60] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-xl border border-white/10 bg-[#263431] px-4 py-3 text-xs text-white shadow-xl sm:bottom-20">
          <Check aria-hidden="true" className="size-4 shrink-0 text-emerald-300" />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message" className="ml-1 flex size-6 shrink-0 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
            <X aria-hidden="true" className="size-3.5" />
          </button>
        </div>
      )}
    </main>
  )
}

function ControlButton({
  label,
  active = false,
  onClick,
  icon,
}: {
  label: string
  active?: boolean
  onClick: () => void
  icon: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex size-11 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:size-12 ${active ? "border-emerald-200/20 bg-emerald-100/15 text-emerald-100 hover:bg-emerald-100/25" : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"}`}
    >
      {icon}
    </button>
  )
}

function DemoParticipantTile({ participant }: { participant: (typeof demoParticipants)[number] }) {
  return (
    <div
      role="img"
      aria-label={`${participant.name}, mock participant`}
      className={`relative flex min-h-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${participant.color}`}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,255,255,0.22),transparent_45%),linear-gradient(160deg,transparent,rgba(10,20,18,0.42))]" />
      <span className="relative flex size-14 items-center justify-center rounded-full border border-white/25 bg-black/10 text-lg font-semibold text-white shadow-lg sm:size-20 sm:text-2xl">
        {participant.initials}
      </span>
      <span className="absolute left-2 bottom-2 max-w-[calc(100%-4rem)] truncate rounded-full bg-black/45 px-2.5 py-1 text-[10px] text-white sm:bottom-3 sm:left-3 sm:text-xs">
        {participant.name}
      </span>
      <span className="absolute right-2 top-2 rounded-full border border-white/15 bg-black/25 px-2 py-1 text-[8px] font-semibold uppercase tracking-wider text-white sm:right-3 sm:top-3 sm:text-[9px]">
        Mock
      </span>
      <span aria-hidden="true" className="absolute bottom-2 right-2 rounded-full bg-black/35 p-1.5 text-white sm:bottom-3 sm:right-3">
        <MicOff className="size-3" />
      </span>
    </div>
  )
}
