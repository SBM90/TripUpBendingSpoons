import { AnimatePresence, motion } from 'framer-motion'
import { Check as CheckIcon, ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { PersonId, people } from '../data'

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export function Avatar({ id, size = 36, ring = true }: { id: PersonId; size?: number; ring?: boolean }) {
  const p = people[id]
  return (
    <div
      className={cx('flex shrink-0 items-center justify-center rounded-full font-semibold text-white', ring && 'ring-2 ring-white')}
      style={{ width: size, height: size, background: p.color, fontSize: size * 0.36 }}
      aria-label={p.name}
    >
      {p.initials}
    </div>
  )
}

export function AvatarStack({ ids, size = 32 }: { ids: PersonId[]; size?: number }) {
  return (
    <div className="flex">
      {ids.map((id, i) => (
        <div key={id} style={{ marginLeft: i ? -8 : 0 }}>
          <Avatar id={id} size={size} />
        </div>
      ))}
    </div>
  )
}

export function Chip({ children, tone = 'gray', className }: { children: ReactNode; tone?: 'gray' | 'blue' | 'green' | 'red' | 'white'; className?: string }) {
  const tones = {
    gray: 'bg-fill3 text-label',
    blue: 'bg-blue text-white',
    green: 'bg-green text-white',
    red: 'bg-red text-white',
    white: 'bg-white text-label',
  }
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-cap font-semibold', tones[tone], className)}>{children}</span>
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className={cx('block w-full rounded-2xl bg-gray-6 px-4 text-left', onClick && 'active:opacity-70', className)}>
      {children}
    </Tag>
  )
}

export function Row({
  lead,
  title,
  sub,
  right,
  trail,
  last,
  onClick,
  className,
}: {
  lead?: ReactNode
  title: ReactNode
  sub?: ReactNode
  right?: ReactNode
  trail?: ReactNode
  last?: boolean
  onClick?: () => void
  className?: string
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className={cx('flex w-full items-center gap-3 py-3 text-left', !last && 'border-b border-sep/70', onClick && 'active:opacity-60', className)}>
      {lead}
      <div className="min-w-0 flex-1">
        <div className="text-body text-label">{title}</div>
        {sub && <div className="text-foot text-label-2">{sub}</div>}
      </div>
      {right && <div className="text-sub text-label-2">{right}</div>}
      {trail}
    </Tag>
  )
}

export function Segmented<T extends string>({ items, value, onChange }: { items: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="relative flex rounded-full bg-fill3 p-[3px]">
      {items.map((it) => (
        <button key={it.id} onClick={() => onChange(it.id)} className="relative flex-1 rounded-full py-[7px] text-sub">
          {value === it.id && (
            <motion.div layoutId={`seg-${items.map((i) => i.id).join('')}`} className="absolute inset-0 rounded-full bg-white shadow-sm" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
          )}
          <span className={cx('relative', value === it.id ? 'font-semibold' : '')}>{it.label}</span>
        </button>
      ))}
    </div>
  )
}

export function Button({ children, onClick, kind = 'primary', className, disabled }: { children: ReactNode; onClick?: () => void; kind?: 'primary' | 'secondary' | 'blue'; className?: string; disabled?: boolean }) {
  const kinds = {
    primary: 'bg-label text-white',
    secondary: 'bg-fill3 text-label',
    blue: 'bg-blue text-white',
  }
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} disabled={disabled} className={cx('flex h-[50px] w-full items-center justify-center gap-2 rounded-full text-headline disabled:opacity-40', kinds[kind], className)}>
      {children}
    </motion.button>
  )
}

export function Pill({ children, onClick, primary }: { children: ReactNode; onClick?: () => void; primary?: boolean }) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick} className={cx('rounded-full px-3.5 py-2 text-sub font-semibold', primary ? 'bg-blue text-white' : 'bg-fill3 text-label')}>
      {children}
    </motion.button>
  )
}

export function Toggle({ on, onChange }: { on: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange?.(!on)} className={cx('relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors', on ? 'bg-green' : 'bg-gray-4')} aria-pressed={on}>
      <motion.span layout className="absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow" style={{ left: on ? 22 : 2 }} />
    </button>
  )
}

export function Check({ on }: { on: boolean }) {
  return (
    <span className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-full', on ? 'bg-blue text-white' : 'border-2 border-gray-3')}>
      {on && <CheckIcon size={14} strokeWidth={3} />}
    </span>
  )
}

export function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-5">
      <motion.div className="h-full rounded-full" style={{ background: color }} initial={false} animate={{ width: `${Math.max(pct * 100, 3)}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
    </div>
  )
}

export function NavBar({ back, onBack, right }: { back?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="flex h-11 items-center">
      {back && (
        <button onClick={onBack} className="-ml-1.5 flex items-center text-body text-blue active:opacity-50">
          <ChevronLeft size={26} strokeWidth={2.2} />
          {back}
        </button>
      )}
      <div className="flex-1" />
      {right}
    </div>
  )
}

export function Sheet({ open, onClose, title, children, footer, top = 58 }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; top?: number }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="absolute inset-0 z-30 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="absolute inset-x-0 bottom-0 z-40 flex flex-col rounded-t-[34px] bg-white"
            style={{ top }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => i.offset.y > 120 && onClose()}
          >
            <div className="flex justify-center pt-2">
              <div className="h-[5px] w-9 rounded-full bg-gray-3" />
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center px-5 pb-2 pt-2">
              <button onClick={onClose} className="justify-self-start text-body text-blue active:opacity-50">Cancel</button>
              <div className="text-headline">{title}</div>
              <div />
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">{children}</div>
            {footer && <div className="px-6 pb-[calc(var(--safe-bottom)+8px)] pt-2">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// A full-height screen: scrolling content plus an optional bar pinned above the home indicator.
export function Screen({ children, bottom, pad = 'pb-36' }: { children: ReactNode; bottom?: ReactNode; pad?: string }) {
  return (
    <div className="absolute inset-0">
      <div className={cx('no-scrollbar absolute inset-0 overflow-y-auto px-5', pad)} style={{ paddingTop: 'calc(var(--safe-top) + 4px)' }}>
        {children}
      </div>
      {bottom && (
        <div className="absolute inset-x-0 z-20 px-6" style={{ bottom: 'calc(var(--safe-bottom) + 6px)' }}>
          {bottom}
        </div>
      )}
    </div>
  )
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-center">
      <h2 className="flex-1 text-title3">{children}</h2>
      {right}
    </div>
  )
}

export { cx }
