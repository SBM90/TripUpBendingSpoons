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

console.log('1 open trip'); await tap('Lisbon with the crew'); await expect('Add the final dinner')
console.log('2 add dinner'); await tap('Add the final dinner'); await tap('Add to tonight'); await expect('Final dinner added to tonight')
console.log('3 invite Ren'); await tap('Invite a guest'); await expect('Inviting to one event'); await tap('Invite Ren to the dinner'); await expect('Ren · dinner only')
console.log('4 poll'); await tap('Start a poll for the place'); await tap('Send to the group'); await wait(4800); await tap('Taberna da Rua'); await tap('Nudge', true); await wait(5500); await expect('Taberna da Rua won')
console.log('5 tabs'); await tap('Polls', true); await expect('added to the plan'); await tap('Plan', true)
console.log('6 expense'); await tap('Add expense')
await page.evaluate(() => { for (const n of ['nic', 'ren']) [...document.querySelectorAll(`[data-chip="${n}"]`)].at(-1).click() })
await wait(400); await expect('€39 each'); await expect('€27 each'); await tap('Save expense'); await expect('€171')
console.log('7 settle'); await tap('Ask everyone to settle'); await wait(2200); await tap('tap to open'); await expect('€57.00'); await tap('Pay €57'); await wait(5200); await expect('All squared up'); await expect('€198 settled')
if (errors.length) { console.log('ERRORS', errors); process.exitCode = 1 }
await browser.close()
