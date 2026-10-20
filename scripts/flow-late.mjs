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

console.log('1 trip + dinner, no Ren'); await tap('Lisbon with the crew'); await tap('Add another event'); await tap('Add to tonight')
console.log('2 poll without Ren'); await tap('Start a poll for the place'); await tap('Send to the group'); await wait(4800); await tap('Taberna da Rua'); await tap('Nudge', true); await wait(4500); await expect('Taberna da Rua won')
console.log('3 bill for 5'); await tap('Add expense'); await page.evaluate(() => document.querySelector('[data-item="wine"]').click()); await wait(500)
await page.evaluate(() => [...document.querySelectorAll('[data-chip="nic"]')].at(-1).click()); await wait(300); await expect('€32.40'); await tap('Save expense'); await expect('Dinner added')
console.log('4 invite Ren late'); await tap('Plan', true); await tap('Invite a guest'); await tap('Invite Ren to the dinner'); await expect('he’s not on the dinner bill yet'); await expect('Ren isn’t on the dinner bill yet')
await tap('Money', true); await tap('Ask everyone to settle'); await expect('Add Ren to the dinner bill before settling up')
console.log('5 update bill'); await tap('Update', true); await expect('Edit expense'); await expect('Ren joined after this was logged'); await expect('Nic and Ren not in')
await page.evaluate(() => [...document.querySelectorAll('[data-chip="ren"]')][0].click()); await wait(400); await expect('Nic and Ren not in'); await expect('€27 each'); await tap('Save changes'); await expect('Dinner updated'); await expect('Ren pays Maya'); await expect('€171')
if (errors.length) { console.log('ERRORS', errors); process.exitCode = 1 }
await browser.close()
