import { Link2, Search } from 'lucide-react'
import { useState } from 'react'
import { useTrip } from '../store'
import { Avatar, Button, Card, Check, Row, Segmented, Sheet } from '../components/ui'

export default function AddPeople({ open }: { open: boolean }) {
  const close = () => useTrip.getState().openSheet(null)
  const addRen = useTrip((s) => s.addRen)
  const renAdded = useTrip((s) => s.renAdded)
  const toast = useTrip((s) => s.showToast)
  const [picked, setPicked] = useState(true)
  const [scope, setScope] = useState<'trip' | 'dinner'>('dinner')

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Add people"
      footer={
        renAdded ? (
          <Button kind="secondary" onClick={close}>Ren is already in</Button>
        ) : (
          <Button onClick={addRen} disabled={!picked}>
            {picked ? (scope === 'dinner' ? 'Add Ren to dinner' : 'Add Ren to the trip') : 'Pick someone'}
          </Button>
        )
      }
    >
      <div className="flex items-center gap-2 rounded-xl bg-fill3 px-3 py-2.5">
        <Search size={18} className="text-label-2" />
        <span className="text-body">Ren</span>
        <span className="h-5 w-[2px] animate-pulse bg-blue" />
      </div>

      <div className="mb-2 mt-4 text-foot font-semibold text-label-2">Contacts</div>
      <Card>
        <Row lead={<Avatar id="ren" ring={false} />} title="Ren Okafor" sub="+351 912 448 210 · not on TripUp yet" trail={<Check on={picked} />} onClick={() => setPicked((v) => !v)} />
        <Row
          lead={<div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-4 text-foot font-semibold">RB</div>}
          title="Rita Barros"
          sub="On TripUp"
          trail={<Check on={false} />}
          onClick={() => toast('Only Ren is part of this scenario', 'neutral')}
          last
        />
      </Card>

      <div className="mb-2 mt-5 text-headline">Ren joins for</div>
      <Segmented
        items={[
          { id: 'trip', label: 'Whole trip' },
          { id: 'dinner', label: 'Dinner tonight' },
        ]}
        value={scope}
        onChange={setScope}
      />
      <p className="mt-2 text-foot text-label-2">
        {scope === 'dinner'
          ? 'Guests only see tonight’s plan and the costs they’re part of. No account needed: Ren gets a link and can vote right away.'
          : 'Ren sees the whole trip, every poll and the shared expenses.'}
      </p>

      <button onClick={() => toast('Invite link copied', 'neutral')} className="mt-4 flex w-full items-center gap-2 rounded-xl bg-gray-6 px-3.5 py-3 text-left">
        <Link2 size={18} className="text-blue" />
        <span className="flex-1 text-sub font-semibold text-blue">Share invite link</span>
        <span className="text-foot text-label-2">WhatsApp · Copy</span>
      </button>
    </Sheet>
  )
}
