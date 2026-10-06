import { BookOpenCheck } from "lucide-react"

export function AuthShowcase() {
  return (
    <section className="relative hidden h-full min-h-0 overflow-hidden rounded-[26px] bg-[#080611] p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_30%,rgba(242,0,171,0.46),transparent_42%),radial-gradient(ellipse_at_78%_62%,rgba(0,128,255,0.42),transparent_38%),radial-gradient(ellipse_at_60%_100%,rgba(99,30,255,0.38),transparent_45%)]"
      />
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-80"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 760 900"
      >
        <defs>
          <linearGradient id="owlio-wave-one" x1="40" x2="730" y1="160" y2="450" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF00B8" />
            <stop offset=".48" stopColor="#8A2BFF" />
            <stop offset="1" stopColor="#00C8FF" />
          </linearGradient>
          <linearGradient id="owlio-wave-two" x1="10" x2="760" y1="430" y2="730" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6B16FF" />
            <stop offset=".5" stopColor="#F400A8" />
            <stop offset="1" stopColor="#FF4C55" />
          </linearGradient>
          <filter id="owlio-wave-glow" height="180%" width="140%" x="-20%" y="-40%">
            <feGaussianBlur stdDeviation="11" />
          </filter>
        </defs>
        <g filter="url(#owlio-wave-glow)" opacity=".75" strokeWidth="18">
          <path d="M-120 150C70 75 218 168 360 240s278 114 540 77" stroke="url(#owlio-wave-one)" />
          <path d="M-145 250c170-56 291 32 442 86s319 78 590 11" stroke="url(#owlio-wave-one)" />
          <path d="M-110 570c178-139 338-102 479-38s284 94 532 8" stroke="url(#owlio-wave-two)" />
          <path d="M-136 680c204-132 341-77 483-16s302 52 548-72" stroke="url(#owlio-wave-two)" />
        </g>
        <g opacity=".92" strokeWidth="2">
          <path d="M-120 150C70 75 218 168 360 240s278 114 540 77" stroke="url(#owlio-wave-one)" />
          <path d="M-145 190c170-56 291 32 442 86s319 78 590 11" stroke="url(#owlio-wave-one)" />
          <path d="M-145 225c170-56 291 32 442 86s319 78 590 11" stroke="url(#owlio-wave-one)" />
          <path d="M-145 260c170-56 291 32 442 86s319 78 590 11" stroke="url(#owlio-wave-one)" />
          <path d="M-110 570c178-139 338-102 479-38s284 94 532 8" stroke="url(#owlio-wave-two)" />
          <path d="M-136 615c204-132 341-77 483-16s302 52 548-72" stroke="url(#owlio-wave-two)" />
          <path d="M-136 660c204-132 341-77 483-16s302 52 548-72" stroke="url(#owlio-wave-two)" />
          <path d="M-136 705c204-132 341-77 483-16s302 52 548-72" stroke="url(#owlio-wave-two)" />
        </g>
      </svg>

      <div className="relative z-10 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-white/12 ring-1 ring-white/20 backdrop-blur-sm">
          <BookOpenCheck aria-hidden="true" className="size-5" />
        </span>
        <span className="text-lg font-semibold tracking-tight">owlio</span>
      </div>

      <div className="relative z-10 max-w-md pb-1">
        <p className="mb-5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em] text-white/80">
          <span>Learning, connected</span>
          <span className="h-px w-16 bg-white/55" />
        </p>
        <h1 className="font-serif text-5xl leading-[0.98] tracking-[-0.055em] xl:text-6xl">
          Make room
          <br />
          for what
          <br />
          you can learn.
        </h1>
        <p className="mt-6 max-w-sm text-sm leading-6 text-white/75">
          Your subjects, study spaces, and classrooms—together in one place.
        </p>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-4 rounded-[22px] border border-white/75" />
    </section>
  )
}
