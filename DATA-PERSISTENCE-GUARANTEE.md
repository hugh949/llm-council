# 🔒 Data Persistence Guarantee

## ✅ Conversation History is Preserved

Your conversation history is **safe and preserved** during application updates. The system is designed to maintain all past conversations unless explicitly deleted by the user.

---

## 🗄️ Database Storage

### Current Implementation:
- **Database Type**: SQLite
- **Storage Location**: 
  - Local: `data/llm_council.db`
  - Azure: Persistent storage in the app's data directory
- **Schema Updates**: Safe - only adds missing tables/columns, never deletes data

### What's Stored:
Each conversation contains:
- ✅ **Step 1 (Prompt Engineering)**: All messages and finalized prompt
- ✅ **Step 2 (Context Engineering)**: All messages, documents, files, links, and finalized context
- ✅ **Step 3 (Council Deliberation)**: All messages, Stage 1 results, Stage 2 rankings, and final synthesis
- ✅ **Metadata**: Conversation ID, title, creation date

---

## 🔄 Application Updates

### During Updates:
1. ✅ **Database is NOT dropped or cleared**
2. ✅ **Existing conversations are preserved**
3. ✅ **Only missing tables/columns are created**
4. ✅ **No data migration that deletes records**

### Database Initialization:
The `init_db()` function uses:
```python
Base.metadata.create_all(engine)
```
This is **safe** - it only creates tables if they don't exist. It **never drops** existing tables or data.

---

## 🗑️ Deletion Policy

### Conversations are ONLY deleted when:
- ✅ User explicitly clicks the delete button (×) in the sidebar
- ✅ User confirms the deletion prompt
- ✅ API endpoint `DELETE /api/conversations/{id}` is called with user action

### Conversations are NEVER deleted:
- ❌ On application restart
- ❌ On code deployment/update
- ❌ On database initialization
- ❌ Automatically after a time period
- ❌ Due to schema changes

---

## 🔒 Azure Deployment Safety

### Database Persistence in Azure:

**SQLite (Default)**:
- Database file is stored in `/home/site/wwwroot/data/llm_council.db`
- This location persists across deployments
- File is NOT in `.gitignore`, so it's preserved

**PostgreSQL (Optional - only if you configure it later)**:
- Would use Azure Database for PostgreSQL
- SQLite is the default and works well for now

### What Happens on Deployment:
1. ✅ Code is updated
2. ✅ Application restarts
3. ✅ Database is initialized (if needed - creates missing tables only)
4. ✅ **Existing conversations remain intact**
5. ✅ Users can access all their previous conversations

---

## 📋 Backup Recommendations

While the system preserves data, we recommend:

### For Production:
1. **SQLite** (current setup - works well):
   - Consider periodic backups of `/home/site/wwwroot/data/llm_council.db`
   - Optional: Use Azure Storage for backups

### Manual Backup (SQLite):
```bash
# SSH into Azure App Service
# Copy database file
cp /home/site/wwwroot/data/llm_council.db /home/site/wwwroot/backup_$(date +%Y%m%d).db
```

---

## ✅ Verification

To verify your data is safe:

1. **Check Database Location**:
   - SQLite: `/home/site/wwwroot/data/llm_council.db`
   - PostgreSQL: Only if you add it later (SQLite is default)

2. **Test After Update**:
   - Update the application
   - Verify old conversations are still accessible
   - Check that Step 1, Step 2, and Step 3 data is intact

3. **Monitor Logs**:
   - Check Azure Log Stream for database initialization messages
   - Should see: "✅ Database initialized successfully"
   - Should NOT see: "dropping tables" or "clearing data"

---

## 🛡️ Data Integrity Guarantees

### Code Guarantees:
- ✅ No `drop_all()` or `drop_table()` calls in codebase
- ✅ `create_all()` only creates missing tables
- ✅ Delete operations require explicit user action
- ✅ All storage operations preserve existing data

### Schema Evolution:
- ✅ New fields are added with defaults
- ✅ Old data is migrated gracefully (see `_ensure_conversation_structure`)
- ✅ Backward compatibility maintained

---

## 📞 Support

If you notice any data loss:
1. Check Azure Log Stream for errors
2. Verify database file exists: `/home/site/wwwroot/data/llm_council.db`
3. Check if PostgreSQL connection is working (if configured)
4. Review recent deployments for any schema changes

---

## ✅ Summary

**Your conversation history is safe!**

- ✅ Preserved during updates
- ✅ Preserved during restarts
- ✅ Only deleted by explicit user action
- ✅ All Step 1, Step 2, Step 3 data is maintained
- ✅ Database schema updates are safe and non-destructive

**No automatic deletion. User data is respected and preserved.** 🔒

