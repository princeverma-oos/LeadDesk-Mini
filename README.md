# LeadDesk Mini 🚀 (Production-Ready Upgrade)

LeadDesk Mini is a production-ready, full-stack lead acquisition and management application designed for high-growth SaaS teams. It integrates a secure, modern administrator authentication pipeline with a fully functional lead CRM, showcasing premium glassmorphic UI aesthetics, motion-driven visual elements, and rigorous security middleware.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Database Design](#database-design)
6. [Authentication Flow](#authentication-flow)
7. [API Documentation](#api-documentation)
8. [Folder Structure](#folder-structure)
9. [Installation & Setup](#installation--setup)
10. [Environment Variables](#environment-variables)
11. [Deployment Guide](#deployment-guide)
12. [Verification Tests](#verification-tests)
13. [Future Improvements](#future-improvements)
14. [License](#license)

---

## Project Overview
LeadDesk Mini allows companies to capture client inquiries using a highly-responsive form with custom real-time validations. Leads are persisted securely in a MongoDB database (or fall back to an in-memory demo array if no database connection is configured). Authorized administrators can access the protected **Leads Hub** to search, sort, filter, view full details in a modal, adjust lead lifecycle statuses, and delete records under an authenticated session guarded by JSON Web Tokens (JWT).

---

## Features

### 💻 Public Landing Page & Lead Capture Form
- **Premium Dark Aesthetics**: Styled with a beautiful radial gradient mesh, glassmorphism card layouts, and subtle animations powered by **Framer Motion**.
- **Robust Client Validation**: Captures 5 required fields (Full Name, Email, Company, Phone, Message) with strict email checks and minimum message length rules via **React Hook Form**.
- **Duplicate Submission Prevention**: Prevents double-submitting the same inquiry within a short time frame on both the client (1-minute local limit) and backend (10-minute database limit).
- **Toast Notifications**: Provides feedback on submission state (success, validation errors, duplicate checks).

### 🛡️ Security & Guarded MVC Backend
- **Secure Authentication**: Restricts admin dashboards and endpoints with **JWT Auth**. Passwords are encrypted using **bcryptjs** (10 salt rounds).
- **Comprehensive API Security**:
  - **Helmet**: Secures Express apps by setting various HTTP headers.
  - **Rate Limiting**: Defends endpoints against brute force and spam attacks.
  - **Mongo Sanitization**: Protects query objects against MongoDB operator injection attacks.
  - **XSS Protections**: Automatically escapes client inputs inside validator filters.
  - **CORS Configuration**: Restricts API calls to approved origins.

### 📊 Advanced CRM Admin Dashboard
- **Authentication Route Guard**: Automatically redirects unauthenticated routes (e.g. `/admin`) to `/login` and auto-logs in users on page refresh if a valid token is present in `localStorage`.
- **5-Column Stats Grid**: Animates Total, New, Contacted, Qualified, and Closed lead count cards using custom requestAnimationFrame counters.
- **Interactive Data Table**:
  - **Clickable Header Sorting**: Instantly toggle ascending/descending order on fields (Name, Company, Date, Status).
  - **Live Search & Filter**: Debounced keypress searches (`400ms`) and instant status filters sync dynamically with the database.
  - **Lead Details Modal**: View comprehensive inquiry contents in an animated modal.
  - **Status Workflows**: Instantly cycle statuses between `New`, `Contacted`, `Qualified`, and `Closed` via instant dropdown selectors.
  - **Confirmation Dialogs**: Prompts users before deleting lead records to prevent accidental deletions.

---

## Architecture
The system uses a decoupled client-server architecture:

```text
  [ Client Browser ] <--- (JSON Web Tokens) ---> [ Express API Gateway ]
          |                                               |
  (React / Vite App)                                (Helmet / Rate Limiters)
          |                                               |
  [ Local / Session Storage ]                       [ Controller Middleware ]
                                                          |
                                                    [ MongoDB Atlas / Local ]
```

- **Frontend SPA**: Vite, React 19, and Tailwind CSS v4 construct a performant client application using state-driven layout routing (`window.location.pathname`).
- **Backend API (MVC)**: An Express app organizing logic into Mongoose Models, Controllers, Input Validation filters, and router routes.

---

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, React Hook Form, Axios, Lucide React
- **Backend**: Node.js, Express.js, Mongoose, JsonWebToken, BcryptJS, Helmet, Express Rate Limit, Express Mongo Sanitize
- **Database**: MongoDB (Local or Atlas)

---

## Database Design

### 1. Admin Schema (`Admin`)
Represents authenticated administrative accounts:
```json
{
  "_id": "ObjectId",
  "username": "String (Required, Unique)",
  "email": "String (Required, Unique, Lowercase)",
  "password": "String (Hashed via bcrypt)",
  "createdAt": "Date (Defaults to Date.now)"
}
```

### 2. Lead Schema (`Lead`)
Represents customer proposals:
```json
{
  "_id": "ObjectId",
  "name": "String (Required)",
  "email": "String (Required, Lowercase)",
  "company": "String (Required)",
  "phone": "String (Required)",
  "message": "String (Required, Minimum 10 chars)",
  "status": "String (Enum: ['New', 'Contacted', 'Qualified', 'Closed'], Default: 'New')",
  "createdAt": "Date (Defaults to Date.now)"
}
```

---

## Authentication Flow
1. **Login**: User submits credentials to `POST /api/auth/login`.
2. **Token Generation**: If email matches and password verifies, backend signs a JWT with user payload expiring in 24 hours.
3. **Storage**: Client stores token in `localStorage.setItem('token', token)` and updates App authentication state.
4. **Header Interceptor**: Axios request interceptor attaches token as `Authorization: Bearer <token>` on all outbound admin requests.
5. **Route Protection**: Middleware `verifyJWT` checks incoming tokens, extracts sub-identity, and delegates flow to controllers.
6. **Session Check**: On page refresh, the client hits `GET /api/auth/verify`. If token is valid, session continues; otherwise, the user is redirected to `/login`.

---

## API Documentation

### Authentication Endpoints

#### `POST /api/auth/login`
Authenticates user and returns a token.
- **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "6a63bc3d5...",
      "username": "admin",
      "email": "admin@example.com"
    }
  }
  ```

#### `GET /api/auth/verify`
Validates user token and returns details. Requires JWT.
- **Request Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "6a63bc3d5...",
      "username": "admin",
      "email": "admin@example.com"
    }
  }
  ```

### Lead Management Endpoints

#### `POST /api/leads`
Submit a new lead inquiry. Public endpoint.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@company.com",
    "company": "Global Tech",
    "phone": "+1 555-1234",
    "message": "We would like to request a demo of the pipeline workspace."
  }
  ```
- **Response (210 Created)**:
  ```json
  {
    "success": true,
    "message": "Lead submitted successfully",
    "data": { ... }
  }
  ```

#### `GET /api/leads`
Retrieve, sort, search, and filter leads. Requires JWT.
- **Request Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status` (Optional): `'All'`, `'New'`, `'Contacted'`, `'Qualified'`, `'Closed'` (Default: `'All'`)
  - `page` (Optional): `Number` (Default: `1`)
  - `limit` (Optional): `Number` (Default: `8`)
  - `q` (Optional): Search string matching `name`, `company`, `email`, `phone`, or `message`.
  - `sortBy` (Optional): Field to sort by (Default: `'createdAt'`)
  - `order` (Optional): `'desc'` or `'asc'` (Default: `'desc'`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 12,
    "totalPages": 2,
    "currentPage": 1,
    "leads": [ ... ],
    "stats": {
      "total": 12,
      "new": 4,
      "contacted": 3,
      "qualified": 2,
      "closed": 3
    }
  }
  ```

#### `PATCH /api/leads/:id`
Modify a lead status. Requires JWT.
- **Request Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "status": "Qualified"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lead status updated successfully",
    "data": { ... }
  }
  ```

#### `DELETE /api/leads/:id`
Permanently remove a lead from database. Requires JWT.
- **Request Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lead deleted successfully"
  }
  ```

---

## Folder Structure

```text
LeadDesk-Mini/
├── backend/
│   ├── config/          # DB Connection setup (db.js)
│   ├── controllers/     # Controller handlers (authController, leadsController)
│   ├── middleware/      # Middleware guards (auth JWT verifier, validators)
│   ├── models/          # Mongoose schemas (Admin, Lead)
│   ├── routes/          # Express Router maps (auth, leads)
│   ├── scripts/         # Scripts (seeding, automated verification)
│   ├── server.js        # Express application entry
│   ├── .env             # Active environment configuration
│   └── .env.example     # Environment template
│
└── frontend/
    ├── public/          # Static assets (favicons, icons)
    ├── src/
    │   ├── components/  # Layout elements (Navbar, Footer, LeadForm, Toast)
    │   ├── pages/       # SPA routing targets (LandingPage, LoginPage, AdminDashboard)
    │   ├── services/    # Axios client API service functions (api.js)
    │   ├── App.jsx      # Navigation, auth provider, & entry routing
    │   ├── index.css    # Global Tailwind and keyframe configurations
    │   └── main.jsx     # Root mount file
    ├── vite.config.js   # Build settings and path resolution
    └── index.html       # Single Page Application HTML root
```

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas connection string.

### 1. Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the configuration:
   ```bash
   cp .env.example .env
   ```
   *(Edit `.env` to customize your database URI, server ports, and JWT secret).*
4. Seed the database with initial mock leads and a default administrator account (`admin@example.com` / `password123`):
   ```bash
   npm run seed
   ```
5. Launch the backend API:
   ```bash
   npm run dev
   ```

### 2. Setup Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`. 
   - To access the admin panel, navigate to `/login` or click the **Admin Dashboard** button in the navbar.
   - Enter `admin@example.com` / `password123` to log in.

---

## Environment Variables
Create a `.env` file under the `/backend` folder.

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/leaddesk-mini
JWT_SECRET=super_secret_jwt_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## Deployment Guide
When deploying the application to production environments (e.g. AWS, Render, Heroku):

1. **Configure Environment Variables**:
   - Ensure `NODE_ENV` is set to `production`.
   - Set a highly secure, randomized `JWT_SECRET` string.
   - Set `MONGODB_URI` to point to a reliable MongoDB Atlas cluster.
   - Set `CLIENT_URL` to your production frontend domain (e.g. `https://my-app.vercel.app`) to authorize CORS access.
2. **Build and Serve Frontend**:
   - Run `npm run build` in the frontend directory to output static assets in the `/dist` folder.
   - Host the `/dist` directory on static providers like Vercel, Netlify, or AWS S3.
3. **Backend Host**:
   - Deploy the backend server to services like Render, Heroku, or digital ocean instances.
   - Set start scripts to run `npm start` (which executes `node server.js`).

---

## Verification Tests
You can verify the backend endpoints and security rules by executing:
```bash
npm run verify
```
This runs the automated script which logs authentication, JWT protection, schema validation errors, duplicate submission checks, searches, and status modifications.

---

## Future Improvements
- **Multi-tenant Role Permissions**: Introduce read-only, manager, and administrator role hierarchy.
- **Auto-routing Rules**: Automatically assign qualified leads to specific sales representatives based on criteria.
- **Webhooks**: Dispatch Slack or Discord notifications instantly upon qualifying inquiries.

---

## License
Created for Digital Heroes Training Task. Linked to [https://digitalheroesco.com](https://digitalheroesco.com).
