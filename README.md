# 🎯 SlotSwapper

A full-stack peer-to-peer time-slot scheduling application that allows users to swap their scheduled events with each other seamlessly.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Design Choices](#design-choices)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)

---

## 🌟 Overview

SlotSwapper is a MERN (MongoDB, Express, React, Node.js) stack application designed to solve the common problem of scheduling conflicts. Users can create time-slot events, mark them as swappable, browse other users' available slots, and initiate swap requests. The application features a clean, modern UI built with Tailwind CSS and implements secure JWT-based authentication.

### Key Functionality:
- **User Authentication**: Secure signup/login with JWT tokens
- **Event Management**: Create, view, update, and delete time-slot events
- **Swap Marketplace**: Browse and request swaps for available slots from other users
- **Request Management**: View incoming/outgoing swap requests with accept/reject functionality
- **Real-time Status Updates**: Events automatically update based on swap request states

---

## ✨ Features

### 🔐 Authentication
- User registration with password hashing (bcrypt)
- JWT-based session management
- Protected routes and API endpoints
- Persistent login state

### 📅 Event Management
- Create events with title, start time, and end time
- View all personal events in a responsive grid layout
- Update event status (BUSY, SWAPPABLE, SWAP_PENDING)
- Delete events (with protection against deleting events in pending swaps)
- Color-coded status badges for quick identification

### 🔄 Swap System
- Browse marketplace of swappable slots from other users
- Initiate swap requests by selecting your slot and their slot
- View incoming swap requests with detailed information
- Accept or reject swap requests
- Automatic ownership transfer on acceptance
- Track outgoing swap requests and their status

### 🎨 User Interface
- Modern, responsive design with Tailwind CSS
- Sticky navigation bar with user context
- Tabbed interface for incoming/outgoing requests
- Modal dialogs for swap initiation
- Real-time error handling and user feedback
- Date formatting in DD/MM/YYYY HH:MM format

---

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI library
- **React Router DOM 7.9.5** - Client-side routing
- **Axios 1.13.1** - HTTP client
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Vite 7.1.7** - Build tool and dev server

### Backend
- **Node.js** - Runtime environment
- **Express 4.21.2** - Web framework
- **MongoDB** - NoSQL database (MongoDB Atlas)
- **Mongoose 8.19.2** - MongoDB ODM
- **JWT (jsonwebtoken 9.0.2)** - Authentication
- **bcryptjs 2.4.3** - Password hashing
- **CORS 2.8.5** - Cross-origin resource sharing

### Development Tools
- **Nodemon 3.1.10** - Auto-restart dev server
- **ESLint** - Code linting
- **dotenv 16.6.1** - Environment variable management

---

## 💡 Design Choices

### Architecture Decisions

1. **MERN Stack Selection**
   - **MongoDB**: Chosen for flexible schema design, perfect for evolving swap request structures
   - **Express**: Lightweight and unopinionated, allowing custom middleware for JWT authentication
   - **React**: Component-based architecture for reusable UI elements (Navbar, event cards, etc.)
   - **Node.js**: JavaScript across the stack for consistency and developer efficiency

2. **Authentication Strategy**
   - JWT tokens stored in localStorage for persistence across sessions
   - Token included in Authorization header for all protected API calls
   - Cryptographically secure 128-character secret key for production-grade security
   - User context managed via React Context API for global state

3. **Database Design**
   - **User Model**: Simple authentication with name, email, and hashed password
   - **Event Model**: Owned by users with status tracking (BUSY, SWAPPABLE, SWAP_PENDING)
   - **SwapRequest Model**: References to both users and their respective slots with status tracking
   - Indexed fields on frequently queried data (requesterId, targetOwnerId, status)

4. **State Management**
   - React Context for authentication state (avoid prop drilling)
   - Component-level state for UI interactions (modals, forms, tabs)
   - Server as single source of truth - fetch fresh data after mutations

5. **UI/UX Decisions**
   - **Tailwind CSS**: Utility-first approach for rapid development and consistent design
   - **Custom Color Scheme**: Purple gradient (primary: #667eea) for modern, professional look
   - **Responsive Design**: Mobile-first with breakpoints (sm, md, lg) for all screen sizes
   - **Date Format**: DD/MM/YYYY HH:MM (24-hour) - international standard without seconds
   - **Status Colors**: Yellow (BUSY), Green (SWAPPABLE), Gray (SWAP_PENDING) for instant recognition

6. **Swap Flow Logic**
   - Transactional approach using Mongoose sessions for data consistency
   - Both slots set to SWAP_PENDING when request created (prevents double-booking)
   - On acceptance: Ownership swaps + both set to BUSY (users review their new schedules)
   - On rejection: Both slots revert to SWAPPABLE status
   - Slots cannot be deleted while in SWAP_PENDING state

7. **Error Handling**
   - Backend validation for all inputs (status values, time ranges, ownership)
   - Frontend try-catch blocks with user-friendly error messages
   - Optional chaining (?.) to prevent crashes from missing nested data
   - Filtered responses to exclude swap requests with deleted slots

8. **Security Measures**
   - Password hashing with bcrypt (never store plain text)
   - JWT expiration (30 days, configurable)
   - Ownership verification on all update/delete operations
   - CORS configured for localhost (update for production)
   - Protected routes require valid authentication token

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** (or local MongoDB instance) - [Sign up here](https://www.mongodb.com/cloud/atlas)
- **Git** (optional, for cloning) - [Download here](https://git-scm.com/)

---

## 📦 Installation & Setup

### Step 1: Clone or Download the Repository

```bash
git clone <repository-url>
cd SlotSwapper
```

Or download and extract the ZIP file.

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv, nodemon

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This will install:
- react, react-dom, react-router-dom, axios, tailwindcss, vite, and dev dependencies

### Step 4: Configure Environment Variables

Create a `.env` file in the `backend` folder:

```bash
cd ../backend
# Create .env file (or use existing one)
```

Add the following variables to `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secure_jwt_secret_here
NODE_ENV=development
```

**Important Notes:**
- Replace `your_mongodb_connection_string_here` with your actual MongoDB Atlas connection string
- Replace `your_super_secure_jwt_secret_here` with a strong random string (minimum 32 characters)
- The project includes a `.env` file with working credentials for development

**Example MongoDB URI format:**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database_name>?retryWrites=true&w=majority
```
Replace `<username>`, `<password>`, `<cluster>`, and `<database_name>` with your actual MongoDB Atlas credentials.

### Step 5: Verify Setup

Ensure your project structure looks like this:

```
SlotSwapper/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

---

## 🚀 Running the Application

### Option 1: Run Backend and Frontend Separately (Recommended)

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server is running on http://localhost:5000
✅ MongoDB Connected: <your-cluster-address>
```

**Terminal 2 - Frontend Development Server:**
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v7.1.12  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Option 2: Using PowerShell (Windows)

```powershell
# Terminal 1
cd backend; npm run dev

# Terminal 2 (new terminal)
cd frontend; npm run dev
```

### Access the Application

- **Frontend:** Open your browser and navigate to `http://localhost:5173`
- **Backend API:** Available at `http://localhost:5000`

### Stopping the Servers

Press `Ctrl + C` in each terminal to stop the servers.

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required | Request Body |
|--------|----------|-------------|---------------|--------------|
| POST | `/auth/signup` | Register a new user | No | `{ name, email, password }` |
| POST | `/auth/login` | Login existing user | No | `{ email, password }` |

**Example - Signup:**
```json
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Example - Login:**
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Event Endpoints

| Method | Endpoint | Description | Auth Required | Request Body |
|--------|----------|-------------|---------------|--------------|
| GET | `/events/mine` | Get all user's events | Yes | None |
| POST | `/events` | Create a new event | Yes | `{ title, startTime, endTime }` |
| PUT | `/events/:id/status` | Update event status | Yes | `{ status }` |
| DELETE | `/events/:id` | Delete an event | Yes | None |

**Example - Create Event:**
```json
POST /api/events
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Team Meeting",
  "startTime": "2025-11-10T10:00:00",
  "endTime": "2025-11-10T11:00:00"
}

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "ownerId": "507f1f77bcf86cd799439011",
    "title": "Team Meeting",
    "startTime": "2025-11-10T10:00:00.000Z",
    "endTime": "2025-11-10T11:00:00.000Z",
    "status": "BUSY"
  }
}
```

**Example - Update Event Status:**
```json
PUT /api/events/507f1f77bcf86cd799439012/status
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "SWAPPABLE"
}

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "SWAPPABLE",
    ...
  }
}
```

**Valid Status Values:** `BUSY`, `SWAPPABLE`, `SWAP_PENDING`

**Example - Delete Event:**
```json
DELETE /api/events/507f1f77bcf86cd799439012
Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

### Swap Endpoints

| Method | Endpoint | Description | Auth Required | Request Body |
|--------|----------|-------------|---------------|--------------|
| GET | `/swappable-slots` | Get marketplace (other users' swappable slots) | Yes | None |
| POST | `/swap-request` | Initiate a swap request | Yes | `{ mySlotId, theirSlotId }` |
| POST | `/swap-response/:requestId` | Respond to swap request (accept/reject) | Yes | `{ accepted }` |
| GET | `/swaps/incoming` | Get incoming swap requests | Yes | None |
| GET | `/swaps/outgoing` | Get outgoing swap requests | Yes | None |

**Example - Get Swappable Slots:**
```json
GET /api/swappable-slots
Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Available Slot",
      "startTime": "2025-11-10T14:00:00.000Z",
      "endTime": "2025-11-10T15:00:00.000Z",
      "status": "SWAPPABLE",
      "ownerId": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
  ]
}
```

**Example - Initiate Swap:**
```json
POST /api/swap-request
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "mySlotId": "507f1f77bcf86cd799439012",
  "theirSlotId": "507f1f77bcf86cd799439013"
}

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "requesterId": { ... },
    "targetOwnerId": { ... },
    "mySlotId": { ... },
    "theirSlotId": { ... },
    "status": "PENDING",
    "createdAt": "2025-11-04T12:00:00.000Z"
  }
}
```

**Example - Respond to Swap:**
```json
POST /api/swap-response/507f1f77bcf86cd799439015
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "accepted": true
}

Response:
{
  "success": true,
  "data": { ... },
  "message": "Swap accepted successfully"
}
```

**Note:** `accepted` can be `true` (accept) or `false` (reject)

---

### Authorization Header Format

For all protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:**
- Use `Bearer` followed by a space, then the token
- NO quotes around the token
- Include `Content-Type: application/json` header for POST/PUT requests

---

### 📬 Postman Collection

**Import our Postman collection for easy API testing:**

🔗 **[View API Documentation](https://documenter.getpostman.com/view/38153132/2sB3WqtL5E)**

The collection includes:
- Pre-configured requests for all 11 endpoints
- Environment variables for tokens and IDs
- Example request bodies
- Expected response structures
- Testing workflow examples

---

## 📁 Project Structure

### Backend Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic (signup, login)
│   ├── eventController.js   # Event CRUD operations + delete
│   └── swapController.js    # Swap request logic
├── middleware/
│   └── authMiddleware.js    # JWT verification middleware
├── models/
│   ├── User.js              # User schema (name, email, password)
│   ├── Event.js             # Event schema (title, times, status, owner)
│   └── SwapRequest.js       # Swap request schema (requester, target, slots)
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── eventRoutes.js       # Event endpoints
│   └── swapRoutes.js        # Swap endpoints
├── server.js                # Express app entry point
├── package.json             # Dependencies and scripts
└── .env                     # Environment variables
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Navigation bar with auth context
│   │   └── ProtectedRoute.jsx   # Route wrapper for authentication
│   ├── context/
│   │   └── AuthContext.jsx      # Global auth state management
│   ├── pages/
│   │   ├── Login.jsx            # Login page
│   │   ├── Signup.jsx           # Registration page
│   │   ├── Dashboard.jsx        # User's events management
│   │   ├── Marketplace.jsx      # Browse swappable slots
│   │   └── Requests.jsx         # Incoming/outgoing swap requests
│   ├── services/
│   │   └── api.js               # Axios instance + API service functions
│   ├── App.jsx                  # Main app component with routing
│   ├── main.jsx                 # React entry point
│   └── index.css                # Tailwind directives + global styles
├── public/                      # Static assets
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
├── vite.config.js               # Vite build configuration
└── package.json                 # Dependencies and scripts
```

---

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>` |
| `JWT_SECRET` | Secret key for JWT signing | `<your_super_secure_random_string>` |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Frontend

The frontend uses the hardcoded API URL `http://localhost:5000/api` in `src/services/api.js`. For production, update this to your deployed backend URL.

---

## 🧪 Testing the Application

### Manual Testing Flow

1. **Start both servers** (backend and frontend)
2. **Open browser** to `http://localhost:5173`
3. **Sign up** two different users (User A and User B)
4. **As User A:**
   - Create 2-3 events
   - Mark one event as "Swappable"
5. **As User B:**
   - Create 2-3 events
   - Mark one event as "Swappable"
   - Go to Marketplace
   - See User A's swappable slot
   - Click "Request Swap"
   - Select your slot and submit
6. **As User A:**
   - Go to Requests → Incoming tab
   - See User B's swap request
   - Accept the swap
7. **Verify:**
   - Both users' events now swapped ownership
   - Both events set to BUSY status
   - Check Dashboard to see the new event

### API Testing with Postman

1. **Authentication:**
   - Signup two users
   - Login with both and save tokens

2. **Event Management:**
   - Create events for both users
   - Update status to SWAPPABLE
   - Get events list
   - Test delete functionality

3. **Swap Flow:**
   - Get swappable slots marketplace
   - Initiate swap request
   - Check incoming/outgoing requests
   - Accept/Reject swap
   - Verify ownership change

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
- Verify your MongoDB URI in `.env`
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure database user has proper permissions

**Port Already in Use:**
- Change `PORT` in `.env` to a different number (e.g., 5001)
- Kill the process using port 5000

**"Token invalid or expired" Error:**
- Ensure token is copied completely
- Check Authorization header format: `Bearer <token>` (one space, no quotes)
- Login again to get a fresh token

### Frontend Issues

**Vite Port Conflict:**
- The app will automatically try port 5174 if 5173 is busy
- Or manually specify port in `vite.config.js`

**CORS Errors:**
- Ensure backend server is running
- Check CORS configuration in `backend/server.js`

**Tailwind Styles Not Applied:**
- Verify `tailwind.config.js` and `postcss.config.js` exist
- Check that `index.css` contains Tailwind directives
- Clear browser cache and hard refresh (Ctrl + Shift + R)

**Authentication Not Working:**
- Check browser console for token errors
- Verify JWT_SECRET is set in backend `.env`
- Clear localStorage and login again

---

## 🚀 Deployment Considerations

### Backend Deployment (e.g., Heroku, Railway, Render)

1. Set environment variables on hosting platform
2. Update `MONGODB_URI` to production database
3. Set `NODE_ENV=production`
4. Update CORS origin to frontend production URL

### Frontend Deployment (e.g., Vercel, Netlify)

1. Update API URL in `src/services/api.js` to production backend
2. Build the app: `npm run build`
3. Deploy the `dist` folder
4. Configure environment variables if needed

---

## 📝 Key Features

✅ **Secure Authentication** - JWT-based with password hashing  
✅ **Event Management** - Full CRUD with status tracking  
✅ **Smart Marketplace** - Browse only other users' swappable slots  
✅ **Swap Requests** - Incoming/outgoing with accept/reject  
✅ **Ownership Transfer** - Automatic on swap acceptance  
✅ **Data Integrity** - Transaction-based swap operations  
✅ **Delete Protection** - Cannot delete events in pending swaps  
✅ **Responsive UI** - Tailwind CSS with mobile-first design  
✅ **Date Formatting** - DD/MM/YYYY HH:MM (international standard)  
✅ **Real-time Updates** - Events refresh after mutations  

---

## 👨‍💻 Developer Notes

- **Security**: Change JWT secret and MongoDB credentials before deploying to production
- **Validation**: Additional frontend validation can be added for better UX
- **Features**: Future enhancements could include email notifications, recurring events, or event categories
- **Performance**: Consider implementing pagination for large event lists
- **Real-time**: WebSocket integration could provide live updates for swap requests
- **Testing**: Unit tests and integration tests can be added using Jest/Mocha

---

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review API endpoint documentation
3. Test with Postman collection
4. Check browser console for error messages
5. Verify backend logs in terminal

---

