# CareBridge — Doctor Dashboard (Person 3's scope)

This is a standalone, runnable Vite + React + Tailwind project containing
just Person 3's piece: `DoctorDashboard`, `AppointmentsList` (the
`"appointments"` case), and the `DoctorApp` shell that switches between them.

## Run it

```bash
npm install
npm run dev
```

Opens on **http://localhost:5176** (matches the port in your screenshot).

## Files

```
doctor-dashboard/
├── index.html            # Vite entry HTML
├── package.json          # dependencies + scripts
├── vite.config.js        # dev server (port 5176)
├── tailwind.config.js    # Tailwind content paths
├── postcss.config.js     # Tailwind/Autoprefixer wiring
├── README.md
└── src/
    ├── main.jsx           # mounts <DoctorApp />
    ├── index.css          # Tailwind directives
    └── DoctorApp.jsx      # DoctorDashboard + AppointmentsList + DoctorApp
```

## Merging into the real team project

Your team almost certainly has one shared `App.jsx`/`DoctorApp.jsx` (with the
`case "appointments":` switch) that Persons 2 and 4 also touch. Don't just
drop this whole folder on top of theirs — instead:

1. Copy **`DoctorDashboard`** and **`AppointmentsList`** (and `QueueRow`,
   `StatCard` if useful) out of `src/DoctorApp.jsx` into wherever your team's
   shared component files live.
2. In the team's `DoctorApp`, wire up the `"appointments"` case to render
   `<AppointmentsList queue={queue} markDone={markDone} />`, and the
   `"dashboard"` case to `<DoctorDashboard queue={queue} markDone={markDone} />`.
3. Make sure `markDone` and the `queue` state live in the shared parent
   component (not duplicated per-page) — that's what keeps the dashboard
   stats and the full appointments list from drifting apart.

## About the shared `"queue"` key

Person 2's `AppointmentsPage` (patient booking) and this dashboard read/write
the **same** key so a booking made on one page shows up on the other.

- This standalone copy uses `localStorage` under the key `"queue"` — that
  works in any real browser tab.
- If your team is actually building this inside **Claude.ai as an artifact**
  (with the `window.storage` API mentioned in your spec), swap `loadQueue`
  and `saveQueue` in `DoctorApp.jsx` for `window.storage.get("queue", true)` /
  `window.storage.set("queue", JSON.stringify(queue), true)` instead —
  everything else (the read‑modify‑write pattern in `markDone`, the
  components, the stats logic) stays identical either way.
- ⚠️ One caveat either way: `localStorage` is per-browser and `window.storage`
  is per-artifact-session — neither is a real multi-user backend. Fine for
  this assignment/demo; for a real product you'd swap it for an actual API.
