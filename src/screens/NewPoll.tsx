import { Plus, Utensils } from 'lucide-react'
import { useState } from 'react'
import { restaurants } from '../data'
import { members, useTrip } from '../store'
import { Button, Card, Check, Row, Sheet, Toggle } from '../components/ui'

export default function NewPoll({ open }: { open: boolean }) {
  const close = () => useTrip.getState().openSheet(null)
  const sendPoll = useTrip((s) => s.sendPoll)
  const toast = useTrip((s) => s.showToast)
  const count = useTrip((s) => members(s).length)
  const [picked, setPicked] = useState<string[]>(restaurants.map((r) => r.id))
  const [addToPlan, setAddToPlan] = useState(true)
  const [anon, setAnon] = useState(false)

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  const ordered = restaurants.map((r) => r.id).filter((id) => picked.includes(id))

  return (
    <Sheet
      open={open}
      onClose={close}
      title="New poll"
      footer={
        <Button onClick={() => sendPoll(ordered)} disabled={ordered.length < 2}>
          {ordered.length < 2 ? 'Pick at least 2 options' : `Send to the group (${count})`}
        </Button>
      }
    >
      <div className="rounded-xl bg-fill3 px-3.5 py-3">
        <div className="text-cap text-label-2">Question</div>
        <div className="text-body">Where should we eat tonight?</div>
      </div>

      <div className="mb-2 mt-4 flex items-center">
        <span className="flex-1 text-foot font-semibold text-label-2">Options · nearby, open now</span>
        <button onClick={() => toast('Search is not part of this demo', 'neutral')} className="text-foot font-semibold text-blue">Search</button>
      </div>
      <div className="space-y-2.5">
        {restaurants.map((r) => (
          <button key={r.id} onClick={() => toggle(r.id)} className="flex w-full items-center gap-3 rounded-[14px] bg-gray-6 p-3 text-left active:opacity-70">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] text-white" style={{ background: r.tint }}>
              <Utensils size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-headline">{r.name}</div>
              <div className="text-foot text-label-2">
                {r.vibe} · {r.price} · {r.walk}
              </div>
            </div>
            <Check on={picked.includes(r.id)} />
          </button>
        ))}
      </div>
      <button onClick={() => toast('Custom options are not part of this demo', 'neutral')} className="mt-3 flex items-center gap-1 text-sub font-semibold text-blue">
        <Plus size={18} /> Add another option
      </button>

      <Card className="mt-4">
        <Row title="Closes" right={<span className="text-foot">In 30 min or when all vote</span>} />
        <Row title="Add winner to itinerary" trail={<Toggle on={addToPlan} onChange={setAddToPlan} />} />
        <Row title="Anonymous votes" trail={<Toggle on={anon} onChange={setAnon} />} last />
      </Card>
    </Sheet>
  )
}
