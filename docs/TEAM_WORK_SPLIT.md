# Charity Center — Team Roles, Work Split, and Recent Changes

This document describes how the **charity-center** project is divided among the team, what changed after the previous `main` commit (`e898700`), and how that work was recorded in git as three separate commits (one backend, two frontend).

---

## Team members (from git history)

| Display name | Git author | Email | Primary role |
|--------------|------------|-------|--------------|
| **8harifi** | `8harifi` | `8harifi@gmail.com` | **Backend** — Django REST API, models, migrations, wallet/payments, admin APIs, deployment (Liara), tests, project docs |
| **Mobina Rasa** | `mobin-84-rasa` | `mobinarasa84@gmail.com` | **Frontend (~60%)** — public site, homepage, campaigns/needs, signup flows, API client wiring, shared layout |
| **Yasaman Alizadeh** | `yasamanalizadeh2003` | `yasamanalz00@gmail.com` | **Frontend (~40%)** — admin dashboards, request/workflow UI, wallet/admin panels, login/password reset UX |

Approximate lifetime commit counts on this repository (all branches):

- 8harifi: **82** commits  
- mobin-84-rasa: **60** commits  
- yasamanalizadeh2003: **30** commits  

Frontend ownership is intentionally **~60% Mobina / ~40% Yasaman** for the doc2 batch (by lines of React/source changed, not including the compiled `back/spa` bundle).

---

## Project layout (who owns what)

### Backend (`back/`) — **8harifi**

| Area | Path(s) | Responsibility |
|------|---------|----------------|
| Django project | `back/backend/` | Settings, URLs, WSGI, Liara static/media/database paths |
| Domain models | `back/api/models/` | Users, patients, doctors, HAs, wallets, requests, campaigns, public features (medical centers, contact messages) |
| Migrations | `back/api/migrations/` | Schema and data seeds (including doc2 migrations `0032`–`0034`) |
| Serializers | `back/api/serializers/` | API shapes for all roles and public endpoints |
| Business logic | `back/api/services/` | Donations, top-up, SMS helper |
| HTTP API | `back/api/views/` | Auth, dashboards, admin, wallet, public homepage APIs, password reset |
| Routing | `back/api/urls.py` | All `/api/...` routes |
| Tests | `back/api/tests/` | Requirement/regression tests (e.g. doc2) |
| Data seeding | `back/populate_db.py` | Local/demo database population |
| Deploy | `back/liara.json`, `back/liara_nginx.conf`, `back/.liaraignore`, `back/database/` | Liara Django deploy, persistent disk mount, nginx static/media |
| Requirements | `back/requirements.txt` | Python dependencies |

The backend serves the React SPA via `back/templates/index.html` and collected static files; the **source** SPA lives under `front/`.

### Frontend (`front/`) — **Mobina + Yasaman**

| Area | Path(s) | Primary owner (this batch) |
|------|---------|----------------------------|
| App shell & routes | `front/src/App.jsx`, `front/src/layouts/` | Mobina |
| Public homepage | `front/src/pages/Home.jsx`, `front/src/copmonent/home/*` | Mobina (new: `DoctorScheduleSection`, `HomePatientActions`, `SupportingOrgSearch`; updates to hero, map, CTA) |
| Campaigns / needs | `front/src/pages/Needs.jsx`, `front/src/components/DonateModal.jsx` | Mobina |
| Auth & signup | `front/src/pages/Auth/*`, `front/src/pages/Auth/utils/signupValidation.js` | Mobina (signup flows); Yasaman (`LoginPage` password reset) |
| Contact | `front/src/pages/ContactSection.jsx` | Mobina |
| Public API clients | `front/src/API/publicApi.js`, `PatientApi.js`, `front/src/Services/dashboardApi.js`, `walletService.js` | Mobina |
| Role dashboards (patient/doctor/HA/benefactor) | `front/src/dashboards/*Dashboard.jsx` | Mixed; small hooks in Yasaman commit for doctor/patient |
| Dashboard shell & HA introduce/request forms | `DashboardShell.jsx`, `IntroducePatientModal.jsx`, `NewRequestForm.jsx` | Mobina (this batch) |
| Admin dashboard | `AdminDashboard.jsx`, `Admin*Panel.jsx`, `ContactInboxPanel.jsx`, `AdminMedicalCentersPanel.jsx` | Yasaman |
| Request list & wallet UI | `RequestListPanel.jsx`, `WalletPanel.jsx` | Yasaman |
| Admin services | `front/src/Services/adminService.js` | Yasaman |
| Permissions & mappers | `front/src/data/haPermissions.js`, `front/src/utils/profileMappers.js` | Yasaman |
| Build | `front/package.json`, `front/vite.config.js` | Mobina runs `npm run deploy:django` → copies build to `back/spa/` |

### Documentation (`docs/`)

| File | Owner |
|------|--------|
| `docs/اصلاحات سامانه خیریه ها (2).docx` | Product/requirements (referenced by all; added in backend commit) |
| `docs/TEAM_WORK_SPLIT.md` | This file — team overview |

---

## What changed since commit `e898700`

Previous tip: **`e898700`** — *feat(front): admin reports/payouts panels and dashboard UI updates* (Yasaman).

The new work implements **doc2** requirements: public homepage (stats, Kerman medical centers & schedules, supporting-org search, fundable requests), contact messaging, SMS password reset, HA affiliation, admin medical-center management, contact inbox, wallet/donation tweaks, and **Liara production deploy** (SQLite on disk, static root, nginx, spa bundle).

**Aggregate diff** `e898700..HEAD`: 132 files, ~14k insertions (includes compiled assets in `back/spa/`).

---

## Git commits created for this batch

Commits are ordered so backend lands first, then the larger frontend slice, then the admin/workflow UI.

### 1. Backend — `2861389` — **8harifi** `<8harifi@gmail.com>`

**Message:** `feat(backend): doc2 homepage APIs, contact inbox, SMS reset, and Liara disk deploy`

**Includes:**

- Models & migrations `0032`–`0034`: medical centers, schedule images, contact messages, public stats, HA affiliation, privacy flags, seeds for Kerman centers and consultant doctor  
- `public_features.py` views/serializers: public stats, medical centers, supporting org search, fundable requests, contact CRUD/inbox, admin medical center CRUD  
- `password_reset.py` + `sms.py` service  
- Updates to requests, wallet, donation/topup, admin users/wallet, search, health assistants, patient/HA serializers  
- `test_doc2_requirements.py`  
- `settings.py`, `liara.json`, `liara_nginx.conf`, `.liaraignore`, `database/.gitkeep`, `populate_db.py`  
- Requirements docx in `docs/`

### 2. Frontend (~60%) — `aead7f7` — **mobin-84-rasa** `<mobinarasa84@gmail.com>`

**Message:** `feat(front): homepage doc2 sections, campaigns/needs UX, and signup flows`

**Includes (~60% of frontend source-line changes in this batch):**

- New homepage sections: doctor schedules, patient actions, supporting-org search  
- `HeroSection`, `HealthAssistantMapSection`, `CallToAction`, `Home.jsx`  
- Large `Needs.jsx` update (tabs, fundable requests, guest contact, network donation)  
- Signup flows: patient, salamatyar individual, signup role, validation  
- `Header.jsx`, `ContactSection.jsx`, `News.jsx`  
- `DonateModal`, `CharitableDashboard`, `SalamatyarDashboard`  
- `DashboardShell`, `IntroducePatientModal`, `NewRequestForm`  
- API wiring: `publicApi`, `PatientApi`, `dashboardApi`, `walletService`, `healthAssistantDashboardService`, `App.jsx`, `package.json`  
- **`back/spa/`** — production Vite build copied for Django/Liara (static JS/CSS/fonts; not hand-edited)

### 3. Frontend (~40%) — `d82db8b` — **yasamanalizadeh2003** `<yasamanalz00@gmail.com>`

**Message:** `feat(front): admin medical centers, contact inbox, and request workflow UI`

**Includes (~40% of frontend source-line changes):**

- New: `AdminMedicalCentersPanel.jsx`, `ContactInboxPanel.jsx`  
- Updates: `AdminUsersPanel`, `AdminWalletPanel`, `AdminDashboard`, `RequestListPanel`, `WalletPanel`  
- `LoginPage.jsx` (password reset UX), `HAPatientEditModal`, `GlobalSearchPanel`, `BenefactorSupportPanel`  
- `DoctorDashboard`, `PatientDashboard`, `adminService.js`, `haPermissions.js`, `profileMappers.js`

---

## How frontend work was split (40 / 60)

Assignment rule for **this doc2 batch** (source files only):

- **Mobina (~60%)**: everything user-facing on the marketing site, campaigns/needs, navigation, signup, contact, and shared dashboard shell / introduce-patient / new-request forms that sit on public and role flows.  
- **Yasaman (~40%)**: admin operations, request list depth, wallet panel in dashboards, medical center admin UI, contact inbox, and login recovery.

Line-count check (additions in modified files + new `.jsx` files, excluding `back/spa`):

| Author | Approx. lines credited | Share |
|--------|------------------------|-------|
| mobin-84-rasa | ~1,504 | **60%** |
| yasamanalizadeh2003 | ~1,002 | **40%** |

---

## End-to-end feature map (doc2)

| Feature | Backend (8harifi) | Frontend Mobina | Frontend Yasaman |
|---------|-------------------|-----------------|------------------|
| Public stats on homepage | `PublicStatsView` | Hero / home consumption via API | — |
| Medical center schedules (Kerman) | Models, seeds, public list API | `DoctorScheduleSection` | Admin medical centers panel |
| Supporting org search | `PublicSupportingOrgSearchView` | `SupportingOrgSearch` | — |
| Fundable requests / needs tabs | `PublicFundableRequestsView`, campaigns API | `Needs.jsx` | — |
| Contact form | `ContactMessageCreateView` | `ContactSection.jsx` | — |
| Contact inbox (admin) | Inbox/reply APIs | — | `ContactInboxPanel` |
| Password reset (SMS) | `password_reset` views, `sms.py` | — | `LoginPage.jsx` |
| HA affiliation on map | HA model + serializer | `HealthAssistantMapSection` | — |
| Wallet / donate flows | wallet, donation services | `DonateModal`, `Needs`, services | `WalletPanel`, admin wallet |
| Liara deploy | settings, disk, nginx, liara.json | `deploy:django` → `back/spa` | — |

---

## Working agreements (for future commits)

1. **Backend-only** changes → commit as **8harifi** (or matching `--author` if using shared machines).  
2. **Public site / signup / campaigns** → **mobin-84-rasa**.  
3. **Admin / request panels / wallet admin UI** → **yasamanalizadeh2003**.  
4. After frontend changes for production, run from `front/`:  
   `npm run deploy:django`  
   and commit `back/spa/` with the frontend owner’s commit (usually Mobina).  
5. Keep migrations and API changes in backend commits **before** or **with** the frontend that depends on them.

---

## Quick reference — clone and deploy

- **API:** Django under `back/`, served at `/api/`  
- **UI dev:** `cd front && npm install && npm run dev`  
- **UI prod bundle:** `cd front && npm run deploy:django`  
- **Deploy:** `cd back && liara deploy` (app `charity-center` on Liara)

---

*Generated from git history and the doc2 change set split across commits `2861389`, `aead7f7`, and `d82db8b` (base `e898700`).*
