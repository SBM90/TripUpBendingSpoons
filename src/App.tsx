import { AnimatePresence, motion } from 'framer-motion'
import { Check, RotateCcw } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { people } from './data'
import { Avatar } from './components/ui'
import AddEvent from './screens/AddEvent'
import AddExpense from './screens/AddExpense'
import AddPeople from './screens/AddPeople'
import Home from './screens/Home'
import Hub from './screens/Hub'
import LivePoll from './screens/LivePoll'
import NewPoll from './screens/NewPoll'
import NicLock from './screens/NicLock'
import Pay from './screens/Pay'
import Squared from './screens/Squared'
import { useTrip } from './store'

function useFramed() {
  const q = '(min-width: 640px) and (min-height: 600px)'
  const [framed, setFramed] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const on = () => setFramed(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return framed
}

// The phone is always 393x852 inside; only the presentation frame shrinks on short laptop screens.
const FRAME_H = 852 + 22
function useFrameScale() {
  const calc = () => Math.min(1, (window.innerHeight - 40) / FRAME_H)
  const [scale, setScale] = useState(calc)
  useEffect(() => {
    const on = () => setScale(calc())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return scale
}

function StatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[60] flex h-[54px] items-center justify-between px-[42px] pt-1">
      <span className="text-headline">9:41</span>
      <div className="absolute left-1/2 top-[11px] h-[37px] w-[125px] -translate-x-1/2 rounded-full bg-black" />
      <div className="flex items-center gap-1.5">
        <span className="h-3 w-[18px] rounded-[3px] bg-black" />
        <span className="h-3 w-4 rounded-full bg-black" />
        <span className="h-3 w-[25px] rounded-[4px] bg-black" />
      </div>
    </div>
  )
}

function Toasts() {
  const toast = useTrip((s) => s.toast)
  return (
    <div className="pointer-events-none absolute inset-x-0 z-[55] flex justify-center px-5" style={{ top: 'calc(var(--safe-top) + 50px)' }}>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-foot font-semibold text-white shadow-lg ${toast.tone === 'success' ? 'bg-green' : 'bg-label/85 backdrop-blur'}`}
          >
            {toast.tone === 'success' && <Check size={15} strokeWidth={3} />}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PushBanner() {
  const push = useTrip((s) => (s.screen === 'nicLock' ? null : s.push))
  const openPush = useTrip((s) => s.openPush)
  return (
    <AnimatePresence>
      {push && (
        <motion.button
          initial={{ y: -120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={openPush}
          className="absolute inset-x-3 z-[70] rounded-[24px] bg-white/80 p-3 text-left shadow-2xl ring-1 ring-black/5 backdrop-blur-xl"
          style={{ top: 'calc(var(--safe-top) + 4px)' }}
        >
          <div className="mb-1.5 text-cap font-semibold uppercase tracking-wide text-indigo">{push.device} · tap to open</div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-blue text-foot font-bold text-white">TU</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-foot font-semibold">{push.title}</span>
                <span className="text-cap text-label-2">now</span>
              </div>
              <div className="text-foot">{push.body}</div>
            </div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

function Phone() {
  const screen = useTrip((s) => s.screen)
  const sheet = useTrip((s) => s.sheet)
  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={screen}
          className="absolute inset-0"
          initial={{ x: screen === 'home' ? -60 : 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: screen === 'home' ? 80 : -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        >
          {screen === 'home' && <Home />}
          {screen === 'hub' && <Hub />}
          {screen === 'poll' && <LivePoll />}
          {screen === 'squared' && <Squared />}
          {screen === 'nicLock' && <NicLock />}
        </motion.div>
      </AnimatePresence>
      <AddEvent open={sheet === 'addEvent'} />
      <AddPeople open={sheet === 'addPeople'} />
      <NewPoll open={sheet === 'newPoll'} />
      <AddExpense open={sheet === 'addExpense'} />
      <Pay open={sheet === 'pay'} />
      <Toasts />
      <PushBanner />
      <ViewerPill />
    </div>
  )
}

// Shows whose phone the prototype is currently showing, whenever it isn't Ari's.
function ViewerPill() {
  const viewer = useTrip((s) => s.viewer)
  if (viewer === 'ari') return null
  return (
    <div className="pointer-events-none absolute inset-x-0 z-[65] flex justify-center" style={{ top: 'calc(var(--safe-top) + 2px)' }}>
      <div className="flex items-center gap-1.5 rounded-full bg-indigo py-1 pl-1 pr-3 text-cap font-semibold text-white shadow-lg">
        <Avatar id={viewer} size={20} ring={false} />
        {people[viewer].name}’s phone
      </div>
    </div>
  )
}

// Flips the whole device when the prototype switches from one person's phone to another's.
function Flip({ children }: { children: ReactNode }) {
  const viewer = useTrip((s) => s.viewer)
  return (
    <div className="h-full w-full" style={{ perspective: 1800 }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={viewer}
          className="h-full w-full"
          initial={{ rotateY: -90, scale: 0.94 }}
          animate={{ rotateY: 0, scale: 1 }}
          exit={{ rotateY: 90, scale: 0.94 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// The "peekaboo" card that tells the person demoing whose phone they are looking at now.
function Peekaboo() {
  const peek = useTrip((s) => s.peek)
  return (
    <AnimatePresence>
      {peek && (
        <motion.div
          key={peek.id}
          className="pointer-events-auto absolute inset-0 z-[90] flex items-center justify-center bg-black/25 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => useTrip.setState({ peek: null })}
        >
          <motion.div
            className="w-full max-w-[300px] rounded-[28px] bg-white p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
            initial={{ y: 40, scale: 0.8, rotate: -4 }}
            animate={{ y: 0, scale: 1, rotate: 0 }}
            exit={{ y: -20, scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 20 }}
          >
            <div className="mb-1 text-cap font-semibold uppercase tracking-wide text-indigo">Switching phones</div>
            <motion.div className="mx-auto my-3 w-fit" initial={{ scale: 0 }} animate={{ scale: [0, 1.25, 1] }} transition={{ delay: 0.15, duration: 0.45 }}>
              <Avatar id={peek.who} size={64} ring={false} />
            </motion.div>
            <div className="text-title3">{peek.title}</div>
            <div className="mt-1 text-sub text-label-2">{peek.body}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ScenarioPanel() {
  const s = useTrip()
  const reset = useTrip((x) => x.reset)
  const steps = [
    { label: 'Open the Lisbon trip', done: s.screen !== 'home' || s.dinnerAdded },
    { label: 'Add the final dinner to the plan', done: s.dinnerAdded },
    { label: 'Invite Ren to the dinner only', done: s.renAdded },
    { label: 'Create a dinner poll', done: !!s.poll },
    { label: 'Poll closes, winner joins the plan', done: s.poll?.status === 'closed' },
    { label: 'Log the bill, skip wine for Nic and Ren', done: !!s.dinnerShares },
    { label: 'Settle up in the app', done: s.paid.includes('nic') },
    { label: 'Everyone squared up', done: s.screen === 'squared' },
  ]
  const next = steps.findIndex((x) => !x.done)
  return (
    <aside className="hidden w-[300px] shrink-0 xl:block">
      <div className="mb-1 text-foot font-semibold uppercase tracking-wide text-blue">TripUp prototype</div>
      <h1 className="text-title1">Last night in Lisbon</h1>
      <p className="mt-2 text-sub text-label-2">
        Ari, a participant, sorts out dinner for the group and the bill afterwards. Use the app as you would on a phone; the other five friends respond on their own.
      </p>
      <ol className="mt-6 space-y-3">
        {steps.map((st, i) => (
          <li key={st.label} className="flex items-center gap-3">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-cap font-semibold ${st.done ? 'bg-green text-white' : i === next ? 'bg-blue text-white' : 'bg-gray-5 text-label-2'}`}>
              {st.done ? <Check size={14} strokeWidth={3} /> : i + 1}
            </span>
            <span className={`text-sub ${st.done ? 'text-label-2 line-through' : i === next ? 'font-semibold' : 'text-label-2'}`}>{st.label}</span>
          </li>
        ))}
      </ol>
      <button onClick={reset} className="mt-8 flex items-center gap-2 rounded-full bg-fill3 px-4 py-2 text-sub font-semibold active:opacity-60">
        <RotateCcw size={16} /> Restart demo
      </button>
      <p className="mt-6 text-foot text-label-3">iPhone 15 · 393 × 852 pt · mock data</p>
    </aside>
  )
}

export default function App() {
  const framed = useFramed()
  const scale = useFrameScale()
  if (!framed) {
    return (
      <div className="phone-full fixed inset-0 bg-[#1c1c1e]">
        <Flip>
          <Phone />
        </Flip>
        <Peekaboo />
      </div>
    )
  }
  return (
    <div className="flex h-screen items-center justify-center gap-16 overflow-hidden bg-[#e9e9ee] px-8">
      <ScenarioPanel />
      <div style={{ width: 415 * scale, height: FRAME_H * scale }} className="relative shrink-0">
        <div className="phone-framed absolute left-0 top-0 h-[874px] w-[415px] origin-top-left" style={{ transform: `scale(${scale})` }}>
          <Flip>
            <div className="relative h-full w-full rounded-[64px] bg-[#1c1c1e] p-[11px] shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
              <div className="relative h-[852px] w-[393px] overflow-hidden rounded-[54px]">
                <Phone />
                <StatusBar />
                <div className="pointer-events-none absolute bottom-2 left-1/2 z-[60] h-[5px] w-[139px] -translate-x-1/2 rounded-full bg-black" />
              </div>
            </div>
          </Flip>
          <Peekaboo />
        </div>
      </div>
    </div>
  )
}
