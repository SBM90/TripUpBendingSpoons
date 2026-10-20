import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronRight, Link2, Plus, ScanLine, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PersonId, dinnerItems, people, restaurantById } from '../data'
import { members, useTrip } from '../store'
import { Avatar, Button, Sheet, cx } from '../components/ui'

const fmt = (n: number) => (Math.abs(n - Math.round(n)) < 0.005 ? `€${Math.round(n)}` : `€${n.toFixed(2)}`)

interface Item {
  id: string
  label: string
  amount: number
  who: PersonId[]
  custom?: boolean
}

export default function AddExpense({ open }: { open: boolean }) {
  const close = () => useTrip.getState().openSheet(null)
  const saveExpense = useTrip((s) => s.saveExpense)
  const toast = useTrip((s) => s.showToast)
  const poll = useTrip((s) => s.poll)
  const renAdded = useTrip((s) => s.renAdded)
  const crew = useMemo(() => members({ renAdded }), [renAdded])
  const place = poll?.winner ? restaurantById(poll.winner).name : 'Dinner'

  const [items, setItems] = useState<Item[]>([])
  useEffect(() => {
    if (open) setItems(dinnerItems.map((i) => ({ ...i, who: crew })))
  }, [open, crew])

  const total = items.reduce((a, i) => a + (i.amount || 0), 0)
  const shares = useMemo(() => {
    const out: Partial<Record<PersonId, number>> = {}
    for (const item of items) {
      if (!item.who.length || !item.amount) continue
      for (const p of item.who) out[p] = (out[p] ?? 0) + item.amount / item.who.length
    }
    return out
  }, [items])
  const groups = useMemo(() => {
    const m = new Map<string, PersonId[]>()
    for (const p of crew) {
      const k = (shares[p] ?? 0).toFixed(2)
      m.set(k, [...(m.get(k) ?? []), p])
    }
    return [...m.entries()].sort((a, b) => Number(b[0]) - Number(a[0]))
  }, [shares, crew])

  const invalid = items.some((i) => i.amount > 0 && i.who.length === 0)
  const update = (id: string, patch: Partial<Item>) => setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  const toggle = (id: string, p: PersonId) =>
    setItems((list) => list.map((i) => (i.id !== id ? i : { ...i, who: i.who.includes(p) ? i.who.filter((x) => x !== p) : crew.filter((x) => i.who.includes(x) || x === p) })))
  const addItem = () => setItems((list) => [...list, { id: `custom-${Date.now()}`, label: '', amount: 0, who: crew, custom: true }])

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Add expense"
      footer={
        <Button onClick={() => saveExpense(shares, Math.round(total * 100) / 100)} disabled={invalid || total <= 0}>
          {invalid ? 'Every item needs someone' : 'Save expense'}
        </Button>
      }
    >
      <div className="flex items-center gap-2">
        <motion.div key={total} initial={{ scale: 0.96 }} animate={{ scale: 1 }} className="flex-1 text-large">
          €{total.toFixed(2)}
        </motion.div>
        <span className="flex items-center gap-1.5 rounded-full bg-fill3 px-2.5 py-1.5 text-foot">
          <Link2 size={13} /> Dinner · {place}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-gray-6 px-3.5 py-3">
        <Avatar id="ari" ring={false} />
        <div className="min-w-0 flex-1">
          <div className="text-body">Paid by Ari (you)</div>
          <div className="text-foot text-label-2">Added by Ari just now · split by item</div>
        </div>
        <button onClick={() => toast('Changing the payer is not part of this demo', 'neutral')} className="text-foot font-semibold text-blue">Change</button>
      </div>

      <motion.button whileTap={{ scale: 0.98 }} onClick={() => toast('Receipt scanning is not part of this demo', 'neutral')} className="mt-2.5 flex w-full items-center gap-3 rounded-2xl bg-blue/10 px-3.5 py-3 text-left">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-blue text-white">
          <ScanLine size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sub font-semibold text-blue">Scan receipt</span>
          <span className="block text-foot text-label-2">Fill the items from a photo of the bill</span>
        </span>
        <ChevronRight size={18} className="text-blue" />
      </motion.button>

      <div className="mb-2 mt-4 text-foot font-semibold text-label-2">Items · tap a name to leave them out</div>
      <div className="space-y-2.5">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const partial = item.who.length < crew.length
            const empty = item.who.length === 0
            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={cx('rounded-2xl p-3.5 ring-2 transition-colors', empty && item.amount ? 'bg-white ring-red' : partial ? 'bg-white ring-blue' : 'bg-gray-6 ring-transparent')}
              >
                <div className="flex items-center gap-2">
                  {item.custom ? (
                    <>
                      <input autoFocus value={item.label} onChange={(e) => update(item.id, { label: e.target.value })} placeholder="Dessert, tip, taxi…" className="min-w-0 flex-1 bg-transparent text-headline outline-none placeholder:text-label-3" />
                      <span className="text-headline text-label-2">€</span>
                      <input
                        inputMode="decimal"
                        value={item.amount ? String(item.amount) : ''}
                        onChange={(e) => update(item.id, { amount: Number(e.target.value.replace(',', '.')) || 0 })}
                        placeholder="0"
                        className="w-16 bg-transparent text-right text-headline outline-none placeholder:text-label-3"
                      />
                      <button onClick={() => setItems((l) => l.filter((i) => i.id !== item.id))} aria-label="Remove item" className="text-label-3">
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-headline">{item.label}</span>
                      <span className="text-headline">€{item.amount}</span>
                    </>
                  )}
                </div>
                <div className={cx('mb-2.5 text-foot', empty && item.amount ? 'font-semibold text-red' : 'text-label-2')}>
                  {empty
                    ? 'Nobody selected'
                    : `${item.who.length} ${item.who.length === 1 ? 'person' : 'people'}${item.amount ? ` · ${fmt(item.amount / item.who.length)} each` : ''}`}
                  {partial && !empty && ` · ${crew.filter((p) => !item.who.includes(p)).map((p) => people[p].name).join(' and ')} skipped`}
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {crew.map((p) => {
                    const on = item.who.includes(p)
                    return (
                      <motion.button key={p} data-chip={p} whileTap={{ scale: 0.9 }} onClick={() => toggle(item.id, p)} aria-pressed={on} className="flex flex-col items-center gap-1">
                        <span className="relative">
                          <span className={cx('block transition-all', !on && 'opacity-30 grayscale')}>
                            <Avatar id={p} size={36} ring={false} />
                          </span>
                          <span className={cx('absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full ring-2 ring-white', on ? 'bg-blue text-white' : 'bg-gray-3 text-white')}>
                            {on ? <Check size={11} strokeWidth={3.5} /> : <X size={11} strokeWidth={3.5} />}
                          </span>
                        </span>
                        <span className={cx('text-cap font-semibold', on ? 'text-label' : 'text-label-3 line-through')}>{people[p].name}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <motion.button whileTap={{ scale: 0.98 }} onClick={addItem} className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-blue py-3">
        <Plus size={18} className="text-blue" />
        <span className="text-sub font-semibold text-blue">Add expense item</span>
        <span className="text-foot text-label-2">tips, taxi, dessert…</span>
      </motion.button>

      <div className="mt-2.5 flex items-center gap-3 rounded-2xl bg-gray-6 px-3.5 py-2.5">
        {groups.map(([amt, ps]) => (
          <div key={amt + ps.join()} className="min-w-0 flex-1">
            <div className="truncate text-foot text-label-2">{ps.map((p) => people[p].name).join(', ')}</div>
            <div className="text-headline">{fmt(Number(amt))} each</div>
          </div>
        ))}
        <span className="shrink-0 rounded-full bg-green px-2 py-0.5 text-foot font-semibold text-white">€{Math.round(total * 100) / 100} ✓</span>
      </div>
    </Sheet>
  )
}
