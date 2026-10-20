// Screenshots every scenario state at iPhone 15 size (393x852 @2x) using the dev server.
// Usage: node scripts/shots.mjs [filter]   (dev server must be running on :5173)
import puppeteer from 'puppeteer-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const URL = process.env.URL ?? 'http://localhost:5173'
const only = process.argv[2]

const wine = { ari: 39, maya: 39, leo: 39, sam: 39, nic: 27, ren: 27 }
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
  '03-add-people': { screen: 'hub', sheet: 'addPeople' },
  '04-new-poll': { screen: 'hub', renAdded: true, sheet: 'newPoll' },
  '05-live-poll': { screen: 'poll', renAdded: true, poll: poll(live) },
  '05b-live-voted': { screen: 'poll', renAdded: true, poll: poll({ ...live, ari: 'taberna' }) },
  '06-plan-updated': { screen: 'hub', renAdded: true, poll: poll(final, 'closed', 'taberna'), highlightDinner: true, toast: { id: 1, text: 'Taberna da Rua won · added to tonight', tone: 'success' } },
  '06b-polls-tab': { screen: 'hub', hubTab: 'polls', renAdded: true, poll: poll(final, 'closed', 'taberna') },
  '07-add-expense': { screen: 'hub', renAdded: true, poll: poll(final, 'closed', 'taberna'), sheet: 'addExpense', after: 'wine' },
  '08-money': { screen: 'hub', hubTab: 'money', renAdded: true, poll: poll(final, 'closed', 'taberna'), dinnerShares: wine },
  '08b-push': { screen: 'hub', hubTab: 'money', renAdded: true, poll: poll(final, 'closed', 'taberna'), dinnerShares: wine, settleRequested: true, push: { title: 'TripUp · Lisbon', body: 'Ari asked everyone to settle. You owe €57.', device: 'On Nic’s phone' } },
  '09-pay': { screen: 'hub', hubTab: 'money', renAdded: true, poll: poll(final, 'closed', 'taberna'), dinnerShares: wine, settleRequested: true, sheet: 'pay', viewer: 'nic' },
  '10-squared': { screen: 'squared', renAdded: true, poll: poll(final, 'closed', 'taberna'), dinnerShares: wine, settleRequested: true, paid: ['nic', 'leo', 'sam', 'ren'] },
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
