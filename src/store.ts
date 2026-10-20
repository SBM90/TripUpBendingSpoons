import { create } from 'zustand'
import {
  CREW,
  DINNER_TOTAL,
  ME,
  PersonId,
  balancesBeforeDinner,
  people,
  restaurantById,
} from './data'

export type Screen = 'home' | 'hub' | 'poll' | 'squared'
export type Sheet = null | 'addPeople' | 'newPoll' | 'addExpense' | 'pay'
export type HubTab = 'plan' | 'polls' | 'money'

export interface Poll {
  question: string
  options: string[]
  votes: Partial<Record<PersonId, string>>
  status: 'live' | 'closed'
  closesAt: number
  winner?: string
  nudged: boolean
}

export interface Toast {
  id: number
  text: string
  tone: 'success' | 'neutral'
}

export interface Push {
  title: string
  body: string
  device: string
}

export interface Transfer {
  from: PersonId
  to: PersonId
  amount: number
}

interface State {
  screen: Screen
  sheet: Sheet
  hubTab: HubTab
  renAdded: boolean
  poll: Poll | null
  dinnerShares: Partial<Record<PersonId, number>> | null
  settleRequested: boolean
  paid: PersonId[]
  viewer: PersonId
  toast: Toast | null
  push: Push | null
  highlightDinner: boolean

  go: (screen: Screen, tab?: HubTab) => void
  openSheet: (sheet: Sheet) => void
  setTab: (tab: HubTab) => void
  showToast: (text: string, tone?: Toast['tone']) => void
  addRen: () => void
  sendPoll: (options: string[]) => void
  vote: (who: PersonId, option: string) => void
  nudge: () => void
  closePoll: () => void
  saveExpense: (shares: Partial<Record<PersonId, number>>) => void
  askSettle: () => void
  openPush: () => void
  pay: () => void
  reset: () => void
}

// Timers drive the "other people" in the demo. They are cleared on reset.
let timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => {
  timers.push(setTimeout(fn, ms))
}

export const members = (s: Pick<State, 'renAdded'>): PersonId[] =>
  s.renAdded ? [...CREW, 'ren'] : CREW

export const balances = (s: Pick<State, 'dinnerShares'>): Record<PersonId, number> => {
  const b = { ...balancesBeforeDinner }
  if (s.dinnerShares) {
    b[ME] += DINNER_TOTAL
    for (const [id, share] of Object.entries(s.dinnerShares)) b[id as PersonId] -= share ?? 0
  }
  return b
}

// Greedy debt simplification: largest debtor pays largest creditor until everyone is even.
export const simplify = (b: Record<PersonId, number>): Transfer[] => {
  const cred = Object.entries(b).filter(([, v]) => v > 0.5).map(([id, v]) => ({ id: id as PersonId, v }))
  const debt = Object.entries(b).filter(([, v]) => v < -0.5).map(([id, v]) => ({ id: id as PersonId, v: -v }))
  const out: Transfer[] = []
  while (cred.length && debt.length) {
    cred.sort((a, z) => z.v - a.v)
    debt.sort((a, z) => z.v - a.v)
    const c = cred[0]
    const d = debt[0]
    const amt = Math.min(c.v, d.v)
    out.push({ from: d.id, to: c.id, amount: Math.round(amt) })
    c.v -= amt
    d.v -= amt
    if (c.v < 0.5) cred.shift()
    if (d.v < 0.5) debt.shift()
  }
  return out
}

export const tally = (poll: Poll) =>
  poll.options.map((id) => ({
    id,
    voters: (Object.entries(poll.votes) as [PersonId, string][]).filter(([, v]) => v === id).map(([p]) => p),
  }))

const initial = {
  screen: 'home' as Screen,
  sheet: null as Sheet,
  hubTab: 'plan' as HubTab,
  renAdded: false,
  poll: null as Poll | null,
  dinnerShares: null as Partial<Record<PersonId, number>> | null,
  settleRequested: false,
  paid: [] as PersonId[],
  viewer: ME as PersonId,
  toast: null as Toast | null,
  push: null as Push | null,
  highlightDinner: false,
}

export const useTrip = create<State>((set, get) => ({
  ...initial,

  go: (screen, tab) => set((s) => ({ screen, sheet: null, hubTab: tab ?? s.hubTab })),
  openSheet: (sheet) => set({ sheet }),
  setTab: (hubTab) => set({ hubTab }),
  showToast: (text, tone = 'success') => {
    const id = Date.now()
    set({ toast: { id, text, tone } })
    later(2600, () => {
      if (get().toast?.id === id) set({ toast: null })
    })
  },

  addRen: () => {
    set({ renAdded: true, sheet: null })
    get().showToast('Ren added to tonight’s dinner')
  },

  sendPoll: (options) => {
    set({
      poll: {
        question: 'Where should we eat tonight?',
        options,
        votes: {},
        status: 'live',
        closesAt: Date.now() + 30 * 60 * 1000,
        nudged: false,
      },
      sheet: null,
      screen: 'poll',
    })
    const first = options[0]
    const second = options[1] ?? first
    later(1400, () => get().vote('maya', first))
    later(2800, () => get().vote('leo', first))
    later(4300, () => get().vote('sam', second))
    // If nobody nudges, the last two vote on their own.
    later(14000, () => get().nudge())
  },

  vote: (who, option) => {
    const p = get().poll
    if (!p || p.status !== 'live') return
    const votes = { ...p.votes, [who]: option }
    set({ poll: { ...p, votes } })
    const everyone = members(get())
    if (everyone.every((m) => votes[m])) later(700, () => get().closePoll())
  },

  nudge: () => {
    const p = get().poll
    if (!p || p.status !== 'live' || p.nudged) return
    set({ poll: { ...p, nudged: true } })
    const last = p.options[p.options.length - 1]
    later(1300, () => get().vote('nic', last))
    if (get().renAdded) later(2400, () => get().vote('ren', p.options[0]))
  },

  closePoll: () => {
    const p = get().poll
    if (!p || p.status !== 'live') return
    const counts = tally(p)
    const winner = counts.reduce((best, c) => (c.voters.length > best.voters.length ? c : best), counts[0]).id
    set({ poll: { ...p, status: 'closed', winner } })
    later(1500, () => {
      set({ screen: 'hub', hubTab: 'plan', highlightDinner: true })
      get().showToast(`${restaurantById(winner).name} won · added to tonight`)
    })
  },

  saveExpense: (shares) => {
    set({ dinnerShares: shares, sheet: null, hubTab: 'money', screen: 'hub', highlightDinner: false })
    get().showToast('Dinner added · balances updated')
  },

  askSettle: () => {
    set({ settleRequested: true })
    const debtors = simplify(balances(get())).map((t) => people[t.from].name)
    get().showToast(`Sent to ${debtors.slice(0, -1).join(', ')} and ${debtors.slice(-1)}`, 'neutral')
    const nicOwes = simplify(balances(get())).find((t) => t.from === 'nic')?.amount ?? 0
    later(1800, () =>
      set({
        push: {
          title: 'TripUp · Lisbon',
          body: `Ari asked everyone to settle. You owe €${nicOwes}.`,
          device: 'On Nic’s phone',
        },
      }),
    )
  },

  openPush: () => set({ push: null, viewer: 'nic', sheet: 'pay' }),

  pay: () => {
    set({ paid: ['nic'] })
    const rest = simplify(balances(get())).map((t) => t.from).filter((p) => p !== 'nic')
    rest.forEach((p, i) => later(900 + i * 700, () => set((s) => ({ paid: [...s.paid, p] }))))
    later(900 + rest.length * 700 + 400, () => set({ sheet: null, viewer: ME, screen: 'squared' }))
  },

  reset: () => {
    timers.forEach(clearTimeout)
    timers = []
    set({ ...initial })
  },
}))
