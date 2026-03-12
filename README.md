# Instagram DM Commerce SaaS Platform

A production-ready multi-tenant SaaS platform that enables businesses to automatically respond to Instagram DMs with product carousels and purchase links.

## 🎯 Features

- **Multi-Tenant Architecture**: Isolated data per company
- **Instagram Integration**: OAuth, webhook handling, automated DM responses
- **Product Management**: Full CRUD for product catalogs
- **Analytics Dashboard**: Track DMs, impressions, CTR, conversions
- **Security**: Token encryption, webhook verification, role-based access
- **Scalable**: Ready for 10,000+ businesses

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Instagram Business API                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Webhooks & API Calls
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Express)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   Auth      │  │   Products   │  │    Instagram      │  │
│  │   System    │  │   Management │  │    Integration    │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
└──────────────────┬──────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┬──────────────┐
         ▼                   ▼              ▼
    ┌─────────┐         ┌────────┐    ┌─────────┐
    │ MongoDB │         │ Redis  │    │   S3    │
    │ Database│         │ Queue  │    │ Storage │
    └─────────┘         └────────┘    └─────────┘
                   ▲
                   │
         ┌─────────┴─────────┐
         │                   │
    ┌─────────────────────────────┐
    │   Frontend (React)          │
    │   - Dashboard               │
    │   - Product Management      │
    │   - Analytics               │
    └─────────────────────────────┘
```

## 📦 Tech Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Queue**: Redis (Bull queue)
- **Storage**: AWS S3 or compatible
- **Auth**: JWT with HTTP-only cookies

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query + Zustand
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod

### DevOps
- **Containerization**: Docker & Docker Compose
- **Environment**: dotenv
- **Process Manager**: PM2 (production)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Redis 7+
- AWS S3 account (or compatible)
- Meta Developer Account with Facebook/Instagram App

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd console-2.0

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your configurations

# Frontend environment
cd ../frontend
cp .env.example .env
# Edit .env with your configurations
```

### 3. Setup Database

```bash
# Start MongoDB (if using Docker)
docker-compose up -d mongodb redis

# Run migrations
cd backend
npm run migrate
```

### 4. Meta Developer Setup

1. Go to [Meta Developer Console](https://developers.facebook.com)
2. Create a new app
3. Add "Instagram" product
4. Add "Webhooks" product
5. Configure OAuth redirect URI: `http://localhost:3000/auth/instagram/callback`
6. Copy App ID and App Secret to `.env`

### 5. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Queue Worker
cd backend
npm run worker
```

Visit `http://localhost:5173` to access the dashboard.

## 📁 Project Structure

```
console-2.0/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities & helpers
│   │   ├── workers/         # Queue workers
│   │   └── types/           # TypeScript types
│   ├── tests/               # Test files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── store/           # State management
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utilities
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔐 Security

- All Meta access tokens are encrypted at rest using AES-256
- Webhook signatures are verified on every request
- Rate limiting on all API endpoints
- RBAC (Role-Based Access Control)
- Input validation with Zod
- SQL injection prevention with Mongoose
- XSS protection with sanitization

## 📊 Database Models

### User
- Email, password (hashed)
- Company reference
- Role (owner, admin, editor)

### Company
- Name, profile info
- Subscription status
- Created/updated timestamps

### InstagramAccount
- Company reference
- Facebook Page ID
- Instagram Business Account ID
- Access tokens (encrypted)
- Token expiration

### Product
- Company reference
- Name, description, price
- Images (S3 URLs)
- Purchase URL
- Priority/ranking

### MessageEvent
- Company reference
- Instagram sender ID
- Message content
- Response sent
- Timestamp

### AnalyticsEvent
- Company reference
- Event type (impression, click, purchase_redirect)
- Metadata
- Timestamp

## 🎨 Instagram Integration Flow

1. **OAuth Connection**
   - User clicks "Connect Instagram"
   - Redirected to Facebook Login
   - Permissions requested: `instagram_basic`, `instagram_manage_messages`, `pages_show_list`, `pages_manage_metadata`
   - Access token received and encrypted
   - Long-lived token exchanged

2. **Webhook Subscription**
   - Subscribe to `messages` and `messaging_postbacks`
   - Webhook URL: `https://yourdomain.com/webhooks/instagram`
   - Verification handled automatically

3. **Incoming DM Processing**
   - Instagram sends webhook event
   - Signature verified
   - Event added to Redis queue
   - Worker processes:
     - Identifies company
     - Fetches top products
     - Sends carousel response
     - Logs analytics

## 📈 Analytics Tracked

- Total incoming DMs
- Carousel sends
- Product impressions
- Click-through rate (CTR)
- Purchase link clicks
- Webhook failures
- Token expiration alerts

## 🔄 API Documentation

API documentation is available at `/api-docs` when running the backend server.

Key endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/instagram/oauth-url` - Get Instagram OAuth URL
- `POST /api/instagram/callback` - OAuth callback handler
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/analytics` - Get analytics data

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 🚢 Deployment

### Using Docker

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

1. Build frontend: `cd frontend && npm run build`
2. Build backend: `cd backend && npm run build`
3. Set environment variables
4. Run migrations: `npm run migrate`
5. Start backend: `pm2 start ecosystem.config.js`
6. Serve frontend through Nginx/CDN

## 📝 Environment Variables

### Backend (.env)

```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/instagram-dm-saas
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=your-32-char-encryption-key

# Meta Platform
META_APP_ID=your-app-id
META_APP_SECRET=your-app-secret
META_WEBHOOK_VERIFY_TOKEN=your-webhook-token
OAUTH_REDIRECT_URI=http://localhost:3000/auth/instagram/callback

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Instagram DM Commerce
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT License

## 🆘 Support

For support, email support@example.com or open an issue.

---

Built with ❤️ for modern e-commerce businesses
# Console-2.0
