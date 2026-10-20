import { CalendarPlus, Check, ChevronRight, GlassWater, Utensils } from 'lucide-react'
import type { ReactNode } from 'react'
import { restaurantById } from '../data'
import { useTrip } from '../store'
import { Sheet, cx } from '../components/ui'

// Polls and expenses always belong to an event. This sheet asks which one.
export default function EventPicker({ open }: { open: boolean }) {
  const s = useTrip()
  const forPoll = s.pickFor === 'poll'
  const close = () => useTrip.setState({ sheet: null })
  const winner = s.poll?.winner ? restaurantById(s.poll.winner) : null

  const pickDinner = () => {
    if (forPoll) {
      if (s.poll?.status === 'live') return s.go('poll')
      if (s.poll?.status === 'closed') return s.showToast(`The dinner is decided: ${winner?.name}`, 'neutral')
      return useTrip.setState({ sheet: 'newPoll' })
    }
    if (!winner) return s.showToast('Decide the dinner place first, then log the bill', 'neutral')
    return s.dinnerShares ? s.editExpense() : useTrip.setState({ sheet: 'addExpense', expenseMode: 'new' })
  }
  const dinnerSub = forPoll
    ? s.poll?.status === 'live'
      ? 'Poll running · tap to see it'
      : s.poll?.status === 'closed'
        ? `Decided · ${winner?.name}`
        : 'Place not decided yet'
    : winner
      ? s.dinnerShares
        ? `€${s.dinnerTotal} logged · tap to edit`
        : `${winner.name} · ready for the bill`
      : 'Decide the place before logging the bill'

  return (
    <Sheet open={open} onClose={close} title={forPoll ? 'New poll for…' : 'Add expense to…'}>
      <p className="mb-3 text-foot text-label-2">{forPoll ? 'Every poll belongs to an event, so the winner lands in the right slot.' : 'Every expense belongs to an event, so the right people share it.'}</p>
      <div className="space-y-2">
        <Option icon={<Check size={18} />} title="Belém Tower · 10:00" sub="Already happened" muted onClick={() => s.showToast('This event is over', 'neutral')} />
        <Option icon={<Check size={18} />} title="LX Factory · 15:00" sub="Already happened" muted onClick={() => s.showToast('This event is over', 'neutral')} />
        {s.dinnerAdded && <Option icon={<Utensils size={18} />} tint="bg-orange" title={`${winner ? winner.name : s.dinnerName} · ${s.dinnerTime}`} sub={dinnerSub} onClick={pickDinner} highlight />}
        <Option icon={<GlassWater size={18} />} tint="bg-indigo" title="Bairro Alto drinks · 23:30" sub="Optional" onClick={() => s.showToast(`This demo runs the ${forPoll ? 'poll' : 'bill'} for the dinner`, 'neutral')} />
      </div>
      {forPoll && !s.dinnerAdded && (
        <button
          onClick={() => useTrip.setState({ afterEvent: 'poll', sheet: 'addEvent' })}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-blue/60 px-4 py-3 text-left"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue/10 text-blue">
            <CalendarPlus size={18} />
          </span>
          <span className="flex-1">
            <span className="block text-headline text-blue">Add a new event first</span>
            <span className="block text-foot text-label-2">Then the poll opens for it</span>
          </span>
          <ChevronRight size={18} className="text-blue" />
        </button>
      )}
    </Sheet>
  )
}

function Option({ icon, title, sub, onClick, muted, highlight, tint = 'bg-gray-3' }: { icon: ReactNode; title: string; sub: string; onClick: () => void; muted?: boolean; highlight?: boolean; tint?: string }) {
  return (
    <button onClick={onClick} className={cx('flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left active:opacity-70', highlight ? 'bg-white ring-2 ring-blue' : 'bg-gray-6')}>
      <span className={cx('flex h-9 w-9 items-center justify-center rounded-xl text-white', muted ? 'bg-gray-4' : tint)}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className={cx('block text-body', muted && 'text-label-2')}>{title}</span>
        <span className="block text-foot text-label-2">{sub}</span>
      </span>
      {!muted && <ChevronRight size={18} className="text-label-3" />}
    </button>
  )
}
