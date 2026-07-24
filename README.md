# LeadDesk Mini 🚀

LeadDesk Mini is a premium, fully responsive sales-focused Lead CRM and capture dashboard built for the **Digital Heroes Full Stack Internship Task**. It features a modern dark SaaS landing page, a glassmorphic design, client & server validations, and a live-updating admin panel linked to a MongoDB database.

---

## Features

### 💻 Public Landing Page
- **Hero & CTA**: Call-to-action redirecting users to the inquiry form.
- **Features & Pitch**: Sleek card layout using modern Framer Motion transitions.
- **Glassmorphic Lead Capture Form**: React Hook Form with instant client validation.
  - Form Fields: Name, Email, Budget Range (`< $500`, `$500–$1000`, `$1000–$5000`, `>$5000`), Message.
- **Toast Notifications**: Interactive sliding status alerts for successes and error messages.

### 🛡️ Secure MVC Backend API
- **Express Validators**: Re-validates inputs on the server and maps field-specific messages.
- **Mongoose Schemas**: Custom validation patterns to sanitize and secure lead records.
- **RESTful Endpoints**:
  - `POST /api/leads` - Validate and save new inquiries.
  - `GET /api/leads` - Paginate, search, and list records with aggregated stats.
  - `PATCH /api/leads/:id` - Instantly save lifecycle/status transitions.
  - `GET /api/leads/search?q=` - Regex text search on name, email, budget, and message.

### 📊 Admin Dashboard (`/admin`)
- **Responsive Layout**: Sidebar menu, top bar filters, and responsive spacing.
- **Statistics Grid**: Displays Total, New, Contacted, and Closed stats with animated counters.
- **Interactive Leads Table**: Features live sorting, status dropdown edits (saves on change), and live search.
- **Pagination**: Quick control buttons for navigating larger databases.
- **Empty & Loading States**: Clean visual feedback and skeletons while syncing data.

---

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS v4, Framer Motion, React Hook Form, Axios, Lucide React
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB

---

## Folder Structure

```text
LeadDesk-Mini/
├── backend/
│   ├── config/          # DB connections
│   ├── controllers/     # Controller handlers (MVC)
│   ├── middleware/      # express-validator filters
│   ├── models/          # Mongoose Schemas
│   ├── routes/          # Express API route mapping
│   ├── scripts/         # DB seed mock scripts
│   ├── server.js        # Server entry file
│   └── .env.example     # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, Footer, LeadForm, Toast
│   │   ├── pages/       # LandingPage, AdminDashboard
│   │   ├── services/    # Axios client & api methods
│   │   ├── main.jsx     # DOM anchor
│   │   ├── App.jsx      # Navigation routing container
│   │   └── index.css    # Tailwind CSS & custom animations
│   ├── vite.config.js   # Tailwind & Vite configuration
│   └── index.html       # Web landing page
│
└── README.md
```

---

## Installation & Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) (v16+) and [MongoDB](https://www.mongodb.com/) installed and running locally.

### 1. Setup Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file using the template:
   ```bash
   cp .env.example .env
   ```
   *(Ensure `MONGODB_URI` points to your running MongoDB instance).*
4. Seed mock data for dashboard verification:
   ```bash
   npm run seed
   ```
5. Start the development server (runs on port 5000):
   ```bash
   npm run dev
   ```

### 2. Setup Frontend
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the development server (runs on port 5173):
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser to view the Landing Page. Go to [http://localhost:5173/admin](http://localhost:5173/admin) to view the CRM Dashboard.

---

## License
Built for Digital Heroes Training Task. Linked to [https://digitalheroesco.com](https://digitalheroesco.com).
