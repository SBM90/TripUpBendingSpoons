import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, ChevronRight, Plus, ScanLine, Trash2, UserPlus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PersonId, dinnerItems, people, restaurantById } from '../data'
import { ExpenseItem, members, useTrip } from '../store'
import { Avatar, AvatarStack, Button, Sheet, cx } from '../components/ui'

const fmt = (n: number) => (Math.abs(n - Math.round(n)) < 0.005 ? `€${Math.round(n)}` : `€${n.toFixed(2)}`)
const names = (ps: PersonId[]) => (ps.length < 2 ? ps.map((p) => people[p].name).join('') : `${ps.slice(0, -1).map((p) => people[p].name).join(', ')} and ${people[ps[ps.length - 1]].name}`)

export default function AddExpense({ open }: { open: boolean }) {
  const close = () => useTrip.setState({ sheet: null, expenseMode: 'new' })
  const saveExpense = useTrip((s) => s.saveExpense)
  const toast = useTrip((s) => s.showToast)
  const poll = useTrip((s) => s.poll)
  const renAdded = useTrip((s) => s.renAdded)
  const mode = useTrip((s) => s.expenseMode)
  const saved = useTrip((s) => s.expenseItems)
  const savedPeople = useTrip((s) => s.expensePeople)
  const crew = useMemo(() => members({ renAdded }), [renAdded])
  const place = poll?.winner ? restaurantById(poll.winner).name : 'Dinner'
  const editing = mode === 'edit' && !!saved
  // People who joined after the bill was logged: they start off every item until someone taps them in.
  const newcomers = editing ? crew.filter((p) => !savedPeople.includes(p)) : []

  const [items, setItems] = useState<ExpenseItem[]>([])
  const [openItem, setOpenItem] = useState<string | null>(null)
  useEffect(() => {
    if (!open) return
    setItems(editing ? saved!.map((i) => ({ ...i })) : dinnerItems.map((i) => ({ ...i, who: crew })))
    setOpenItem(editing && newcomers.length ? 'all' : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

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
  const update = (id: string, patch: Partial<ExpenseItem>) => setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  const toggle = (id: string, p: PersonId) =>
    setItems((list) => list.map((i) => (i.id !== id ? i : { ...i, who: i.who.includes(p) ? i.who.filter((x) => x !== p) : crew.filter((x) => i.who.includes(x) || x === p) })))
  const addItem = () => {
    const id = `custom-${Date.now()}`
    setItems((list) => [...list, { id, label: '', amount: 0, who: crew, custom: true }])
    setOpenItem(id)
  }
  const isOpen = (id: string) => openItem === 'all' || openItem === id

  return (
    <Sheet
      open={open}
      onClose={close}
      title={editing ? 'Edit expense' : 'Add expense'}
      footer={
        <Button onClick={() => saveExpense(shares, Math.round(total * 100) / 100, items)} disabled={invalid || total <= 0}>
          {invalid ? 'Every item needs someone' : editing ? 'Save changes' : 'Save expense'}
        </Button>
      }
    >
      {newcomers.length > 0 && (
        <div className="mb-3 flex items-start gap-2.5 rounded-2xl bg-orange/10 p-3">
          <UserPlus size={18} className="mt-0.5 shrink-0 text-orange" />
          <div className="text-foot">
            <span className="font-semibold text-orange">{names(newcomers)} joined after this was logged.</span> Tap {newcomers.length > 1 ? 'them' : 'him'} on the items {newcomers.length > 1 ? 'they' : 'he'} shared.
          </div>
        </div>
      )}

      <div className="text-center">
        <motion.div key={total} initial={{ scale: 0.96 }} animate={{ scale: 1 }} className="text-large">
          €{total.toFixed(2)}
        </motion.div>
        <div className="mt-0.5 text-foot text-label-2">
          {place} · paid by Ari ·{' '}
          <button onClick={() => toast('Changing the payer is not part of this demo', 'neutral')} className="font-semibold text-blue">
            Change
          </button>
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.98 }} onClick={() => toast('Receipt scanning is not part of this demo', 'neutral')} className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-blue/10 px-3.5 py-2.5 text-left">
        <ScanLine size={20} className="text-blue" />
        <span className="flex-1 text-sub font-semibold text-blue">Scan receipt</span>
        <ChevronRight size={18} className="text-blue" />
      </motion.button>

      <div className="mb-1.5 mt-4 px-1 text-foot text-label-2">Tap an item to choose who shared it</div>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const out = crew.filter((p) => !item.who.includes(p))
            const empty = item.who.length === 0
            const expanded = isOpen(item.id)
            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={cx('rounded-2xl px-3.5 py-3 ring-2 transition-colors', empty && item.amount ? 'bg-white ring-red' : expanded ? 'bg-white ring-blue' : 'bg-gray-6 ring-transparent')}
              >
                {item.custom ? (
                  <div className="flex items-center gap-2">
                    <input value={item.label} onChange={(e) => update(item.id, { label: e.target.value })} placeholder="Dessert, tip, taxi…" className="min-w-0 flex-1 bg-transparent text-headline outline-none placeholder:text-label-3" />
                    <span className="text-headline text-label-2">€</span>
                    <input
                      inputMode="decimal"
                      value={item.amount ? String(item.amount) : ''}
                      onChange={(e) => update(item.id, { amount: Number(e.target.value.replace(',', '.')) || 0 })}
                      placeholder="0"
                      className="w-14 bg-transparent text-right text-headline outline-none placeholder:text-label-3"
                    />
                    <button onClick={() => setItems((l) => l.filter((i) => i.id !== item.id))} aria-label="Remove item" className="text-label-3">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : null}
                <button data-item={item.id} onClick={() => setOpenItem(expanded ? null : item.id)} className="flex w-full items-center gap-2 text-left">
                  <div className="min-w-0 flex-1">
                    {!item.custom && (
                      <div className="flex items-baseline">
                        <span className="flex-1 text-headline">{item.label}</span>
                        <span className="text-headline">€{item.amount}</span>
                      </div>
                    )}
                    <div className={cx('text-foot', empty && item.amount ? 'font-semibold text-red' : 'text-label-2')}>
                      {empty ? 'Nobody selected' : out.length === 0 ? 'Everyone' : `${item.who.length} people · ${names(out)} not in`}
                      {!empty && item.amount ? ` · ${fmt(item.amount / item.who.length)} each` : ''}
                    </div>
                  </div>
                  {!expanded && <AvatarStack ids={item.who.slice(0, 4)} size={22} />}
                  <ChevronDown size={16} className={cx('shrink-0 text-label-3 transition-transform', expanded && 'rotate-180')} />
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-6 gap-1 pt-3">
                        {crew.map((p) => {
                          const on = item.who.includes(p)
                          const isNew = newcomers.includes(p)
                          return (
                            <motion.button key={p} data-chip={p} whileTap={{ scale: 0.9 }} onClick={() => toggle(item.id, p)} aria-pressed={on} className="flex flex-col items-center gap-1">
                              <span className="relative">
                                <span className={cx('block rounded-full transition-all', !on && 'opacity-30 grayscale', isNew && !on && 'ring-2 ring-orange ring-offset-2')}>
                                  <Avatar id={p} size={36} ring={false} />
                                </span>
                                <span className={cx('absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full ring-2 ring-white', on ? 'bg-blue text-white' : 'bg-gray-3 text-white')}>
                                  {on ? <Check size={11} strokeWidth={3.5} /> : <X size={11} strokeWidth={3.5} />}
                                </span>
                                {isNew && <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-orange px-1.5 text-[9px] font-bold uppercase text-white">New</span>}
                              </span>
                              <span className={cx('text-cap font-semibold', on ? 'text-label' : 'text-label-3 line-through')}>{people[p].name}</span>
                            </motion.button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <button onClick={addItem} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed border-blue/60 py-2.5 text-sub font-semibold text-blue">
        <Plus size={17} /> Add expense item
      </button>

      <div className="mt-3 flex items-center gap-3 px-1">
        {groups.map(([amt, ps]) => (
          <div key={amt + ps.join()} className="min-w-0 flex-1">
            <div className="truncate text-cap text-label-2">{ps.map((p) => people[p].name).join(', ')}</div>
            <div className="text-headline">{fmt(Number(amt))}</div>
          </div>
        ))}
      </div>
    </Sheet>
  )
}
