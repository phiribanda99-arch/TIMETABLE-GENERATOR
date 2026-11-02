# Chalimbana University — Intelligent Timetable Scheduling System

A complete, role-based university timetable product for **Chalimbana University (CHAU)**. It covers academic data, constraint-aware generation, conflict detection, examination scheduling, analytics, and student/lecturer portals.

## What it does

- **Intelligent generator** — multi-start greedy solver that respects lecturer clashes, room clashes, student-group clashes, room type/capacity, availability, lunch, consecutive-hour limits, and soft preferences (morning lectures, compact days).
- **Conflict monitor** — hard clashes and soft workload warnings, with locked slots that survive regeneration.
- **Role portals** — Registrar/Admin, Head of Department, Lecturer, Student.
- **Resources** — rooms, lecturers, courses, offerings, cohorts (CRUD).
- **Exams** — generate a diet of papers with venue capacity.
- **Analytics** — campus heat map, lecturer load, room utilisation.
- **Export** — CSV and print/PDF of the visible timetable.
- **Persistence** — academic database stored in the browser (`localStorage`), with reset to the demonstration seed.

## Demo sign-in

Password for every demonstration account: **`ChauPass2026!`**

| Portal | ID | Person |
| --- | --- | --- |
| Administrator / Registrar | `CHAU-ADM-001` | Mrs. Ruth Kalumba |
| Head of Department (CS) | `CHAU-HOD-CS01` | Dr. Chanda Mutale |
| Lecturer | `CHAU-LEC-204` | Mr. Peter Banda |
| Student (BSc CS Year 2) | `202408912` | Mwaka Phiri |

Other staff IDs and student numbers from the seed data also authenticate.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL (typically `http://localhost:5173`).

```bash
npm run build
npm run preview
```

## Architecture

```
src/
  auth/authenticate.js      Portal authentication against seed users
  data/constants.js         Days, periods, room types, rules
  data/seed.js              CHAU 2026/2027 Semester 1 dataset
  store/database.js         localStorage database
  engine/scheduler.js       Generator + exam diet + manual move
  engine/conflicts.js       Clash detection
  engine/analytics.js       Workload and utilisation
  engine/export.js          CSV / print
  context/AppContext.jsx    Application state
  views/                    Role dashboards
```

Scheduling is performed in the browser so the product is fully usable without a backend. The data model (departments, offerings, occupancy keys, constraint set) is ready to sit on a real API later.

## Scheduling constraints

**Hard:** lecturer double-booking, room double-booking, student-group clash, room type, capacity, lecturer unavailability, lunch lock (optional), session duration fit.

**Soft:** preferred teaching days, morning lectures, Friday late slot, consecutive-hour load, weekly hour caps.
