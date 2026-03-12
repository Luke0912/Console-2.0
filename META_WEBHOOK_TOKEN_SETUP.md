# 🔐 Meta Webhook Setup - Complete Guide

## ✅ Yes! You Need to Set This in Meta App Dashboard

The `META_WEBHOOK_VERIFY_TOKEN` from your `.env` file **MUST** be entered in your Meta App settings when configuring webhooks.

---

## 🎯 Quick Answer

**In your `.env` file:**
```env
META_WEBHOOK_VERIFY_TOKEN=your_secret_verify_token_123
```

**In Meta App Dashboard:**
When setting up webhooks, you'll enter this **EXACT SAME TOKEN** in the "Verify Token" field.

---

## 📋 Step-by-Step Setup

### **Step 1: Choose Your Verify Token**

In `backend/.env`:
```env
META_WEBHOOK_VERIFY_TOKEN=MySecureToken12345
```

**Important:**
- ✅ Use a random, secure string
- ✅ Remember this token (you'll need it in Meta dashboard)
- ✅ Don't share it publicly
- ✅ Can be any alphanumeric string

**Example tokens:**
```
my_super_secret_token_2024
webhook_verify_abc123xyz
instagram_dm_hook_secure_key
```

---

### **Step 2: Set Up Your Meta App**

#### **2.1 Go to Meta Developers**
```
https://developers.facebook.com/apps
```

#### **2.2 Create App (if you haven't)**
1. Click "Create App"
2. Select "Business" or "Consumer" type
3. Add app name: "Instagram DM Commerce"
4. Add contact email
5. Click "Create App"

#### **2.3 Add Instagram Product**
1. In your app dashboard
2. Click "Add Product"
3. Find "Instagram"
4. Click "Set Up"

---

### **Step 3: Configure Webhooks** ⚠️ **IMPORTANT**

#### **3.1 Navigate to Webhooks**
```
Meta App Dashboard
→ Products
→ Instagram
→ Configuration
→ Webhooks
```

#### **3.2 Configure Webhook Endpoint**

You'll see a form with these fields:

```
┌─────────────────────────────────────────────┐
│  Configure Webhooks                         │
├─────────────────────────────────────────────┤
│                                             │
│  Callback URL:                              │
│  [https://yourdomain.com/api/webhooks/____] │
│   instagram                                 │
│                                             │
│  Verify Token:                              │
│  [MySecureToken12345___________________]    │
│   ↑                                         │
│   └─ ENTER YOUR TOKEN HERE!                 │
│      (from your .env file)                  │
│                                             │
│  [ Verify and Save ]                        │
└─────────────────────────────────────────────┘
```

**Fill in:**

**Callback URL:**
```
https://your-domain.com/api/webhooks/instagram
```
OR for local testing with ngrok:
```
https://abc123.ngrok.io/api/webhooks/instagram
```

**Verify Token:**
```
MySecureToken12345
```
↑ **MUST MATCH** your `.env` file exactly!

#### **3.3 Click "Verify and Save"**

Meta will make a request to your callback URL:
```
GET https://your-domain.com/api/webhooks/instagram
?hub.mode=subscribe
&hub.challenge=1234567890
&hub.verify_token=MySecureToken12345
```

Your backend will:
1. Check if `hub.verify_token` matches `META_WEBHOOK_VERIFY_TOKEN`
2. If match → Return `hub.challenge`
3. If no match → Return 403 error

**Success:** ✅ "Webhook verified successfully"
**Failure:** ❌ "Verify token doesn't match"

---

### **Step 4: Subscribe to Events**

After webhook is verified, subscribe to these events:

**Required events:**
- ✅ `messages` - Instagram DMs
- ✅ `messaging_postbacks` - Button clicks
- ✅ `messaging_seen` - Message read receipts
- ✅ `messaging_optins` - User opt-ins
- ✅ `messaging_optouts` - User opt-outs

**How to subscribe:**
1. In webhooks section
2. Click "Configure" next to Instagram
3. Check the boxes for events above
4. Click "Save"

---

## 🔄 How Webhook Verification Works

### **The Verification Flow:**

```
Meta Server                          Your Backend
    │                                     │
    │  1. GET /webhooks/instagram         │
    │     ?hub.verify_token=MyToken       │
    │─────────────────────────────────────>│
    │                                     │
    │                      2. Check token │
    │                         matches .env│
    │                                     │
    │  3. Return hub.challenge            │
    │<─────────────────────────────────────│
    │                                     │
    │  ✅ Verified!                        │
```

### **Your Backend Code (Already Built!):**

```typescript
// backend/src/routes/webhookRoutes.ts
router.get('/instagram', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.meta.webhookVerifyToken) {
    // ✅ Token matches!
    res.status(200).send(challenge);
  } else {
    // ❌ Token doesn't match
    res.sendStatus(403);
  }
});
```

---

## 🌐 Setting Up for Production vs Development

### **Development (Local Testing with ngrok)**

**1. Install ngrok:**
```bash
# Windows
choco install ngrok

# Mac
brew install ngrok

# Or download from ngrok.com
```

**2. Start your backend:**
```bash
cd backend
npm run dev
# Running on http://localhost:3000
```

**3. Start ngrok:**
```bash
ngrok http 3000
```

**4. Copy ngrok URL:**
```
Forwarding: https://abc123.ngrok.io -> http://localhost:3000
            ↑
            Use this in Meta dashboard
```

**5. In Meta App, use:**
```
Callback URL: https://abc123.ngrok.io/api/webhooks/instagram
Verify Token: MySecureToken12345
```

### **Production (Live Server)**

**1. Deploy backend to:**
- Heroku
- AWS EC2
- DigitalOcean
- Vercel
- Railway
- etc.

**2. In Meta App, use:**
```
Callback URL: https://yourdomain.com/api/webhooks/instagram
Verify Token: MySecureToken12345
```

**3. Ensure HTTPS:**
- Meta requires HTTPS (not HTTP)
- Use SSL certificate
- Most hosting providers include SSL

---

## 📝 Complete .env Setup

Your `backend/.env` should have:

```env
# Meta/Instagram Configuration
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here
META_WEBHOOK_VERIFY_TOKEN=MySecureToken12345
META_ACCESS_TOKEN=your_instagram_access_token

# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/instagram-dm-saas

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=30d

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## 🔍 Where to Find Other Meta Credentials

### **META_APP_ID** and **META_APP_SECRET**

**Location:** Meta App Dashboard → Settings → Basic

```
App ID:         1234567890123456
App Secret:     [Show] → abc123def456...
```

### **META_ACCESS_TOKEN**

**How to get:**

**Option 1: Graph API Explorer (Testing)**
1. Go to https://developers.facebook.com/tools/explorer
2. Select your app
3. Get User Access Token
4. Add permissions: `instagram_basic`, `instagram_manage_messages`, `pages_messaging`
5. Copy token

**Option 2: OAuth Flow (Production)**
1. User logs in with Instagram
2. Grants permissions
3. You receive access token
4. Store encrypted in database

---

## ✅ Checklist: Complete Setup

### **1. Backend Configuration**
- [ ] Set `META_WEBHOOK_VERIFY_TOKEN` in `.env`
- [ ] Set other Meta credentials
- [ ] Backend running on port 3000

### **2. Expose Backend (Choose One)**
- [ ] **Local:** ngrok running → https://xyz.ngrok.io
- [ ] **Production:** Deployed → https://yourdomain.com

### **3. Meta App Dashboard**
- [ ] Created Meta App
- [ ] Added Instagram product
- [ ] Went to Webhooks section
- [ ] Entered Callback URL
- [ ] Entered **SAME** verify token from .env
- [ ] Clicked "Verify and Save"
- [ ] ✅ Saw "Success" message
- [ ] Subscribed to events (messages, etc.)

### **4. Test Webhook**
- [ ] Verification succeeded
- [ ] Webhook shows "Active" status
- [ ] Events subscribed

---

## 🚨 Common Issues & Solutions

### **Issue 1: "Verify token doesn't match"**

**Cause:** Token in Meta dashboard ≠ token in `.env`

**Solution:**
```bash
# Check your .env file
cat backend/.env | grep WEBHOOK_VERIFY

# Should output:
META_WEBHOOK_VERIFY_TOKEN=MySecureToken12345

# Enter EXACT SAME token in Meta dashboard
```

### **Issue 2: "Callback URL not reachable"**

**Cause:** 
- Backend not running
- ngrok not running
- Firewall blocking
- Wrong URL

**Solution:**
```bash
# 1. Check backend is running
curl http://localhost:3000/api/health

# 2. Check ngrok is running
curl https://your-ngrok-url.ngrok.io/api/health

# 3. Test webhook endpoint
curl "http://localhost:3000/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=MySecureToken12345&hub.challenge=test123"

# Should return: test123
```

### **Issue 3: "SSL certificate required"**

**Cause:** Meta requires HTTPS

**Solutions:**
- **Local:** Use ngrok (provides HTTPS automatically)
- **Production:** Use hosting with SSL (most providers include it)
- **Custom:** Use Let's Encrypt (free SSL)

### **Issue 4: Token keeps failing**

**Check for:**
- Extra spaces in token
- Wrong capitalization (tokens are case-sensitive)
- Special characters being escaped
- Quotes included in token

**Correct:**
```env
META_WEBHOOK_VERIFY_TOKEN=MyToken123
```

**Wrong:**
```env
META_WEBHOOK_VERIFY_TOKEN="MyToken123"   # Remove quotes
META_WEBHOOK_VERIFY_TOKEN=MyToken123     # Extra space
```

---

## 🧪 Testing Your Setup

### **Test 1: Manual Verification**

```bash
# Simulate Meta's verification request
curl "http://localhost:3000/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=MySecureToken12345&hub.challenge=test123"

# Should return: test123
```

### **Test 2: Wrong Token**

```bash
curl "http://localhost:3000/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=WRONG_TOKEN&hub.challenge=test123"

# Should return: 403 error
```

### **Test 3: Live Webhook**

1. Send a DM to your Instagram business account
2. Check backend logs for incoming webhook
3. Should see: `POST /api/webhooks/instagram`

---

## 📊 Summary

**Question:** Do I need to set `META_WEBHOOK_VERIFY_TOKEN` in Meta app?

**Answer:** **YES!**

**Where:**
- ✅ In your `backend/.env` file
- ✅ In Meta App Dashboard → Webhooks → Verify Token field
- ✅ **MUST BE EXACTLY THE SAME** in both places

**Why:**
- Meta uses this to verify YOU control the webhook URL
- Prevents unauthorized webhook subscriptions
- Security measure

**Next Steps:**
1. Choose a secure token
2. Add to `.env` file
3. Restart backend
4. Enter in Meta dashboard
5. Verify and save
6. ✅ Done!

---

*See `META_APP_SETUP_GUIDE.md` for complete Meta app configuration including app creation, permissions, and testing.*
