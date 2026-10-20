import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Bell, ChevronRight, Map, Plus, User } from 'lucide-react'
import { CREW } from '../data'
import { useTrip } from '../store'
import { AvatarStack, Card, Chip, Row, Screen, SectionTitle } from '../components/ui'

export default function Home() {
  const go = useTrip((s) => s.go)
  const toast = useTrip((s) => s.showToast)
  const poll = useTrip((s) => s.poll)
  const renAdded = useTrip((s) => s.renAdded)
  const reset = useTrip((s) => s.reset)

  const pending = poll?.status === 'live' ? 'Dinner poll is live · tap to vote' : poll?.winner ? 'Tonight: dinner is booked' : 'Tonight: dinner not decided yet'

  return (
    <Screen
      bottom={
        <nav className="flex h-[62px] items-center rounded-full bg-gray-6/90 px-2 shadow-sm backdrop-blur">
          <TabItem icon={<Map size={22} />} label="Trips" active />
          <TabItem icon={<Bell size={22} />} label="Activity" onClick={() => toast('Activity is not part of this demo', 'neutral')} />
          <TabItem icon={<User size={22} />} label="Profile" onClick={() => toast('Profile is not part of this demo', 'neutral')} />
          <button onClick={() => toast('New trip is not part of this demo', 'neutral')} className="ml-1 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-label text-white" aria-label="New trip">
            <Plus size={24} />
          </button>
        </nav>
      }
    >
      <div className="text-sub text-label-2">Good evening, Ari</div>
      <h1 className="mt-1 text-large">Your trips</h1>

      <motion.button whileTap={{ scale: 0.98 }} onClick={() => go('hub', 'plan')} className="mt-4 block w-full overflow-hidden rounded-[20px] bg-gray-6 text-left">
        <div className="relative h-[140px] bg-[linear-gradient(135deg,#ffb36b_0%,#ff7a59_45%,#6155f5_100%)] p-3.5">
          <Chip tone="green">● Live now · Day 4 of 4</Chip>
          <div className="absolute bottom-3 right-4 text-right text-cap font-semibold text-white/90">Lisbon, Portugal</div>
        </div>
        <div className="space-y-1.5 p-4">
          <div className="text-title3">Lisbon with the crew</div>
          <div className="text-sub text-label-2">15–18 Oct · {renAdded ? '5 friends + Ren' : '5 friends'} · Casa Alfama</div>
          <div className="pt-1">
            <AvatarStack ids={renAdded ? [...CREW, 'ren'] : CREW} />
          </div>
          <div className="mt-2 flex items-center rounded-xl bg-white px-3 py-2.5">
            <span className="flex-1 text-foot font-semibold">{pending}</span>
            <ChevronRight size={18} className="text-gray" />
          </div>
        </div>
      </motion.button>

      <SectionTitle>Upcoming</SectionTitle>
      <Card onClick={() => toast('This demo covers the Lisbon trip', 'neutral')}>
        <Row title="Primavera Sound" sub="Barcelona · 4–8 Jun · 4 friends" right="Planning" last />
      </Card>

      <SectionTitle>Past</SectionTitle>
      <Card onClick={() => toast('This demo covers the Lisbon trip', 'neutral')}>
        <Row title="Berlin weekend" sub="Mar 2026 · all settled" right={<span className="text-green">✓</span>} last />
      </Card>

      <button onClick={reset} className="mx-auto mt-8 block rounded-full bg-fill3 px-3.5 py-1.5 text-foot font-semibold text-label-2 active:opacity-60">Restart demo</button>

    </Screen>
  )
}

function TabItem({ icon, label, active, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 ${active ? 'bg-white text-blue' : 'text-gray'}`}>
      {icon}
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  )
}
