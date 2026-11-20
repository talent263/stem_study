# STEM STUDY: Academic Hub & Collaboration Platform

> **Full-Stack Academic Ecosystem for STEM Disciplines**  
> **Prepared by:** Talent Nechiturike (Lead Engineer)  
> **Institution:** University of Zimbabwe, Department of Software Engineering  

STEM STUDY is a production-grade academic repository, peer-collaboration environment, and administrative ledger designed specifically for STEM disciplines (Software Engineering, Computer Science, Mathematics, Electrical Engineering, and Physics).

---

## 🚀 Quick Start: Running Locally on Your PC

Follow these steps to run STEM STUDY on Windows, macOS, or Linux.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.x, v20.x, or v22.x): [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **bun** / **pnpm**
- A modern web browser (Chrome, Firefox, Edge, Safari)

Verify installation in your terminal / command prompt:
```bash
node -v
npm -v
```

---

### 2. Install Dependencies
Open your terminal inside the project root folder (where `package.json` is located) and run:

```bash
npm install
```
*(Or if you use Bun: `bun install`)*

---

### 3. Firebase Configuration
The live cloud database configuration is already included in `firebase-applet-config.json`:
- **Firebase Project ID:** `gen-lang-client-0294847969`
- **Firestore Database ID:** `ai-studio-deb2b45a-7693-47bb-991d-7858fca30ddc`
- **Google OAuth:** Enable the Google provider in Firebase Authentication and add `localhost` plus your deployed site domain under **Settings → Authorized domains**.

No manual API key setup is required to start developing immediately.

---

### 4. Start the Development Server
Run the following command:

```bash
npm run dev
```

You should see output similar to:
```
  VITE v8.x.x  ready in 250 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://0.0.0.0:3000/
```

Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### 5. Running the Automated Unit Test Suite
To verify the pure logic (RBAC permission gates, resource input validation, Ohm's law, and degree classification calculations):

```bash
npm test
```
All tests use Node.js's built-in test runner (`node:test` via `tsx`).

---

### 6. Building for Production
To create an optimized production build:

```bash
npm run build
```
To preview the production bundle locally:
```bash
npm run preview
```

---

## 🛠️ Project Architecture & Features

| Component | Description |
| :--- | :--- |
| **Academic Resources Hub** | Search, filter, download, and review STEM past papers, lecture notes, lab manuals, and code snippets with faculty verification badges. |
| **Peer Study Rooms** | Live study groups with schedules, member rosters, and real-time chat synced via Firestore listeners (`onSnapshot`). |
| **RBAC Access Control** | Three-tier permissions (`STUDENT`, `TUTOR`, `ADMIN`) with separate sign-in routes and role-specific workspaces. Tutor and administrator access must be assigned to the Google account. |
| **Audit Logging Ledger** | Centralized, immutable event stream tracking logins, resource uploads, tutor approvals, and room activity (Step 6 of the architecture journal). |
| **Interactive STEM Tools** | Ohm's Law circuit solver, Big-O algorithm growth comparator, Laplace transform tables, and Zimbabwean degree classification calculator. |
| **Practice Assessment Quiz** | Multiple-choice questions covering software design patterns, recurrences, and engineering math with instant feedback and explanations. |
| **Architecture Guide Viewer** | Interactive 10-step implementation roadmap with an embedded view of the original PDF journal. |

The public `/` page is browse-only. Sign-in pages are `/login/student`, `/login/tutor`, and `/login/admin`; after Google sign-in, users are sent to the workspace matching their provisioned account role.

### Add separate Google accounts for each role

- **Student:** Sign out, choose Student sign in, and select the student's Google account. New accounts are created as `STUDENT` automatically.
- **Tutor:** Sign out, choose Tutor sign in, and select the tutor's separate Google account once. In Firebase Console → Firestore Database → `users`, open that account's UID document and change `role` from `STUDENT` to `TUTOR`. Sign out and sign in again; the Tutor workspace will open. This project-owner console edit does not require signing into the app as Admin.
- **Administrator:** Admin accounts require the protected `admins/{uid}` marker. Keep administrator access limited to the intended account.

Google sign-in now prompts you to choose an account when multiple Google accounts are available. Selecting a Tutor sign-in page does not itself grant Tutor permissions; the account's Firestore role controls access.

---

## 📁 Project Structure

```
├── firebase-applet-config.json   # Live Firebase configuration
├── firebase-blueprint.json       # Intermediate schema representation
├── firestore.rules               # Hardened Firestore security rules (ABAC)
├── index.html                    # Application entry point & typography
├── package.json                  # Scripts & dependencies
├── public/                       # Static assets & attached PDF guide
├── src/
│   ├── components/               # Modular UI views & panels
│   │   ├── Navbar.tsx            # Role-aware navigation and sign-in links
│   │   ├── RoleLoginView.tsx     # Student, tutor, and administrator sign-in pages
│   │   ├── DashboardView.tsx     # Role-specific workspace home
│   │   ├── ResourcesView.tsx     # Resource repository & upload modal
│   │   ├── StudyGroupsView.tsx   # Collaborative study rooms & chat
│   │   ├── StemToolsView.tsx     # STEM calculators & formula cheat sheets
│   │   ├── QuizView.tsx          # Practice quiz component
│   │   ├── AuditLogView.tsx      # Step 6 centralized audit ledger
│   │   └── ArchitectureGuideView.tsx # 10-step engineering journal view
│   ├── context/
│   │   ├── AuthContext.tsx       # Firebase authentication and account roles
│   │   └── ToastContext.tsx      # Sonner-style notifications provider
│   ├── firebase/
│   │   └── config.ts             # Firebase app & Firestore initialization
│   ├── services/
│   │   ├── auditService.ts       # Centralized audit logging service
│   │   ├── resourceService.ts    # Resource CRUD & real-time sync
│   │   └── studyGroupService.ts  # Study groups & chat messages
│   ├── utils/
│   │   ├── rbac.ts               # RBAC rules & validation logic
│   │   ├── rbac.test.ts          # RBAC unit tests
│   │   ├── stemCalculators.ts    # Scientific & grading math functions
│   │   └── stemCalculators.test.ts # STEM calculator unit tests
│   ├── App.tsx                   # Main layout & cloud data subscriptions
│   └── main.tsx                  # React DOM root
```

---

## 🛡️ Optional: Deploying Security Rules with Firebase CLI

If you make modifications to `firestore.rules` on your PC, you can deploy them directly using the Firebase CLI:

```bash
# 1. Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Deploy Firestore rules
firebase deploy --only firestore:rules --project gen-lang-client-0294847969
```

---

*Engineered with precision for the University of Zimbabwe Department of Software Engineering.*
