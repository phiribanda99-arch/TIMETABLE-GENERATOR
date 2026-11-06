# Chalimbana University (CHAU) — Intelligent Timetable Scheduling System

An enterprise-grade, mathematical constraint-optimized academic timetable scheduling and examination planning platform engineered for higher education institutions.

Powered by a CP-SAT constraint satisfaction engine, multi-role governance (Registrar, Head of Department, Lecturer, Student), conflict detection, real-time manual adjustment with clash prevention, and multi-format exports (Excel XLSX, PDF/Print, CSV).

---

## 1. System Architecture

```
                      ┌──────────────────────────────────────────────┐
                      │          University Client Portal            │
                      │   (React SPA, Tailwind CSS, Lucide Icons)    │
                      └──────────────────────┬───────────────────────┘
                                             │
                      ┌──────────────────────▼───────────────────────┐
                      │        Application State & Local DB          │
                      │  (AppContext, Local Storage, Audit History)  │
                      └──────────────┬───────────────┬───────────────┘
                                     │               │
        ┌────────────────────────────▼─────┐   ┌─────▼────────────────────────────┐
        │  Intelligent Scheduling Engine   │   │  Independent Timetable Validator │
        │  • Domain Pruning                │   │  • 15 Hard & Soft Constraints    │
        │  • MRV & Degree Order Heuristics │   │  • Diagnostic Explanations       │
        │  • Multi-Pass Local Annealing    │   │  • Live Clash Prevention Check   │
        └──────────────────────────────────┘   └──────────────────────────────────┘
                                     │               │
        ┌────────────────────────────▼───────────────▼───────────────────────────┐
        │                        Export & Reporting Services                     │
        │  • Multi-Sheet Excel (xlsx)  • Print / PDF Layout  • CSV Data Feeds    │
        └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Scheduling Constraints Implemented

### Hard Constraints (Never Violated)
1. **Lecturer Conflict Prevention**: No lecturer is assigned to teach two classes simultaneously.
2. **Classroom Conflict Prevention**: No room or laboratory is double-booked for the same time window.
3. **Student Cohort Conflict Prevention**: No student group has concurrent compulsory lectures or practicals.
4. **Room Capacity**: Classroom capacity $\ge$ registered cohort headcount (supports lab batching).
5. **Room Type Suitability**: Practical laboratory modules strictly placed in Computer Labs or Science Labs.
6. **Lecturer Availability**: Sessions respect lecturer unavailable hours (administrative meetings, research days, senate commitments).
7. **Permitted Working Hours**: Sessions fit entirely within university hours (08:00 – 17:00, Monday through Friday).
8. **University Lunch Hour**: Protects the 12:00 – 13:00 lunch window from compulsory classes.
9. **Course Contact Hours**: Every course receives its required weekly contact hours.
10. **Session Duration**: Multi-hour sessions (e.g., 2-hour contiguous lab blocks) are scheduled without interruption.
11. **Locked / Pinned Sessions**: Administrator-locked sessions remain stationary during re-generation.

### Soft Constraints (Optimized Preferences)
1. **Student Schedule Compactness**: Penalizes non-lunch idle gaps between lectures on the same day.
2. **Weekly Day Balancing**: Distributes teaching loads evenly across Monday to Friday.
3. **Morning Lecture Priority**: Schedules demanding theoretical modules in morning slots (08:00 – 12:00).
4. **Lecturer Workload Caps**: Distributes assignments to respect weekly contract teaching ceilings (12–16 hrs/wk).

---

## 3. User Roles & Demo Credentials

| Role | Name | ID / Login | Default Password |
|---|---|---|---|
| **Academic Registrar (Admin)** | Mrs. Ruth Kalumba | `CHAU-ADM-001` | `ChauPass2026!` |
| **Head of Department (HOD)** | Dr. Chanda Mutale | `CHAU-HOD-CS01` | `ChauPass2026!` |
| **Lecturer (Computing)** | Mr. Peter Banda | `CHAU-LEC-204` | `ChauPass2026!` |
| **Student (BSc CS Year 2)** | Mwaka Phiri | `202408912` | `ChauPass2026!` |

Use the user profile selector in the top navigation bar to switch between roles instantly.

---

## 4. Prerequisites

- **Node.js**: version `18.x` or higher (`20.x` or `22.x` recommended)
- **npm**: version `9.x` or higher

Verify your installation:
```bash
node -v
npm -v
```

---

## 5. Installation Instructions

### Linux & macOS
```bash
# 1. Clone repository or navigate to project root
cd university_timetable

# 2. Install all dependencies
npm install

# 3. Verify TypeScript build and compile applet
npm run build
```

### Windows (PowerShell or Command Prompt)
```powershell
# 1. Navigate to project root
cd university_timetable

# 2. Install dependencies
npm install

# 3. Verify TypeScript build
npm run build
```

---

## 6. Running the Development Server

To launch the development server on port 3000:

```bash
npm run dev
```

Open your browser to:
```
http://localhost:3000
```

---

## 7. Running Automated Tests

The test suite validates core scheduling logic, constraint satisfaction, and infeasibility diagnostics using Node's built-in test runner:

```bash
npx --yes tsx --test src/engine/scheduler.test.ts
```

All 6 test suites execute in milliseconds:
- `buildSessionsFromCourses`: Verifies atomic decomposition of lecture and practical hours.
- `Independent validator detects lecturer double-booking`: Ensures simultaneous clashes fail validation.
- `Independent validator detects classroom double-booking`: Verifies room collision prevention.
- `Feasibility analyzer detects impossible room capacity`: Ensures impossible student group sizes are caught before solving.
- `Solver respects lecturer unavailable slots strictly`: Validates blocking of restricted time slots.
- `Solver preserves fixed/locked sessions`: Ensures pinned sessions survive re-optimization.

---

## 8. Workflow: Timetable Generation & Management

1. **Dashboard & KPIs**: Inspect total courses (18), teaching faculty (12), classrooms (12), and cohorts (7).
2. **Generate Timetable**: Click **"Generate Intelligent Timetable"** to run the CP-SAT solver. The engine reports runtime, scheduled sessions, room utilization, and constraint status.
3. **Master Timetable View**: Use the grid view with filters by *University Master*, *Student Cohort*, *Lecturer*, *Classroom/Lab*, *Department*, or *Programme*.
4. **Manual Session Relocation**: Click any session card to open the allocation modal. Choose a target day, time window, and room. The modal runs real-time independent constraint validation and prevents invalid moves.
5. **Session Pinning / Locking**: Toggle session lock in the manual allocation modal to preserve the position across solver re-runs.
6. **Infeasibility Testing**: Click **"Test Infeasibility"** to inject a deliberately contradictory course (500 students in 140 max hall). Observe how the system halts with `STATUS: INFEASIBLE` and guides resolution.
7. **Examination Diet**: Access the **"Exam Timetable Diet"** tab to review session windows, invigilator assignments, and candidate seating.
8. **Export Timetable**: Export formatted workbooks via **"Excel (XLSX)"** or print a formal paper timetable with sign-off blocks via **"Print / PDF"**.
9. **Reset Database**: Click **"Reset Demo Database"** in the sidebar footer at any time to restore the demonstration seed.

---

## 9. Production Build & Deployment

To prepare for production deployment:

```bash
# Clean and produce optimized static production bundle in dist/
npm run build

# Preview production build locally
npm run preview
```

### Static Web Hosting
The production bundle in `/dist` can be hosted on any web server or CDN (Nginx, Apache, Cloudflare Pages, Vercel, Firebase Hosting, AWS S3 / CloudFront).
