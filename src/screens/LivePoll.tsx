import { AnimatePresence, motion } from 'framer-motion'
import { Check, Share } from 'lucide-react'
import { ME, restaurantById } from '../data'
import { members, tally, useTrip } from '../store'
import { AvatarStack, Bar, Button, Chip, NavBar, Pill, Screen, cx } from '../components/ui'

export default function LivePoll() {
  const s = useTrip()
  const poll = s.poll
  if (!poll) return null
  const crew = members(s)
  const counts = tally(poll)
  const total = Object.keys(poll.votes).length
  const top = Math.max(...counts.map((c) => c.voters.length))
  const waiting = crew.filter((m) => !poll.votes[m])
  const closed = poll.status === 'closed'
  const mine = poll.votes[ME]

  return (
    <Screen
      bottom={
        closed ? (
          <Button kind="blue" onClick={() => s.go('hub', 'plan')}>See tonight’s plan</Button>
        ) : (
          <Button kind="secondary" onClick={s.closePoll} disabled={total === 0}>Close poll now</Button>
        )
      }
    >
      <NavBar back="Lisbon" onBack={() => s.go('hub')} right={<button onClick={() => s.showToast('Poll link copied', 'neutral')} className="text-blue"><Share size={20} /></button>} />
      <h1 className="text-title2">{poll.question}</h1>
      <div className="mt-2 flex items-center gap-2">
        {closed ? <Chip>Closed</Chip> : <Chip tone="red">● Live</Chip>}
        <span className="text-sub text-label-2">
          {total} of {crew.length} voted{closed ? '' : ' · closes 21:30'}
        </span>
      </div>

      {!mine && !closed && <div className="mt-4 rounded-xl bg-blue/10 px-3.5 py-2.5 text-foot font-semibold text-blue">Tap an option to vote. You can change it until the poll closes.</div>}

      <div className="mt-4 space-y-3">
        {counts.map((c) => {
          const r = restaurantById(c.id)
          const leading = c.voters.length > 0 && c.voters.length === top
          const isWinner = closed && poll.winner === c.id
          return (
            <motion.button
              layout
              key={c.id}
              whileTap={closed ? undefined : { scale: 0.98 }}
              onClick={() => !closed && s.vote(ME, c.id)}
              className={cx('block w-full rounded-2xl bg-gray-6 p-3.5 text-left ring-2 transition-shadow', isWinner || (!closed && leading) ? 'ring-blue' : 'ring-transparent')}
            >
              <div className="flex items-center gap-2">
                <span className="flex-1 text-headline">{r.name}</span>
                {isWinner ? <Chip tone="blue">Winner</Chip> : !closed && leading && <Chip tone="blue">Leading</Chip>}
                <span className="text-foot font-semibold text-label-2">
                  {c.voters.length} {c.voters.length === 1 ? 'vote' : 'votes'}
                </span>
              </div>
              <div className="mb-2.5 text-foot text-label-2">
                {r.vibe} · {r.price} · {r.walk}
              </div>
              <Bar pct={total ? c.voters.length / crew.length : 0} color={leading || isWinner ? '#0088ff' : '#8e8e93'} />
              <div className="mt-2.5 flex h-8 items-center">
                {c.voters.length ? <AvatarStack ids={c.voters} size={28} /> : <span className="text-foot text-label-3">No votes yet</span>}
                <span className="flex-1" />
                {mine === c.id && (
                  <span className="flex items-center gap-1 text-foot font-semibold text-blue">
                    Your vote <Check size={14} strokeWidth={3} />
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {!closed && waiting.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="mt-3 flex items-center gap-2.5 rounded-2xl bg-gray-6 px-3.5 py-3">
            <AvatarStack ids={waiting} size={30} />
            <span className="flex-1 text-sub">
              Waiting on {waiting.map((w) => (w === ME ? 'you' : w[0].toUpperCase() + w.slice(1))).join(' and ').replace(/ and (?=.* and )/g, ', ')}
            </span>
            {waiting.some((w) => w !== ME) && (
              <Pill onClick={() => { s.nudge(); s.showToast('Nudge sent', 'neutral') }}>{poll.nudged ? 'Nudged' : 'Nudge'}</Pill>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-3 text-foot text-label-2">
        {closed
          ? `${restaurantById(poll.winner!).name} is now in tonight’s plan. Everyone got a notification.`
          : 'Closes on its own when everyone has voted. The winner goes straight into tonight’s plan.'}
      </p>
    </Screen>
  )
}
