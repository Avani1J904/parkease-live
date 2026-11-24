# 🚗 ParkEase — Smart Parking Management System (All-in-One Live)

> **Department of Computer Applications (SVICA)**  
> **Shri Vaishnav Vidyapeeth Vishwavidyalaya, Indore**  
> **MCA Minor Project (2026–2027)**  
> **Team:** Arnavi Jain (`2504MCAAIML0011`), Atharv Mishra (`2504MCAAIML0015`), Avani Jain (`2504MCAAIML0016`), Ishan Tiwari (`2504MCAAIML0027`)

---

## 🌟 What is in this Folder?
This folder (`ParkEase_AllInOne_Dynamic`) is the **complete, unified, production-ready package** where:
1. **Frontend & Backend are 100% dynamic together**:
   - `login.html`: Live JWT authentication via `/api/auth/login` (with 1-click Demo Driver & Demo Admin buttons).
   - `register.html`: Live user account creation via `/api/auth/register`.
   - `parking.html`: Live slot inventory loaded from SQLite `/api/parking/slots` with live filters (Date, Time, Duration, Vehicle Type) and instant price quote calculation.
   - `booking.html`: Live reservation engine with 10-minute hold window and anti-conflict locking.
   - `payment.html`: Simulated UPI & Card payment gateway with instant QR entry pass generation.
   - `dashboard.html`: Live user dashboard showing active parking session, QR pass modal, cancellation, lifetime statistics, and past reservations.
   - `history.html`: Searchable and filterable booking history with live digital tax receipts.
   - `profile.html`: Live profile editor updating user details in SQLite.
   - `admin/dashboard.html`: Live occupancy monitoring, revenue stats, zone cards, and Chart.js trend.
   - `backend-dashboard.html`: Full SQLite table explorer, data editor, and API tester.
2. **One-Link Architecture**:
   - Both the frontend website and the REST API are served on **ONE SINGLE URL** (`http://localhost:5000` or `https://parkease-live.onrender.com`).
   - Root `/` serves `frontend/index.html`.
   - All `/api/*` routes are handled seamlessly by Flask.

---

## 🛠️ Root Directory Structure (Render Ready)
```
ParkEase_AllInOne_Dynamic/
├── app/                        # Complete Flask REST API backend
│   ├── routes/                 # admin, auth, bookings, dashboard, parking, payments, profile
│   ├── __init__.py             # Unified router (serves dynamic frontend + API)
│   ├── config.py               # Auto-detects frontend directory
│   ├── db.py                   # SQLite database engine
│   ├── payment_gateway.py      # Demo payment gateway
│   └── seed.py                 # Seeds 3 parking facilities, 60+ slots & test bookings
├── frontend/                   # 100% Dynamic UI
│   ├── admin/dashboard.html    # Live Admin Console
│   ├── assets/js/api.js        # Universal API SDK (auto-detects cloud/local origin)
│   ├── assets/js/app.js        # Dynamic UI controllers for all pages
│   ├── backend-dashboard.html  # Live Database Explorer
│   ├── booking.html            # Reservation page
│   ├── dashboard.html          # User Dashboard
│   ├── history.html            # History & Receipts
│   ├── index.html              # Dynamic Landing Page
│   ├── login.html              # Login with 1-click Demo buttons
│   ├── parking.html            # Live Slot Grid
│   ├── payment.html            # Payment & QR Pass
│   ├── profile.html            # User Profile
│   └── register.html           # New User Registration
├── instance/
│   └── parking.db              # Pre-seeded SQLite database
├── Procfile                    # web: gunicorn run:app
├── render.yaml                 # Render cloud blueprint
├── requirements.txt            # AT REPO ROOT (Fixes Render build error!)
├── run.py                      # Production entrypoint
└── README.md
```

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the server
python run.py

# 3. Open your browser:
#    http://localhost:5000
```

---

## ☁️ How to Deploy to Render on GitHub

### Why Did the Previous Deploy Fail?
1. **Screenshot 1 (`smart-parking-bchr.onrender.com` showing raw JSON)**:
   The backend was deployed without the `frontend/` folder bundled inside the root, so Flask served the fallback API JSON at `/` instead of `index.html`.
2. **Screenshot 2 (`ERROR: Could not open requirements file: 'requirements.txt'`)**:
   In your repository `Avani1904/parkease-live`, `requirements.txt` was inside a subfolder rather than directly at the repository root.

### ✅ The 1-Minute Fix:
Push the **exact contents of this folder** to your GitHub repository `Avani1904/parkease-live`:

```bash
cd "C:\Users\avani\.gemini\antigravity\scratch\Smart_Parking\ParkEase_AllInOne_Dynamic"

# Initialize or connect to your GitHub repo
git init
git remote add origin https://github.com/Avani1904/parkease-live.git
git branch -M main

# Add and commit all files
git add .
git commit -m "Deploy ParkEase all-in-one dynamic system"

# Push to GitHub
git push -u origin main --force
```

### In Render Dashboard:
1. Open your service **`parkease-live`** on [dashboard.render.com](https://dashboard.render.com).
2. Go to **Settings**:
   - **Root Directory**: Leave **BLANK** (empty).
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn run:app`
3. Click **Manual Deploy** → **Deploy latest commit**.
4. Render will build and launch in under 60 seconds!
5. Open your live link: Your full website will load with live slots, booking, and database!

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Access |
|---|---|---|---|
| **Driver / User** | `aarav@example.com` | `User@1234` | Live slot booking, QR pass, profile, history |
| **Administrator** | `admin@parkease.com` | `Admin@123` | Occupancy stats, revenue analytics, DB explorer |

*(You can also click the "Driver Demo" or "Admin Demo" buttons on the `login.html` page to sign in with 1 click!)*
