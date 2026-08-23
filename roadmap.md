# CareBridge — Detailed Roadmap for Each Person

This is the "how to actually build your part" doc. No code has been changed — this explains
what exists already in `App.jsx`, what each person needs to implement/verify inside their own
section, what to stay away from, and the JS mechanics running underneath each feature.

General rule for everyone: **don't edit another person's components.** If you need something
from another section (e.g. Person 1 needs the doctor list Person-agnostic data `DOCTORS`), only
*read* it — never rename or restructure it without telling the team.

---

## PERSON 1 — Doctors List + Live Consultation (Video/Call/Chat)

### Scope (components you own)
`DoctorsPage`, `ConsultFlow`, `MedicineOrderButton`

### What to implement / verify
1. **Doctor list rendering** — `DOCTORS` is a plain JS array (40 objects) built once at the top
   of the file by `generateDoctors()`. Your job is just to `.map()` over it and render cards —
   don't hardcode doctors by hand.
2. **Specialty filter** — a `useState` holding the selected specialty string; filtering is a
   plain `.filter()` on the array, re-run on every render (no need for `useEffect` here since
   there's no async work).
3. **Payment-before-call gate** — this is the important logic. `ConsultFlow` has a `stage` state
   machine with three values: `"pay" → "live" → "done"`. It **starts at `"pay"`** and only moves
   to `"live"` when `PaymentModal`'s `onSuccess` fires. Never let the call UI render before
   payment succeeds — that's the whole point of the gate.
4. **The timer** — this is a `useEffect` that runs `setInterval(() => setSeconds(s => s+1), 1000)`
   only while `stage === "live"` and mode is video/call. It's cleaned up (`clearInterval`) in two
   places: the `useEffect`'s cleanup function (runs if the component unmounts) and manually
   inside `endCall()`. If you ever see the timer keep running after the call ends, you forgot to
   clear the interval in one of those two spots.
5. **Ending the call** — `endCall()` stops the timer, builds a plain JS object (`entry`) with
   doctor name, type, formatted duration, and the medicine list, then does:
   ```
   read hist_<username> from storage → unshift the new entry → write it back
   ```
   This is why History (Person 2's page) "just works" — you're writing to the same storage key
   they read from. You don't need to touch their component.
6. **Prescription + medicine ordering** — after the call ends, `notes` (a `useState` array of
   strings) is shown as the prescription. `MedicineOrderButton` is a small self-contained
   component: it opens `PaymentModal` again for the medicine total, and on success pushes an
   order into `medorders_<username>`.

### What NOT to do
- Don't add new pages, new specialties, or a real video stream — this is a UI simulation, no
  camera/mic access, no WebRTC. Faking the timer and photo is the whole assignment.
- Don't move the payment step to *after* the call — the brief specifically wants fees collected
  first.
- Don't touch `AppointmentsPage`, `MedicinesPage`, `HistoryPage`, or `EmergencyPage` — those are
  Person 2's.
- Don't invent new storage keys for prescriptions — reuse `hist_<username>` so Person 2's
  History page keeps working without any change on their end.

### JS mechanics behind this section
- `useState` for: filter, `stage`, `seconds`, `messages`, chat `input`, `notes`
- `useEffect` with a dependency array `[stage, mode]` to start/stop the interval
- `useRef` (`timerRef`) to hold the interval ID so it can be cleared from a different function
  than the one that created it
- `async/await` calls to `loadData` / `saveData` only at the moment the call ends (not on every
  render — that would spam storage)

---

## PERSON 2 — Appointments + Medicines + History + Emergency

### Scope (components you own)
`AppointmentsPage`, `MedicinesPage`, `HistoryPage`, `EmergencyPage`, `DeliveryCountdown`

### What to implement / verify
1. **Appointments booking** — pick a doctor (`useState selectedDoc`), pick a slot from the fixed
   `TIME_SLOTS` array, then `confirm()` does two writes:
   - `appts_<username>` (shared:false) — this patient's own booking history
   - `queue` (shared:true) — **this is what Person 3 reads.** If you forget the shared write,
     Person 3's doctor dashboard will look empty even though the booking "worked" for the patient.
2. **Medicine suggestion** — `suggest()` does a simple case-insensitive substring match between
   the typed symptom text and each medicine's `tags` array. This is not AI — it's literally
   `q.includes(t) || t.includes(q)`. Don't over-engineer it with a real NLP model; that's outside
   scope.
3. **Medicine catalog + cart** — `cart` is a `useState` object shaped like `{ [medicineId]: qty }`.
   Add/remove just increments/decrements. Total is computed on every render with `.reduce()` —
   no need to store the total separately.
4. **Checkout** — opens `PaymentModal`, and on success writes an order object (`items`, `total`,
   `placedAt: Date.now()`) into `medorders_<username>`.
5. **5-minute delivery countdown** — `DeliveryCountdown` takes `placedAt` (a timestamp) and runs
   its own `setInterval` every second, computing `300 - secondsElapsed`. When it hits 0 it shows
   "Delivered". This is why closing and reopening the page still shows the correct remaining time
   — it's calculated from the stored timestamp, not from a counter that resets.
6. **History page** — purely a reader: `useEffect` on mount loads `hist_<username>` and renders
   it. For a brand-new signup this array is `[]` (set during signup), so you must show a friendly
   empty state, not a blank screen or an error.
7. **Emergency page** — reads shared `beds` (so it reflects whatever Person 4 sets on their Beds
   page) and the SOS form writes to both `sos_<username>` (personal) and `sos_all` (shared, in
   case a doctor view is added later).

### What NOT to do
- Don't rebuild the payment modal — reuse the shared `PaymentModal` component exactly as Person 1
  uses it, just with a different `title`/`amount`.
- Don't write appointment bookings only to the personal key — the shared `queue` write is
  mandatory or Person 3's page has nothing to show.
- Don't make the countdown a plain decrementing number stored in state without a timestamp — if
  you do, refreshing the page resets it to 5:00 again, which is wrong.
- Don't touch `DoctorsPage` or `ConsultFlow` (Person 1's).

### JS mechanics behind this section
- `useState` for: `selectedDoc`, `selectedSlot`, `booked`, `symptom`, `suggested`, `cart`,
  `showPay`, `orders`, `hospitals`, SOS form fields
- `useEffect(() => { (async () => setX(await loadData(...)))(); }, [])` — the standard pattern
  used everywhere to load storage data once when a page mounts (an async IIFE inside `useEffect`,
  since the effect callback itself can't be `async`)
- `Date.now()` used as a stable timestamp for the delivery countdown

---

## PERSON 3 — Doctor Dashboard + Appointments Queue

### Scope (components you own)
`DoctorDashboard`, and the `"appointments"` case inside `DoctorApp`

### What to implement / verify
1. **Reading the shared queue** — on mount, `useEffect` loads the shared `queue` key (the exact
   same key Person 2 writes to from `AppointmentsPage`). You never write to it from the dashboard
   stats view — only read and derive counts with `.filter()`.
2. **Stats cards** — total bookings = `queue.length`, waiting = `queue.filter(status === "waiting").length`,
   completed = the difference. These are computed at render time, not stored separately, so they
   can never go out of sync with the underlying list.
3. **Mark Done** — `markDone(id)` maps over the queue array, flips the `status` of the matching
   entry to `"done"`, updates local state (`setQueue`), and re-saves the *entire* array back to
   the shared `queue` key. This "read whole array → modify → write whole array back" pattern is
   what `window.storage` requires (there's no partial update), so always do full-array
   read-modify-write, never try to update just one field remotely.
4. **Full appointments list** (the navbar "Appointments" tab) — same data source (`queue`), just
   render every entry instead of only the first few "next in queue" ones, with a Complete button
   for anything still `"waiting"`.

### What NOT to do
- Don't create a second, doctor-specific copy of appointment data — there is one source of truth
  (`queue`) shared between the patient booking flow and the doctor's view. Duplicating it will
  cause the two sides to drift out of sync.
- Don't try to filter the queue down to "only appointments for the logged-in doctor" — in this
  version, one doctor/staff login manages the whole shared queue across all 40 marketplace
  doctors (like a reception desk). Don't add per-doctor login matching — that's out of scope.
- Don't touch `DoctorPatientsPage`, `DoctorBedsPage`, or `DoctorDirectoryPage` (Person 4's).

### JS mechanics behind this section
- `useState` for `queue`
- `useEffect(..., [])` to load once on mount
- `.filter()` / `.length` for stats (no extra state needed for counts)
- `.map()` with a conditional spread (`a.id === id ? {...a, status:"done"} : a`) for the
  read-modify-write update pattern — this is the same pattern used for the Beds page (Person 4),
  worth understanding once and reusing mentally.

---

## PERSON 4 — Patients + Beds + Directory

### Scope (components you own)
`DoctorPatientsPage`, `DoctorBedsPage`, `DoctorDirectoryPage`

### What to implement / verify
1. **Patients list** — reads shared `patients_registry`. This array is populated automatically
   by the Auth step (during signup, if role is `"patient"`, an entry is pushed here) — **you do
   not write to this key from your pages, only read it.** If it's empty, the fix is checking the
   signup flow, not adding a write inside your component.
2. **Beds management** — reads/writes shared `beds` (seeded from `HOSPITALS_SEED` the first time
   it's ever loaded, since nobody has saved to that key yet). The +/- buttons do the same
   read-modify-write pattern as Person 3's Mark Done: map over the array, update the one hospital
   that changed, clamp the value between `0` and `totalBeds` with `Math.max`/`Math.min`, save the
   whole array back.
3. **This must visibly connect to Person 2's Emergency page** — since both read the same shared
   `beds` key, changing a number here and then opening the Emergency page (even in a different
   browser tab logged in as a patient) should show the new number and the correct red/green bar.
   That live connection is the actual feature to demo, not just "buttons that increment a local
   number."
4. **Directory** — a read-only scrollable list of the static `DOCTORS` array (same array Person 1
   uses). No storage involved at all here — it's just a `.map()` over existing data.

### What NOT to do
- Don't let the Beds page fall back to only local state — if you skip the `saveData("beds", ...)`
  call, your changes will disappear on refresh and won't show up on the patient side at all. The
  whole point is that it's shared storage, not component state.
- Don't add editing/removing doctors from the Directory — it's read-only display, no CRUD needed.
  Adding that would be scope creep beyond the brief.
- Don't touch `DoctorDashboard` or the doctor appointments tab (Person 3's).

### JS mechanics behind this section
- `useState` for `patients`, `beds`
- `useEffect(..., [])` to load once
- `Math.max(0, Math.min(total, current + delta))` — the clamp pattern so beds can't go negative
  or above the hospital's total
- Same shared-storage read-modify-write pattern as Person 3 — if Person 3 explains their Mark
  Done logic to you (or vice versa), you'll both understand each other's code faster since it's
  the identical pattern applied to a different array.

---

## Cross-team notes (everyone should read once)

- **Nobody uses `localStorage`.** This project uses `window.storage` (an Anthropic artifact API)
  because plain `localStorage` doesn't work inside a Claude.ai artifact. It behaves the same way
  conceptually (`get`/`set`/`delete`), just async (`await`), and every call takes a `shared`
  true/false flag as the second argument.
- **`shared: false`** = private to this browser/account (used for personal data: history,
  appointments, orders).
- **`shared: true`** = the "hospital's shared database" (used for anything the doctor side needs
  to see: the appointment queue, bed counts, patient registry, SOS alerts).
- Every page that reads storage on load follows the same three-line pattern:
  ```
  useEffect(() => {
    (async () => setSomeState(await loadData(key, sharedFlag, fallbackValue)))();
  }, []);
  ```
  If your page's data isn't showing up, check this pattern first — a missing `await`, wrong key
  name, or wrong `shared` flag is the most common bug.
- Test across roles: create one patient account and one doctor account, keep both logged in (two
  browser tabs), and confirm actions on the patient side show up on the doctor side without
  refreshing manually needed beyond a normal page reload.
