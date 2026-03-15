# Charity Project 🏥❤️

A comprehensive full-stack web application for managing charitable healthcare initiatives, connecting doctors, patients, benefactors, and health assistants in a unified platform.

## 📋 Overview

The Charity Project is a Django + React platform designed to:
- **Connect healthcare providers** (doctors) with patients in need
- **Facilitate financial support** through benefactor donations
- **Enable health assistants** to introduce and support patients
- **Manage network requests** for consultations, financial aid, and services
- **Track donations and campaigns** for transparency
- **Manage digital wallets** for secure financial transactions

## 🏗️ Project Structure

```
charity-project/
├── back/                 # Django REST API backend
│   ├── api/             # Main API app
│   ├── backend/         # Django settings & configuration
│   ├── manage.py        # Django management script
│   ├── requirements.txt # Python dependencies
│   ├── db.sqlite3       # SQLite database
│   └── populate_db.py   # Database seeding script
├── front/               # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json     # Node dependencies
│   ├── vite.config.js   # Vite configuration
│   └── index.html
├── docs/                # Documentation
├── README.md            # This file
└── DEVELOPMENT.md       # Development guide
```

## 👥 User Roles

### 1. **Doctor** 👨‍⚕️
- View patients introduced by health assistants
- Provide medical consultations
- Create consultation requests
- Manage patient interactions

### 2. **Patient** 🏥
- Receive healthcare services
- Request financial support
- Request consultations
- Access wallet for donations received
- Track their profile and history

### 3. **Benefactor** 💰
- Browse patients and campaigns
- Make financial donations
- Support network requests
- Manage personal wallet
- Track donation history

### 4. **Health Assistant** 👩‍⚕️
- Introduce patients to the system
- Manage patient groups
- Create support requests on behalf of patients
- Individual or organizational profiles

## 🚀 Quick Start

### Backend Setup

```bash
cd back
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py shell < populate_db.py
python manage.py runserver
```

Backend runs on: `http://localhost:8000`

### Frontend Setup

```bash
cd front
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 🗄️ Database Models

### Core Models
- **CustomUser** - Extended Django user with role system
- **Doctor** - Doctor profiles with specialties
- **Patient** - Patient profiles with health info
- **Benefactor** - Donor profiles
- **HealthAssistant** - Individual and organizational health assistants

### Request Management
- **NetworkRequest** - Requests for consultation, financial aid, services
- **RequestStatusLog** - Track status changes

### Financial System
- **Wallet** - User wallets (benefactor, patient escrow, platform)
- **WalletTransaction** - Transaction history
- **BenefactorDonation** - Donation records
- **Campaign** - Fundraising campaigns

## 📊 API Endpoints

All API endpoints are documented in the Postman collection included in the project.

### Key Endpoints
- `GET/POST /api/patients/` - Patient management
- `GET/POST /api/network-requests/` - Network requests
- `GET/POST /api/donations/` - Donations
- `GET/POST /api/campaigns/` - Campaigns
- `GET /api/wallets/` - Wallet information

## 🔐 Authentication

- JWT (JSON Web Tokens) for API authentication
- Token refresh mechanism
- Role-based access control

## 📚 Documentation

- **[DATABASE_DESIGN.md](./DATABASE_DESIGN.md)** - Detailed database schema
- **[DATABASE_POPULATION_SUMMARY.md](./DATABASE_POPULATION_SUMMARY.md)** - Sample data info
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guidelines
- **[BACKEND-DEV-PROCESS.md](./BACKEND-DEV-PROCESS.md)** - Backend setup
- **[FRONTEND-DEV-PROCESS.md](./FRONTEND-DEV-PROCESS.md)** - Frontend setup

## 🛠️ Technology Stack

### Backend
- **Django 4.x** - Web framework
- **Django REST Framework** - API development
- **SQLite** - Database (for development)
- **PostgreSQL** - Production database (configured)

### Frontend
- **React 18+** - UI library
- **Vite** - Build tool & dev server
- **JavaScript/JSX** - Components

## 👤 Sample Users

The project includes sample data for testing:

| Role | Username | Password |
|------|----------|----------|
| Doctor | `dr_ali` | (set via admin) |
| Patient | `patient_reza` | (set via admin) |
| Benefactor | `benefactor_hassan` | (set via admin) |
| Health Assistant | `ha_sara` | (set via admin) |

See [DATABASE_POPULATION_SUMMARY.md](./DATABASE_POPULATION_SUMMARY.md) for complete details.

## 🔄 Workflow Example

1. **Health Assistant** introduces a new patient to the system
2. **Patient** creates a network request (e.g., for financial support for surgery)
3. **Doctor** reviews consultation requests for the patient
4. **Benefactor** sees the request and makes a donation
5. **System** tracks all transactions through the wallet system

## 📈 Features

- ✅ Multi-role user system
- ✅ Role-based access control
- ✅ Patient request management
- ✅ Donation tracking
- ✅ Campaign fundraising
- ✅ Digital wallet system
- ✅ Transaction history
- ✅ Real-time status updates
- ✅ Network request workflow

## 🐛 Known Issues & TODO

- [ ] Payment gateway integration (Zarinpal)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced reporting dashboard
- [ ] Mobile app
- [ ] Video consultation support

## 📝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📄 License

This project is private and proprietary. All rights reserved.

## 📞 Contact

For questions or support, please reach out to the development team.

---

**Last Updated:** July 1, 2024
**Status:** Active Development
