import { motion } from 'framer-motion'
import { Camera, Link2, MessageCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { CREW, SPENT_BEFORE_DINNER, restaurantById } from '../data'
import { useTrip } from '../store'
import { AvatarStack, Sheet } from '../components/ui'

// Peak-end: the trip ends on a shareable recap instead of a plain "done".
export default function Recap({ open }: { open: boolean }) {
  const s = useTrip()
  const toast = s.showToast
  const winner = s.poll?.winner ? restaurantById(s.poll.winner).name : 'Final dinner'
  const spent = SPENT_BEFORE_DINNER + (s.dinnerShares ? s.dinnerTotal : 0)
  const share = (where: string) => toast(`Shared to ${where}`, 'success')

  return (
    <Sheet open={open} onClose={() => useTrip.setState({ sheet: null })} title="Trip recap">
      <motion.div
        initial={{ scale: 0.92, rotate: -2, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className="overflow-hidden rounded-[24px] text-white shadow-xl"
      >
        <div className="bg-[linear-gradient(135deg,#ffb36b_0%,#ff7a59_45%,#6155f5_100%)] p-5">
          <div className="text-cap font-semibold uppercase tracking-wide text-white/80">15–18 Oct</div>
          <div className="text-title1">Lisbon with the crew</div>
          <div className="mt-3">
            <AvatarStack ids={s.renAdded ? [...CREW, 'ren'] : CREW} size={30} />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Stat value="4" label="days" />
            <Stat value="12" label="places" />
            <Stat value={`€${spent.toLocaleString('en-US')}`} label="spent" />
          </div>
        </div>
        <div className="space-y-1.5 bg-[#1c1c1e] p-5 text-sub">
          <div>
            <span className="text-white/60">Last night · </span>
            {winner}
          </div>
          <div>
            <span className="text-white/60">Decided together · </span>3 polls, 0 group-chat debates
          </div>
          <div>
            <span className="text-white/60">Settled · </span>4 transfers, everyone square
          </div>
        </div>
      </motion.div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <ShareButton icon={<MessageCircle size={22} />} label="WhatsApp" onClick={() => share('WhatsApp')} />
        <ShareButton icon={<Camera size={22} />} label="Story" onClick={() => share('your story')} />
        <ShareButton icon={<Link2 size={22} />} label="Copy link" onClick={() => toast('Recap link copied', 'neutral')} />
      </div>
      <p className="mt-3 text-center text-foot text-label-2">Friends without TripUp can open the recap from the link.</p>
    </Sheet>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-2 py-2 text-center backdrop-blur">
      <div className="text-headline">{value}</div>
      <div className="text-cap text-white/80">{label}</div>
    </div>
  )
}

function ShareButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick} className="flex flex-col items-center gap-1.5 rounded-2xl bg-gray-6 py-3 text-foot font-semibold">
      <span className="text-blue">{icon}</span>
      {label}
    </motion.button>
  )
}
