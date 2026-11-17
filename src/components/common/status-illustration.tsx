type IllustrationKind = 'search' | 'barrier' | 'lock' | 'server'

/** Original, decorative vector artwork inspired by the supplied status cards. */
export function StatusIllustration({ kind }: { kind: IllustrationKind }) {
  return <svg viewBox="0 0 240 170" fill="none" aria-hidden="true" className="h-40 w-56 max-w-full">
    <ellipse cx="120" cy="150" rx="91" ry="10" className="fill-slate-50 surface-dark:fill-slate-800" />
    {kind === 'barrier' ? <>
      <path d="M48 91 60 49 73 91Z" fill="#e2e7ee" /><path d="M53 73h15m-19 12h22" stroke="white" strokeWidth="6" />
      <path d="M55 119v27m135-27v27" stroke="#bcc7d7" strokeWidth="8" />
      <rect x="31" y="91" width="179" height="36" rx="3" fill="#e5e9f1" />
      <path d="m65 92-18 17 18 17m43-34-18 17 18 17m43-34-18 17 18 17m43-34-18 17 18 17" stroke="#f8fafc" strokeWidth="12" />
      <path d="M167 90V45" stroke="#151339" strokeWidth="3" /><path d="m167 13 19 19-19 19-19-19Z" fill="#fafbfe" stroke="#d5dce7" strokeWidth="2" />
      <path d="M167 25v9" stroke="#a4b2c9" strokeWidth="3" strokeLinecap="round" /><circle cx="167" cy="40" r="1.8" fill="#a4b2c9" />
    </> : kind === 'server' ? <>
      <path d="M36 136V64l40-20 32 18 34-36 51 29 13 81Z" fill="#f5f7fb" />
      {[62, 103, 144].map((x, index) => <g key={x} transform={`translate(${x} ${index === 1 ? 46 : 68})`}>
        <rect width="34" height={index === 1 ? 95 : 73} rx="3" fill="#d8deea" />
        {[10, 24, 38, 52, 66].map(y => <g key={y}><path d={`M5 ${y}h18`} stroke="white" strokeWidth="5" /><circle cx="28" cy={y} r="1.5" fill="#9aaac4" /></g>)}
      </g>)}
    </> : <>
      <rect x="64" y="30" width="83" height="115" rx="4" transform="rotate(-5 64 30)" fill="#d8deea" />
      <path d="M85 24h60l21 22v92H85Z" fill="#f4f6fa" /><path d="M145 24v23h21" fill="#e2e7ee" />
      <path d="m104 28 39 3" stroke="#9aaac4" strokeWidth="4" strokeLinecap="round" />
      {[54, 73, 92, 111].map(y => <g key={y}><circle cx="99" cy={y} r="4" stroke="#a7b2c6" /><path d={`M112 ${y}h35`} stroke="#e0e5ef" strokeWidth="4" /></g>)}
      {kind === 'lock' ? <><rect x="136" y="82" width="48" height="39" rx="9" fill="white" /><path d="M146 82v-9a14 14 0 0 1 28 0v9" stroke="#9aaac4" strokeWidth="4" /><path d="M160 96v11" stroke="#d4dce8" strokeWidth="6" strokeLinecap="round" /></> : <><circle cx="164" cy="80" r="23" fill="white" stroke="#151339" strokeWidth="4" /><path d="m178 99 20 32" stroke="#151339" strokeWidth="9" strokeLinecap="round" /></>}
    </>}
  </svg>
}
