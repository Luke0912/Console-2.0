# ✅ Getting Started Checklist

Use this checklist to ensure you've completed all steps to get your Instagram DM Commerce platform running.

---

## 📋 Pre-Installation Checklist

### System Requirements
- [ ] **Node.js 18+** installed
  ```bash
  node --version  # Should show v18.x.x or higher
  ```

- [ ] **MongoDB 6+** installed and running
  ```bash
  mongod --version  # Should show 6.x.x or higher
  mongosh  # Should connect successfully
  ```

- [ ] **Redis 7+** installed and running
  ```bash
  redis-server --version  # Should show 7.x.x or higher
  redis-cli ping  # Should return "PONG"
  ```

- [ ] **Git** installed (optional, for version control)
  ```bash
  git --version
  ```

---

## 🔧 Installation Checklist

### Step 1: Project Setup
- [ ] Navigate to project directory
  ```bash
  cd "c:\Users\Axeno\Documents\Console 2.0"
  ```

- [ ] Run setup script (Windows)
  ```bash
  setup.bat
  ```
  **OR** Manual setup:
  - [ ] Install backend dependencies
    ```bash
    cd backend
    npm install
    ```
  - [ ] Install frontend dependencies
    ```bash
    cd ../frontend
    npm install
    ```

### Step 2: Environment Configuration
- [ ] Copy backend environment file
  ```bash
  cd backend
  copy .env.example .env
  ```

- [ ] Edit `backend/.env` with required values:
  - [ ] `MONGODB_URI` - Your MongoDB connection string
  - [ ] `REDIS_URL` - Your Redis connection string
  - [ ] `JWT_SECRET` - Random string (min 32 characters)
  - [ ] `ENCRYPTION_KEY` - **EXACTLY 32 characters**
  - [ ] `PORT` - 3000 (or your preferred port)

- [ ] Copy frontend environment file
  ```bash
  cd ../frontend
  copy .env.example .env
  ```

- [ ] Edit `frontend/.env`:
  - [ ] `VITE_API_URL` - http://localhost:3000 (or your backend URL)

### Step 3: Verify Configuration
- [ ] Backend `.env` file exists and is configured
- [ ] Frontend `.env` file exists and is configured
- [ ] MongoDB is accessible at configured URI
- [ ] Redis is accessible at configured URL
- [ ] `ENCRYPTION_KEY` is exactly 32 characters

---

## 🚀 Running the Application

### Option A: Docker (Recommended)
- [ ] Docker Desktop installed
- [ ] Run docker-compose
  ```bash
  docker-compose up
  ```
- [ ] Verify services are running:
  - [ ] MongoDB: localhost:27017
  - [ ] Redis: localhost:6379
  - [ ] Backend: localhost:3000
  - [ ] Frontend: localhost:5173
  - [ ] Worker: Running in background

### Option B: Manual Start
- [ ] **Terminal 1**: Start MongoDB
  ```bash
  mongod
  ```

- [ ] **Terminal 2**: Start Redis
  ```bash
  redis-server
  ```

- [ ] **Terminal 3**: Start Backend API
  ```bash
  cd backend
  npm run dev
  ```
  Should see: "✓ Server running on port 3000"

- [ ] **Terminal 4**: Start Worker Process
  ```bash
  cd backend
  npm run worker
  ```
  Should see: "✓ Worker started successfully"

- [ ] **Terminal 5**: Start Frontend
  ```bash
  cd frontend
  npm run dev
  ```
  Should see: "Local: http://localhost:5173/"

---

## 🧪 Testing the Installation

### Basic Functionality Tests
- [ ] Open browser to http://localhost:5173
- [ ] See login page with glassmorphism design
- [ ] No console errors in browser DevTools
- [ ] Click "Sign up" link works
- [ ] Backend API health check works:
  ```bash
  curl http://localhost:3000/api/health
  # Should return: {"success":true,"message":"API is healthy"}
  ```

### Create Your First Account
- [ ] Click "Sign up" on login page
- [ ] Fill in registration form:
  - [ ] Email address
  - [ ] Password (min 8 chars)
  - [ ] First name
  - [ ] Last name
  - [ ] Company name
- [ ] Submit form
- [ ] Successfully redirected to dashboard
- [ ] See welcome message with your name

### Explore the Dashboard
- [ ] Dashboard page loads successfully
- [ ] See 4 stat cards (DMs, Carousels, Impressions, CTR)
- [ ] Navigation sidebar visible with all menu items
- [ ] Click "Products" in sidebar
- [ ] See "No Products Yet" message
- [ ] Click "Settings" in sidebar
- [ ] See "Instagram Business Account" section

### Add Your First Product
- [ ] Go to Products page
- [ ] Click "Add Product" button
- [ ] Fill in product details (or note that full form needs implementation)
- [ ] For now, test with API:
  ```bash
  # Login first to get cookie, then:
  curl -X POST http://localhost:3000/api/products \
    -H "Content-Type: application/json" \
    -b cookies.txt \
    -d '{
      "name": "Test Product",
      "description": "My first product",
      "price": 99.99,
      "currency": "USD",
      "images": ["https://via.placeholder.com/400"],
      "purchaseUrl": "https://example.com/product"
    }'
  ```

---

## 🔐 Meta Developer Setup (Optional for Full Testing)

### Only needed for Instagram integration

- [ ] Go to [Meta for Developers](https://developers.facebook.com/)
- [ ] Create new app or select existing
- [ ] App type: **Business**
- [ ] Add **Instagram** product
- [ ] Add **Webhooks** product

### Configure OAuth
- [ ] Go to Instagram → Basic Display
- [ ] Add OAuth Redirect URI:
  ```
  http://localhost:3000/api/instagram/callback
  ```
- [ ] Request permissions:
  - [ ] `instagram_basic`
  - [ ] `instagram_manage_messages`
  - [ ] `pages_show_list`
  - [ ] `pages_manage_metadata`

### Configure Webhooks
- [ ] Go to Webhooks → Instagram
- [ ] Callback URL (for production, needs HTTPS):
  ```
  https://your-domain.com/api/webhooks/instagram
  ```
- [ ] Verify Token: (same as `META_WEBHOOK_VERIFY_TOKEN` in .env)
- [ ] Subscribe to fields:
  - [ ] `messages`
  - [ ] `messaging_postbacks`

### Update Backend .env
- [ ] `META_APP_ID` - From Meta app dashboard
- [ ] `META_APP_SECRET` - From Meta app dashboard
- [ ] `META_REDIRECT_URI` - Your callback URL
- [ ] `META_WEBHOOK_VERIFY_TOKEN` - Random string for webhook verification

### Test Instagram Connection
- [ ] Restart backend server (to load new env vars)
- [ ] Go to Settings page in frontend
- [ ] Click "Connect Instagram Account"
- [ ] Complete Facebook login flow
- [ ] Grant requested permissions
- [ ] Select your Facebook Page
- [ ] Verify "Connected" status shown

---

## 📊 Verify Everything is Working

### Database
- [ ] Connect to MongoDB
  ```bash
  mongosh
  use instagram_dm_saas
  db.users.find()  # Should show your user
  db.companies.find()  # Should show your company
  ```

### Redis
- [ ] Connect to Redis
  ```bash
  redis-cli
  KEYS *  # Should show some keys
  ```

### Worker Process
- [ ] Worker logs show "Listening for jobs..."
- [ ] No errors in worker console

### API Endpoints
- [ ] Health check: `GET http://localhost:3000/api/health` ✅
- [ ] Get current user: `GET http://localhost:3000/api/auth/me` (with auth) ✅
- [ ] List products: `GET http://localhost:3000/api/products` (with auth) ✅

### Frontend
- [ ] All pages accessible:
  - [ ] Dashboard: http://localhost:5173/dashboard
  - [ ] Products: http://localhost:5173/products
  - [ ] Analytics: http://localhost:5173/analytics
  - [ ] Settings: http://localhost:5173/settings
- [ ] Logout works
- [ ] Login works
- [ ] Auth guards prevent unauthorized access

---

## 🎯 Next Steps After Successful Setup

### Immediate Actions
- [ ] Read through **ARCHITECTURE.md** to understand system design
- [ ] Review **IMPLEMENTATION_GUIDE.md** for detailed docs
- [ ] Explore the codebase:
  - [ ] Backend: `backend/src/index.ts`
  - [ ] Frontend: `frontend/src/App.tsx`
- [ ] Check browser DevTools for any warnings

### Development Tasks
- [ ] Customize UI colors (edit `frontend/tailwind.config.js`)
- [ ] Add company logo
- [ ] Implement full product creation form
- [ ] Implement full registration page
- [ ] Add more analytics visualizations

### Production Preparation
- [ ] Review security checklist in **IMPLEMENTATION_GUIDE.md**
- [ ] Set up error tracking (Sentry)
- [ ] Configure monitoring (New Relic, DataDog, etc.)
- [ ] Set up CI/CD pipeline
- [ ] Configure production database (MongoDB Atlas)
- [ ] Configure production Redis (Redis Cloud)
- [ ] Set up SSL/TLS certificates
- [ ] Configure production file storage (AWS S3)

### Feature Extensions
- [ ] Add Stripe for payments
- [ ] Implement advanced analytics
- [ ] Add email notifications
- [ ] Build custom carousel template editor
- [ ] Add WhatsApp integration
- [ ] Implement A/B testing

---

## ⚠️ Common Issues & Quick Fixes

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongod --version

# If not running, start it:
mongod

# Or check the connection string in .env
MONGODB_URI=mongodb://localhost:27017/instagram_dm_saas
```

### Redis Connection Error
```bash
# Check if Redis is running
redis-cli ping  # Should return PONG

# If not running, start it:
redis-server
```

### Backend Won't Start
```bash
# Check for syntax errors in .env
# Ensure no extra spaces or quotes

# Clear and reinstall:
cd backend
rm -rf node_modules
npm install
```

### Frontend Build Errors
```bash
# Clear and reinstall:
cd frontend
rm -rf node_modules
npm install

# Check Vite config
# Ensure VITE_API_URL is set correctly
```

### "ENCRYPTION_KEY must be 32 characters"
```env
# In backend/.env, ensure exactly 32 characters:
ENCRYPTION_KEY=12345678901234567890123456789012
#              ^                              ^
#              1                              32
```

### Webhook Signature Verification Fails
```env
# Ensure META_APP_SECRET matches the one in Meta Developer Console
META_APP_SECRET=your-actual-app-secret
```

### Can't Access API from Frontend
```env
# In frontend/.env:
VITE_API_URL=http://localhost:3000

# Ensure backend is running on port 3000
# Check browser console for CORS errors
```

---

## 📞 Getting Help

### Documentation References
- **Quick Setup**: QUICKSTART.md
- **Architecture**: ARCHITECTURE.md
- **Detailed Guide**: IMPLEMENTATION_GUIDE.md
- **All Docs**: DOCUMENTATION_INDEX.md

### Debugging Steps
1. Check all services are running (MongoDB, Redis, Backend, Worker, Frontend)
2. Review logs in each terminal window
3. Check browser DevTools console for errors
4. Verify `.env` files are configured correctly
5. Ensure ports are not already in use

### Additional Resources
- [Meta Platform Docs](https://developers.facebook.com/docs/)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [Redis Documentation](https://redis.io/documentation)
- [React Documentation](https://react.dev/)

---

## ✨ Success Criteria

You've successfully set up the platform when:

- ✅ All 5 processes running without errors
- ✅ Can create account and login
- ✅ Can navigate all pages
- ✅ Can add products (via API or UI)
- ✅ Database contains your user and company
- ✅ No console errors in browser or terminals
- ✅ (Optional) Instagram account connected
- ✅ (Optional) Received test DM carousel

---

## 🎊 Congratulations!

If you've checked off all items, your Instagram DM Commerce SaaS platform is fully operational!

### What You Can Do Now:
- ✅ Manage products
- ✅ Connect Instagram Business Accounts
- ✅ Automatically respond to DMs with product carousels
- ✅ Track analytics and metrics
- ✅ Manage multiple companies (multi-tenant)
- ✅ Scale to production

**Happy building! 🚀**

---

*Need help? Review QUICKSTART.md or IMPLEMENTATION_GUIDE.md for detailed troubleshooting.*
