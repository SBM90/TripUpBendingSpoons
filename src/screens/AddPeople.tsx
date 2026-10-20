import { EyeOff, Link2, Receipt, Search, Utensils, Vote } from 'lucide-react'
import { useState } from 'react'
import { restaurantById } from '../data'
import { useTrip } from '../store'
import { Avatar, Button, Card, Check, Row, Sheet } from '../components/ui'

export default function AddPeople({ open }: { open: boolean }) {
  const close = () => useTrip.getState().openSheet(null)
  const addRen = useTrip((s) => s.addRen)
  const renAdded = useTrip((s) => s.renAdded)
  const target = useTrip((s) => s.inviteTarget)
  const winner = useTrip((s) => s.poll?.winner)
  const toast = useTrip((s) => s.showToast)
  const [picked, setPicked] = useState(true)
  const dinner = target === 'dinner'

  return (
    <Sheet
      open={open}
      onClose={close}
      title={dinner ? 'Invite to dinner' : 'Add to the trip'}
      footer={
        renAdded ? (
          <Button kind="secondary" onClick={close}>Ren is already invited</Button>
        ) : (
          <Button onClick={addRen} disabled={!picked}>
            {!picked ? 'Pick someone' : dinner ? 'Invite Ren to the dinner' : 'Add Ren to the trip'}
          </Button>
        )
      }
    >
      {dinner && (
        <div className="flex items-center gap-3 rounded-2xl bg-orange/10 p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange text-white">
            <Utensils size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-cap font-semibold uppercase tracking-wide text-orange">Inviting to one event</div>
            <div className="text-headline">{winner ? restaurantById(winner).name : 'Final dinner'}</div>
            <div className="text-foot text-label-2">Tonight · 21:00 · {winner ? restaurantById(winner).walk : 'place decided by poll'}</div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-fill3 px-3 py-2.5">
        <Search size={18} className="text-label-2" />
        <span className="text-body">Ren</span>
        <span className="h-5 w-[2px] animate-pulse bg-blue" />
      </div>

      <div className="mb-2 mt-4 text-foot font-semibold text-label-2">Contacts</div>
      <Card>
        <Row lead={<Avatar id="ren" ring={false} />} title="Ren Okafor" sub="+351 912 448 210 · not on TripUp yet" trail={<Check on={picked} />} onClick={() => setPicked((v) => !v)} />
        <Row
          lead={<div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-4 text-sub font-semibold">R</div>}
          title="Rita Barros"
          sub="On TripUp"
          trail={<Check on={false} />}
          onClick={() => toast('Only Ren is part of this scenario', 'neutral')}
          last
        />
      </Card>

      {dinner ? (
        <>
          <div className="mb-2 mt-5 text-headline">What Ren gets as a dinner guest</div>
          <Card>
            <Row lead={<Vote size={19} className="text-blue" />} title="Votes on where to eat" sub="Joins the dinner poll right away" />
            <Row lead={<Receipt size={19} className="text-green" />} title="Shares only the dinner bill" sub="And only the items Ren had" />
            <Row lead={<EyeOff size={19} className="text-label-2" />} title="Doesn’t see the rest of the trip" sub="Other plans, polls and expenses stay private" last />
          </Card>
          <button onClick={() => useTrip.setState({ inviteTarget: 'trip' })} className="mt-3 text-foot font-semibold text-blue">
            Add Ren to the whole trip instead
          </button>
        </>
      ) : (
        <p className="mt-4 text-foot text-label-2">Ren will see the whole Lisbon trip: every plan, poll and shared expense.</p>
      )}

      <button onClick={() => toast('Invite link copied', 'neutral')} className="mt-4 flex w-full items-center gap-2 rounded-xl bg-gray-6 px-3.5 py-3 text-left">
        <Link2 size={18} className="text-blue" />
        <span className="flex-1 text-sub font-semibold text-blue">Share invite link</span>
        <span className="text-foot text-label-2">No account needed</span>
      </button>
    </Sheet>
  )
}
