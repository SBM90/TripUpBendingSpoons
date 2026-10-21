# TripUp UX review: laws of UX

An audit of the coded prototype against 19 UX laws and principles. For each one: where TripUp applies it, and any gap found in the audit with the fix that was made.

## Summary

The prototype already follows most of the laws, because the brief's core constraint ("more than a couple of taps and users switch to WhatsApp") pushes toward few choices, big targets and instant feedback. The audit found five gaps, all fixed in the same pass:

1. Hick's law: the event picker listed finished events as full rows. They now collapse into one muted line.
2. Fitts's law: four small text links had hit areas under 44 pt. They now have padded, full-height targets.
3. Goal-gradient: settling up had no visible progress. The Money tab now shows "2 of 4 paid" with a bar that fills as transfers land.
4. Peak-end rule: "Share trip recap" only showed a toast. It now opens a recap card (places, polls, spend, who came) with share options, so the final moment of the trip is rewarding.
5. Visual hierarchy: before the dinner existed, the Plan tab showed two equal "Add" actions (the dashed slot and the bottom button). The slot is now the in-context secondary action and the bottom button is the single primary.

## The laws

| Law | Where TripUp applies it | Gap and fix |
|---|---|---|
| Hick's law: decision time grows with the number of choices | Plan tab has one primary action ("Add an event"). New poll preselects three nearby restaurants. Close time offers four presets. Add event shows only Tonight and five times. | Event picker showed past events as full choices. Collapsed into one line. |
| Fitts's law: targets should be large and close | Primary buttons are full width, 50 pt, at the bottom in the thumb zone. Split toggles are 36 pt avatars with labels (56 pt tall). Icon buttons are 44 pt. | "Change", "See everyone's balance", "Share an invite link" and "Back to Ari" were small text links. Given 44 pt targets. |
| Jakob's law: users expect apps to work like the apps they already use | iOS conventions: large titles, sheets with grabbers, segmented control, swipe between tabs, lock-screen notifications. WhatsApp-style invite links. Splitwise-style simplified debts. | None. |
| Miller's law: people hold about 7 items in working memory | Events grouped by day. Settle-up is 4 transfers instead of 9. Polls cap at 3 options. Six people in the split grid. | None. |
| Doherty threshold: respond in under 400 ms | Votes, toggles and totals update instantly (optimistic, local). Every tap animates within 300 ms. The only wait (paying, 1.1 s) shows a spinner and "Sending…". | None. |
| Law of proximity: related items sit together | The event card keeps time, place, people and its next action in one block. Item totals sit directly under the items. | None. |
| Law of similarity: things that look alike are read as alike | One card style for every event and item. Blue means interactive or primary, orange means guest or dinner-only, green means paid or done, red means live or error. | None. |
| Law of common region: a shared boundary groups content | Each event, poll option and expense item is its own rounded region. Sheets separate a task from the page behind it. | None. |
| Visual hierarchy | Large title, then section titles, then cards. One primary button per view. The new event gets a blue ring until it is acted on. | Two equal "Add" actions on Plan before the dinner existed. One primary now. |
| Progressive disclosure | Expense items collapse to a one-line summary and expand to the people toggles. Close-time presets sit behind "Edit". Everyone's balance is behind a link. The invite scope only appears when inviting. | None. |
| Recognition rather than recall | Restaurants show vibe, price and walking time. Avatars always carry names. The poll shows which event it is for. Late guests are tagged "New". The event picker lists real events instead of asking the user to type. | None. |
| Von Restorff effect: the different item is remembered | "Leading" and "Recommended" chips, the red Live chip, the blue ring on the new event, the orange late-guest banner. | None. |
| Peak-end rule: experiences are judged by their peak and their end | Peak: the winning restaurant morphs into the plan with a toast. End: the animated "All squared up" check. | Recap button did nothing useful. Now a recap card. |
| Goal-gradient effect: motivation rises near the goal | Poll shows "4 of 6 voted" with live bars. The desktop demo shows a scenario checklist. | No progress while settling. Added "x of 4 paid" progress. |
| Serial position effect: first and last items are remembered best | The live trip is first on Home. The primary action is last, at the bottom. Tabs follow the flow: Plan, Polls, Money. | None. |
| Tesler's law: complexity has to live somewhere, so the app should absorb it | Debts simplified from 9 to 4. Polls close themselves and fill the event. Split maths is automatic. Ren's €27 is routed to Maya to save a transfer. | None. |
| Postel's law: be liberal in what you accept, strict in what you give | Amounts accept "18,50" or "18.50". Guests join by link without an account. Event names are free text. Output is strict: every item needs a name and an amount, and the split must add up. | None. |
| Occam's razor: remove what isn't needed | Removed during iteration: anonymous votes, duplicate day and time rows, the second contact, quick actions on Plan, the recent-expenses list, helper copy. | None. |
| Feedback loops | Toasts confirm every action. Votes arrive live. Nudges and push notifications close the loop with people who haven't acted. Balances update the moment a bill is saved. The late-guest banner prompts a fix. Validation explains what is missing. | None. |

## Guardrails for testers

The prototype is deliberately restrictive so every tester follows the scenario:

- Polls and expenses must belong to an event, picked from a list. A poll with no event offers "Add a new event first" and then opens the poll for it.
- Add event only allows tonight and food. Other days, dates and event types explain that they aren't part of the demo.
- An event needs a name. Expense items need a name and an amount.
- Dinner items can't be deleted (a notice explains); added items can.
- Settling up is blocked until a late guest is on the bill. The bill locks once settling starts.
