# Instagram DM Commerce SaaS - Implementation Guide

## 🎉 Project Successfully Created!

This document provides a comprehensive guide to understanding, setting up, and extending the Instagram DM Commerce SaaS platform.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Setup Instructions](#setup-instructions)
3. [Meta Developer Configuration](#meta-developer-configuration)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Structure](#frontend-structure)
7. [Instagram Integration Flow](#instagram-integration-flow)
8. [Webhook Processing](#webhook-processing)
9. [Security Considerations](#security-considerations)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Extending the Platform](#extending-the-platform)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     Instagram Business API                       │
│              (Messages, OAuth, Webhooks)                         │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ Webhooks & API Calls
                       ▼
        ┌──────────────────────────────────────┐
        │      Webhook Handler (Express)       │
        │  - Signature Verification            │
        │  - Queue Job Creation                │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │         Redis Queue (Bull)           │
        │  - Message Processing                │
        │  - Retry Logic                       │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │        Worker Process                │
        │  1. Identify Company                 │
        │  2. Fetch Products                   │
        │  3. Build Carousel                   │
        │  4. Send via Instagram API           │
        │  5. Track Analytics                  │
        └──────────────────┬───────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
    ┌──────────────┐              ┌─────────────┐
    │   MongoDB    │              │    Redis    │
    │  - Users     │              │  - Queues   │
    │  - Companies │              │  - Cache    │
    │  - Products  │              └─────────────┘
    │  - Messages  │
    │  - Analytics │
    └──────────────┘
```

### Multi-Tenant Architecture

- **Company** = Tenant
- **Strict data isolation** using company_id filtering
- **Role-Based Access Control** (Owner, Admin, Editor)
- **Subscription-based limits** enforced at service layer

---

## Setup Instructions

### Step 1: Prerequisites

Ensure you have the following installed:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** 6+ ([Download](https://www.mongodb.com/try/download/community))
- **Redis** 7+ ([Download](https://redis.io/download))
- **Git** (for version control)

### Step 2: Environment Configuration

#### Backend Environment

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Copy the environment template:
   ```bash
   copy .env.example .env
   ```

3. Edit `.env` and fill in your values:
   ```env
   # Critical configurations to update:
   MONGODB_URI=mongodb://admin:password123@localhost:27017/instagram_dm_saas?authSource=admin
   REDIS_URL=redis://localhost:6379
   
   JWT_SECRET=<generate-random-32-char-string>
   ENCRYPTION_KEY=<generate-exactly-32-char-string>
   
   # Meta Platform (from Meta Developer Console)
   META_APP_ID=your-app-id
   META_APP_SECRET=your-app-secret
   META_WEBHOOK_VERIFY_TOKEN=<random-string-for-webhook-verification>
   
   # AWS S3 (for product images)
   AWS_ACCESS_KEY_ID=your-aws-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret
   S3_BUCKET_NAME=your-bucket-name
   ```

#### Frontend Environment

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Copy the environment template:
   ```bash
   copy .env.example .env
   ```

3. Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_APP_NAME=Instagram DM Commerce
   ```

### Step 3: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 4: Start Services

#### Option A: Using Docker (Recommended for Development)

```bash
# From project root
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Redis on port 6379
- Backend on port 3000
- Frontend on port 5173
- Worker process

#### Option B: Manual Start

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - Redis:**
```bash
redis-server
```

**Terminal 3 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 4 - Worker:**
```bash
cd backend
npm run worker
```

**Terminal 5 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **API Health Check:** http://localhost:3000/api/health

---

## Meta Developer Configuration

### 1. Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Choose **"Business"** as app type
4. Fill in app details

### 2. Add Products

Add these products to your app:
- **Instagram**: For Instagram Business API access
- **Webhooks**: For receiving DM events

### 3. Configure Instagram Product

1. Go to **Instagram** → **Basic Display**
2. Add **OAuth Redirect URI**:
   ```
   http://localhost:3000/api/instagram/callback
   ```
   (Update to your production URL when deploying)

3. Request permissions:
   - `instagram_basic`
   - `instagram_manage_messages`
   - `pages_show_list`
   - `pages_manage_metadata`

### 4. Configure Webhooks

1. Go to **Webhooks** → **Instagram**
2. Add **Callback URL**:
   ```
   https://your-domain.com/api/webhooks/instagram
   ```
   (Must be HTTPS in production)

3. Add **Verify Token**: (Same as `META_WEBHOOK_VERIFY_TOKEN` in your .env)

4. Subscribe to fields:
   - `messages`
   - `messaging_postbacks`

### 5. Test Webhook

Meta provides a "Test" button to verify your webhook endpoint responds correctly.

---

## Database Schema

### Collections

#### users
```json
{
  "_id": "ObjectId",
  "email": "string (unique, indexed)",
  "password": "string (hashed)",
  "firstName": "string",
  "lastName": "string",
  "role": "owner | admin | editor",
  "company": "ObjectId (ref: companies)",
  "isActive": "boolean",
  "lastLogin": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### companies
```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "subscriptionStatus": "trial | active | cancelled | expired",
  "maxProducts": "number",
  "maxMonthlyDMs": "number",
  "settings": {
    "autoReplyEnabled": "boolean",
    "maxProductsInCarousel": "number (1-10)",
    "carouselProductSelectionStrategy": "featured | random | newest | top_sellers"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### instagramaccounts
```json
{
  "_id": "ObjectId",
  "company": "ObjectId (ref: companies, unique)",
  "facebookPageId": "string",
  "instagramBusinessAccountId": "string (unique, indexed)",
  "instagramUsername": "string",
  "accessToken": "string (encrypted)",
  "tokenExpiresAt": "Date (indexed)",
  "webhookSubscribed": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### products
```json
{
  "_id": "ObjectId",
  "company": "ObjectId (ref: companies, indexed)",
  "name": "string",
  "description": "string",
  "price": "number",
  "currency": "string",
  "images": ["string (S3 URLs)"],
  "purchaseUrl": "string",
  "isFeatured": "boolean",
  "isActive": "boolean",
  "priority": "number (indexed)",
  "metadata": {
    "impressions": "number",
    "clicks": "number",
    "conversions": "number"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### messageevents
```json
{
  "_id": "ObjectId",
  "company": "ObjectId (ref: companies, indexed)",
  "instagramAccount": "ObjectId (ref: instagramaccounts)",
  "senderId": "string (Instagram User ID)",
  "messageType": "incoming | outgoing_carousel | outgoing_text",
  "messageText": "string",
  "products": ["ObjectId (ref: products)"],
  "responseStatus": "pending | sent | failed",
  "createdAt": "Date (indexed)"
}
```

#### analyticsevents
```json
{
  "_id": "ObjectId",
  "company": "ObjectId (ref: companies, indexed)",
  "eventType": "dm_received | carousel_sent | product_impression | product_click | purchase_redirect | webhook_failure",
  "product": "ObjectId (ref: products)",
  "metadata": "object",
  "createdAt": "Date (indexed, TTL: 90 days)"
}
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user & company | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/refresh-token` | Refresh access token | No |

### Instagram Integration

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/instagram/oauth-url` | Get OAuth URL | Yes |
| GET | `/api/instagram/callback` | OAuth callback | Yes |
| GET | `/api/instagram/account` | Get account status | Yes |
| DELETE | `/api/instagram/account` | Disconnect account | Yes (Owner/Admin) |

### Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | List products | Yes |
| GET | `/api/products/:id` | Get product | Yes |
| POST | `/api/products` | Create product | Yes |
| PUT | `/api/products/:id` | Update product | Yes |
| DELETE | `/api/products/:id` | Delete product | Yes (Owner/Admin) |

### Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/summary` | Get analytics summary | Yes |
| GET | `/api/analytics/daily-stats` | Get daily stats | Yes |
| GET | `/api/analytics/top-products` | Get top products | Yes |
| GET | `/api/analytics/recent-activity` | Get recent activity | Yes |

### Webhooks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/webhooks/instagram` | Verify webhook | No |
| POST | `/api/webhooks/instagram` | Receive webhook events | No |

---

## Frontend Structure

```
frontend/src/
├── components/
│   ├── layouts/
│   │   └── DashboardLayout.tsx      # Main dashboard layout
│   ├── products/
│   │   ├── ProductCard.tsx          # Product display card
│   │   ├── ProductForm.tsx          # Create/Edit product form
│   │   └── ProductList.tsx          # Products grid
│   ├── analytics/
│   │   ├── StatsCard.tsx            # Metric display card
│   │   └── Chart.tsx                # Chart component
│   └── common/
│       ├── Button.tsx               # Reusable button
│       ├── Modal.tsx               # Modal component
│       └── Loader.tsx              # Loading spinner
├── pages/
│   ├── LoginPage.tsx                # Login page
│   ├── RegisterPage.tsx             # Registration page
│   ├── DashboardPage.tsx            # Main dashboard
│   ├── ProductsPage.tsx             # Products management
│   ├── AnalyticsPage.tsx            # Analytics dashboard
│   └── SettingsPage.tsx             # Settings & Instagram connection
├── services/
│   ├── authService.ts               # Auth API calls
│   ├── productService.ts            # Product API calls
│   ├── instagramService.ts          # Instagram API calls
│   └── analyticsService.ts          # Analytics API calls
├── store/
│   └── authStore.ts                 # Zustand auth store
├── lib/
│   ├── api.ts                       # Axios instance
│   └── utils.ts                     # Utility functions
├── App.tsx                          # Main app with routing
└── main.tsx                         # React entry point
```

---

## Instagram Integration Flow

### Complete OAuth Flow

```mermaid
sequenceDiagram
    User->>Frontend: Click "Connect Instagram"
    Frontend->>Backend: GET /api/instagram/oauth-url
    Backend->>Frontend: Return OAuth URL
    Frontend->>Meta: Redirect to Facebook Login
    User->>Meta: Authorize permissions
    Meta->>Backend: Redirect to callback with code
    Backend->>Meta: Exchange code for access token
    Meta->>Backend: Return short-lived token
    Backend->>Meta: Exchange for long-lived token (60 days)
    Meta->>Backend: Return long-lived token
    Backend->>Meta: Get Facebook Pages
    Meta->>Backend: Return pages list
    Backend->>Meta: Get Instagram Business Account
    Meta->>Backend: Return IG account details
    Backend->>Meta: Subscribe to webhooks
    Backend->>Database: Save encrypted token
    Backend->>Frontend: Redirect to dashboard with success
```

### Incoming DM Processing

```mermaid
sequenceDiagram
    Instagram->>Webhook: POST /api/webhooks/instagram
    Webhook->>Webhook: Verify signature
    Webhook->>Instagram: 200 OK (immediate response)
    Webhook->>Redis Queue: Add message job
    Worker->>Redis Queue: Pick up job
    Worker->>Database: Find company by IG account ID
    Worker->>Database: Fetch products (strategy: featured/random/etc)
    Worker->>Instagram API: Send carousel message
    Worker->>Database: Log message event
    Worker->>Database: Track analytics
```

---

## Webhook Processing

### Signature Verification

Instagram sends a signature with each webhook POST:

```typescript
const signature = req.headers['x-hub-signature-256'];
const expectedHash = crypto
  .createHmac('sha256', META_APP_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (`sha256=${expectedHash}` !== signature) {
  return res.status(403).send('Invalid signature');
}
```

### Idempotency

- Each webhook event has a unique ID
- Store processed event IDs in Redis with TTL
- Skip processing if event ID already exists

### Retry Logic

- Bull queue automatically retries failed jobs
- Exponential backoff: 2s, 4s, 8s
- After 3 attempts, job moves to failed queue
- Monitor failed jobs in Bull dashboard

---

## Security Considerations

### 1. Token Encryption

All Instagram access tokens are encrypted using AES-256 before storage:

```typescript
import CryptoJS from 'crypto-js';

const encrypted = CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
```

### 2. JWT Security

- Access tokens: 7-day expiry, stored in HTTP-only cookies
- Refresh tokens: 30-day expiry, one-time use
- Tokens revoked on logout

### 3. Rate Limiting

- Authentication endpoints: 5 requests per 15 minutes
- General API: 100 requests per 15 minutes
- Webhooks: 100 requests per minute

### 4. Input Validation

All inputs validated using Zod schemas on both frontend and backend.

### 5. RBAC Implementation

```typescript
// Owner can do everything
// Admin can manage products and view analytics
// Editor can only create/edit products

const authorize = (...roles: UserRole[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
```

---

## Testing

### Backend Tests

```bash
cd backend
npm test
```

Test coverage includes:
- Unit tests for services
- Integration tests for API endpoints
- Webhook signature verification tests

### Frontend Tests

```bash
cd frontend
npm test
```

Test coverage includes:
- Component unit tests
- Page integration tests
- Form validation tests

### Manual Testing

1. **Registration Flow**
   - Register new user
   - Verify company created
   - Check JWT cookies set

2. **Instagram Connection**
   - Click "Connect Instagram"
   - Complete OAuth flow
   - Verify account saved with encrypted token

3. **Product Management**
   - Create product with images
   - Edit product
   - Delete product
   - Check product limits

4. **DM Processing** (requires actual Instagram account)
   - Send test DM to connected IG account
   - Verify carousel response received
   - Check analytics tracked

---

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT_SECRET and ENCRYPTION_KEY
- [ ] Configure HTTPS for webhooks
- [ ] Set up MongoDB replica set
- [ ] Configure Redis persistence
- [ ] Set up S3 bucket with proper CORS
- [ ] Configure Meta app for production domain
- [ ] Set up monitoring (PM2, New Relic, etc.)
- [ ] Configure error tracking (Sentry)
- [ ] Set up backup strategy
- [ ] Configure CDN for frontend
- [ ] Enable rate limiting
- [ ] Set up log rotation

### Docker Production Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Production Deployment

1. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Build backend:
   ```bash
   cd backend
   npm run build
   ```

3. Start with PM2:
   ```bash
   pm2 start ecosystem.config.js
   ```

---

## Extending the Platform

### Adding New Product Fields

1. Update Product model (`backend/src/models/Product.ts`)
2. Update product service validation
3. Update frontend ProductForm component

### Adding New Analytics Events

1. Add event type to `AnalyticsEventType` enum
2. Track event in relevant service
3. Update analytics queries
4. Add visualization to dashboard

### Supporting Multiple Languages

1. Add `i18next` to frontend
2. Create translation files
3. Wrap text in translation function
4. Add language selector

### Adding Stripe Payments

1. Install Stripe SDK
2. Create subscription plans
3. Add payment endpoints
4. Add billing page to frontend
5. Enforce subscription limits

---

## Support & Resources

- **Meta Platform Docs**: https://developers.facebook.com/docs/instagram-api
- **Bull Queue Docs**: https://github.com/OptimalBits/bull
- **MongoDB Docs**: https://www.mongodb.com/docs/
- **React Query Docs**: https://tanstack.com/query/latest

---

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for modern e-commerce businesses**
