# 🧠 Athena AI – Intelligent Productivity Assistant

Athena AI is a full-stack AI-powered productivity assistant that helps users manage tasks, generate AI-based plans, schedule work intelligently, analyze productivity, and receive personalized coaching.

The project consists of a **Flask backend** with AI capabilities and a **React (Vite) frontend** for a modern dashboard experience.

---

# 🚀 Features

## 🔐 Authentication

* User Registration
* User Login
* JWT Authentication
* Protected Routes
* User Profile API

---

## ✅ Task Management

* Create Tasks
* View Tasks
* Store Tasks in SQLite
* Task Categories
* Priority Levels
* Estimated Time
* Deadlines
* Pending / Completed Status

---

## 🤖 AI Features

### AI Planner

Convert natural language into structured tasks.

Example:

> "Tomorrow complete AI assignment and prepare for interview."

Automatically generates:

* Task Title
* Description
* Deadline
* Priority
* Estimated Time
* Category

---

### Smart Scheduler

Automatically schedules pending tasks into available time slots.

Features:

* Priority-based scheduling
* Deadline-aware ordering
* Detects unscheduled tasks

---

### Productivity Analyzer

Analyzes all pending tasks and predicts deadline risks.

Returns:

* Productivity Score
* High Risk Tasks
* Completion Probability
* Recommendations

---

### AI Coach

Provides personalized productivity coaching.

Includes:

* Daily Motivation
* Today's Focus
* Work Order
* Time Management Advice

---

### AI Chat Assistant

Context-aware assistant capable of answering questions about the user's tasks.

Examples:

* What should I do today?
* Which task is most urgent?
* Can I finish everything before tomorrow?
* What should I prioritize?

---

### Smart Priority Engine

Calculates task priority using:

* Deadline
* Estimated Time
* Priority Level

Returns a score (0–100) for each task.

---

### AI Dashboard

Generates an intelligent daily dashboard including:

* Productivity Score
* Pending Tasks
* Completed Tasks
* High Risk Tasks
* Today's Focus
* Daily Summary
* Motivation Message

---

# 🏗️ Tech Stack

## Backend

* Python
* Flask
* Flask-JWT-Extended
* Flask-SQLAlchemy
* SQLite
* Groq API (LLM)
* Python Dotenv

---

## Frontend

* React
* Vite
* React Router
* Axios
* Framer Motion
* React Icons

---

# 📂 Project Structure

```
Athena-ai/

├── backend/
│
│   ├── ai/
│   │   ├── planner.py
│   │   ├── scheduler.py
│   │   ├── analyzer.py
│   │   ├── coach.py
│   │   ├── chat.py
│   │   ├── priority.py
│   │   ├── dashboard.py
│   │   ├── prompts.py
│   │   └── client.py
│   │
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── instance/
│   ├── app.py
│   └── requirements.txt
│
├── frontend/
│
│   ├── src/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# 🔌 Backend APIs

## Authentication

| Method | Endpoint       |
| ------ | -------------- |
| POST   | /auth/register |
| POST   | /auth/login    |
| GET    | /auth/profile  |

---

## Tasks

| Method | Endpoint   |
| ------ | ---------- |
| GET    | /tasks/    |
| POST   | /tasks/add |

---

## AI

| Method | Endpoint       |
| ------ | -------------- |
| POST   | /ai/plan       |
| POST   | /ai/schedule   |
| GET    | /ai/analyze    |
| GET    | /ai/coach      |
| POST   | /ai/chat       |
| GET    | /ai/priorities |
| GET    | /ai/dashboard  |

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/Athena-ai.git

cd Athena-ai
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory:

```env
GROQ_API_KEY=YOUR_GROQ_API_KEY
JWT_SECRET_KEY=YOUR_SECRET_KEY
```

Run the backend:

```bash
python app.py
```

Server:

```
http://127.0.0.1:5000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```
http://localhost:5173
```

---

# 📌 Current Progress

## ✅ Backend

* JWT Authentication
* SQLite Database
* Task CRUD
* AI Planner
* Smart Scheduler
* Productivity Analyzer
* AI Coach
* AI Chat
* Smart Priority Engine
* AI Dashboard

---

## 🚧 Frontend (In Progress)

Current work includes:

* Authentication UI
* Dashboard Layout
* Sidebar
* Navbar
* AI Dashboard Cards
* Task Management UI
* Chat Interface
* Schedule Timeline
* Analytics Charts

---

# 🔮 Future Improvements

* Google Calendar Integration
* Outlook Calendar Sync
* Email Notifications
* Mobile Responsive Dashboard
* Voice Assistant
* OCR Task Scanner
* File Upload Support
* Multi-language Support
* Team Collaboration
* Dark / Light Theme Toggle
* Real-time Notifications
* AI Weekly Reports
* AI Goal Tracking
* AI Habit Tracker

---

# 👨‍💻 Author

**Vedant Shelake**

Third-Year Engineering Student

Passionate about Artificial Intelligence, Full Stack Development, and Building AI-powered Productivity Tools.

---

# ⭐ Project Status

**Backend:** ✅ Complete

**Frontend:** 🚧 Under Development

**Overall Progress:** ~70%

---

If you find this project helpful, consider giving it a ⭐ on GitHub!
