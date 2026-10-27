# MediSync / CareBridge Combined Healthcare Platform (Suryansh)

An integrated full-stack healthcare web application combining patient portal, doctor & staff management, OPD appointments, pharmacy orders, emergency live hospital beds, hotlines, and medical history.

---

## 🏛️ State Management Architecture (College Viva Reference)

The application implements a clean, production-grade architectural separation between **React Context API** and **Redux Toolkit (RTK)**:

| Feature / Scope | React Context API | Redux Toolkit (RTK) |
|---|---|---|
| **Primary Purpose** | Patient Identity & Session Data | Shared Application UI State |
| **Managed State** | `user` (name, role, bloodGroup, hospitalBranch) | `theme` (mode: 'light' \| 'dark'), `preferences` |
| **Location** | `src/context/UserContext.jsx`, `src/context/ThemeContext.jsx` (bridge) | `src/redux/store.js`, `src/redux/slices/` |
| **Why this separation?** | Session and identity data change infrequently during a session. React Context avoids prop drilling without complex boilerplate. | Theme and UI preferences are shared application-wide, benefit from Redux DevTools, predictable reducers (`createSlice`), and Immer-based immutable updates. |
| **Custom Hooks / Selectors** | `useUser()`, `useTheme()` (bridge hook) | `useSelector(selectTheme)`, `useDispatch(toggleTheme())` |

---

## 🌓 Dark Mode & Light Mode Implementation

1. **Redux Theme Slice (`src/redux/slices/themeSlice.js`)**:
   - Manages state: `{ mode: 'light' | 'dark' }`.
   - Initializes from `localStorage.getItem('medisync_theme')` with OS dark mode fallback (`prefers-color-scheme: dark`).
   - Dispatches `toggleTheme()` or `setTheme(mode)` and automatically syncs to `localStorage`.
2. **Context API Bridge (`src/context/ThemeContext.jsx`)**:
   - Provides backward compatibility for `useTheme()` hook so existing components continue to function seamlessly without breaking.
3. **DOM Synchronization (`src/components/App.jsx` & `index.html`)**:
   - Sets `document.documentElement.setAttribute('data-theme', theme)` and `document.body.className`.
   - Pre-render script in `index.html` head eliminates theme flashing on reload.
4. **CSS Variables (`src/App.css` & `src/index.css`)**:
   - Neo-brutalist / modern clean design tokens for backgrounds, text, cards, borders, inputs, modals, tags, and status alerts.
   - Smooth `0.25s` color transitions across all pages:
     * Home Page (`Home.jsx`)
     * Auth / Login (`Auth.jsx`)
     * Navbar (`Navbar.jsx`)
     * Doctor Portal (`DoctorApp.jsx`)
     * Medical History / Dashboard (`HistoryPage.jsx`)
     * Doctors Directory & Details (`DoctorsPage.jsx`, `DoctorDetailsPage.jsx`)
     * Appointments Booking (`AppointmentsPage.jsx`)
     * Pharmacy & Medicine Catalog (`MedicinesPage.jsx`)
     * Emergency Beds & Hotlines (`EmergencyPage.jsx`)
     * 404 Fallback (`NotFoundPage.jsx`)
     * Common components (`Card`, `Button`, `Input`, `Modal`)

---

## 🚀 Running and Testing the Application

Inside the `Suryansh` directory:

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build

# 4. Run ESLint checks
npm run lint
```
