# Premium Purchases

A full-stack e-commerce application built with modern technologies.

## 🚀 Tech Stack

### Backend
- **Runtime:** Node.js 20 + Express
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose ODM)
- **Cache/Queue:** Redis + Bull
- **Authentication:** JWT + Refresh Tokens + 2FA (speakeasy)
- **Payments:** Stripe (Checkout + PaymentIntents)
- **File Upload:** Multer + Cloudinary + Sharp
- **Email:** Nodemailer + Handlebars templates
- **Real-time:** Socket.io
- **Validation:** Zod
- **Logging:** Winston

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State:** React Context
- **Routing:** React Router v7
- **HTTP:** Axios
- **Payments:** Stripe Elements

## 📦 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/       # Environment, DB, Redis, Logger
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, validation, rate limiting
│   │   ├── models/       # Mongoose schemas
│   │   ├── queues/       # Bull job queues
│   │   ├── routes/       # API routes (v1)
│   │   ├── services/     # Business logic
│   │   ├── sockets/      # Socket.io handlers
│   │   ├── templates/    # Email templates
│   │   ├── utils/        # Helpers
│   │   ├── validators/   # Zod schemas
│   │   └── workers/      # Background job processors
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── context/      # React context providers
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API services
│   │   └── styles/       # CSS files
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## 🛠️ Setup

### Prerequisites
- Node.js 20+
- MongoDB
- Redis
- Stripe account
- Cloudinary account

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with your API URL
npm install
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/premium-purchases
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
BULL_BOARD_PASSWORD=your-password
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
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
