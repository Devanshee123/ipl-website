# Cricket Ticket Booking Backend

Complete Node.js/Express backend with MongoDB for IPL ticket booking system.

## Features

- **Authentication**: JWT-based auth with register/login
- **Match Management**: CRUD operations for matches with seat inventory
- **Booking System**: Real-time seat booking with 15-min reservation
- **Payment Integration**: UPI deep linking (Google Pay, PhonePe, Paytm, etc.)
- **Admin Dashboard**: Stats, user management, booking overview
- **Security**: Helmet, CORS, input validation

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Matches
- `GET /api/matches` - Get all matches (with filters)
- `GET /api/matches/:id` - Get single match
- `POST /api/matches` - Create match (Admin)
- `PUT /api/matches/:id` - Update match (Admin)
- `DELETE /api/matches/:id` - Delete match (Admin)
- `GET /api/matches/:id/seats` - Get available seats

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/pay` - Confirm payment
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Payment
- `POST /api/payment/upi/initiate` - Generate UPI payment link
- `POST /api/payment/verify` - Verify payment status
- `GET /api/payment/status/:transactionId` - Check payment status

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/make-admin` - Promote to admin
- `GET /api/admin/recent-bookings` - Recent bookings
- `PUT /api/admin/matches/:id/status` - Update match status

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```
Edit `.env` with your credentials:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `MERCHANT_UPI_ID` - Your UPI ID for payments
- `FRONTEND_URL` - Frontend app URL

### 3. MongoDB Setup
- Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create cluster and get connection string
- Add IP to allowlist

### 4. Run Server
```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## Database Models

### User
- name, email, password, phone, isAdmin, bookings[]

### Match
- teams, date, time, stadium, city, categories[seats[]], status

### Booking
- bookingId, user, match, seats[], payment details, status

### Stadium
- name, city, capacity, address, facilities

## Deployment

### Render Deployment
1. Create new Web Service on Render
2. Connect your GitHub repo
3. Set environment variables
4. Build Command: `npm install`
5. Start Command: `npm start`

## Frontend Integration

Update frontend API calls to use:
```javascript
const API_URL = 'http://localhost:5000/api' // or deployed URL

// Add auth header
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```
