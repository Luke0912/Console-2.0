# 🚀 Quick Start Guide

This guide will help you get the Instagram DM Commerce SaaS platform up and running in minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB 6+ installed and running
- [ ] Redis 7+ installed and running
- [ ] Meta Developer account created
- [ ] Code editor (VS Code recommended)

## 5-Minute Setup

### Step 1: Install Dependencies (2 minutes)

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### Step 2: Configure Environment (1 minute)

**Backend (.env):**
```bash
cd backend
copy .env.example .env
```

Edit `backend/.env` - **Minimum required:**
```env
MONGODB_URI=mongodb://localhost:27017/instagram_dm_saas
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-random-secret-min-32-chars
ENCRYPTION_KEY=exactly-32-characters-here!!
```

**Frontend (.env):**
```bash
cd frontend
copy .env.example .env
```

No changes needed for local development.

### Step 3: Start Services (2 minutes)

**Option A: All at once (Windows)**

```bash
# Terminal 1
mongod

# Terminal 2
redis-server

# Terminal 3
cd backend && npm run dev

# Terminal 4
cd backend && npm run worker

# Terminal 5
cd frontend && npm run dev
```

**Option B: Using Docker Compose**

```bash
docker-compose up
```

### Step 4: Access the App

Open http://localhost:5173 in your browser

## First Steps After Installation

### 1. Create Your Account

1. Click "Sign up" on the login page
2. Fill in your details:
   - Email
   - Password (min 8 characters)
   - First & Last Name
   - Company Name
3. You'll be logged in automatically

### 2. Add Some Products

1. Navigate to **Products** in the sidebar
2. Click **"Add Product"**
3. Fill in product details:
   ```
   Name: Premium Headphones
   Description: Noise-cancelling wireless headphones
   Price: 299.99
   Currency: USD
   Image URL: https://via.placeholder.com/400
   Purchase URL: https://yourstore.com/product/123
   ```
4. Mark as **Featured** for carousel priority
5. Click **Create**

Repeat for 3-5 products.

### 3. Connect Instagram (Optional for Testing)

**Note:** You need a real Instagram Business Account for this step.

1. Go to **Settings**
2. Click **"Connect Instagram Account"**
3. Complete Facebook Login flow
4. Grant permissions
5. Select your Facebook Page

**For Testing Without Instagram:**
- You can still test all other features
- Product management works independently
- Analytics will show zero until DMs are processed

## Testing the Platform

### Test Product Management

```bash
# Create a product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Testing",
    "price": 99.99,
    "currency": "USD",
    "images": ["https://via.placeholder.com/400"],
    "purchaseUrl": "https://example.com"
  }'
```

### Test Webhook (Manual)

```bash
# Simulate incoming Instagram webhook
curl -X POST http://localhost:3000/api/webhooks/instagram \
  -H "Content-Type: application/json" \
  -H "x-hub-signature-256: sha256=test" \
  -d '{
    "object": "instagram",
    "entry": [{
      "messaging": [{
        "sender": {"id": "1234"},
        "recipient": {"id": "5678"},
        "message": {"text": "Hello"}
      }]
    }]
  }'
```

**Note:** This will fail signature verification but tests the endpoint structure.

## Common Issues & Solutions

### Issue: MongoDB connection failed

**Solution:**
```bash
# Make sure MongoDB is running
mongod --version

# Check MONGODB_URI in .env
MONGODB_URI=mongodb://localhost:27017/instagram_dm_saas
```

### Issue: Redis connection error

**Solution:**
```bash
# Make sure Redis is running
redis-cli ping  # Should return "PONG"

# Check REDIS_URL in .env
REDIS_URL=redis://localhost:6379
```

### Issue: Backend won't start

**Solution:**
```bash
# Clear node_modules and reinstall
cd backend
rm -rf node_modules
npm install

# Check for errors in .env file
```

### Issue: Frontend shows API errors

**Solution:**
```bash
# Make sure backend is running on port 3000
curl http://localhost:3000/api/health

# Check VITE_API_URL in frontend/.env
VITE_API_URL=http://localhost:3000
```

### Issue: ENCRYPTION_KEY error

**Solution:**
```env
# Must be EXACTLY 32 characters
ENCRYPTION_KEY=12345678901234567890123456789012
                ^                              ^
                1                              32
```

## Next Steps

1. **Read IMPLEMENTATION_GUIDE.md** for detailed architecture
2. **Configure Meta Developer App** for Instagram integration
3. **Add more products** to test carousels
4. **Customize the UI** to match your brand
5. **Deploy to production** (see deployment guide)

## Development Workflow

### Backend Development

```bash
cd backend

# Development with hot reload
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production build
npm start
```

### Frontend Development

```bash
cd frontend

# Development with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Worker Process

The worker must be running to process incoming Instagram DMs:

```bash
cd backend
npm run worker

# Worker will log:
# "Worker started successfully"
# "Listening for jobs..."
```

## Useful Commands

```bash
# View MongoDB data
mongosh
use instagram_dm_saas
db.users.find().pretty()
db.products.find().pretty()

# View Redis queues
redis-cli
KEYS *

# View Bull queue dashboard (optional)
npm install -g bull-monitor
bull-monitor
```

## Project Structure Quick Reference

```
backend/
  src/
    controllers/    # Route handlers
    services/       # Business logic
    models/         # MongoDB schemas
    routes/         # API routes
    workers/        # Background jobs
    middleware/     # Auth, validation, etc.

frontend/
  src/
    pages/         # Page components
    components/    # Reusable UI components
    services/      # API calls
    store/         # State management
```

## Getting Help

- Check **IMPLEMENTATION_GUIDE.md** for detailed docs
- Review error logs in `backend/logs/`
- Inspect browser console for frontend errors
- Check Redis and MongoDB logs

## Production Deployment Quick Guide

See full deployment guide in IMPLEMENTATION_GUIDE.md, but here's the checklist:

- [ ] Set `NODE_ENV=production`
- [ ] Use strong secrets (JWT_SECRET, ENCRYPTION_KEY)
- [ ] Configure HTTPS for webhooks
- [ ] Set production CORS origins
- [ ] Configure Meta app with production URLs
- [ ] Set up monitoring and logging
- [ ] Configure database backups
- [ ] Use environment variables (never commit .env)

---

**You're all set! 🎉**

Start building your Instagram DM automation platform. Happy coding!
