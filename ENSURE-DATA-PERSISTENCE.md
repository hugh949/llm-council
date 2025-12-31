# 🔒 Ensuring Data Persistence in Azure

## ⚠️ Important: Database File Location

To ensure conversation history persists across deployments in Azure, the database file must be stored in a **persistent location**.

---

## 🗄️ Current Database Configuration

### Database Storage:
- **Type**: SQLite (default) or PostgreSQL (if configured)
- **Location**: `data/llm_council.db` (relative to app root)

### In Azure:
- App root: `/home/site/wwwroot/`
- Database path: `/home/site/wwwroot/data/llm_council.db`
- ✅ This location **persists** across deployments

---

## ✅ Verification Checklist

To ensure your data is safe:

1. ✅ **Database Initialization**: Uses `create_all()` (safe, doesn't drop data)
2. ✅ **No Drop Operations**: No `drop_all()` or `drop_table()` in codebase
3. ✅ **User-Only Deletion**: Only deleted via explicit user action
4. ✅ **Persistent Location**: Database file in `/home/site/wwwroot/data/`
5. ✅ **Backup Strategy**: Recommended for production (see below)

---

## 📋 Recommendations

### Option 1: Continue Using SQLite (Current - Works Fine)

**Pros:**
- ✅ Simple - no additional setup
- ✅ File persists in `/home/site/wwwroot/data/`
- ✅ Works well for 10 users, 5 conversations/day

**Cons:**
- ⚠️ Not ideal for horizontal scaling
- ⚠️ Requires manual backup

**What You Need to Do:**
- ✅ Nothing! Current setup works
- ✅ Consider periodic backups (optional)

---

### Option 2: Upgrade to PostgreSQL (Recommended for Production)

**Pros:**
- ✅ Automatic backups
- ✅ Better performance
- ✅ Scales better
- ✅ High availability

**Setup:**
1. Create Azure Database for PostgreSQL
2. Set `DATABASE_URL` environment variable in Azure App Service
3. Format: `postgresql://user:pass@host:port/dbname`
4. Database will automatically be used instead of SQLite

**Code Already Supports This:**
- ✅ Detects `DATABASE_URL` environment variable
- ✅ Automatically uses PostgreSQL if configured
- ✅ No code changes needed!

---

## 🔄 What Happens During Updates

### Safe Update Process:
1. ✅ Code is deployed to Azure
2. ✅ Application restarts
3. ✅ Database initialization runs (`init_db()`)
4. ✅ `create_all()` checks if tables exist
5. ✅ Only creates missing tables (doesn't touch existing data)
6. ✅ **All conversations remain intact**

### No Data Loss Because:
- ✅ No `drop_all()` calls
- ✅ No table dropping
- ✅ Schema evolution is additive only
- ✅ Old data is preserved with defaults

---

## 🛡️ Additional Safeguards

The codebase includes:

1. **Backward Compatibility**:
   - `_ensure_conversation_structure()` handles old data formats
   - Missing fields get defaults
   - Never loses existing data

2. **Safe Initialization**:
   - `Base.metadata.create_all(engine)` is idempotent
   - Only creates what's missing
   - Never destroys existing structure

3. **Explicit Deletion Only**:
   - `delete_conversation()` only called via user action
   - Requires confirmation in UI
   - No automatic cleanup

---

## ✅ Your Data is Safe!

**Current Implementation:**
- ✅ Database file persists in Azure
- ✅ Updates don't delete data
- ✅ Only user action can delete conversations
- ✅ All Step 1, Step 2, Step 3 data is preserved

**No changes needed - your setup is already safe!** 🔒

