# LinkedIn JD2CV Supabase Sync Extension v2.0

A Chrome browser extension that automatically syncs LinkedIn job postings to your JD2CV Supabase database.

## Features

- 🔄 **Automatic Sync**: Automatically detects when you click "Save" on LinkedIn job posts
- 📊 **Supabase Integration**: Direct integration with your JD2CV Supabase database
- 🎯 **Smart Duplicate Detection**: Prevents duplicate job entries
- ⚙️ **Configurable**: Easy setup with your own API endpoint and user credentials
- 🔔 **Visual Feedback**: Chrome notifications for sync status
- 🧪 **Manual Testing**: Test data extraction on any LinkedIn job page

## Installation

1. Download or clone this extension folder
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your Chrome toolbar

## Configuration

1. Click the extension icon in your Chrome toolbar
2. In the popup, configure:
   - **API Base URL**: Your Next.js application URL (e.g., `http://localhost:3000` or `https://your-app.vercel.app`)
   - **User ID**: Your Supabase user ID (UUID format)
3. Click "Save Settings"

## Usage

### Automatic Sync (Recommended)
1. Navigate to any LinkedIn job posting page
2. Click the "Save" button on LinkedIn (⭐ or bookmark icon)
3. The extension automatically extracts job data and syncs to your Supabase database
4. You'll receive a Chrome notification confirming the sync status

### Manual Sync
1. Navigate to any LinkedIn job posting page
2. Click the extension icon to open the popup
3. Click "Extract Job Data" to test extraction
4. Click "Manual Sync Job" to sync the extracted data

## Database Schema

The extension syncs data to the `jd_records` table with these fields:

- `user_id`: Your Supabase user ID
- `title`: Job title
- `company`: Company name
- `full_job_description`: Complete job description (formatted)
- `application_stage`: Set to "Saved" by default
- `match_score`: Default score of 100 (10/10 scale stored as 10-100)
- Additional fields: `jd_key_sentences`, `keywords_from_sentences`, `role_group`, `firm_type`, etc.

## API Endpoints

The extension communicates with these API routes:

- `POST /api/jd2cv/supabase` - Create new job record
- `GET /api/jd2cv/supabase` - Search for existing job records

## Development

### Architecture
- **Content Script**: Extracts job data from LinkedIn pages
- **Background Script**: Handles API communication with Supabase
- **Popup**: User interface for configuration and manual testing

### Key Components
- `linkedin-data-extractor.js`: Monitors LinkedIn page interactions
- `linkedin-supabase-background.js`: API calls and notification management  
- `linkedin-sync-popup.html/js`: Configuration interface

## Troubleshooting

### Common Issues

1. **"Extension context invalidated" error**
   - Reload the extension in `chrome://extensions/`
   - Refresh the LinkedIn page

2. **"User ID is required" error**
   - Ensure your User ID is configured in the popup settings
   - Verify the User ID is in valid UUID format

3. **"API request failed" error**
   - Check that your API Base URL is correct and accessible
   - Verify your Next.js application is running
   - Check browser console for detailed error messages

4. **No data extracted**
   - Ensure you're on a LinkedIn job posting page (`linkedin.com/jobs/view/...`)
   - Some job posts may have different HTML structure - check browser console

### Debug Mode

Open Chrome DevTools and check:
- **Console tab**: Extension logging and errors
- **Network tab**: API requests to your backend
- **Application tab > Storage**: Extension settings

## Version History

- **v2.0.0**: Complete rewrite based on JD2CV 1.0 architecture with Supabase integration
- **v1.x.x**: Previous Notion-based implementation

## Support

For issues and questions:
1. Check browser console for detailed error messages  
2. Verify your API endpoint is running and accessible
3. Test the API endpoints directly using tools like Postman
4. Check Supabase database permissions and table structure