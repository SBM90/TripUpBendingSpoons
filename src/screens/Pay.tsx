import { motion } from 'framer-motion'
import { Check as CheckIcon, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { nicBreakdown } from '../data'
import { balances, simplify, useTrip } from '../store'
import { Avatar, Button, Card, Check, Row, Sheet } from '../components/ui'

const methods = [
  { id: 'bank', title: 'Bank transfer', sub: 'Instant · Ari’s IBAN saved' },
  { id: 'mbway', title: 'MB Way' },
  { id: 'revolut', title: 'Revolut' },
]

export default function Pay({ open }: { open: boolean }) {
  const pay = useTrip((s) => s.pay)
  const owed = useTrip((s) => simplify(balances(s)).find((t) => t.from === 'nic')?.amount ?? 0)
  const dinnerShare = useTrip((s) => Math.round(s.dinnerShares?.nic ?? 27))
  const breakdown = nicBreakdown.map((b, i) => (i === 0 ? { ...b, amount: dinnerShare } : b))
  const [method, setMethod] = useState('bank')
  const [state, setState] = useState<'idle' | 'paying' | 'done'>('idle')

  useEffect(() => {
    if (open) setState('idle')
  }, [open])

  const submit = () => {
    setState('paying')
    setTimeout(() => {
      setState('done')
      pay()
    }, 1100)
  }
  const close = () => {
    if (state === 'idle') useTrip.getState().switchPhone('ari', { sheet: null, screen: 'hub', hubTab: 'money' }, 'Back on Ari’s phone', 'Nic hasn’t paid yet.')
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Settle up"
      top={96}
      footer={
        <Button onClick={submit} disabled={state !== 'idle'} kind={state === 'done' ? 'blue' : 'primary'}>
          {state === 'idle' && `Pay €${owed}`}
          {state === 'paying' && (
            <>
              <Loader2 size={20} className="animate-spin" /> Sending…
            </>
          )}
          {state === 'done' && (
            <>
              <CheckIcon size={20} strokeWidth={3} /> Sent to Ari
            </>
          )}
        </Button>
      }
    >
      <div className="mb-3 flex justify-center">
        <span className="rounded-full bg-indigo/10 px-3 py-1 text-cap font-semibold text-indigo">Nic’s view</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <Avatar id="ari" size={28} ring={false} />
          <span className="text-headline text-label-2">Pay Ari</span>
        </div>
        <motion.div key={state} initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="text-large">
          €{owed}.00
        </motion.div>
      </div>

      <Card className="mt-4">
        {breakdown.map((b, i) => (
          <Row key={b.label} title={b.label} right={`€${b.amount}`} last={i === breakdown.length - 1} />
        ))}
      </Card>

      <div className="mb-2 mt-4 text-foot font-semibold text-label-2">Pay with</div>
      <Card>
        {methods.map((m, i) => (
          <Row key={m.id} title={m.title} sub={m.sub} trail={<Check on={method === m.id} />} onClick={() => state === 'idle' && setMethod(m.id)} last={i === methods.length - 1} />
        ))}
      </Card>
    </Sheet>
  )
}
