import { motion } from 'framer-motion'
import { BedDouble, CalendarDays, Clock, Landmark, Plane, Users, Utensils, Vote } from 'lucide-react'
import { useState } from 'react'
import { CREW } from '../data'
import { useTrip } from '../store'
import { AvatarStack, Button, Card, Row, Segmented, Sheet, cx } from '../components/ui'

const kinds = [
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'activity', label: 'Activity', icon: Landmark },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'stay', label: 'Stay', icon: BedDouble },
]

export default function AddEvent({ open }: { open: boolean }) {
  const close = () => useTrip.getState().openSheet(null)
  const addDinner = useTrip((s) => s.addDinner)
  const toast = useTrip((s) => s.showToast)
  const [kind, setKind] = useState('food')
  const [where, setWhere] = useState<'poll' | 'known'>('poll')

  return (
    <Sheet open={open} onClose={close} title="Add to the plan" footer={<Button onClick={addDinner}>Add to tonight</Button>}>
      <div className="rounded-xl bg-fill3 px-3.5 py-3">
        <div className="text-cap text-label-2">Event name</div>
        <div className="flex items-center text-body">
          Final dinner
          <span className="ml-0.5 h-5 w-[2px] animate-pulse bg-blue" />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {kinds.map((k) => {
          const Icon = k.icon
          const on = kind === k.id
          return (
            <motion.button
              key={k.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => setKind(k.id)}
              className={cx('flex flex-col items-center gap-1 rounded-xl py-2.5 text-foot font-semibold ring-2', on ? 'bg-blue/10 text-blue ring-blue' : 'bg-gray-6 text-label-2 ring-transparent')}
            >
              <Icon size={20} />
              {k.label}
            </motion.button>
          )
        })}
      </div>

      <Card className="mt-4">
        <Row lead={<CalendarDays size={20} className="text-red" />} title="Day" right="Tonight · Sat 18 Oct" />
        <Row lead={<Clock size={20} className="text-blue" />} title="Time" right="21:00" last />
      </Card>

      <div className="mb-2 mt-5 text-headline">Where</div>
      <Segmented
        items={[
          { id: 'known', label: 'I know the place' },
          { id: 'poll', label: 'Let the group vote' },
        ]}
        value={where}
        onChange={(v) => {
          setWhere(v)
          if (v === 'known') toast('In this demo the group picks the place with a poll', 'neutral')
        }}
      />
      <div className="mt-2 flex items-start gap-2 text-foot text-label-2">
        <Vote size={16} className="mt-px shrink-0 text-blue" />
        The dinner goes into tonight’s plan now. You can start a poll for the restaurant from the event.
      </div>

      <div className="mb-2 mt-5 text-headline">Who’s coming</div>
      <Card>
        <Row lead={<Users size={20} className="text-indigo" />} title="Everyone on the trip" sub="You can invite guests to just this dinner after adding it" trail={<AvatarStack ids={CREW} size={26} />} last />
      </Card>
    </Sheet>
  )
}
