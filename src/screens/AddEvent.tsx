import { motion } from 'framer-motion'
import { BedDouble, CalendarDays, Clock, Landmark, Plane, Users, Utensils } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CREW } from '../data'
import { useTrip } from '../store'
import { AvatarStack, Button, Card, Row, Segmented, Sheet, cx } from '../components/ui'

const kinds = [
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'activity', label: 'Activity', icon: Landmark },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'stay', label: 'Stay', icon: BedDouble },
]
const days = [
  { id: 'Tonight', label: 'Tonight', full: 'Tonight · Sat 18 Oct' },
  { id: 'Tomorrow', label: 'Tomorrow', full: 'Tomorrow · Sun 19 Oct' },
]
const times = ['19:30', '20:00', '20:30', '21:00', '21:30']

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.94 }} onClick={onClick} className={cx('rounded-full px-3 py-[7px] text-foot font-semibold transition-colors', on ? 'bg-blue text-white' : 'bg-fill3 text-label')}>
      {children}
    </motion.button>
  )
}

export default function AddEvent({ open }: { open: boolean }) {
  const close = () => useTrip.getState().openSheet(null)
  const addDinner = useTrip((s) => s.addDinner)
  const toast = useTrip((s) => s.showToast)
  const [name, setName] = useState('Final dinner')
  const [kind, setKind] = useState('food')
  const [day, setDay] = useState('Tonight')
  const [time, setTime] = useState('21:00')
  const [where, setWhere] = useState<'poll' | 'known'>('poll')
  useEffect(() => {
    if (open) {
      setName('Final dinner')
      setDay('Tonight')
      setTime('21:00')
    }
  }, [open])

  return (
    <Sheet open={open} onClose={close} title="Add to the plan" footer={<Button onClick={() => addDinner({ name, day, time })}>Add to {day.toLowerCase()}</Button>}>
      <label className="block rounded-xl bg-fill3 px-3.5 py-2.5">
        <span className="block text-cap text-label-2">Event name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent text-body outline-none" />
      </label>

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

      <Card className="mt-3">
        <Row lead={<CalendarDays size={20} className="text-red" />} title="Day" right={days.find((d) => d.id === day)?.full ?? day} />
        <Row lead={<Clock size={20} className="text-blue" />} title="Time" right={time} last />
      </Card>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {days.map((d) => (
          <Chip key={d.id} on={day === d.id} onClick={() => setDay(d.id)}>
            {d.label}
          </Chip>
        ))}
        <Chip on={false} onClick={() => toast('The date picker is not part of this demo', 'neutral')}>
          Pick date
        </Chip>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {times.map((t) => (
          <Chip key={t} on={time === t} onClick={() => setTime(t)}>
            {t}
          </Chip>
        ))}
      </div>

      <div className="mb-2 mt-4 text-headline">Where</div>
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

      <div className="mb-2 mt-4 text-headline">Who’s coming</div>
      <Card>
        <Row lead={<Users size={20} className="text-indigo" />} title="Everyone on the trip" sub="Invite guests to just this event after adding it" trail={<AvatarStack ids={CREW.slice(0, 3)} size={26} />} last />
      </Card>
    </Sheet>
  )
}
