# 🛒 MHD Commerce

**MHD Commerce** is a professional, high-performance, full-stack e-commerce application designed with a focus on modern aesthetics (Glassmorphism) and a seamless user experience. Built using the **MERN** stack (MongoDB, Express, React, Node.js), it features a secure demo payment flow, robust state management, and an administration dashboard.

![MHD Commerce Logo](frontend/public/logo.png)

## ✨ Key Features

### 🎨 Stunning UI/UX
- **Glassmorphism Design**: High-end, futuristic UI with translucent layers, glowing effects, and smooth transitions.
- **Responsive Layout**: Optimized for mobile, tablet, and desktop devices.
- **Interactive Micro-animations**: Hover effects and state changes that make the app feel alive.
- **Premium Loading Screen**: Branding-integrated loading state.

### 💳 Commerce Engine
- **One-Click Demo Payment**: A simulated secure payment flow for quick testing and reviews (bypassess Stripe validation for demo purposes).
- **Cart Management**: Persistent shopping cart with real-time total calculation.
- **Product Discovery**: Advanced filtering by category, price, and status.
- **Order Tracking**: Comprehensive order history for authenticated users.

### 🛡️ Secure Infrastructure
- **Full Auth Suite**: JWT-based authentication with HttpOnly cookies and refresh token rotation.
- **Protected Routes**: Granular access control for Users and Admins.
- **Validation Layers**: Strict type checking with TypeScript and Zod schema validation.
- **Rate Limiting**: Tiered protection against brute-force and spam.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 + Glassmorphism utilities
- **State:** React Context API
- **Routing:** React Router v7
- **HTTP/API:** Axios with Interceptors

### Backend
- **Runtime:** Node.js 20 + Express
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **Cache:** Redis
- **Security:** Helmet, CORS, Bcrypt (12 rounds)
- **Validation:** Zod

## 📦 Project Structure

```
├── backend/          # Express API with TypeScript
├── frontend/         # React SPA with Tailwind CSS
├── docker-compose.yml
└── DEPLOYMENT.md     # Comprehensive deployment instructions
```

## 🛠️ Quick Start

### 1. Clone & Install
```bash
git clone [your-repo-url]
cd 1-8
```

### 2. Backend Setup
```bash
cd backend
npm install
# Copy .env.example to .env and configure
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Copy .env.example to .env and configure
npm run dev
```

### 4. Seed Data
```bash
cd backend
npx ts-node --transpile-only src/scripts/seedSimpleProducts.ts
```

## 🔧 Essential Environment Variables

### Backend (.env)
```env
DATABASE_URL=mongodb://your-mongodb-url
JWT_SECRET=your-secret
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## 🐳 Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# With coverage
npm run test:coverage
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/verify-email` - Verify email
- `POST /api/v1/auth/forgot-password` - Request reset
- `POST /api/v1/auth/reset-password` - Reset password

### Products
- `GET /api/v1/products` - List products
- `GET /api/v1/products/:id` - Get product
- `POST /api/v1/products` - Create product (auth)
- `PUT /api/v1/products/:id` - Update product (auth)
- `DELETE /api/v1/products/:id` - Delete product (auth)

### Cart
- `GET /api/v1/cart` - Get cart (auth)
- `POST /api/v1/cart/add` - Add to cart (auth)
- `PUT /api/v1/cart/update` - Update quantity (auth)
- `DELETE /api/v1/cart/remove/:productId` - Remove item (auth)

### Orders
- `POST /api/v1/orders` - Create order (auth)
- `GET /api/v1/orders/my-orders` - My orders (auth)
- `GET /api/v1/orders/:id` - Order details (auth)
- `POST /api/v1/orders/webhook` - Stripe webhook

### Admin
- `GET /api/v1/admin/users` - List users (admin)
- `GET /api/v1/admin/orders` - List orders (admin)
- `GET /api/v1/admin/stats` - Dashboard stats (admin)

## 🔒 Security Features

- JWT with HttpOnly cookies
- Refresh token rotation
- Rate limiting (general, auth, strict tiers)
- Password hashing (bcrypt, 12 rounds)
- 2FA support (TOTP)
- Email verification
- Stripe webhook signature verification
- Helmet security headers
- CORS configuration
- Input validation (Zod)

## 📊 Monitoring

- Health check: `GET /health`
- Bull Board: `/admin/queues` (protected)
- Winston logs: `logs/` directory

## 🚀 Deployment

### Render (Backend)
1. Create Web Service
2. Connect GitHub repo
3. Set environment variables
4. Deploy

### Vercel (Frontend)
1. Import project
2. Set environment variables
3. Deploy

## 📝 License

ISC
