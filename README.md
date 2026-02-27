# 🏥 Doctors Cares — Complete Integrated System

A full-stack clinic management system with:
- **Website** (patient-facing frontend with appointment booking)
- **Backend API** (Node.js + Express + MongoDB)
- **Dashboard** (staff portal for doctors & receptionists)

---

## 📁 Project Structure

```
doctors-cares-complete/
├── backend/          ← Node.js API server
│   ├── models/       ← MongoDB schemas
│   ├── routes/       ← API endpoints
│   ├── middleware/   ← JWT auth middleware
│   ├── dashboard/    ← Staff dashboard (served by backend)
│   ├── server.js     ← Main server
│   ├── seed.js       ← Create default accounts
│   └── .env          ← Environment variables
├── dashboard/        ← Dashboard HTML (served at /dashboard)
└── frontend/         ← Patient-facing website
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v16+
- MongoDB (local or MongoDB Atlas)

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment
Edit `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/doctors-cares
JWT_SECRET=your_secret_key_here
```

### 4. Create Default Staff Accounts
```bash
cd backend
node seed.js
```

This creates:
| Role          | Username      | Password      |
|---------------|---------------|---------------|
| Doctor        | doctor        | doctor123     |
| Receptionist  | receptionist  | reception123  |

### 5. Start the Server
```bash
cd backend #cd "C:\Users\makas\doctor-website\doctors-cares-complete\doctors-cares-complete\backend"
npm start        # production
npm run dev      # development (auto-restart)
```

### 6. Access the System
| URL | Description |
|-----|-------------|
| `http://localhost:5000/dashboard` | Staff Dashboard |
| `http://localhost:5000/frontend`  | Patient Website  |
| `http://localhost:5000/api`       | API Health Check |

---

## 🔐 Role-Based Access

### Receptionist
- View all appointments
- Register walk-in patients
- Change appointment statuses
- Add/edit/delete patients
- View reports
- Manage staff accounts
- Access all dashboard pages

### Doctor
- View their appointments
- View patient profiles and visit history
- Add notes to patient records
- Access dashboard

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/signup` | Public | Create account |
| GET | `/api/auth/me` | Protected | Get profile |
| GET | `/api/auth/users` | Protected | List staff |
| DELETE | `/api/auth/users/:id` | Protected | Delete staff |

### Appointments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/appointments` | **Public** | Book from website |
| POST | `/api/appointments/walkin` | Protected | Walk-in registration |
| GET | `/api/appointments` | Protected | List all |
| GET | `/api/appointments/today` | Protected | Today's appointments |
| GET | `/api/appointments/stats` | Protected | Dashboard stats |
| PUT | `/api/appointments/:id/status` | Protected | Update status |
| DELETE | `/api/appointments/:id` | Protected | Delete |

### Patients
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/patients` | Protected | List all patients |
| POST | `/api/patients` | Protected | Create patient |
| PUT | `/api/patients/:id` | Protected | Update patient |
| DELETE | `/api/patients/:id` | Protected | Delete patient |

### Other
- `GET/POST /api/doctors` — Doctor profiles
- `GET/POST /api/contact` — Contact messages
- `GET/POST /api/blog` — Blog posts
- `GET/POST /api/reviews` — Patient reviews

---

## 🌐 Website Features
- Responsive design (mobile-friendly)
- **Appointment booking form** → connects to backend
- **Contact form** → connects to backend
- Doctor profiles section
- Patient reviews
- Blog section
- Link to Staff Dashboard

---

## 📊 Dashboard Features
- **Login/Signup** with role selection (Doctor / Receptionist)
- **Dashboard**: live stats, today's appointments, charts
- **Appointments**: filter by date/status/search, status management
- **Patients**: full CRUD, visit history, notes
- **Reports**: analytics charts, weekly trends
- **Messages**: SMS templates, message history
- **Settings**: clinic config, staff management, working hours

---

## 🔧 Troubleshooting

**"Cannot connect to server"** — Make sure MongoDB is running and the backend is started.

**Login fails** — Run `node seed.js` to create default accounts.

**CORS errors** — The backend allows all origins by default. For production, restrict in `server.js`.
