# 🔗 LinkedIn to Notion JD2CV Sync

Chrome extension that automatically syncs LinkedIn job postings to your Notion JD2CV database.

## 📋 Features

- **Automatic Sync**: Detects when you save a job on LinkedIn and automatically syncs it to Notion
- **Manual Sync**: Test and manually sync jobs from the extension popup
- **Duplicate Detection**: Prevents duplicate job entries in your database
- **Configurable API**: Works with localhost development and production deployments
- **User Notifications**: Success/error notifications for all sync operations

## 🚀 Installation

### Development Setup

1. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

2. **Load Extension**
   - Click "Load unpacked"
   - Select the `browser-extensions/linkedin-notion-sync` folder

3. **Configure API URL**
   - Click the extension icon in Chrome toolbar
   - Update API Base URL to match your development server
   - Default: `http://localhost:3000`

## 📖 Usage

### Automatic Sync
1. Navigate to any LinkedIn job posting page
2. Click the "Save" button on LinkedIn
3. Extension automatically extracts job data and syncs to Notion
4. Receive notification on success/failure

### Manual Testing
1. Navigate to a LinkedIn job page
2. Click extension icon to open popup
3. Click "Test Current Page" to extract job data
4. Click "Manual Sync Current Job" to sync to Notion

## 🔧 Configuration

### API Settings
- **API Base URL**: Your JD2CV application URL
  - Development: `http://localhost:3000`
  - Production: `https://your-app.vercel.app`

### Required Permissions
- `activeTab`: Access current LinkedIn page
- `storage`: Save extension settings
- `notifications`: Show sync status notifications
- `https://www.linkedin.com/*`: Access LinkedIn job pages
- Your API domain: Make API calls to your JD2CV backend

## 📊 Data Mapping

LinkedIn job data is mapped to your JD2CV Notion database as follows:

| LinkedIn Field | Notion Field | Description |
|---|---|---|
| Job Title | `title` | Position title |
| Company Name | `company` | Company name |
| Job Description | `full_job_description` | Complete job posting text |
| Location | `location` | Job location (if available) |
| Current URL | `linkedin_url` | Link to original LinkedIn posting |
| - | `application_stage` | Set to "Saved" by default |
| - | `synced_from_linkedin` | True for LinkedIn-synced jobs |
| - | `synced_at` | Timestamp of sync operation |

## 🛠️ Development

### File Structure
```
browser-extensions/linkedin-notion-sync/
├── manifest.json                          # Extension configuration
├── scripts/
│   ├── linkedin-data-extractor.js        # Content script for LinkedIn pages
│   └── linkedin-notion-background.js     # Background script for API calls
├── popup/
│   ├── linkedin-sync-popup.html          # Extension popup UI
│   └── linkedin-sync-popup.js            # Popup functionality
├── icons/                                 # Extension icons (16, 32, 48, 128px)
└── README.md                             # This file
```

### CSS Selectors Used
The extension uses these LinkedIn CSS selectors (based on current page structure):

- **Job Title**: `.job-details-jobs-unified-top-card__job-title h1 a`
- **Company Name**: `.job-details-jobs-unified-top-card__company-name a`
- **Job Description**: `.jobs-description__content .jobs-description-content__text--stretch`
- **Save Button**: `.jobs-save-button`
- **Location**: `.job-details-jobs-unified-top-card__primary-description-container .jobs-unified-top-card__bullet`

### API Integration
The extension integrates with your existing JD2CV API endpoints:

- `POST /api/jd2cv/search` - Check for existing jobs
- `POST /api/jd2cv/save-jd` - Save new job data

## 🔍 Troubleshooting

### Common Issues

1. **"No job data found"**
   - Ensure you're on a LinkedIn job posting page (`linkedin.com/jobs/view/...`)
   - LinkedIn may have updated their page structure

2. **"Sync failed"**
   - Check API URL in extension popup
   - Ensure your JD2CV server is running
   - Check browser console for detailed error messages

3. **Extension not detecting saves**
   - Refresh the LinkedIn page
   - Check if extension is enabled in `chrome://extensions/`

### Debug Mode
- Open Chrome DevTools on LinkedIn page
- Check Console tab for extension logs prefixed with 🔗, 💾, ✅, ❌

## 🔄 Updates

When LinkedIn updates their page structure, you may need to update the CSS selectors in `linkedin-data-extractor.js`. Check the browser console for extraction errors.

## 📝 Version History

- **v1.0.0**: Initial release
  - Automatic LinkedIn job saving detection
  - Manual sync functionality
  - Notion API integration
  - User notification system

## 🤝 Contributing

This extension is part of your personal JD2CV system. To modify:

1. Update selectors in `linkedin-data-extractor.js` if LinkedIn changes their layout
2. Modify API endpoints in `linkedin-notion-background.js` if backend changes
3. Enhance UI in popup files for additional features

## 📄 License

This is a personal utility extension for your JD2CV workflow.