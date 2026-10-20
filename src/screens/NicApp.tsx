import { ArrowRight } from 'lucide-react'
import { CREW } from '../data'
import { balances, simplify, useTrip } from '../store'
import { Avatar, AvatarStack, Button, Card, Chip, Row, Screen, SectionTitle, Segmented } from '../components/ui'

// Nic's own TripUp app, opened from the notification. The pay sheet slides up over it.
export default function NicApp() {
  const owed = useTrip((s) => simplify(balances(s)).find((t) => t.from === 'nic')?.amount ?? 0)
  const paid = useTrip((s) => s.paid.includes('nic'))
  const openSheet = useTrip((s) => s.openSheet)

  return (
    <Screen bottom={!paid && <Button onClick={() => openSheet('pay')}>Pay Ari €{owed}</Button>}>
      <div className="h-11" />
      <h1 className="text-large">Lisbon</h1>
      <div className="text-sub text-label-2">Sat 18 Oct · last night</div>
      <div className="mt-3 flex items-center gap-2.5">
        <AvatarStack ids={CREW} />
        <span className="text-foot text-label-2">5 travellers</span>
      </div>
      <div className="mt-4">
        <Segmented items={[{ id: 'plan', label: 'Plan' }, { id: 'polls', label: 'Polls' }, { id: 'money', label: 'Money' }]} value="money" onChange={() => {}} />
      </div>

      <div className="mt-4 rounded-[20px] bg-gray-6 p-[18px]">
        <div className="text-sub text-label-2">{paid ? 'You’re all square' : 'You owe'}</div>
        <div className={paid ? 'text-large text-green' : 'text-large text-red'}>{paid ? '€0' : `€${owed}`}</div>
        <div className="text-foot text-label-2">Ari asked everyone to settle up</div>
      </div>

      <SectionTitle right={<Chip tone="blue">1 transfer</Chip>}>Your part</SectionTitle>
      <Card>
        <Row
          lead={
            <div className="flex items-center gap-1">
              <Avatar id="nic" size={30} />
              <ArrowRight size={14} className="text-label-2" />
              <Avatar id="ari" size={30} />
            </div>
          }
          title="You pay Ari"
          sub={paid ? 'Paid' : 'Dinner, Uber and groceries'}
          right={<span className="text-headline text-label">€{owed}</span>}
          last
        />
      </Card>
    </Screen>
  )
}
