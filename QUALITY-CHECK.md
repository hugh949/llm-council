# 🔍 Quality Check & Common Error Fixes

## Common Errors When Clicking "New Conversation"

### Error 1: "Failed to create conversation: 500"
**Cause:** Database initialization issue or storage error

**Fix:**
1. Check backend logs (Azure App Service → Log stream)
2. Verify database is initialized
3. Check if storage module is working

---

### Error 2: "Cannot connect to backend"
**Cause:** Backend URL is wrong or backend is down

**Fix:**
1. Check `VITE_API_BASE_URL` in Azure Static Web Apps
2. Verify backend is running (test the URL in browser)
3. Check CORS settings

---

### Error 3: "Failed to create conversation: 404"
**Cause:** Backend endpoint not found

**Fix:**
1. Verify backend is deployed correctly
2. Check backend URL is correct
3. Test backend health endpoint: `https://your-backend.com/`

---

### Error 4: Database/SQLite errors
**Cause:** Database file permissions or path issues

**Fix:**
1. Check backend logs for database errors
2. Verify database directory is writable
3. For Azure/Render: May need to use PostgreSQL instead of SQLite

---

## 🧪 Testing Checklist

### Frontend Tests:
- [ ] App loads without errors
- [ ] "New Conversation" button works
- [ ] Can create multiple conversations
- [ ] Conversations appear in sidebar
- [ ] Can select conversations
- [ ] Can delete conversations

### Backend Tests:
- [ ] Health check works: `GET /`
- [ ] Create conversation: `POST /api/conversations`
- [ ] List conversations: `GET /api/conversations`
- [ ] Get conversation: `GET /api/conversations/{id}`

### Integration Tests:
- [ ] Create conversation from frontend
- [ ] Step 1 (Prompt Engineering) works
- [ ] Step 2 (Context Engineering) works
- [ ] Step 3 (Council Deliberation) works
- [ ] All steps save correctly

---

## 🔧 Debugging Steps

### 1. Check Browser Console
1. Open app in browser
2. Press F12 → Console tab
3. Click "New Conversation"
4. Look for error messages
5. Check the exact error text

### 2. Check Network Tab
1. F12 → Network tab
2. Click "New Conversation"
3. Find the request to `/api/conversations`
4. Check:
   - Request URL (is it correct?)
   - Status code (200, 404, 500?)
   - Response body (what does it say?)

### 3. Check Backend Logs
1. Go to Azure Portal → Your Web App → Log stream
2. Open "Logs" or "Log stream"
3. Look for errors when creating conversation
4. Check for database errors

### 4. Test Backend Directly
Open in browser or use curl:

```bash
# Health check
curl https://your-backend.com/

# Create conversation
curl -X POST https://your-backend.com/api/conversations \
  -H "Content-Type: application/json" \
  -d "{}"
```

---

## 📋 Common Issues & Solutions

### Issue: Database not initialized
**Solution:**
- Backend should auto-initialize on startup
- Check logs for initialization errors
- May need to manually initialize

### Issue: SQLite not working on cloud
**Solution:**
- Use PostgreSQL instead
- Add PostgreSQL service in Azure/Render
- Set `DATABASE_URL` environment variable

### Issue: CORS errors
**Solution:**
- Backend CORS is set to allow all (`*`)
- If still issues, check backend logs
- Verify backend URL in frontend

### Issue: Environment variables missing
**Solution:**
- Check `OPENROUTER_API_KEY` is set
- Verify all required env vars are present
- Restart service after adding vars

---

## ✅ Quality Checklist

Before deploying to production:

- [ ] All error messages are clear and helpful
- [ ] Database initializes correctly
- [ ] All API endpoints work
- [ ] Frontend handles errors gracefully
- [ ] Logs show useful information
- [ ] No console errors in browser
- [ ] All three steps work end-to-end
- [ ] Conversations persist correctly
- [ ] Can create multiple conversations
- [ ] Can delete conversations

---

## 🚨 If You're Still Getting Errors

**Please provide:**
1. **Complete error message** (copy the full text)
2. **Where it happens** (which button/action)
3. **Browser console errors** (F12 → Console)
4. **Network request details** (F12 → Network → find the failed request)
5. **Backend logs** (from Azure App Service → Log stream)

This will help identify the exact issue!

