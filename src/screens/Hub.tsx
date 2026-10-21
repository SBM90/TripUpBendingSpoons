import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BarChart3, CalendarPlus, Check, ChevronLeft, MapPin, MoreHorizontal, Phone, Plus, Receipt, UserPlus, Utensils, Vote } from 'lucide-react'
import { ReactNode, useRef, useState } from 'react'
import { CREW, ME, PersonId, SPENT_BEFORE_DINNER, UNSIMPLIFIED_TRANSFERS, people, restaurantById } from '../data'
import { HubTab, balances, members, simplify, useTrip } from '../store'
import { Avatar, AvatarStack, Button, Card, Chip, NavBar, Row, Screen, SectionTitle, Segmented, cx } from '../components/ui'

const euro = (n: number) => `€${Math.abs(Math.round(n)).toLocaleString('en-US')}`
const TABS: HubTab[] = ['plan', 'polls', 'money']

export default function Hub() {
  const s = useTrip()
  const [scrolled, setScrolled] = useState(false)
  // Direction of the last tab change: 1 = moving right, -1 = moving left.
  const prevTab = useRef(s.hubTab)
  const dir = useRef(1)
  if (prevTab.current !== s.hubTab) {
    dir.current = TABS.indexOf(s.hubTab) > TABS.indexOf(prevTab.current) ? 1 : -1
    prevTab.current = s.hubTab
  }
  const guest = s.renAdded && s.renScope === 'dinner'

  const bottom =
    s.hubTab === 'plan' ? (
      <Button onClick={() => (s.dinnerAdded ? s.showToast('This demo adds one event to tonight', 'neutral') : s.openSheet('addEvent'))} kind={s.dinnerAdded ? 'secondary' : 'primary'}>
        <CalendarPlus size={20} /> Add an event
      </Button>
    ) : s.hubTab === 'polls' ? (
      <Button onClick={() => (s.poll?.status === 'live' ? s.go('poll') : s.pickEvent('poll'))}>
        <Plus size={20} /> {s.poll?.status === 'live' ? 'Open live poll' : 'New poll'}
      </Button>
    ) : s.dinnerShares ? (
      <Button onClick={() => (s.settleRequested ? s.showToast('Waiting for transfers to land', 'neutral') : s.askSettle())} kind={s.settleRequested ? 'secondary' : 'primary'}>
        {s.settleRequested ? 'Request sent · waiting for transfers' : 'Ask everyone to settle'}
      </Button>
    ) : (
      <Button onClick={() => s.pickEvent('expense')}>
        <Plus size={20} /> Add expense
      </Button>
    )

  return (
    <motion.div
      className="absolute inset-0"
      style={{ touchAction: 'pan-y' }}
      // Swipe left or right anywhere on the hub to move between Plan, Polls and Money.
      onPanEnd={(_, info) => {
        const horizontal = Math.abs(info.offset.x) > Math.abs(info.offset.y) * 1.4
        if (!horizontal || (Math.abs(info.offset.x) < 60 && Math.abs(info.velocity.x) < 400)) return
        const i = TABS.indexOf(s.hubTab)
        const next = info.offset.x < 0 ? Math.min(i + 1, TABS.length - 1) : Math.max(i - 1, 0)
        if (next !== i) s.setTab(TABS[next])
      }}
    >
    <Screen bottom={bottom} onScroll={(top) => setScrolled(top > 96)}>
      <NavBar back="Trips" onBack={() => s.go('home')} right={<MoreHorizontal className="text-blue" />} />
      <h1 className="text-large">Lisbon</h1>
      <div className="text-sub text-label-2">Sat 18 Oct · Day 4 of 4 · last night</div>

      <div className="mt-3 flex items-center gap-2.5">
        <AvatarStack ids={s.renAdded && !guest ? [...CREW, 'ren'] : CREW} />
        {guest && (
          <div className="flex items-center gap-1.5 border-l border-sep pl-2.5">
            <div className="rounded-full border-[1.5px] border-dashed border-orange p-[2px]">
              <Avatar id="ren" size={28} ring={false} />
            </div>
            <span className="text-cap font-semibold leading-tight text-orange">Dinner<br />guest</span>
          </div>
        )}
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => s.invite('trip')} className="flex h-9 w-9 items-center justify-center rounded-full bg-fill3 text-blue" aria-label="Add people to the trip">
          <Plus size={20} strokeWidth={2.5} />
        </motion.button>
        {!guest && <span className="text-foot text-label-2">{members(s).length} travellers</span>}
      </div>

      {/* Sticky tab header: stays under the status bar while the page scrolls. */}
      <div className={cx('sticky z-20 -mx-5 mt-3 px-5 pb-2.5 pt-2 transition-colors', scrolled && 'border-b border-black/5 bg-white/95 backdrop-blur')} style={{ top: 'var(--safe-top)' }}>
        {scrolled && <div className="absolute inset-x-0 bottom-full h-16 bg-white/95" />}
        <AnimatePresence initial={false}>
          {scrolled && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 36, opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex items-center overflow-hidden">
              <button onClick={() => s.go('home')} className="-ml-1.5 text-blue" aria-label="Back to trips">
                <ChevronLeft size={26} />
              </button>
              <span className="flex-1 text-center text-headline">Lisbon</span>
              <span className="w-6" />
            </motion.div>
          )}
        </AnimatePresence>
        <Segmented<HubTab>
          items={[
            { id: 'plan', label: 'Plan' },
            { id: 'polls', label: s.poll?.status === 'live' ? 'Polls ●' : 'Polls' },
            { id: 'money', label: 'Money' },
          ]}
          value={s.hubTab}
          onChange={s.setTab}
        />
      </div>

      <div className="relative -mx-5 overflow-x-clip px-5">
        <AnimatePresence mode="popLayout" initial={false} custom={dir.current}>
          <motion.div
            key={s.hubTab}
            custom={dir.current}
            variants={{
              enter: (d: number) => ({ x: `${d * 100}%`, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: `${d * -100}%`, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 420, damping: 42 }}
          >
            {s.hubTab === 'plan' && <PlanTab />}
            {s.hubTab === 'polls' && <PollsTab />}
            {s.hubTab === 'money' && <MoneyTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Screen>
    </motion.div>
  )
}

function QuickAction({ icon, label, onClick, primary }: { icon: ReactNode; label: string; onClick: () => void; primary?: boolean }) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick} className={cx('flex h-[54px] flex-1 items-center justify-center gap-1.5 rounded-full text-headline shadow-sm transition-colors', primary ? 'bg-label text-white' : 'bg-gray-6/95 text-label backdrop-blur')}>
      {icon}
      {label}
    </motion.button>
  )
}

function IconButton({ children, label, onClick }: { children: ReactNode; label: string; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.92 }} onClick={onClick} aria-label={label} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fill3 text-blue">
      {children}
    </motion.button>
  )
}

// Shown when someone was invited after the dinner bill was logged, so they're not on it yet.
function LateGuestBanner() {
  const s = useTrip()
  if (!s.needsExpenseUpdate) return null
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-3 rounded-2xl bg-orange/10 p-3.5">
      <Avatar id="ren" size={32} ring={false} />
      <div className="min-w-0 flex-1">
        <div className="text-sub font-semibold">Ren isn’t on the dinner bill yet</div>
        <div className="text-foot text-label-2">Add him to what he shared</div>
      </div>
      <button onClick={s.editExpense} className="rounded-full bg-orange px-3.5 py-2 text-foot font-semibold text-white">Update</button>
    </motion.div>
  )
}

// Goal-gradient: shows how close the group is to being squared up.
function SettleProgress({ done, total }: { done: number; total: number }) {
  return (
    <div className="mb-2.5 px-1">
      <div className="mb-1.5 flex text-foot">
        <span className="flex-1 font-semibold">{done === total ? 'Everyone has paid' : `${done} of ${total} paid`}</span>
        <span className="text-label-2">{done === total ? 'All squared up' : `${total - done} to go`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-5">
        <motion.div className="h-full rounded-full bg-green" initial={false} animate={{ width: `${Math.max(4, (done / total) * 100)}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
      </div>
    </div>
  )
}

function Time({ t }: { t: string }) {
  return <span className="w-11 text-sub font-semibold text-label-2">{t}</span>
}

function DinnerCard() {
  const s = useTrip()
  const crew = members(s)
  const poll = s.poll
  const winner = poll?.winner ? restaurantById(poll.winner) : null
  const voted = poll ? Object.keys(poll.votes).length : 0
  const guest = s.renAdded && s.renScope === 'dinner'

  return (
    <motion.div
      layoutId="new-event"
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className={cx('rounded-2xl p-4', s.highlightDinner ? 'bg-white ring-2 ring-blue' : 'bg-gray-6')}
    >
      <div className="flex items-center gap-2">
        <span className="text-sub font-semibold text-blue">{s.dinnerDay === 'Tonight' ? s.dinnerTime : `${s.dinnerDay} · ${s.dinnerTime}`}</span>
        {winner ? (
          s.dinnerShares ? <Chip tone="green">Paid · €{s.dinnerTotal}</Chip> : s.highlightDinner && <Chip tone="blue">Just decided</Chip>
        ) : poll ? (
          <Chip tone="red">● Poll live</Chip>
        ) : (
          <Chip>Place not decided</Chip>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: winner?.tint ?? '#ff8d28' }}>
          <Utensils size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-title3">{winner ? winner.name : s.dinnerName}</div>
          <div className="text-foot text-label-2">{winner ? `${winner.vibe} · ${winner.walk}` : poll ? `${voted} of ${crew.length} voted on the place` : 'Where to eat: let the group vote'}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <AvatarStack ids={CREW} size={28} />
        {guest ? (
          <span className="flex items-center gap-1.5 rounded-full bg-orange/10 py-0.5 pl-0.5 pr-2.5">
            <Avatar id="ren" size={24} ring={false} />
            <span className="text-cap font-semibold text-orange">Ren · dinner only</span>
          </span>
        ) : (
          !s.renAdded && (
            <button onClick={() => s.invite('dinner')} className="flex items-center gap-1 rounded-full border border-dashed border-blue px-2.5 py-1 text-cap font-semibold text-blue">
              <UserPlus size={13} /> Invite a guest
            </button>
          )
        )}
      </div>

      <div className="mt-3.5 flex items-center gap-2">
        {winner ? (
          <>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => (s.dinnerShares ? s.setTab('money') : s.openSheet('addExpense'))}
              className={cx('flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full text-sub font-semibold', s.dinnerShares ? 'bg-fill3 text-label' : 'bg-blue text-white')}
            >
              <Receipt size={17} /> {s.dinnerShares ? 'View balances' : 'Add expense'}
            </motion.button>
            <IconButton label="Directions" onClick={() => s.showToast('Opens Maps in the real app', 'neutral')}><MapPin size={19} /></IconButton>
            <IconButton label="Call" onClick={() => s.showToast('Calls the restaurant in the real app', 'neutral')}><Phone size={18} /></IconButton>
          </>
        ) : (
          <>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => (poll ? s.go('poll') : s.openSheet('newPoll'))}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-blue text-sub font-semibold text-white"
            >
              {poll ? <BarChart3 size={17} /> : <Vote size={17} />} {poll ? 'See live results' : 'Start a poll for the place'}
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  )
}

// Fixed events for the trip; the dinner joins them at whatever time Ari picks.
const TONIGHT = [
  { id: 'belem', time: '10:00', title: 'Belém Tower', done: true },
  { id: 'lx', time: '15:00', title: 'LX Factory', done: true },
  { id: 'bairro', time: '23:30', title: 'Bairro Alto drinks', sub: 'Optional · 3 interested' },
]
const TOMORROW = [{ id: 'checkout', time: '11:30', title: 'Check out, then fly home', sub: 'Flight TP 1350 at 14:05' }]

type PlanItem = { id: string; time: string; title?: string; sub?: string; done?: boolean }

function EventRow({ e }: { e: PlanItem }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-gray-6 px-4 py-3">
      <Time t={e.time} />
      <div className="min-w-0 flex-1">
        <div className={cx('text-body', e.done && 'text-label-2')}>{e.title}</div>
        {e.sub && <div className="text-foot text-label-2">{e.sub}</div>}
      </div>
      {e.done && <Check size={18} className="text-green" />}
    </div>
  )
}

function AddEventSlot() {
  const s = useTrip()
  return (
    <motion.button
      layoutId="new-event"
      whileTap={{ scale: 0.98 }}
      onClick={() => s.openSheet('addEvent')}
      className="flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-blue/60 px-4 py-3 text-left"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue/10 text-blue">
        <CalendarPlus size={18} />
      </div>
      <div className="flex-1">
        <div className="text-headline text-blue">Add another event</div>
        <div className="text-foot text-label-2">Pick a time and it slots into the day</div>
      </div>
    </motion.button>
  )
}

function Day({ items, dinnerHere, showAdd }: { items: PlanItem[]; dinnerHere: boolean; showAdd: boolean }) {
  const s = useTrip()
  const list: PlanItem[] = dinnerHere ? [...items, { id: 'dinner', time: s.dinnerTime }] : items
  const sorted = [...list].sort((a, b) => a.time.localeCompare(b.time))
  return (
    <div className="space-y-2">
      {sorted.map((e) => (
        <motion.div key={e.id} layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
          {e.id === 'dinner' ? <DinnerCard /> : <EventRow e={e} />}
        </motion.div>
      ))}
      {showAdd && <AddEventSlot />}
    </div>
  )
}

function PlanTab() {
  const s = useTrip()
  const tonight = s.dinnerAdded && s.dinnerDay === 'Tonight'
  const tomorrow = s.dinnerAdded && s.dinnerDay === 'Tomorrow'

  return (
    <div>
      <LateGuestBanner />
      <SectionTitle>Tonight</SectionTitle>
      <Day items={TONIGHT} dinnerHere={tonight} showAdd={!s.dinnerAdded} />
      <SectionTitle>Tomorrow</SectionTitle>
      <Day items={TOMORROW} dinnerHere={tomorrow} showAdd={false} />
    </div>
  )
}

function PollsTab() {
  const s = useTrip()
  const poll = s.poll
  const crew = members(s)
  return (
    <div>
      <SectionTitle>Today</SectionTitle>
      {poll ? (
        <Card onClick={() => s.go('poll')} className="py-4">
          <div className="flex items-center gap-2">
            <span className="flex-1 text-headline">{poll.question}</span>
            {poll.status === 'live' ? <Chip tone="red">● Live</Chip> : <Chip>Closed</Chip>}
          </div>
          <div className="mt-1 text-foot text-label-2">
            {poll.status === 'live' ? `${Object.keys(poll.votes).length} of ${crew.length} voted` : `${restaurantById(poll.winner!).name} won · added to the plan`}
          </div>
        </Card>
      ) : (
        <Card className="py-6 text-center">
          <div className="text-headline">Decide together, fast</div>
          <div className="mx-auto mt-1 max-w-[240px] text-foot text-label-2">Polls beat long chats. The winner goes straight into your plan.</div>
        </Card>
      )}
      <SectionTitle>Earlier</SectionTitle>
      <Card>
        <Row title="Fado night: where?" sub="Day 2 · Tasca do Chico won 4–1" right="Closed" />
        <Row title="Sintra day trip?" sub="Day 1 · Yes 5–0" right="Closed" last />
      </Card>
    </div>
  )
}

function MoneyTab() {
  const s = useTrip()
  const b = balances(s)
  const transfers = simplify(b)
  const [showAll, setShowAll] = useState(false)
  const order: PersonId[] = members(s)

  return (
    <div>
      <div className="mt-4 rounded-[20px] bg-gray-6 p-[18px]">
        <div className="text-sub text-label-2">{b[ME] > 0.5 ? 'You’re owed' : 'Your balance'}</div>
        <motion.div key={b[ME]} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cx('text-large', b[ME] > 0.5 ? 'text-green' : 'text-label')}>
          {b[ME] > 0.5 ? euro(b[ME]) : 'All even'}
        </motion.div>
        <div className="text-foot text-label-2">Group spent {euro(SPENT_BEFORE_DINNER + (s.dinnerShares ? s.dinnerTotal : 0))}</div>
      </div>
      <LateGuestBanner />

      {transfers.length > 0 && (
        <>
          <SectionTitle right={<Chip tone="blue">{UNSIMPLIFIED_TRANSFERS} → {transfers.length} transfers</Chip>}>Simplest way to settle</SectionTitle>
          {s.settleRequested && <SettleProgress done={transfers.filter((t) => s.paid.includes(t.from)).length} total={transfers.length} />}
          <Card>
            {transfers.map((t, i) => {
              const done = s.paid.includes(t.from)
              return (
                <Row
                  key={t.from + t.to}
                  lead={
                    <div className="flex items-center gap-1">
                      <Avatar id={t.from} size={30} />
                      <ArrowRight size={14} className="text-label-2" />
                      <Avatar id={t.to} size={30} />
                    </div>
                  }
                  title={`${people[t.from].name} pays ${t.to === ME ? 'you' : people[t.to].name}`}
                  sub={done ? 'Paid' : t.from === 'ren' && s.renScope === 'dinner' ? 'Dinner guest · dinner share only' : s.settleRequested ? 'Requested' : undefined}
                  right={<span className={cx('text-headline', done ? 'text-green' : 'text-label')}>{done ? '✓ ' : ''}€{t.amount}</span>}
                  last={i === transfers.length - 1}
                />
              )
            })}
          </Card>
        </>
      )}

      <button onClick={() => setShowAll((v) => !v)} className="mt-1 flex min-h-[44px] items-center px-1 text-foot font-semibold text-blue">
        {showAll ? 'Hide everyone’s balance' : 'See everyone’s balance'}
      </button>
      {showAll && (
        <Card className="mt-2">
          {order.map((id, i) => (
            <Row key={id} lead={<Avatar id={id} size={28} />} title={people[id].name} right={<span className={b[id] >= 0 ? 'text-green' : 'text-red'}>{b[id] >= 0 ? '+' : '−'}{euro(b[id])}</span>} last={i === order.length - 1} />
          ))}
        </Card>
      )}

      <SectionTitle>Expenses</SectionTitle>
      <Card>
        {s.dinnerShares && (
          <Row
            title="Dinner · Taberna da Rua"
            sub="Ari paid · split by item"
            right={`€${s.dinnerTotal}`}
            trail={<button onClick={s.editExpense} className="rounded-full bg-blue/10 px-2.5 py-1 text-foot font-semibold text-blue">Edit</button>}
          />
        )}
        <Row title="3 earlier expenses" sub="Groceries, Uber, Belém tickets" right="€198" last />
      </Card>
    </div>
  )
}
