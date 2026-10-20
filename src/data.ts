// Mock data for the "last night in Lisbon" scenario.
// Numbers match the wireflow and the case doc: dinner €210, wine €48 split 4 ways,
// trip spend €1,420, and 4 simplified transfers totalling €198.

export type PersonId = 'ari' | 'maya' | 'leo' | 'sam' | 'nic' | 'ren'

export interface Person {
  id: PersonId
  name: string
  initials: string
  color: string
}

export const people: Record<PersonId, Person> = {
  ari: { id: 'ari', name: 'Ari', initials: 'AR', color: '#6155f5' },
  maya: { id: 'maya', name: 'Maya', initials: 'MA', color: '#ff8d28' },
  leo: { id: 'leo', name: 'Leo', initials: 'LE', color: '#00c3d0' },
  sam: { id: 'sam', name: 'Sam', initials: 'SA', color: '#34c759' },
  nic: { id: 'nic', name: 'Nic', initials: 'NI', color: '#ff2d55' },
  ren: { id: 'ren', name: 'Ren', initials: 'RO', color: '#ac7f5e' },
}

export const ME: PersonId = 'ari'
export const CREW: PersonId[] = ['ari', 'maya', 'leo', 'sam', 'nic']

export interface Restaurant {
  id: string
  name: string
  vibe: string
  price: string
  walk: string
  address: string
  tint: string
}

export const restaurants: Restaurant[] = [
  { id: 'taberna', name: 'Taberna da Rua', vibe: 'Cozy Portuguese', price: '€€', walk: '4 min walk', address: 'R. dos Remédios 12', tint: '#ff8d28' },
  { id: 'ramiro', name: 'Ramiro', vibe: 'Seafood institution', price: '€€€', walk: '9 min', address: 'Av. Almirante Reis 1', tint: '#0088ff' },
  { id: 'timeout', name: 'Time Out Market', vibe: 'Food hall, casual', price: '€', walk: '12 min', address: 'Mercado da Ribeira', tint: '#34c759' },
]

export const restaurantById = (id: string) => restaurants.find((r) => r.id === id)!

// Balances from the €1,210 spent before dinner (positive = owed money).
export const balancesBeforeDinner: Record<PersonId, number> = {
  ari: 0,
  maya: 66,
  leo: -25,
  sam: -11,
  nic: -30,
  ren: 0,
}
export const SPENT_BEFORE_DINNER = 1210
// Pairwise debts across the trip before simplification (mock, shown as "9 → 4").
export const UNSIMPLIFIED_TRANSFERS = 9

// What Nic's €57 is made of, shown on the pay sheet.
export const nicBreakdown = [
  { label: 'Dinner · Taberna da Rua', amount: 27 },
  { label: 'Uber to LX Factory', amount: 18 },
  { label: 'Groceries · Casa Alfama', amount: 12 },
]

export const DINNER_TOTAL = 210
export const dinnerItems = [
  { id: 'food', label: 'Food and soft drinks', amount: 162 },
  { id: 'wine', label: 'Wine, 2 bottles', amount: 48 },
]
