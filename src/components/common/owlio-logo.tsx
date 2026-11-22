import { cn } from 'cn'

type OwlioLogoProps = {
  alt: string
  className?: string
}

export function OwlioLogo({ alt, className }: OwlioLogoProps) {
  return (
    <span className={cn('relative block h-10 w-fit', className)}>
      <img
        src="/logo.png"
        alt={alt}
        width={2172}
        height={724}
        className="h-full w-auto object-contain surface-dark:brightness-0 surface-dark:invert"
      />
      {/* Preserve the owl's original eyes and beak inside the white logo. */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        width={2172}
        height={724}
        className="pointer-events-none absolute inset-0 hidden size-full object-contain [clip-path:polygon(18%_43%,22%_35%,26%_34%,29%_38%,32%_28%,37%_22%,40%_25%,41.7%_31%,41.7%_43%,39.5%_54%,35%_62%,29%_68%,21%_73%,18%_68%,17%_59%)] surface-dark:block"
      />
    </span>
  )
}
