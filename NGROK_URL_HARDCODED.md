# ✅ ngrok URL Hardcoded in CORS

## 🎯 What Changed

Updated `backend/src/index.ts` CORS configuration to hardcode your ngrok URL:

```typescript
// CORS configuration
app.use(
    cors({
        origin: config.env === 'development'
            ? [
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:3000',
                'https://726ff6e60194.ngrok-free.app'  // ✅ Your ngrok URL
            ]
            : config.frontend.url,
        credentials: true,
    })
);
```

---

## ✅ Allowed Origins (Development)

- ✅ `http://localhost:5173`
- ✅ `http://localhost:5174`
- ✅ `http://localhost:3000`
- ✅ `https://726ff6e60194.ngrok-free.app` ← Your ngrok tunnel

---

## 🚀 Next Step: Restart Backend

```bash
cd backend
# Press Ctrl+C to stop
npm run dev
```

---

## 🧪 Then Test

1. Go to http://localhost:5174/settings
2. Click "Connect Instagram Account"
3. Should work! ✅

---

## ⚠️ Important Note

**When ngrok URL changes:**
If you restart ngrok and get a new URL like `https://abc123.ngrok-free.app`, you'll need to:

1. Update this line in `backend/src/index.ts`
2. Update `VITE_API_URL` in `frontend/.env`
3. Restart both servers

**To avoid this:** Use ngrok with a custom domain (paid feature) or use a service like localtunnel that gives consistent URLs.

---

## ✅ Summary

- ✅ ngrok URL hardcoded in CORS
- ✅ All localhost ports allowed
- ⚠️ Restart backend required
- 🎉 Instagram connection should work!
