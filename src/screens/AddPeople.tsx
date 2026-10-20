import { Link2, Search, Utensils } from 'lucide-react'
import { useEffect, useState } from 'react'
import { restaurantById } from '../data'
import { InviteTarget, useTrip } from '../store'
import { Avatar, Button, Card, Check, Row, Sheet } from '../components/ui'

export default function AddPeople({ open }: { open: boolean }) {
  const close = () => (useTrip.getState().returnToExpense ? useTrip.setState({ sheet: 'addExpense', returnToExpense: false }) : useTrip.setState({ sheet: null }))
  const addRen = useTrip((s) => s.addRen)
  const renAdded = useTrip((s) => s.renAdded)
  const target = useTrip((s) => s.inviteTarget)
  const dinnerAdded = useTrip((s) => s.dinnerAdded)
  const dinnerName = useTrip((s) => s.dinnerName)
  const dinnerTime = useTrip((s) => s.dinnerTime)
  const winner = useTrip((s) => s.poll?.winner)
  const toast = useTrip((s) => s.showToast)
  const [picked, setPicked] = useState(true)
  const [scope, setScope] = useState<InviteTarget>(target)
  useEffect(() => {
    if (open) setScope(dinnerAdded ? target : 'trip')
  }, [open, target, dinnerAdded])
  const dinner = scope === 'dinner'

  const invite = () => {
    useTrip.setState({ inviteTarget: scope })
    addRen()
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title={dinner ? 'Invite to dinner' : 'Add to the group'}
      footer={
        renAdded ? (
          <Button kind="secondary" onClick={close}>Ren is already invited</Button>
        ) : (
          <Button onClick={invite} disabled={!picked}>
            {!picked ? 'Pick someone' : dinner ? 'Invite Ren to the dinner' : 'Add Ren to the group'}
          </Button>
        )
      }
    >
      {dinnerAdded && (
        <div className="flex items-center gap-3 rounded-2xl bg-orange/10 p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange text-white">
            <Utensils size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-cap font-semibold uppercase tracking-wide text-orange">{dinner ? 'Inviting to one event' : 'Event in this trip'}</div>
            <div className="text-headline">{winner ? restaurantById(winner).name : dinnerName}</div>
            <div className="text-foot text-label-2">Tonight · {dinnerTime}</div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-fill3 px-3 py-2.5">
        <Search size={18} className="text-label-2" />
        <span className="text-body">Ren</span>
        <span className="h-5 w-[2px] animate-pulse bg-blue" />
      </div>

      <Card className="mt-3">
        <Row lead={<Avatar id="ren" ring={false} />} title="Ren Okafor" sub="+351 912 448 210 · not on TripUp yet" trail={<Check on={picked} />} onClick={() => setPicked((v) => !v)} last />

      </Card>

      <div className="mb-2 mt-5 text-headline">Invite Ren to</div>
      <Card>
        {dinnerAdded && (
          <Row
            title={
              <span className="flex items-center gap-1.5">
                {dinnerName} only <span className="rounded-full bg-orange px-2 py-px text-cap font-semibold text-white">Recommended</span>
              </span>
            }
            sub="Votes and pays only for this dinner"
            trail={<Check on={dinner} />}
            onClick={() => setScope('dinner')}
          />
        )}
        <Row title="The whole group" sub="Sees every plan, poll and expense" trail={<Check on={!dinner} />} onClick={() => setScope('trip')} last />
      </Card>

      <button onClick={() => toast('Invite link copied', 'neutral')} className="mt-3 flex items-center gap-1.5 px-1 text-foot font-semibold text-blue">
        <Link2 size={15} /> Or share an invite link · no account needed
      </button>
    </Sheet>
  )
}
