import { AnimatePresence, motion } from 'framer-motion'
import { Check, Link2, ScanLine } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DINNER_TOTAL, PersonId, dinnerItems, people, restaurantById } from '../data'
import { members, useTrip } from '../store'
import { Button, Card, Row, Sheet, cx } from '../components/ui'

const fmt = (n: number) => (Number.isInteger(Math.round(n * 100) / 100) ? `€${Math.round(n)}` : `€${n.toFixed(2)}`)

export default function AddExpense({ open }: { open: boolean }) {
  const close = () => useTrip.getState().openSheet(null)
  const saveExpense = useTrip((s) => s.saveExpense)
  const toast = useTrip((s) => s.showToast)
  const poll = useTrip((s) => s.poll)
  const renAdded = useTrip((s) => s.renAdded)
  const crew = useMemo(() => members({ renAdded }), [renAdded])
  const place = poll?.winner ? restaurantById(poll.winner).name : 'Dinner'

  const [split, setSplit] = useState<Record<string, PersonId[]>>({})
  useEffect(() => {
    if (open) setSplit(Object.fromEntries(dinnerItems.map((i) => [i.id, crew])))
  }, [open, crew])

  const shares = useMemo(() => {
    const out: Partial<Record<PersonId, number>> = {}
    for (const item of dinnerItems) {
      const who = split[item.id] ?? crew
      if (!who.length) continue
      for (const p of who) out[p] = (out[p] ?? 0) + item.amount / who.length
    }
    return out
  }, [split, crew])

  const groups = useMemo(() => {
    const m = new Map<string, PersonId[]>()
    for (const p of crew) {
      const k = (shares[p] ?? 0).toFixed(2)
      m.set(k, [...(m.get(k) ?? []), p])
    }
    return [...m.entries()].sort((a, b) => Number(b[0]) - Number(a[0]))
  }, [shares, crew])

  const unassigned = dinnerItems.some((i) => (split[i.id] ?? crew).length === 0)
  const toggle = (item: string, p: PersonId) =>
    setSplit((s) => {
      const cur = s[item] ?? crew
      return { ...s, [item]: cur.includes(p) ? cur.filter((x) => x !== p) : crew.filter((x) => cur.includes(x) || x === p) }
    })

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Add expense"
      footer={
        <Button onClick={() => saveExpense(shares)} disabled={unassigned}>
          {unassigned ? 'Every item needs someone' : 'Save expense'}
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-1.5 pb-1 pt-1">
        <div className="text-large">€{DINNER_TOTAL}.00</div>
        <span className="flex items-center gap-1.5 rounded-full bg-fill3 px-3 py-1.5 text-foot">
          <Link2 size={14} /> Linked to Dinner · {place}
        </span>
      </div>

      <Card className="mt-3">
        <Row title="Paid by" right="Ari (you)" />
        <Row title="Split" right={<span className="text-blue">By item</span>} last />
      </Card>

      <div className="mb-2 mt-4 flex items-center">
        <span className="flex-1 text-foot font-semibold text-label-2">Items · tap a name to leave them out</span>
        <button onClick={() => toast('Receipt scan is not part of this demo', 'neutral')} className="flex items-center gap-1 text-foot font-semibold text-blue">
          <ScanLine size={15} /> Scan receipt
        </button>
      </div>

      <div className="space-y-2.5">
        {dinnerItems.map((item) => {
          const who = split[item.id] ?? crew
          const partial = who.length < crew.length
          return (
            <motion.div layout key={item.id} className={cx('rounded-2xl p-3.5 ring-2 transition-colors', partial ? 'bg-white ring-blue' : 'bg-gray-6 ring-transparent')}>
              <div className="flex items-center">
                <span className="flex-1 text-headline">{item.label}</span>
                <span className="text-headline">€{item.amount}</span>
              </div>
              <div className="mb-2.5 text-foot text-label-2">
                {who.length ? `${who.length} ${who.length === 1 ? 'person' : 'people'} · ${fmt(item.amount / who.length)} each` : 'Nobody selected'}
                {partial && who.length > 0 && ` · ${crew.filter((p) => !who.includes(p)).map((p) => people[p].name).join(' and ')} skipped`}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {crew.map((p) => {
                  const on = who.includes(p)
                  return (
                    <motion.button
                      key={p}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => toggle(item.id, p)}
                      className={cx('flex items-center gap-1 rounded-full px-2.5 py-[5px] text-foot font-semibold', on ? 'bg-blue text-white' : 'border border-dashed border-gray-3 bg-white text-label-2 line-through')}
                    >
                      {on && <Check size={12} strokeWidth={3} />}
                      {people[p].name}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>

      <Card className="mt-3">
        <AnimatePresence initial={false}>
          {groups.map(([amt, ps], i) => (
            <motion.div key={amt + ps.join()} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Row title={ps.map((p) => people[p].name).join(', ')} right={<span className="font-semibold text-label">{fmt(Number(amt))} each</span>} last={i === groups.length - 1} />
            </motion.div>
          ))}
        </AnimatePresence>
      </Card>
    </Sheet>
  )
}
