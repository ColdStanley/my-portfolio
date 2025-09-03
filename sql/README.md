# AI Card Studio Marketplace - Database Setup

This directory contains SQL scripts to set up the marketplace functionality database in Supabase.

## Files Overview

### 🚀 Quick Setup (Recommended)
- **`install_marketplace.sql`** - Complete installation script with everything you need
  - Creates tables, indexes, functions, and sample data
  - Includes verification and documentation
  - **Use this file for new installations**

### 📋 Individual Components (Advanced)
- **`001_create_marketplace_tables.sql`** - Core table structure and basic setup
- **`002_update_api_endpoints.sql`** - Helper functions and views for API integration  
- **`003_performance_optimizations.sql`** - Advanced indexes and performance features

## Installation Instructions

### Option 1: One-Click Install (Recommended)

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Copy and paste the entire content of `install_marketplace.sql`
4. Click **Run** button
5. ✅ Done! Your marketplace database is ready

### Option 2: Step-by-Step Install

If you prefer to install components separately:

1. Run `001_create_marketplace_tables.sql` first
2. Then run `002_update_api_endpoints.sql`
3. Finally run `003_performance_optimizations.sql`

## What Gets Created

### Tables
- **`marketplace_items`** - Main table storing shared columns
  - UUID primary key, name, description, JSONB data
  - Content hash for duplicate prevention
  - Download tracking, tags, timestamps

### Indexes
- Performance indexes for fast queries
- Full-text search on names and descriptions
- Tag-based filtering optimization
- Composite indexes for common query patterns

### Functions
- **`increment_marketplace_downloads()`** - Safely increment download count
- **`get_marketplace_items()`** - Paginated item retrieval with sorting
- **`validate_marketplace_data()`** - Clean and validate column data
- **`update_marketplace_updated_at()`** - Auto-update timestamps

### Views
- **`marketplace_items_list`** - List view without full data
- **`marketplace_popular_items`** - Top downloaded items
- **`marketplace_trending_items`** - Trending based on downloads/time

### Security
- Row Level Security (RLS) policies
- Users can only manage their own items
- Public read access to all marketplace items

## Sample Data

The installation includes 3 sample columns for testing:
- Content Writing Assistant (writing, marketing)
- Data Analysis Workflow (analysis, data)
- Customer Support Bot (support, automation)

## Verification

After installation, verify everything works:

```sql
-- Check table exists and has data
SELECT COUNT(*) FROM marketplace_items;

-- Test pagination function
SELECT * FROM get_marketplace_items(1, 5, 'downloads', 'desc');

-- Test increment function (replace with actual item ID)
SELECT increment_marketplace_downloads('your-item-id-here');
```

## Updating Your API

After database setup, update your application to use the real database instead of demo endpoints:

1. In `InfoCard.tsx`, change:
   ```typescript
   // From:
   const response = await fetch('/api/marketplace/demo', {
   
   // To:
   const response = await fetch('/api/marketplace', {
   ```

2. In `PreviewModal.tsx`, change:
   ```typescript
   // From:
   const response = await fetch(`/api/marketplace/demo/${itemId}`)
   
   // To:
   const response = await fetch(`/api/marketplace/${itemId}`)
   ```

3. In `page.tsx`, change:
   ```typescript
   // From:
   const response = await fetch(`/api/marketplace/demo?${params}`)
   
   // To:
   const response = await fetch(`/api/marketplace?${params}`)
   ```

## Performance Notes

- The database is optimized for read-heavy workloads (typical for marketplaces)
- Indexes support fast sorting by downloads, date, and name
- Full-text search is available on item names and descriptions
- Tag filtering uses GIN indexes for fast array operations

## Monitoring & Maintenance

For production use, consider:

1. **Regular Statistics Updates**: The functions include table analysis for query optimization
2. **Materialized View Refresh**: Tag statistics and trending items views should be refreshed periodically
3. **Index Monitoring**: Monitor query performance and adjust indexes as needed

## Troubleshooting

### Common Issues

1. **Permission Errors**: Make sure you're running as a Supabase admin user
2. **Extension Missing**: The script automatically installs required extensions (uuid-ossp, pg_trgm)
3. **Function Conflicts**: If you have naming conflicts, check existing function names

### Getting Help

- Check the Supabase logs in your dashboard
- Use the verification queries at the end of `install_marketplace.sql`
- All functions include error handling and helpful messages

## Production Considerations

- **User Authentication**: The RLS policies assume Supabase Auth is used
- **Backup Strategy**: Set up regular backups of your marketplace data
- **Monitoring**: Monitor query performance as your marketplace grows
- **Rate Limiting**: Consider API rate limiting for upload endpoints

---

**Ready to launch your AI Card Studio Marketplace! 🚀**