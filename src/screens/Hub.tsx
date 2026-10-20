import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BarChart3, Check, MapPin, MoreHorizontal, Phone, Plus, Receipt, UserPlus, Vote } from 'lucide-react'
import { useState } from 'react'
import { ME, PersonId, SPENT_BEFORE_DINNER, DINNER_TOTAL, UNSIMPLIFIED_TRANSFERS, people, restaurantById } from '../data'
import { HubTab, balances, members, simplify, useTrip } from '../store'
import { Avatar, AvatarStack, Button, Card, Chip, NavBar, Row, Screen, SectionTitle, Segmented, cx } from '../components/ui'

const euro = (n: number) => `€${Math.abs(Math.round(n)).toLocaleString('en-US')}`

export default function Hub() {
  const s = useTrip()
  const crew = members(s)

  const bottom =
    s.hubTab === 'plan' ? (
      <div className="flex gap-2">
        <QuickAction icon={<Vote size={18} />} label="Poll" primary onClick={() => (s.poll?.status === 'live' ? s.go('poll') : s.openSheet('newPoll'))} />
        <QuickAction icon={<Receipt size={18} />} label="Expense" onClick={() => s.openSheet('addExpense')} />
        <QuickAction icon={<UserPlus size={18} />} label="Invite" onClick={() => s.openSheet('addPeople')} />
      </div>
    ) : s.hubTab === 'polls' ? (
      <Button onClick={() => (s.poll?.status === 'live' ? s.go('poll') : s.openSheet('newPoll'))}>
        <Plus size={20} /> {s.poll?.status === 'live' ? 'Open live poll' : 'New poll'}
      </Button>
    ) : s.dinnerShares ? (
      <Button onClick={() => (s.settleRequested ? s.showToast('Waiting for transfers to land', 'neutral') : s.askSettle())} kind={s.settleRequested ? 'secondary' : 'primary'}>
        {s.settleRequested ? 'Request sent · waiting for transfers' : 'Ask everyone to settle'}
      </Button>
    ) : (
      <Button onClick={() => s.openSheet('addExpense')}>
        <Plus size={20} /> Add expense
      </Button>
    )

  return (
    <Screen bottom={bottom}>
      <NavBar back="Trips" onBack={() => s.go('home')} right={<MoreHorizontal className="text-blue" />} />
      <h1 className="text-large">Lisbon</h1>
      <div className="text-sub text-label-2">Sat 18 Oct · Day 4 of 4 · last night</div>

      <div className="mt-3 flex items-center gap-2.5">
        <AvatarStack ids={crew} />
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => s.openSheet('addPeople')} className="flex h-9 w-9 items-center justify-center rounded-full bg-fill3 text-blue" aria-label="Add people">
          <Plus size={20} strokeWidth={2.5} />
        </motion.button>
        <span className="text-foot text-label-2">{crew.length} going{s.renAdded ? ' · Ren as guest' : ''}</span>
      </div>

      <div className="mt-4">
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

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={s.hubTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
          {s.hubTab === 'plan' && <PlanTab />}
          {s.hubTab === 'polls' && <PollsTab />}
          {s.hubTab === 'money' && <MoneyTab />}
        </motion.div>
      </AnimatePresence>
    </Screen>
  )
}

function QuickAction({ icon, label, onClick, primary }: { icon: React.ReactNode; label: string; onClick: () => void; primary?: boolean }) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick} className={cx('flex h-[54px] flex-1 items-center justify-center gap-1.5 rounded-full text-headline shadow-sm', primary ? 'bg-label text-white' : 'bg-gray-6/95 text-label backdrop-blur')}>
      {icon}
      {label}
    </motion.button>
  )
}

function IconButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.92 }} onClick={onClick} aria-label={label} className="flex h-11 w-11 items-center justify-center rounded-full bg-fill3 text-blue">
      {children}
    </motion.button>
  )
}

function Time({ t }: { t: string }) {
  return <span className="w-11 text-sub font-semibold text-label-2">{t}</span>
}

function PlanTab() {
  const s = useTrip()
  const crew = members(s)
  const poll = s.poll
  const winner = poll?.winner ? restaurantById(poll.winner) : null
  const voted = poll ? Object.keys(poll.votes).length : 0
  const b = balances(s)

  return (
    <div>
      <SectionTitle>Tonight</SectionTitle>
      <Card>
        <Row lead={<Time t="10:00" />} title="Belém Tower" sub="Done" right={<Check size={18} className="text-green" />} />
        <Row lead={<Time t="15:00" />} title="LX Factory" sub="Done" right={<Check size={18} className="text-green" />} last={!!winner} />
        {!winner && (
          <>
            <Row lead={<Time t="21:00" />} title="Dinner" sub={poll ? `Poll live · ${voted} of ${crew.length} voted` : 'Not decided yet'} last />
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => (poll ? s.go('poll') : s.openSheet('newPoll'))}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue py-2.5 text-sub font-semibold text-blue"
            >
              {poll ? (
                <>
                  <BarChart3 size={17} /> See live results
                </>
              ) : (
                <>
                  <Vote size={17} /> Start a poll for dinner
                </>
              )}
            </motion.button>
          </>
        )}
      </Card>

      {winner && (
        <motion.div
          initial={s.highlightDinner ? { scale: 0.96, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
          className={cx('mt-3 rounded-2xl p-4', s.highlightDinner ? 'bg-white ring-2 ring-blue' : 'bg-gray-6')}
        >
          <div className="flex items-center gap-2">
            <span className="text-sub font-semibold text-blue">21:00</span>
            {s.highlightDinner && <Chip tone="blue">Just added</Chip>}
            {s.dinnerShares && <Chip tone="green">Paid · €{DINNER_TOTAL}</Chip>}
          </div>
          <div className="mt-1.5 text-title3">{winner.name}</div>
          <div className="text-foot text-label-2">
            {winner.vibe} · {winner.address} · {winner.walk}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <AvatarStack ids={crew} size={30} />
            <span className="text-foot text-label-2">{crew.length}{s.renAdded ? ' · Ren as guest' : ''}</span>
          </div>
          <div className="mt-3.5 flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => (s.dinnerShares ? s.setTab('money') : s.openSheet('addExpense'))}
              className={cx('flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full text-sub font-semibold', s.dinnerShares ? 'bg-fill3 text-label' : 'bg-blue text-white')}
            >
              <Receipt size={17} /> {s.dinnerShares ? 'View balances' : 'Add expense'}
            </motion.button>
            <IconButton label="Directions" onClick={() => s.showToast('Opens Maps in the real app', 'neutral')}><MapPin size={19} /></IconButton>
            <IconButton label="Call" onClick={() => s.showToast('Calls the restaurant in the real app', 'neutral')}><Phone size={18} /></IconButton>
          </div>
        </motion.div>
      )}

      <Card className="mt-3">
        <Row lead={<Time t="23:30" />} title="Bairro Alto drinks" sub="Optional · 3 interested" last />
      </Card>

      <Card className="mt-6" onClick={() => s.setTab('money')}>
        <Row
          title={b[ME] > 0.5 ? `You’re owed ${euro(b[ME])}` : 'You’re all even'}
          sub={`${euro(SPENT_BEFORE_DINNER + (s.dinnerShares ? DINNER_TOTAL : 0))} spent by the group`}
          right={<span className="text-blue">Money ›</span>}
          last
        />
      </Card>
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
            {poll.status === 'live'
              ? `${Object.keys(poll.votes).length} of ${crew.length} voted`
              : `${restaurantById(poll.winner!).name} won · added to the plan`}
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
        <div className="text-foot text-label-2">
          Group spent {euro(SPENT_BEFORE_DINNER + (s.dinnerShares ? DINNER_TOTAL : 0))}
          {s.dinnerShares ? ` · dinner just added (€${DINNER_TOTAL})` : ''}
        </div>
      </div>

      {transfers.length > 0 && (
        <>
          <SectionTitle right={<Chip tone="blue">{UNSIMPLIFIED_TRANSFERS} → {transfers.length} transfers</Chip>}>Simplest way to settle</SectionTitle>
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
                  sub={done ? 'Paid' : s.settleRequested ? 'Requested' : undefined}
                  right={<span className={cx('text-headline', done ? 'text-green' : 'text-label')}>{done ? '✓ ' : ''}€{t.amount}</span>}
                  last={i === transfers.length - 1}
                />
              )
            })}
          </Card>
        </>
      )}

      <Card className="mt-3" onClick={() => setShowAll((v) => !v)}>
        <Row title="Everyone’s balance" right={<span className="text-blue">{showAll ? 'Hide' : 'Show'}</span>} last={!showAll} />
        {showAll &&
          order.map((id, i) => (
            <Row key={id} lead={<Avatar id={id} size={28} />} title={people[id].name} right={<span className={b[id] >= 0 ? 'text-green' : 'text-red'}>{b[id] >= 0 ? '+' : '−'}{euro(b[id])}</span>} last={i === order.length - 1} />
          ))}
      </Card>

      <SectionTitle>Recent expenses</SectionTitle>
      <Card>
        {s.dinnerShares && <Row title="Dinner · Taberna da Rua" sub="Ari paid · split by item" right="€210" />}
        <Row title="Groceries · Casa Alfama" sub="Maya paid · split 5 ways" right="€84" />
        <Row title="Uber to LX Factory" sub="Maya paid · split 5 ways" right="€54" />
        <Row title="Belém Tower tickets" sub="Leo paid · split 5 ways" right="€60" last />
      </Card>
    </div>
  )
}
