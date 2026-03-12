# 📐 Architecture & Flow Diagrams

Visual guide to understanding the Instagram DM Commerce SaaS platform architecture.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    React Frontend (Vite)                          │  │
│  │  • Glassmorphism UI                                               │  │
│  │  • React Query (Server State)                                     │  │
│  │  • Zustand (Client State)                                         │  │
│  │  • Tailwind CSS                                                   │  │
│  └─────────────────────┬────────────────────────────────────────────┘  │
└────────────────────────┼───────────────────────────────────────────────┘
                         │ HTTP/HTTPS
                         │ JWT Cookies
                         │
┌────────────────────────┼───────────────────────────────────────────────┐
│                        │           API LAYER                            │
│  ┌─────────────────────▼────────────────────────────────────────────┐  │
│  │              Express.js REST API                                  │  │
│  │  ┌────────────┐  ┌──────────┐  ┌────────────┐  ┌─────────────┐  │  │
│  │  │   Auth     │  │ Products │  │ Instagram  │  │  Analytics  │  │  │
│  │  │  Routes    │  │  Routes  │  │   Routes   │  │   Routes    │  │  │
│  │  └────────────┘  └──────────┘  └────────────┘  └─────────────┘  │  │
│  │         │              │               │               │          │  │
│  │  ┌──────▼──────────────▼───────────────▼───────────────▼───────┐ │  │
│  │  │                    Middleware Layer                          │ │  │
│  │  │  • Authentication (JWT)                                      │ │  │
│  │  │  • Authorization (RBAC)                                      │ │  │
│  │  │  • Validation (Zod)                                          │ │  │
│  │  │  • Rate Limiting                                             │ │  │
│  │  │  • Error Handling                                            │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  │         │                                                          │  │
│  │  ┌──────▼──────────────────────────────────────────────────────┐ │  │
│  │  │                  Service Layer                               │ │  │
│  │  │  • authService      • instagramService                       │ │  │
│  │  │  • productService   • messageService                         │ │  │
│  │  │  • analyticsService                                          │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────┬───────────────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────────────────┘
                          │
┌─────────────────────────┼──────────────────────────────────────────────┐
│                         │        DATA LAYER                             │
│  ┌──────────────────────▼──────────────────┐  ┌────────────────────┐  │
│  │         MongoDB (Mongoose)              │  │   Redis            │  │
│  │  ┌──────────────────────────────────┐   │  │  ┌──────────────┐ │  │
│  │  │ • users                          │   │  │  │ Bull Queue   │ │  │
│  │  │ • companies                      │   │  │  │ • Messages   │ │  │
│  │  │ • instagramaccounts              │   │  │  │ • Postbacks  │ │  │
│  │  │ • products                       │   │  │  └──────────────┘ │  │
│  │  │ • messageevents                  │   │  │  ┌──────────────┐ │  │
│  │  │ • analyticsevents (TTL 90d)      │   │  │  │ Session      │ │  │
│  │  │ • refreshtokens (TTL)            │   │  │  │ Cache        │ │  │
│  │  └──────────────────────────────────┘   │  │  └──────────────┘ │  │
│  └──────────────────────────────────────────┘  └────────────────────┘  │
└─────────────────────────┬──────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKGROUND JOBS LAYER                                │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Worker Process                               │  │
│  │  • Consumes jobs from Redis queue                                 │  │
│  │  • Processes incoming Instagram messages                          │  │
│  │  • Generates product carousels                                    │  │
│  │  • Tracks analytics events                                        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────┬──────────────────────────────────────────────┘
                          │
┌─────────────────────────┼──────────────────────────────────────────────┐
│                         │      EXTERNAL SERVICES                        │
│  ┌──────────────────────▼──────────┐  ┌───────────────────────────┐   │
│  │   Meta Graph API / Instagram    │  │      AWS S3               │   │
│  │  • OAuth 2.0                     │  │  • Product Images         │   │
│  │  • Messaging API                 │  │  • Company Logos          │   │
│  │  • Webhooks                      │  │                           │   │
│  └──────────────────────────────────┘  └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Instagram OAuth Flow

```
┌──────────┐                                      ┌─────────────────────┐
│          │  1. Click "Connect Instagram"        │                     │
│   User   │─────────────────────────────────────>│   Frontend (React)   │
│          │                                       │                     │
└──────────┘                                       └──────────┬──────────┘
                                                              │
                                                              │ 2. GET /api/instagram/oauth-url
                                                              │
                                                   ┌──────────▼──────────┐
                                                   │                     │
                                                   │  Backend (Express)   │
                                                   │                     │
                                                   └──────────┬──────────┘
                                                              │
                            3. Return OAuth URL               │
┌──────────┐              with state param                    │
│          │◄──────────────────────────────────────────────────┘
│   User   │
│          │
└─────┬────┘
      │
      │ 4. Redirect to Meta OAuth
      │
      ▼
┌──────────────────────┐
│                      │  5. Shows permission request
│  Meta OAuth Server   │     (instagram_manage_messages, etc.)
│                      │
└──────┬───────────────┘
       │
       │ 6. User grants permissions
       │
       ▼
┌──────────────────────┐
│                      │  7. Redirect back with code
│  Backend Callback    │     /api/instagram/callback?code=ABC123&state=XYZ
│                      │
└──────┬───────────────┘
       │
       │ 8. Exchange code for access token
       │
       ▼
┌──────────────────────┐
│                      │  9. Return short-lived token
│  Meta Graph API      │
│                      │
└──────┬───────────────┘
       │
       │ 10. Exchange for long-lived token (60 days)
       │
       ▼
┌──────────────────────┐
│                      │  11. Return long-lived token
│  Meta Graph API      │
│                      │
└──────┬───────────────┘
       │
       │ 12. Get user's Facebook Pages
       │
       ▼
┌──────────────────────┐
│                      │  13. Return pages + IG accounts
│  Meta Graph API      │
│                      │
└──────┬───────────────┘
       │
       │ 14. Subscribe to webhooks
       │
       ▼
┌──────────────────────┐
│                      │  15. Confirm subscription
│  Meta Webhooks API   │
│                      │
└──────┬───────────────┘
       │
       │ 16. Encrypt token with AES-256
       │
       ▼
┌──────────────────────┐
│                      │  17. Save:
│     MongoDB          │      - IG Account ID
│                      │      - Encrypted token
│                      │      - Expiration date
└──────┬───────────────┘      - Webhook status
       │
       │ 18. Redirect to dashboard
       │
       ▼
┌──────────────────────┐
│                      │
│   User Dashboard     │  ✅ Instagram Connected!
│                      │
└──────────────────────┘
```

---

## Instagram DM Processing Flow

```
┌─────────────────────┐
│   Instagram User    │  Sends DM: "Hi, what products do you have?"
└──────────┬──────────┘
           │
           │ Instagram Platform processes the message
           │
           ▼
┌─────────────────────┐
│  Instagram Webhook  │  POST /api/webhooks/instagram
│     System          │  Headers: x-hub-signature-256
└──────────┬──────────┘
           │
           │ 1. Webhook payload
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Webhook Handler (webhookController.ts)                        │
│                                                                 │
│  Step 1: Verify Signature                                      │
│    - Extract x-hub-signature-256 header                        │
│    - Compute HMAC-SHA256 of body with META_APP_SECRET          │
│    - Compare with provided signature                           │
│    - Reject if mismatch (403)                                  │
│                                                                 │
│  Step 2: Acknowledge Immediately                               │
│    - Return 200 OK to Meta (prevents timeout)                  │
│                                                                 │
│  Step 3: Queue for Processing                                  │
│    - Extract sender ID, recipient ID, message text             │
│    - Add job to Bull queue (Redis)                             │
└──────────┬──────────────────────────────────────────────────────┘
           │
           │ 2. Job queued in Redis
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Redis Queue (Bull)                                             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Job: { senderId, recipientId, messageText, timestamp }   │ │
│  │  Priority: Normal                                         │ │
│  │  Retry: 3 attempts with exponential backoff               │ │
│  └───────────────────────────────────────────────────────────┘ │
└──────────┬──────────────────────────────────────────────────────┘
           │
           │ 3. Worker picks up job
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Worker Process (workers/index.ts)                             │
│                                                                 │
│  Step 1: Identify Company                                      │
│    - Look up InstagramAccount by recipientId (IG Business ID)  │
│    - Get associated Company                                    │
│                                                                 │
│  Step 2: Check Eligibility                                     │
│    - Is auto-reply enabled?                                    │
│    - Within monthly DM limit?                                  │
│    - Instagram account active?                                 │
│                                                                 │
│  Step 3: Fetch Products                                        │
│    - Get company's carousel strategy (featured/random/newest)  │
│    - Query products accordingly                                │
│    - Limit to maxProductsInCarousel (1-10)                     │
│    - Filter: isActive=true, stockStatus != out_of_stock        │
│                                                                 │
│  Step 4: Build Carousel                                        │
│    - Create Generic Template message                           │
│    - For each product:                                         │
│      {                                                          │
│        title: product.name,                                    │
│        subtitle: "$99.99\nDescription...",                     │
│        image_url: product.images[0],                           │
│        buttons: [{ type: "web_url", url: purchaseUrl }]        │
│      }                                                          │
│                                                                 │
│  Step 5: Send via Instagram API                                │
│    - Decrypt access token                                      │
│    - POST to graph.facebook.com/v18.0/me/messages              │
│    - Include recipient ID and carousel payload                 │
│                                                                 │
│  Step 6: Track Analytics                                       │
│    - Log MessageEvent (type: outgoing_carousel)                │
│    - Track AnalyticsEvent (type: carousel_sent)                │
│    - Track product impressions for each product                │
│    - Increment product.metadata.impressions                    │
└──────────┬──────────────────────────────────────────────────────┘
           │
           │ 4. Message sent successfully
           │
           ▼
┌─────────────────────┐
│  Instagram User     │  Receives beautiful product carousel!
│                     │  
│  [Product 1]        │  ┌────────────────────┐
│  [Product 2]        │  │  Premium Headphones│
│  [Product 3]        │  │  $299.99           │
│  [Product 4]        │  │  [Buy Now]         │
│  [Product 5]        │  └────────────────────┘
└─────────────────────┘
```

---

## Database Entity Relationships

```
┌──────────────────┐
│      User        │
│──────────────────│
│ _id              │───┐
│ email (unique)   │   │
│ password (hash)  │   │
│ firstName        │   │
│ lastName         │   │
│ role             │   │  belongsTo
│ company ────────────┼──────────────┐
│ isActive         │   │             │
│ lastLogin        │   │             ▼
└──────────────────┘   │   ┌──────────────────┐
                       │   │     Company      │
┌──────────────────┐   │   │──────────────────│
│ InstagramAccount │   │   │ _id              │
│──────────────────│   │   │ name             │
│ _id              │   │   │ description      │
│ company ─────────────┼──>│ subscription     │
│ facebookPageId   │   │   │ maxProducts      │
│ igBusinessAccId  │   │   │ maxMonthlyDMs    │
│ igUsername       │   │   │ settings         │
│ accessToken      │   │   └──────────────────┘
│  (encrypted!)    │   │             │
│ tokenExpiresAt   │   │             │ hasMany
│ webhookSubscribed│   │             │
└──────────────────┘   │             ▼
                       │   ┌──────────────────┐
┌──────────────────┐   │   │     Product      │
│  MessageEvent    │   │   │──────────────────│
│──────────────────│   │   │ _id              │
│ _id              │   │   │ company ──────┐  │
│ company ─────────────┼──>│ name          │  │
│ instagramAccount │   │   │ description   │  │
│ senderId         │   │   │ price         │  │
│ messageType      │   │   │ currency      │  │
│ messageText      │   │   │ images[]      │  │
│ products[] ──────────┼─┐ │ purchaseUrl   │  │
│ responseStatus   │   │ │ │ isFeatured    │  │
│ createdAt        │   │ │ │ priority      │  │
└──────────────────┘   │ │ │ metadata      │  │
                       │ │ └───────┬─────────┘
┌──────────────────┐   │ │         │
│ AnalyticsEvent   │   │ │         │ references
│──────────────────│   │ │         │
│ _id              │   │ └─────────┼────────┐
│ company ─────────────┼───────────┘        │
│ eventType        │   │                    │
│ product ──────────────────────────────────┘
│ messageEvent     │   │
│ metadata         │   │
│ createdAt (TTL)  │   │
└──────────────────┘   │
                       │
┌──────────────────┐   │
│  RefreshToken    │   │
│──────────────────│   │
│ _id              │   │
│ user ────────────────┘
│ token (unique)   │
│ expiresAt (TTL)  │
│ isRevoked        │
└──────────────────┘
```

---

## Authentication Flow

```
Registration:
──────────────
Frontend          Backend           MongoDB
   │                │                  │
   │ POST /register │                  │
   │───────────────>│                  │
   │                │                  │
   │                │ 1. Validate      │
   │                │ 2. Hash password │
   │                │ 3. Create company│
   │                │────────────────> │
   │                │                  │
   │                │ 4. Create user   │
   │                │────────────────> │
   │                │                  │
   │                │ 5. Generate JWT  │
   │                │ 6. Create refresh│
   │                │    token         │
   │                │────────────────> │
   │                │                  │
   │ Set cookies    │                  │
   │ - accessToken  │                  │
   │ - refreshToken │                  │
   │<───────────────│                  │
   │                │                  │

Login:
──────
   │                │                  │
   │ POST /login    │                  │
   │───────────────>│                  │
   │                │                  │
   │                │ 1. Find user     │
   │                │────────────────> │
   │                │<───────────────  │
   │                │                  │
   │                │ 2. Compare hash  │
   │                │ 3. Generate JWT  │
   │                │ 4. Create refresh│
   │                │────────────────> │
   │                │                  │
   │ Set cookies    │                  │
   │<───────────────│                  │
   │                │                  │

Authenticated Request:
──────────────────────
   │                │                  │
   │ GET /products  │                  │
   │ Cookie: token  │                  │
   │───────────────>│                  │
   │                │                  │
   │                │ 1. Extract cookie│
   │                │ 2. Verify JWT    │
   │                │ 3. Check expiry  │
   │                │ 4. Attach user   │
   │                │                  │
   │                │ 5. Query products│
   │                │────────────────> │
   │                │<───────────────  │
   │                │                  │
   │ 200 + data     │                  │
   │<───────────────│                  │
   │                │                  │

Token Refresh:
──────────────
   │                │                  │
   │ POST /refresh  │                  │
   │ Cookie: refresh│                  │
   │───────────────>│                  │
   │                │                  │
   │                │ 1. Find token    │
   │                │────────────────> │
   │                │<───────────────  │
   │                │                  │
   │                │ 2. Validate      │
   │                │ 3. Generate new  │
   │                │    access token  │
   │                │                  │
   │ Set new cookie │                  │
   │<───────────────│                  │
   │                │                  │
```

---

## Multi-Tenant Data Isolation

```
Request Flow with Tenant Filtering:
────────────────────────────────────

User (Company A) makes request
         │
         ▼
    ┌─────────────────────┐
    │ Authentication       │
    │ Middleware          │
    │                     │
    │ JWT decoded:        │
    │ {                   │
    │   userId: "123",    │
    │   companyId: "A"  ──┼──┐  Attached to req.companyId
    │ }                   │  │
    └─────────────────────┘  │
         │                   │
         ▼                   │
    ┌─────────────────────┐  │
    │ Authorization        │  │
    │ Middleware          │  │
    │                     │  │
    │ Check role:         │  │
    │ - Owner allowed     │  │
    │ - Admin allowed     │  │
    │ - Editor denied     │  │
    └─────────────────────┘  │
         │                   │
         ▼                   │
    ┌─────────────────────┐  │
    │ Controller           │  │
    │                     │  │
    │ Gets req.companyId ◄───┘
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Service Layer        │
    │                     │
    │ productService      │
    │  .getProducts(      │
    │    companyId: "A"   │ ← Always filtered!
    │  )                  │
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │ MongoDB Query        │
    │                     │
    │ db.products.find({  │
    │   company: "A",     │ ← Prevents cross-tenant access
    │   isActive: true    │
    │ })                  │
    └─────────────────────┘
              │
              ▼
    Returns ONLY Company A's products
    (Company B's products never exposed)
```

---

## Error Handling Flow

```
Request → Controller → Service → Database
                │          │         │
                │          │         │
                ▼          ▼         ▼
            Errors can occur at any layer
                │
                ▼
    ┌───────────────────────────────┐
    │ Global Error Handler          │
    │ (middleware/errorHandler.ts)  │
    │                               │
    │ Catches all errors and        │
    │ normalizes response:          │
    │                               │
    │ if (AppError) {               │
    │   // Custom error             │
    │   status = err.statusCode     │
    │   message = err.message       │
    │ }                             │
    │                               │
    │ if (ValidationError) {        │
    │   // Mongoose validation      │
    │   status = 400                │
    │ }                             │
    │                               │
    │ if (MongoError code 11000) {  │
    │   // Duplicate key            │
    │   status = 409                │
    │ }                             │
    │                               │
    │ else {                        │
    │   // Unknown error            │
    │   status = 500                │
    │   Log to Winston              │
    │ }                             │
    └────────────┬──────────────────┘
                 │
                 ▼
    {
      success: false,
      message: "User-friendly error",
      ...(dev env && { stack })
    }
```

---

## Scaling Strategy

```
Phase 1: Single Server (MVP)
─────────────────────────────
┌────────────────────────────────────────┐
│           Single Server                │
│  ┌──────────┐  ┌──────────┐           │
│  │ Frontend │  │ Backend  │           │
│  │  (Nginx) │  │ + Worker │           │
│  └──────────┘  └──────────┘           │
│  ┌──────────┐  ┌──────────┐           │
│  │ MongoDB  │  │  Redis   │           │
│  └──────────┘  └──────────┘           │
└────────────────────────────────────────┘

Phase 2: Separated Workers (Growth)
────────────────────────────────────
┌──────────────┐     ┌──────────────┐
│   Frontend   │     │   Backend    │
│    (CDN)     │     │   (API)      │
└──────────────┘     └──────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
      ┌──────────┐  ┌──────────┐  ┌──────────┐
      │ Worker 1 │  │ Worker 2 │  │ Worker N │
      └─────┬────┘  └─────┬────┘  └─────┬────┘
            │             │             │
            └─────────────┼─────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
      ┌──────────────┐        ┌──────────────┐
      │   MongoDB    │        │    Redis     │
      │ Replica Set  │        │   Cluster    │
      └──────────────┘        └──────────────┘

Phase 3: Microservices (Scale)
───────────────────────────────
                 ┌──────────────┐
                 │ Load Balancer│
                 └──────┬───────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Auth Service │ │Product Service│ │ DM Service   │
└──────┬───────┘ └──────┬────────┘ └──────┬───────┘
       │                │                 │
       └────────────────┼─────────────────┘
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
    ┌──────────────┐        ┌──────────────┐
    │   MongoDB    │        │    Redis     │
    │   Sharded    │        │   Cluster    │
    └──────────────┘        └──────────────┘
```

---

This visual guide should help you understand the complete system architecture and data flows!
