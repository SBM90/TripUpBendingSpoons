// Screenshots every scenario state at iPhone 15 size (393x852 @2x) using the dev server.
// Usage: node scripts/shots.mjs [filter]   (dev server must be running on :5173)
import puppeteer from 'puppeteer-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const URL = process.env.URL ?? 'http://localhost:5173'
const only = process.argv[2]

const wine = { ari: 39, maya: 39, leo: 39, sam: 39, nic: 27, ren: 27 }
const total = 210
const crew5 = ['ari', 'maya', 'leo', 'sam', 'nic']
const five = { ari: 44.4, maya: 44.4, leo: 44.4, sam: 44.4, nic: 32.4 }
const items5 = [{ id: 'food', label: 'Food and soft drinks', amount: 162, who: crew5 }, { id: 'wine', label: 'Wine, 2 bottles', amount: 48, who: ['ari', 'maya', 'leo', 'sam'] }]
const poll = (votes, status = 'live', winner) => ({
  question: 'Where should we eat tonight?',
  options: ['taberna', 'ramiro', 'timeout'],
  votes,
  status,
  winner,
  closesAt: Date.now() + 1800000,
  nudged: false,
})
const live = { maya: 'taberna', leo: 'taberna', sam: 'ramiro' }
const final = { ...live, ari: 'taberna', nic: 'timeout', ren: 'taberna' }

const states = {
  '01-home': {},
  '02-hub': { screen: 'hub' },
  '02b-add-event': { screen: 'hub', sheet: 'addEvent' },
  '02c-dinner-added': { screen: 'hub', dinnerAdded: true, highlightDinner: true },
  '03-add-people': { screen: 'hub', dinnerAdded: true, sheet: 'addPeople', inviteTarget: 'dinner' },
  '03b-ren-invited': { screen: 'hub', dinnerAdded: true, renAdded: true, highlightDinner: true },
  '03c-scrolled': { screen: 'hub', dinnerAdded: true, renAdded: true, after: 'scroll' },
  '04-new-poll': { screen: 'hub', dinnerAdded: true, renAdded: true, sheet: 'newPoll' },
  '05-live-poll': { screen: 'poll', dinnerAdded: true, renAdded: true, poll: poll(live) },
  '04b-poll-edit': { screen: 'hub', dinnerAdded: true, renAdded: true, sheet: 'newPoll', after: 'edit' },
  '05b-live-voted': { screen: 'poll', dinnerAdded: true, renAdded: true, poll: poll({ ...live, ari: 'taberna' }) },
  '06-plan-updated': { screen: 'hub', dinnerAdded: true, renAdded: true, poll: poll(final, 'closed', 'taberna'), highlightDinner: true, toast: { id: 1, text: 'Taberna da Rua won · added to tonight', tone: 'success' } },
  '06b-polls-tab': { screen: 'hub', hubTab: 'polls', dinnerAdded: true, renAdded: true, poll: poll(final, 'closed', 'taberna') },
  '07-add-expense': { screen: 'hub', dinnerAdded: true, renAdded: true, poll: poll(final, 'closed', 'taberna'), sheet: 'addExpense', after: 'wine' },
  '08-money': { screen: 'hub', hubTab: 'money', dinnerAdded: true, renAdded: true, poll: poll(final, 'closed', 'taberna'), dinnerShares: wine },
  '08b-push': { screen: 'hub', hubTab: 'money', dinnerAdded: true, renAdded: true, poll: poll(final, 'closed', 'taberna'), dinnerShares: wine, dinnerTotal: total, settleRequested: true, push: { title: 'TripUp · Lisbon', body: 'Ari asked everyone to settle. You owe €57.', device: 'On Nic’s phone' } },
  '09-pay': { screen: 'hub', hubTab: 'money', dinnerAdded: true, renAdded: true, poll: poll(final, 'closed', 'taberna'), dinnerShares: wine, dinnerTotal: total, settleRequested: true, sheet: 'pay', viewer: 'nic' },
  '09b-nic-lock': { screen: 'nicLock', viewer: 'nic', dinnerAdded: true, renAdded: true, poll: poll(final, 'closed', 'taberna'), dinnerShares: wine, dinnerTotal: total, settleRequested: true, push: { title: 'TripUp · Lisbon', body: 'Ari asked everyone to settle. You owe €57.', device: 'Nic’s phone' } },
  '09c-peek': { screen: 'nicLock', viewer: 'nic', dinnerAdded: true, renAdded: true, peek: { id: 1, who: 'nic', title: 'Now you’re on Nic’s phone', body: 'Nic just got Ari’s request to settle up.' } },
  '11-late-banner': { screen: 'hub', hubTab: 'money', dinnerAdded: true, renAdded: true, needsExpenseUpdate: true, poll: poll(final, 'closed', 'taberna'), dinnerShares: five, dinnerTotal: total, expenseItems: items5, expensePeople: crew5 },
  '12-edit-expense': { screen: 'hub', hubTab: 'money', dinnerAdded: true, renAdded: true, needsExpenseUpdate: true, poll: poll(final, 'closed', 'taberna'), dinnerShares: five, dinnerTotal: total, expenseItems: items5, expensePeople: crew5, sheet: 'addExpense', expenseMode: 'edit' },
  '13-nic-app': { screen: 'nicApp', viewer: 'nic', dinnerAdded: true, renAdded: true, poll: poll(final, 'closed', 'taberna'), dinnerShares: wine, dinnerTotal: total, settleRequested: true },
  '14-dinner-2030': { screen: 'hub', dinnerAdded: true, dinnerTime: '20:30', renAdded: true },
  '15-picker': { screen: 'hub', hubTab: 'polls', sheet: 'pickEvent', pickFor: 'poll' },
  '16-picker-expense': { screen: 'hub', hubTab: 'money', sheet: 'pickEvent', pickFor: 'expense', dinnerAdded: true },
  '17-recap': { screen: 'squared', dinnerAdded: true, renAdded: true, poll: poll(final, 'closed', 'taberna'), dinnerShares: wine, dinnerTotal: total, settleRequested: true, paid: ['nic', 'leo', 'sam', 'ren'], sheet: 'recap' },
  '18-settling': { screen: 'hub', hubTab: 'money', dinnerAdded: true, renAdded: true, poll: poll(final, 'closed', 'taberna'), dinnerShares: wine, dinnerTotal: total, settleRequested: true, paid: ['nic', 'leo'] },
  '10-squared': { screen: 'squared', dinnerAdded: true, renAdded: true, poll: poll(final, 'closed', 'taberna'), dinnerShares: wine, dinnerTotal: total, settleRequested: true, paid: ['nic', 'leo', 'sam', 'ren'] },
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: Number(process.env.W ?? 393), height: Number(process.env.H ?? 852), deviceScaleFactor: Number(process.env.DSF ?? 1), isMobile: !process.env.W, hasTouch: !process.env.W })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

for (const [name, st] of Object.entries(states)) {
  if (only && !name.includes(only)) continue
  await page.goto(URL, { waitUntil: 'networkidle0' })
  const { after, ...state } = st
  await page.evaluate((s) => {
    window.trip.getState().reset()
    window.trip.setState(s)
  }, state)
  await new Promise((r) => setTimeout(r, 900))
  if (after === 'scroll') {
    await page.evaluate(() => { const el = [...document.querySelectorAll('.overflow-y-auto')].at(-1); el.scrollTop = 420; el.dispatchEvent(new Event('scroll')) })
    await new Promise((r) => setTimeout(r, 700))
  }
  if (after === 'edit') {
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith('Edit'))?.click())
    await new Promise((r) => setTimeout(r, 600))
  }
  if (after === 'wine') {
    await page.evaluate(() => {
      const chips = (n) => [...document.querySelectorAll('[data-chip]')].filter((b) => b.dataset.chip === n)
      chips('nic').at(-1)?.click()
      chips('ren').at(-1)?.click()
    })
    await new Promise((r) => setTimeout(r, 600))
  }
  await page.screenshot({ path: `shots/${name}.png` })
  console.log('shot', name)
}
if (errors.length) console.log('ERRORS:\n' + errors.join('\n'))
await browser.close()
