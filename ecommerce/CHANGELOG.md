# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-09

### Added
- **Authentication System**
  - User registration with email verification
  - Login/logout with JWT access + refresh tokens
  - Password reset via email
  - Refresh token rotation with reuse detection
  - Two-factor authentication (TOTP) support
  
- **Product Management**
  - Full CRUD for products
  - Image upload to Cloudinary with optimization
  - Category filtering and search
  - Pagination support

- **Shopping Cart**
  - Server-side cart persistence
  - Add, update, remove items
  - Clear cart functionality

- **Checkout & Payments**
  - Stripe Checkout integration
  - Webhook handling for payment confirmation
  - Atomic stock decrement on purchase
  - Order confirmation emails

- **Order Management**
  - Order history for users
  - Order details view
  - Status tracking (pending, processing, shipped, delivered)
  - Admin order management

- **User Profiles**
  - Profile viewing and editing
  - Avatar upload
  - Password change

- **Admin Dashboard**
  - User management
  - Order management
  - Dashboard statistics
  - Bull Board queue monitoring

- **Security Features**
  - 3-tier rate limiting (general, auth, strict)
  - Helmet security headers with CSP
  - Input validation with Zod
  - HttpOnly cookie-based JWT storage
  - bcrypt password hashing (12 rounds)

- **Infrastructure**
  - Winston logging with daily rotation
  - Redis-backed Bull queues
  - WebSocket real-time updates
  - Graceful shutdown handling
  - Health check endpoint
  - Docker support (Dockerfile, docker-compose)
  - GitHub Actions CI/CD

- **Frontend**
  - React 19 + Vite + Tailwind v4
  - shadcn/ui component library
  - Error Boundary for graceful error handling
  - Protected and Admin routes
  - Responsive design

### Security
- All environment variables validated with envalid
- No default weak passwords in production
- Stripe webhook signature verification
- CORS restricted to frontend origin

### Documentation
- Comprehensive README with API reference
- .env.example templates
- Docker deployment guide
