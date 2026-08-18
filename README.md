# Apna School AI — Autonomous School ERP Intelligence & Multilingual AI Assistant

**Apna School AI** is an Applied Conversational AI Assistant and Intelligent ERP Ecosystem designed for K-12 educational institutions. It seamlessly unifies four primary stakeholder roles — **Student**, **Parent**, **Teacher**, and **Principal / School Management** — through an interactive **Chat Interface**, **Voice Input & Text-to-Speech (STT/TTS)**, **3D Viseme Animated Avatar**, **Google Gemini AI Function Calling**, and an **Enterprise Security Guardrails Engine**.

---

## 📌 Problem Statement

K-12 school administration frequently suffers from fragmented communication channels between students, parents, teachers, and school leadership. Critical ERP data (such as attendance percentages, subject marks, class rosters, and callback requests) remains locked inside complex UI tables, making routine inquiries slow and tedious.

**Apna School AI** bridges this gap by providing an intelligent, voice-enabled, role-aware conversational assistant that delivers real-time information, automates administrative workflows (such as attendance marking and mark entry), and safeguards sensitive records through strict role-based access control.

---

## ✨ Key Features by Role

### 👨‍🎓 1. Student Functionality
- **Real-Time Attendance Lookup**: Instantly view overall attendance percentage and recent log table.
- **Subject Marks Inquiry**: View subject-wise academic scores (Mathematics, Physics, Chemistry, English).
- **Teacher Contact**: Request an official callback from the class teacher.
- **Interactive AI Buddy**: Ask questions in natural English, Hindi, or 9 other regional languages.

### 👪 2. Parent Functionality
- **Dedicated Parent Greeting**: AI greets parents with a polite, non-intrusive greeting ("Hello Parents!").
- **Child Progress Monitoring**: Access real-time attendance and academic performance metrics for linked children (e.g., Raj Kumar, Manya Singh).
- **Human Escalation**: Request an official phone callback from the class teacher (**Ms. Manya**).

### 👩‍🏫 3. Staff / Teacher Functionality
- **Interactive Attendance Marking**: Mark attendance for single students or batch entries via simple conversational prompts (e.g., *"Raj is present today"*).
- **Subject Mark Entry**: Enter and update student test scores and grades.
- **Dynamic Student Enrollment**: Enroll new students into the class roster dynamically through conversation.
- **Roster & Audit Dashboard**: View live class attendance roster and marks management tables.

### 🏫 4. Management / Principal Functionality
- **School-Wide Analytics**: Access aggregate school attendance stats, grade breakdown, and academic pass rates.
- **Executive Voice Briefing**: Automatic generation of a crisp, 2-sentence executive summary readout via Text-to-Speech (TTS) for fast decision-making.

### 🤖 5. Core AI & Multilingual Engine
- **Live Google Gemini API Integration**: Driven by `@google/genai` with function-calling capabilities.
- **100% Reliable Offline Fallback Engine**: Scripted keyword & intent state machine ensuring zero downtime even during API rate limits or offline use.
- **3D Viseme Avatar**: Real-time lip-sync animated avatar reflecting speech amplitude.
- **11 Language Support**: English, Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Punjabi, Kannada, Malayalam, and Urdu.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18
  - Vite
  - Lucide React Icons
  - Vanilla CSS (Glassmorphism Design System)
  - Web Speech API (`SpeechSynthesis` & `SpeechRecognition`)
  - 3D Viseme Animated Avatar Component

- **Backend**:
  - Node.js (v18+)
  - Express.js
  - `@google/genai` (Google Gemini SDK)
  - RESTful APIs for Auth, ERP Metrics, and Chat Pipeline

- **Testing**:
  - Custom Node.js Automated Test Suite (`test-suite.js`)

---

## 📁 Repository Structure

```
Apna School AI
├── 01-student-repository/
│   └── student-portal/          # Student Portal landing page & web assets
├── 02-parent-repository/
│   └── parent-portal/           # Parent Portal landing page & web assets
├── 03-management-repository/
│   └── management-portal/       # Principal Management Portal landing page & web assets
├── 04-staff-repository/
│   └── staff-portal/            # Teacher Staff Portal landing page & web assets
└── 05-xyz-ai-repository/
    └── xyz-ai/
        ├── backend/             # Node.js + Express + Gemini AI & Fallback Engine
        └── frontend/            # React (Vite) + Web Speech API + 3D Avatar + Dashboards
```

---

## ⚙️ Installation & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Step 1: Clone the Repository
```bash
git clone https://github.com/aryangoswami/apna-school-ai.git
cd apna-school-ai
```

### Step 2: Install Backend Dependencies
```bash
cd 05-xyz-ai-repository/xyz-ai/backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 4: Environment Configuration
Copy `05-xyz-ai-repository/xyz-ai/backend/.env.example` to `.env`:

```bash
cd ../backend
cp .env.example .env
```

Configure `.env` variable names (do NOT share real secret values):
```env
PORT=5001
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
OPENAI_API_KEY=optional_openai_whisper_key_here
```

---

## 🚀 How to Run Locally

### Start Backend Server (Terminal 1)
```bash
cd 05-xyz-ai-repository/xyz-ai/backend
npm start
```
*Backend runs on `http://localhost:5001`*

### Start Frontend Application (Terminal 2)
```bash
cd 05-xyz-ai-repository/xyz-ai/frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`*

### Run Automated Audit & Test Suite
```bash
cd 05-xyz-ai-repository/xyz-ai/backend
npm test
```

---

## 🔒 Security & Data Guardrails

| Threat Vector | Mitigation Strategy | Implementation Details |
|---|---|---|
| **Unauthorized Mark Entry** | Role Permission Guard | Only authenticated Teachers can enter/update marks. Students & Parents attempting mark entry receive `Permission Denied`. |
| **Data Leakage Across Users** | Session Identity Binding | Identity is strictly derived from session tokens (`req.user`), avoiding client-side identity spoofing. |
| **Prompt Injection** | Security Wrapper | User text is scanned for injection markers and sanitized before LLM evaluation. |
| **Secret Exfiltration** | Output Scrubbing Middleware | Outgoing responses pass through `securityScrubber.js` to redact keys, tokens, or system prompt markers. |

---

## 🎮 Demo & Pre-seeded User Accounts

Access the portal at `http://localhost:5173` using these credentials:

| Role | Username | Password | Assigned Name / Student |
|---|---|---|---|
| **Teacher** | `manya.teacher` | `pass123` | **Ms. Manya** (Class Teacher 10-A) |
| **Student** | `raj.student` | `pass123` | **Raj Kumar** (Roll 21, Grade 10-A) |
| **Student** | `manya.student` | `pass123` | **Manya Singh** (Roll 22, Grade 10-A) |
| **Parent** | `parent.rahul` / `raj.parent` | `pass123` | Parent of **Raj Kumar** |
| **Principal** | `principal` | `pass123` | **Dr. V. K. Mehta** (School Principal) |

---

## 📦 GitHub Repository Information

- **Repository Name**: `apna-school-ai`
- **Initial Commit**: `Initial commit - Apna School AI`
- **Branch**: `main`
