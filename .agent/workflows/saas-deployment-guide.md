---
description: SaaS Deployment Guide - Multi-Tenant Setup
---

# SaaS Deployment Guide

## Overview
Your application is a **multi-tenant SaaS platform**. You do NOT need separate repositories or Facebook Apps for each client.

## Architecture
- **One Codebase** → Serves all clients
- **One Database** → MongoDB with company-based data isolation
- **One Facebook App** → All clients OAuth through this
- **Multiple Instagram Accounts** → Each client connects their own

---

## Production Deployment Checklist

### 1. Facebook Developer App Setup
- [ ] Create a **single** Facebook Developer App (you already have: `816986358022813`)
- [ ] Add your production domain to **App Domains**
- [ ] Configure **Valid OAuth Redirect URIs**:
  - `https://yourdomain.com/api/instagram/callback`
- [ ] Add **Webhook URL**:
  - `https://yourdomain.com/api/webhooks/instagram`
- [ ] Request **Advanced Access** for permissions:
  - `instagram_basic`
  - `instagram_manage_messages`
  - `pages_show_list`
  - `pages_manage_metadata`
  - `business_management`

### 2. Environment Variables (Production)

Update your `.env` file:

```env
# Node Environment
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://your-production-db-url

# Redis
REDIS_URL=redis://your-production-redis-url

# JWT (CHANGE THESE!)
JWT_SECRET=<generate-strong-random-secret>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=<generate-strong-random-secret>
REFRESH_TOKEN_EXPIRES_IN=30d

# Encryption (32 characters for AES-256)
ENCRYPTION_KEY=<generate-32-character-key>

# Meta Platform
META_APP_ID=816986358022813
META_APP_SECRET=<your-app-secret>
META_API_VERSION=v18.0
META_WEBHOOK_VERIFY_TOKEN=<generate-random-token>
OAUTH_REDIRECT_URI=https://yourdomain.com/api/instagram/callback

# Frontend
FRONTEND_URL=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### 3. Domain Setup
- [ ] Purchase domain (e.g., `yourapp.com`)
- [ ] Point DNS to your server
- [ ] Setup SSL certificate (Let's Encrypt)
- [ ] Configure HTTPS

### 4. Server Setup
- [ ] Deploy backend to cloud (AWS, DigitalOcean, Heroku, etc.)
- [ ] Deploy frontend to CDN (Vercel, Netlify, Cloudflare Pages)
- [ ] Setup MongoDB Atlas (production cluster)
- [ ] Setup Redis (Redis Cloud, AWS ElastiCache)
- [ ] Configure environment variables on server

### 5. Privacy & Terms Pages
- [ ] Create Privacy Policy page
- [ ] Create Terms of Service page
- [ ] Add URLs to Facebook App settings

---

## How Clients Use Your SaaS

### Client Onboarding Flow:

1. **Client signs up** at `https://yourapp.com/register`
   - Creates account with email/password
   - System creates a new `Company` record
   - User is linked to that company

2. **Client connects Instagram**
   - Clicks "Connect Instagram" in dashboard
   - Redirected to Facebook OAuth (your single app)
   - Grants permissions to **their** Instagram Business Account
   - Access token is encrypted and stored with their `companyId`

3. **Client manages products**
   - Adds products to their catalog
   - All products are tagged with their `companyId`

4. **Client receives DMs**
   - Instagram user sends DM to **client's** Instagram
   - Webhook received by your app
   - Worker identifies company by Instagram Business Account ID
   - Sends product carousel from **that client's** products only

### Data Isolation:
Every database query includes the `companyId` filter:
```javascript
// Example: Client A can only see their products
const products = await Product.find({ company: clientA_companyId });

// Client B can only see their products
const products = await Product.find({ company: clientB_companyId });
```

---

## Common Questions

### Q: Do I need a separate Facebook App for each client?
**A: NO.** One Facebook App handles OAuth for all clients. Each client connects their own Instagram account through your app.

### Q: Do I need separate repositories?
**A: NO.** One codebase serves all clients. Multi-tenancy is handled via database filtering.

### Q: How are Instagram tokens stored?
**A: Encrypted.** Each client's access token is encrypted with AES-256 and stored in the database with their `companyId`.

### Q: Can Client A see Client B's data?
**A: NO.** All queries are filtered by `companyId`. The authentication middleware ensures users can only access their company's data.

### Q: What if I want to white-label for enterprise clients?
**A: Use custom domains.** You can:
- Deploy the same codebase to different domains
- Use environment variables to customize branding
- Still use the same database with company filtering

---

## Scaling Strategy

### Phase 1: MVP (Current)
- Single server deployment
- MongoDB Atlas
- Redis Cloud
- Handles 100-1000 clients

### Phase 2: Growth
- Load balancer
- Multiple backend instances
- Separate worker processes
- Handles 1000-10000 clients

### Phase 3: Enterprise
- Microservices architecture
- Database sharding
- Regional deployments
- Handles 10000+ clients

---

## Security Checklist

- [x] Access tokens encrypted at rest
- [x] JWT-based authentication
- [x] Company-based data isolation
- [x] Rate limiting enabled
- [ ] HTTPS in production
- [ ] Environment secrets in vault (not in code)
- [ ] Regular security audits
- [ ] GDPR compliance (if EU users)

---

## Monitoring

### What to Monitor:
- **Instagram token expirations** (refresh before 60 days)
- **Webhook delivery failures**
- **Database query performance**
- **Redis queue backlog**
- **API rate limits** (Meta Graph API)

### Tools:
- **Logging**: Winston (already implemented)
- **APM**: New Relic, DataDog, or Sentry
- **Uptime**: UptimeRobot, Pingdom
- **Analytics**: Mixpanel, Amplitude

---

## Support

For issues:
1. Check logs in Winston
2. Monitor MongoDB queries
3. Check Redis queue status
4. Review Meta Graph API errors
