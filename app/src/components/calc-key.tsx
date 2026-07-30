// A single calculator key. Variants map to the theme's semantic roles.
import { cn } from '@/lib/utils'

type KeyVariant = 'digit' | 'operator' | 'function' | 'equals' | 'clear'

const VARIANT_CLASSES: Record<KeyVariant, string> = {
  digit: 'bg-secondary text-secondary-foreground hover:bg-accent',
  operator:
    'bg-[color-mix(in_srgb,var(--primary),transparent_84%)] text-primary hover:bg-[color-mix(in_srgb,var(--primary),transparent_74%)]',
  function: 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
  equals: 'bg-primary text-primary-foreground hover:brightness-110',
  clear:
    'bg-[color-mix(in_srgb,var(--destructive),transparent_86%)] text-destructive hover:bg-[color-mix(in_srgb,var(--destructive),transparent_78%)]',
}

export function CalcKey({
  label,
  onPress,
  variant = 'digit',
  ariaLabel,
  wide = false,
  active = false,
}: {
  label: React.ReactNode
  onPress: () => void
  variant?: KeyVariant
  ariaLabel?: string
  wide?: boolean
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={ariaLabel}
      className={cn(
        'flex h-16 select-none items-center justify-center rounded-xl text-2xl font-medium tabular-nums',
        'transition-[transform,background-color,filter] duration-100 ease-out active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
        VARIANT_CLASSES[variant],
        wide && 'col-span-2',
        active && 'ring-2 ring-primary',
      )}
    >
      {label}
    </button>
  )
}
