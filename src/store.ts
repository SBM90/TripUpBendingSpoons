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

export type Screen = 'home' | 'hub' | 'poll' | 'squared' | 'nicLock' | 'nicApp'
export type Sheet = null | 'addEvent' | 'addPeople' | 'newPoll' | 'addExpense' | 'pay' | 'pickEvent' | 'recap'
export type PickFor = 'poll' | 'expense'
export type InviteTarget = 'dinner' | 'trip'
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

export interface ExpenseItem {
  id: string
  label: string
  amount: number
  who: PersonId[]
  custom?: boolean
}

export interface Peek {
  id: number
  who: PersonId
  title: string
  body: string
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
  dinnerAdded: boolean
  dinnerName: string
  dinnerDay: string
  dinnerTime: string
  closeAfter: string
  renAdded: boolean
  renScope: InviteTarget
  inviteTarget: InviteTarget
  poll: Poll | null
  dinnerShares: Partial<Record<PersonId, number>> | null
  dinnerTotal: number
  expenseItems: ExpenseItem[] | null
  expensePeople: PersonId[]
  expenseMode: 'new' | 'edit'
  needsExpenseUpdate: boolean
  // Polls and expenses always belong to an event: these track the picker and what to open after it.
  pickFor: PickFor
  afterEvent: PickFor | null
  expenseDraft: { items: ExpenseItem[]; people: PersonId[] } | null
  returnToExpense: boolean
  settleRequested: boolean
  paid: PersonId[]
  viewer: PersonId
  toast: Toast | null
  push: Push | null
  highlightDinner: boolean
  peek: Peek | null

  go: (screen: Screen, tab?: HubTab) => void
  openSheet: (sheet: Sheet) => void
  setTab: (tab: HubTab) => void
  showToast: (text: string, tone?: Toast['tone']) => void
  addDinner: (e?: { name: string; day: string; time: string }) => void
  setCloseAfter: (v: string) => void
  switchPhone: (who: PersonId, then: Partial<State>, title: string, body: string) => void
  invite: (target: InviteTarget) => void
  addRen: () => void
  sendPoll: (options: string[]) => void
  vote: (who: PersonId, option: string) => void
  nudge: () => void
  closePoll: () => void
  saveExpense: (shares: Partial<Record<PersonId, number>>, total: number, items: ExpenseItem[]) => void
  editExpense: () => void
  pickEvent: (forWhat: PickFor) => void
  inviteFromExpense: (draft: { items: ExpenseItem[]; people: PersonId[] }) => void
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

export const balances = (s: Pick<State, 'dinnerShares' | 'dinnerTotal'>): Record<PersonId, number> => {
  const b = { ...balancesBeforeDinner }
  if (s.dinnerShares) {
    b[ME] += s.dinnerTotal
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
  dinnerAdded: false,
  dinnerName: 'Final dinner',
  dinnerDay: 'Tonight',
  dinnerTime: '21:00',
  closeAfter: '30 min',
  renAdded: false,
  renScope: 'dinner' as InviteTarget,
  inviteTarget: 'dinner' as InviteTarget,
  poll: null as Poll | null,
  dinnerShares: null as Partial<Record<PersonId, number>> | null,
  dinnerTotal: DINNER_TOTAL,
  expenseItems: null as ExpenseItem[] | null,
  expensePeople: [] as PersonId[],
  expenseMode: 'new' as 'new' | 'edit',
  needsExpenseUpdate: false,
  pickFor: 'poll' as PickFor,
  afterEvent: null as PickFor | null,
  expenseDraft: null as { items: ExpenseItem[]; people: PersonId[] } | null,
  returnToExpense: false,
  settleRequested: false,
  paid: [] as PersonId[],
  viewer: ME as PersonId,
  toast: null as Toast | null,
  push: null as Push | null,
  highlightDinner: false,
  peek: null as Peek | null,
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

  addDinner: (e) => {
    const next = get().afterEvent
    set({ dinnerAdded: true, sheet: null, highlightDinner: true, afterEvent: null, ...(e ? { dinnerName: e.name || 'Final dinner', dinnerDay: e.day, dinnerTime: e.time } : {}) })
    get().showToast(`${get().dinnerName} added to ${get().dinnerDay.toLowerCase()}`)
    // Came here from "New poll" with no event yet: carry on to the poll for the new event.
    if (next === 'poll') later(500, () => set({ sheet: 'newPoll' }))
  },

  pickEvent: (pickFor) => set({ pickFor, sheet: 'pickEvent' }),

  inviteFromExpense: (draft) => set({ expenseDraft: draft, returnToExpense: true, inviteTarget: 'dinner', sheet: 'addPeople' }),

  setCloseAfter: (closeAfter) => set({ closeAfter }),

  // Flips the device to another person's phone, with a peekaboo card explaining the switch.
  switchPhone: (who, then, title, body) => {
    const id = Date.now()
    set({ peek: { id, who, title, body } })
    later(450, () => set({ viewer: who, ...then }))
    later(2600, () => {
      if (get().peek?.id === id) set({ peek: null })
    })
  },

  invite: (inviteTarget) => set({ inviteTarget, sheet: 'addPeople' }),

  addRen: () => {
    const scope = get().inviteTarget
    // If the dinner bill already exists, Ren isn't on it yet: flag it so the app can prompt an update.
    const late = !!get().dinnerShares
    const back = get().returnToExpense
    set({ renAdded: true, renScope: scope, sheet: back ? 'addExpense' : null, returnToExpense: false, highlightDinner: scope === 'dinner' && !late && !back, needsExpenseUpdate: late })
    if (back) {
      get().showToast('Ren added · tap him on the items he shared', 'neutral')
      return
    }
    get().showToast(late ? 'Ren added · he’s not on the dinner bill yet' : scope === 'dinner' ? 'Ren invited to the final dinner only' : 'Ren added to the trip', late ? 'neutral' : 'success')
  },

  sendPoll: (options) => {
    set({
      highlightDinner: false,
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

  saveExpense: (shares, total, items) => {
    const editing = get().expenseMode === 'edit'
    set({ dinnerShares: shares, dinnerTotal: total, expenseItems: items, expensePeople: members(get()), needsExpenseUpdate: false, expenseMode: 'new', expenseDraft: null, sheet: null, hubTab: 'money', screen: 'hub', highlightDinner: false })
    get().showToast(editing ? 'Dinner updated · balances recalculated' : 'Dinner added · balances updated')
  },

  editExpense: () => {
    if (get().settleRequested) {
      get().showToast('Settling has started, so this bill is locked', 'neutral')
      return
    }
    set({ expenseMode: 'edit', sheet: 'addExpense' })
  },

  askSettle: () => {
    if (get().needsExpenseUpdate) {
      get().showToast('Add Ren to the dinner bill before settling up', 'neutral')
      return
    }
    set({ settleRequested: true })
    const debtors = simplify(balances(get())).map((t) => people[t.from].name)
    get().showToast(`Sent to ${debtors.slice(0, -1).join(', ')} and ${debtors.slice(-1)}`, 'neutral')
    const nicOwes = simplify(balances(get())).find((t) => t.from === 'nic')?.amount ?? 0
    later(1500, () =>
      get().switchPhone('nic', { screen: 'nicLock', sheet: null }, 'Now you’re on Nic’s phone', 'Nic just got Ari’s request to settle up.'),
    )
    later(2700, () => set({ push: { title: 'TripUp · Lisbon', body: `Ari asked everyone to settle. You owe €${nicOwes}.`, device: 'Nic’s phone' } }))
  },

  // Tapping the notification opens Nic's app first; the pay sheet follows a moment later.
  openPush: () => {
    set({ push: null, screen: 'nicApp', sheet: null })
    later(750, () => {
      if (get().screen === 'nicApp') set({ sheet: 'pay' })
    })
  },

  pay: () => {
    set({ paid: ['nic'] })
    const rest = simplify(balances(get())).map((t) => t.from).filter((p) => p !== 'nic')
    rest.forEach((p, i) => later(900 + i * 700, () => set((s) => ({ paid: [...s.paid, p] }))))
    later(900 + rest.length * 700 + 300, () =>
      get().switchPhone(ME, { sheet: null, screen: 'squared' }, 'Back on Ari’s phone', 'Nic paid, and the rest of the group settled up too.'),
    )
  },

  reset: () => {
    timers.forEach(clearTimeout)
    timers = []
    set({ ...initial })
  },
}))
