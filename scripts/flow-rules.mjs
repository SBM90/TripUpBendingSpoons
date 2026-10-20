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

const toastHas = async (t) => expect(t)
console.log('A poll needs an event'); await tap('Lisbon with the crew'); await tap('Polls', true); await tap('New poll'); await expect('New poll for'); await expect('Add a new event first')
await tap('Bairro Alto drinks'); await toastHas('This demo runs the poll for the dinner')
await tap('Add a new event first'); await expect('Add to the plan')
console.log('B add event restrictions'); await tap('Tomorrow', true); await toastHas('Other days aren’t part of this demo'); await expect('Tonight · Sat 18 Oct')
await tap('Activity', true); await toastHas('other event types aren’t available')
await page.evaluate(() => { const i = document.querySelector('input'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, ''); i.dispatchEvent(new Event('input', { bubbles: true })) }); await wait(300); await expect('Give the event a name')
await page.evaluate(() => { const i = document.querySelector('input'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, 'Final dinner'); i.dispatchEvent(new Event('input', { bubbles: true })) }); await wait(300)
await tap('Add to tonight'); await wait(900); await expect('the winner fills this event'); await expect('Final dinner · 21:00')
console.log('C plan CTA'); await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Cancel')?.click()); await wait(600); await tap('Plan', true); await expect('Add an event'); console.log(await page.evaluate(() => ![...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Expense')) ? '  ok  no Poll/Expense quick actions on Plan' : '  FAIL quick actions still there')
console.log('D expense before place decided'); await tap('Money', true); await tap('Add expense'); await tap('Final dinner · 21:00'); await toastHas('Decide the dinner place first')
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Cancel')?.click()); await wait(600)
console.log('E run poll, then expense rules'); await tap('Plan', true); await tap('Start a poll for the place'); await tap('Send to the group'); await wait(4800); await tap('Taberna da Rua'); await tap('Nudge', true); await wait(4500); await expect('Taberna da Rua won')
await tap('Add expense'); await tap('Add item', true); await tap('Save expense'); await toastHas('needs a name and an amount'); await expect('Add a name and an amount')
await page.evaluate(() => [...document.querySelectorAll('[aria-label="Remove item"]')][0].click()); await wait(300); await toastHas('The dinner items stay in this demo')
await page.evaluate(() => [...document.querySelectorAll('[aria-label="Remove item"]')].at(-1).click()); await wait(500)
console.log('F invite from the expense'); await tap('Invite to dinner'); await expect('Inviting to one event'); await tap('Invite Ren to the dinner'); await wait(700); await expect('Add expense'); await expect('Ren just joined the dinner')
await page.evaluate(() => [...document.querySelectorAll('[data-chip="ren"]')][0].click()); await page.evaluate(() => [...document.querySelectorAll('[data-chip="nic"]')].at(-1).click()); await wait(300); await expect('Nic and Ren not in'); await tap('Save expense'); await expect('€171')
console.log('G bill locked once settling starts'); await tap('Ask everyone to settle'); await wait(300); await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Edit')?.click()); await wait(300); await toastHas('this bill is locked')
if (errors.length) { console.log('ERRORS', errors); process.exitCode = 1 }
await browser.close()
