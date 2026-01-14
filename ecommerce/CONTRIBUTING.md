# Contributing to Premium Purchases

Thank you for considering contributing to Premium Purchases! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Redis
- Stripe account (test mode)
- Cloudinary account

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/premium-purchases.git
   cd premium-purchases
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure environment**
   ```bash
   # Backend
   cp .env.example .env
   # Edit .env with your credentials
   
   # Frontend
   cp .env.example .env
   # Edit .env with API URL
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Code Style

- **TypeScript** - All code must be TypeScript
- **ESLint** - Run `npm run lint` before committing
- **Prettier** - Code formatting is automated
- **Naming** - Use camelCase for variables, PascalCase for components/classes

## Project Structure

```
backend/
├── src/
│   ├── config/       # Configuration (env, db, logger)
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Express middleware
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── validators/   # Zod schemas
│   └── utils/        # Helpers

frontend/
├── src/
│   ├── components/   # Reusable UI components
│   ├── context/      # React context providers
│   ├── pages/        # Route pages
│   ├── services/     # API services
│   └── styles/       # CSS files
```

## Making Changes

### Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add user avatar upload
fix: resolve cart quantity bug
docs: update API documentation
refactor: simplify auth middleware
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run tests: `npm test`
4. Run lint: `npm run lint`
5. Run build: `npm run build`
6. Submit PR with clear description

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

## API Changes

When modifying API endpoints:
1. Update route handler
2. Update Zod validator
3. Update controller
4. Update service if needed
5. Add/update tests
6. Update README API section

## Security

- Never commit secrets or `.env` files
- Use environment variables for all credentials
- Validate all user input with Zod
- Use parameterized queries (Mongoose handles this)
- Report security issues privately

## Questions?

Open an issue or reach out to the maintainers.

Thank you for contributing! 🚀
