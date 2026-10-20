import { AnimatePresence, motion } from 'framer-motion'
import { Check, Share, Utensils } from 'lucide-react'
import { ME, people, restaurantById } from '../data'

const listNames = (n: string[]) => (n.length < 2 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`)
import { members, tally, useTrip } from '../store'
import { AvatarStack, Bar, Button, Chip, NavBar, Pill, Screen, cx } from '../components/ui'

const closeLabel = (c: string) => ({ '15 min': 'closes 21:15', '30 min': 'closes 21:30', '1 hour': 'closes 22:00' } as Record<string, string>)[c] ?? 'closes when all vote'

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
          {total} of {crew.length} voted{closed ? '' : ` · ${closeLabel(s.closeAfter)}`}
        </span>
      </div>

      {!closed && !mine && <div className="mt-3 text-foot text-label-2">Tap an option to vote.</div>}

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
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: r.tint }}>
                  <Utensils size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-headline">{r.name}</span>
                    {isWinner ? <Chip tone="blue">Winner</Chip> : !closed && leading && <Chip tone="blue">Leading</Chip>}
                  </div>
                  <div className="text-foot text-label-2">
                    {r.vibe} · {r.price} · {r.walk}
                  </div>
                </div>
                {closed ? (
                  <span className="text-headline">{c.voters.length}</span>
                ) : (
                  <span className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-full', mine === c.id ? 'bg-blue text-white' : 'border-2 border-gray-3')}>
                    {mine === c.id && <Check size={14} strokeWidth={3} />}
                  </span>
                )}
              </div>
              <Bar pct={total ? c.voters.length / crew.length : 0} color={leading || isWinner ? '#0088ff' : '#8e8e93'} />
              <div className="mt-2.5 flex h-7 items-center gap-2">
                {c.voters.length ? <AvatarStack ids={c.voters} size={26} /> : <span className="text-foot text-label-3">No votes yet</span>}
                <span className="flex-1" />
                <span className="text-foot font-semibold text-label-2">
                  {c.voters.length} {c.voters.length === 1 ? 'vote' : 'votes'}
                </span>
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
              Waiting on {listNames(waiting.map((w) => (w === ME ? 'you' : people[w].name)))}
            </span>
            {waiting.some((w) => w !== ME) && (
              <Pill onClick={() => { s.nudge(); s.showToast('Nudge sent', 'neutral') }}>{poll.nudged ? 'Nudged' : 'Nudge'}</Pill>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {closed && <p className="mt-3 text-foot text-label-2">{restaurantById(poll.winner!).name} is now in tonight’s plan. Everyone got a notification.</p>}
    </Screen>
  )
}
