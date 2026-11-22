import { cn } from 'cn'

type OwlioLogoProps = {
  alt: string
  className?: string
}

export function OwlioLogo({ alt, className }: OwlioLogoProps) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={2172}
      height={724}
      className={cn('h-10 w-auto object-contain surface-dark:brightness-0 surface-dark:invert', className)}
    />
  )
}
