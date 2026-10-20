import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { ME, SPENT_BEFORE_DINNER, people } from '../data'
import { balances, simplify, useTrip } from '../store'
import { Button, Card, Row, Screen } from '../components/ui'

export default function Squared() {
  const s = useTrip()
  // Transfers are computed from balances before settling, so the list shows what was paid.
  const transfers = simplify(balances(s))
  const total = transfers.reduce((a, t) => a + t.amount, 0)

  return (
    <Screen
      bottom={
        <div className="space-y-2.5">
          <Button kind="secondary" onClick={() => s.showToast('Recap link copied', 'neutral')}>Share trip recap</Button>
          <Button onClick={() => s.reset()}>Plan the next trip</Button>
        </div>
      }
      pad="pb-44"
    >
      <div className="flex flex-col items-center pt-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-green text-white"
        >
          <Check size={48} strokeWidth={3} />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-5 text-title1">
          All squared up
        </motion.h1>
        <p className="mt-2 px-4 text-sub text-label-2">
          Lisbon with the crew · {transfers.length} transfers · €{total} settled. Everyone just got a notification.
        </p>
      </div>

      <Card className="mt-6">
        {transfers.map((t, i) => (
          <motion.div key={t.from} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
            <Row
              title={`${people[t.from].name} paid ${t.to === ME ? 'you' : people[t.to].name}`}
              right={<span className="font-semibold text-green">€{t.amount} ✓</span>}
              last={i === transfers.length - 1}
            />
          </motion.div>
        ))}
      </Card>

      <div className="mt-3 grid grid-cols-4 rounded-2xl bg-gray-6 py-3.5 text-center">
        {[
          ['4', 'days'],
          ['12', 'places'],
          ['3', 'polls'],
          [`€${(SPENT_BEFORE_DINNER + s.dinnerTotal).toLocaleString('en-US')}`, 'spent'],
        ].map(([v, k]) => (
          <div key={k}>
            <div className="text-headline">{v}</div>
            <div className="text-cap text-label-2">{k}</div>
          </div>
        ))}
      </div>
    </Screen>
  )
}
