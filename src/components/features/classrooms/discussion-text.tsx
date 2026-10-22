import type { ReactNode } from "react"

const urlPattern = /(https?:\/\/[^\s<>"']+)/g
const trailingPunctuation = /[.,;:!?)\]]+$/

function safeHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function renderLine(line: string): ReactNode[] {
  return line.split(urlPattern).map((part, index) => {
    if (index % 2 === 0) return part
    const trailing = part.match(trailingPunctuation)?.[0] ?? ""
    const text = trailing ? part.slice(0, -trailing.length) : part
    const href = safeHttpUrl(text)
    if (!href) return part
    return (
      <span key={index}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all rounded-sm underline underline-offset-2 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          {text}
        </a>
        {trailing}
      </span>
    )
  })
}

export function DiscussionText({ text, className = "" }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean)
  return (
    <div className={`space-y-2 break-words ${className}`}>
      {paragraphs.map((block, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {renderLine(block)}
        </p>
      ))}
    </div>
  )
}
