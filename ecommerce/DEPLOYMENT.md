# MHD Commerce - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas or local MongoDB
- Stripe Account (for payments)
- Cloudinary Account (for images)

---

## 📁 Environment Variables

### Backend (`backend/.env`)
```env
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/mhd-commerce

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# CORS & Frontend
CORS_ORIGIN=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# SMTP (for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis (for rate limiting & queues)
REDIS_URL=redis://localhost:6379

# Stripe (CRITICAL)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Bull Board Admin
BULL_BOARD_USER=admin
BULL_BOARD_PASSWORD=secure-password-here
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://your-backend-api.com/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... # Optional, fetched from backend if missing
```

---

## 🏗️ Build Commands

### Backend
```bash
cd backend
npm install
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run build
# Output: dist/ folder ready for static hosting
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)
1. **Frontend**: Connect GitHub repo to Vercel, set root to `frontend/`
2. **Backend**: Deploy to Railway, add environment variables

### Option 2: Docker
```bash
# Backend
cd backend
docker build -t mhd-backend .
docker run -p 5000:5000 --env-file .env mhd-backend

# Frontend
cd frontend
docker build -t mhd-frontend .
docker run -p 80:80 mhd-frontend
```

### Option 3: VPS (DigitalOcean/AWS)
1. Install Node.js, MongoDB, Redis, Nginx
2. Clone repo, install dependencies
3. Use PM2 for process management: `pm2 start npm --name backend -- start`
4. Configure Nginx as reverse proxy

---

## ✅ Post-Deployment Checklist

- [ ] Environment variables set correctly
- [ ] MongoDB connection working
- [ ] Redis connection working (or disabled if not needed)
- [ ] CORS origins include production frontend URL
- [ ] Stripe webhooks configured with production endpoint
- [ ] HTTPS enabled on both frontend and backend
- [ ] Test user registration and login
- [ ] Test product creation and viewing
- [ ] Test add to cart and checkout flow
- [ ] Test payment with Stripe test card: `4242 4242 4242 4242`

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Ensure `CORS_ORIGIN` includes your frontend URL |
| Stripe not loading | Check `STRIPE_PUBLISHABLE_KEY` in backend `.env` |
| Auth failures | Verify `JWT_SECRET` matches between restarts |
| Images not uploading | Check Cloudinary credentials |

