# Database Setup for LLM Council

The application uses SQLite by default (works well for current scale: ~10 users, ~5 conversations/day).

## Local Development (SQLite)

SQLite is used automatically - no setup needed! The database file will be created at `data/llm_council.db`.

## Production Deployment

### Option 1: SQLite (Current - Good for small scale)

SQLite works great for your use case (10 users, 5 conversations/day). The database file will be stored in the `data/` directory.

**For Azure deployment:**
- SQLite files persist in the filesystem
- No additional setup needed
- Just ensure the `data/` directory is writable

### Option 2: PostgreSQL (Optional - for much larger scale)

SQLite is fine for now. If you ever need to scale significantly later, you could switch to PostgreSQL:

1. **Get PostgreSQL URL** from Azure Database for PostgreSQL
2. **Set environment variable:**
   ```bash
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   ```
3. **Install PostgreSQL driver** (add to `pyproject.toml`):
   ```toml
   "psycopg2-binary>=2.9.0",
   ```
4. The application will automatically use PostgreSQL when `DATABASE_URL` is set!

## Migration from JSON to Database

If you have existing JSON conversations, run the migration script:

```bash
cd /Users/hughrashid/Cursor/LLM-Council
uv run python -m backend.migrate_json_to_db
```

This will:
- Read all JSON files from `data/conversations/`
- Import them into the database
- Skip conversations already in the database

## Database Schema

The database uses a single `conversations` table with:
- `id` (String, Primary Key)
- `created_at` (DateTime)
- `title` (String)
- `prompt_engineering` (JSON)
- `context_engineering` (JSON)
- `council_deliberation` (JSON)
- `messages` (JSON, for backward compatibility)

All complex nested data is stored as JSON, making it easy to work with and migrate.

## Benefits

✅ **Persistent storage** - Data survives server restarts  
✅ **Easy deployment** - Works with Azure App Service  
✅ **Simple** - SQLite works well for current needs  
✅ **Simple** - SQLite requires no setup for small scale  
✅ **Fast** - SQLite is very fast for small datasets  

## Troubleshooting

**Database locked errors:**
- SQLite handles concurrent reads well for typical usage

**Migration issues:**
- Make sure the `data/conversations/` directory exists
- Check file permissions

**Production deployment:**
- Ensure the `data/` directory is writable
- If using PostgreSQL (optional), verify `DATABASE_URL` is set correctly

