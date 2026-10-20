// Clicks through the whole scenario like a user and checks key numbers along the way.
// Usage: node scripts/flow.mjs   (dev server must be running on :5173)
import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto(process.env.URL ?? 'http://localhost:5173', { waitUntil: 'networkidle0' })

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const tap = async (text, exact = false) => {
  const ok = await page.evaluate(
    (t, ex) => {
      const els = [...document.querySelectorAll('button')].filter((b) => (ex ? b.textContent.trim() === t : b.textContent.includes(t)))
      const el = els.at(-1)
      if (!el) return false
      el.click()
      return true
    },
    text,
    exact,
  )
  if (!ok) throw new Error(`No button: ${text}`)
  await wait(700)
}
const expect = async (text) => {
  const found = await page.evaluate((t) => document.body.innerText.toLowerCase().includes(t.toLowerCase()), text)
  console.log(found ? '  ok ' : '  FAIL', text)
  if (!found) process.exitCode = 1
}

console.log('1 open trip'); await tap('Lisbon with the crew'); await expect('Add another event')
console.log('2 add dinner'); await tap('Add another event'); await tap('20:30', true); await tap('Add to tonight'); await expect('Final dinner added to tonight'); await expect('20:30')
const order = await page.evaluate(() => { const t = document.body.innerText; return [t.indexOf('LX Factory'), t.indexOf('Final dinner'), t.indexOf('Bairro Alto')] }); console.log(order[0] < order[1] && order[1] < order[2] ? '  ok  dinner sorted between 15:00 and 23:30' : '  FAIL dinner order ' + order)
console.log('3 invite Ren'); await tap('Invite a guest'); await expect('Inviting to one event'); await expect('The whole group'); await tap('Invite Ren to the dinner'); await expect('Ren · dinner only')
console.log('4 poll'); await tap('Start a poll for the place'); await tap('Edit'); await tap('15 min', true); await expect('In 15 min or when everyone votes'); await tap('Send to the group'); await wait(4800); await tap('Taberna da Rua'); await tap('Nudge', true); await wait(5500); await expect('Taberna da Rua won')
console.log('5 tabs + swipe'); await tap('Polls', true); await expect('added to the plan'); await tap('Plan', true)
const swipe = async (from, to) => { await page.mouse.move(from, 600); await page.mouse.down(); for (let i = 1; i <= 8; i++) await page.mouse.move(from + ((to - from) * i) / 8, 602); await page.mouse.up(); await wait(800) }
await swipe(330, 60); await expect('Earlier'); await swipe(330, 60); await expect('Simplest way to settle'); await swipe(60, 330); await swipe(60, 330); await expect('Bairro Alto drinks')
console.log('6 expense'); await tap('Add expense')
await page.evaluate(() => document.querySelector('[data-item="wine"]').click()); await wait(500); await page.evaluate(() => { for (const n of ['nic', 'ren']) [...document.querySelectorAll(`[data-chip="${n}"]`)].at(-1).click() })
await wait(400); await expect('€39'); await expect('Nic and Ren not in'); await expect('Scan receipt'); await expect('paid by Ari'); await tap('Add expense item'); console.log(await page.evaluate(() => !!document.querySelector('input[placeholder^="Dessert"]')) ? '  ok  new item input' : '  FAIL new item input'); await page.evaluate(() => [...document.querySelectorAll('button[aria-label="Remove item"]')].at(-1).click()); await wait(400); await tap('Save expense'); await expect('€171')
console.log('7 settle'); await tap('Ask everyone to settle'); await wait(1900); await expect('Now you’re on Nic’s phone'); await wait(3000); await expect('Nic’s phone'); await tap('TripUp · Lisbon'); await expect('You owe'); await wait(1200); await expect('€57.00'); await tap('Pay €57'); await wait(4200); await expect('Back on Ari’s phone'); await wait(3000); await expect('All squared up'); await expect('€198 settled')
if (errors.length) { console.log('ERRORS', errors); process.exitCode = 1 }
await browser.close()
