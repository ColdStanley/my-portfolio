# AI Card Studio Developer Panel - God Mode

## 🔥 Overview

The Developer Panel is a powerful "God Mode" interface that provides unlimited administrative control over the AI Card Studio system. This panel bypasses all normal security restrictions and provides complete access to user data, system management, and dangerous operations.

## 🔐 Security Configuration

### Required Environment Variables

Add these variables to your `.env.local` file:

```bash
# Admin User IDs (comma-separated list of user IDs with admin privileges)
DEVELOPER_ADMIN_IDS=your-user-id-1,your-user-id-2

# Master key for API authentication (generate a strong random key)
DEVELOPER_MASTER_KEY=your-super-secret-master-key-here

# Optional: Client-side admin check (comma-separated list)
NEXT_PUBLIC_DEVELOPER_ADMIN_IDS=your-user-id-1,your-user-id-2
```

### Getting Your User ID

1. Log into the AI Card Studio with your admin account
2. Open browser developer tools (F12)
3. Go to Application/Storage → Local Storage
4. Look for workspace data or user information
5. Your user ID will be in the format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Master Key Generation

Generate a strong master key:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using Python
python -c "import secrets; print(secrets.token_hex(32))"
```

## 🚀 Accessing the Developer Panel

### Method 1: Keyboard Shortcut (Primary)
1. Log in to AI Card Studio with an admin account
2. Press `Ctrl + Shift + D`
3. Enter your master key when prompted
4. Full God Mode access granted

### Security Layers
1. **User Authentication**: Must be logged into Supabase
2. **Admin ID Check**: User ID must be in DEVELOPER_ADMIN_IDS list
3. **Master Key**: Must provide correct DEVELOPER_MASTER_KEY
4. **Frontend Validation**: Client-side admin check
5. **Backend Validation**: Server-side double verification

## 🛡️ Security Features

### Multi-Layer Authentication
- **Layer 1**: Supabase user authentication
- **Layer 2**: Admin ID whitelist verification
- **Layer 3**: Master key validation
- **Layer 4**: Request-level authorization headers
- **Layer 5**: Comprehensive audit logging

### Audit Trail
All admin actions are logged with:
- User email and ID
- Timestamp
- Action performed
- Affected resources
- Request details

### Auto-Security Measures
- Session timeout after inactivity
- Master key stored in localStorage (encrypted)
- Failed access attempts logged
- Production environment warnings
- Dangerous action confirmations

## 🔧 API Endpoints

### Admin User Management
- `GET /api/admin/users` - List all users with statistics
- Provides complete user data, activity status, and content counts

### Admin Workspace Control
- `GET /api/admin/workspaces` - View all workspaces and cards
- `GET /api/admin/workspaces?userId=xxx` - Filter by specific user
- Includes password-protected card detection

### Admin Marketplace Control
- `GET /api/admin/marketplace` - Complete marketplace data with analytics
- `DELETE /api/admin/marketplace/{id}` - Force delete any item
- `POST /api/admin/marketplace/{id}/edit` - Edit any item metadata
- `POST /api/admin/marketplace` - Bulk operations (delete, feature, etc.)

### Security Headers Required
All admin API requests must include:
```javascript
headers: {
  'x-admin-master-key': 'your-master-key-here',
  'Content-Type': 'application/json'
}
```

## 🎮 Panel Features

### 🗄️ Data Master Module
- **User Management**: View all users, activity status, content counts
- **Workspace Control**: Access any user's workspace data
- **Raw Data Inspector**: View complete JSON data for any object
- **Cross-User Operations**: Manage content across all users

### 🐛 Debug Monitor Module
- **System Health**: Real-time performance metrics
- **Live Logs**: System event streaming
- **API Testing**: Direct endpoint testing interface
- **Database Inspector**: Table browsing and queries

### 🎮 Quick Actions Module
- **⚠️ DANGER ZONE**: Nuclear options (delete all data)
- **Data Export**: Complete system backup
- **Bulk Operations**: Mass content management
- **Test Data Generation**: Development utilities

### 📊 System Stats Module
- **User Analytics**: Registration, activity, top contributors
- **Marketplace Metrics**: Downloads, popular items, author stats
- **Content Analysis**: Card types, protected content distribution
- **Performance Insights**: System utilization and trends

## ⚠️ Dangerous Operations

### Nuclear Options (Irreversible)
- **Delete All Marketplace**: Permanently removes all shared content
- **Reset Download Counts**: Sets all marketplace downloads to 0
- **Data Purging**: Can remove user data (not yet implemented)

### Bulk Operations
- **Mass Delete**: Remove multiple items simultaneously
- **Feature Management**: Promote/demote marketplace items
- **User Content Transfer**: Move content between users

### Administrative Overrides
- **Password Bypass**: Remove password protection from any card
- **Ownership Transfer**: Change item ownership
- **Content Modification**: Edit any user's content

## 🚧 Implementation Notes

### Frontend Security
```typescript
// Admin check happens on both client and server
const { isAdmin, makeAdminRequest } = useAdminAuth()

// Keyboard shortcut only works for admin users
if (event.ctrlKey && event.shiftKey && event.key === 'D' && isAdmin) {
  // Open developer panel
}
```

### Backend Security
```typescript
// Every admin API route is protected
export const GET = withAdminAuth(async (request, { supabase, user }) => {
  // Full admin access with user context
  console.log(`Admin operation by: ${user.email}`)
  // ... perform privileged operations
})
```

### Error Handling
- All admin operations have comprehensive error logging
- Failed authentication attempts are tracked
- System maintains operation audit trail
- Graceful degradation for network issues

## 🔍 Monitoring & Logging

### What Gets Logged
- All admin panel access attempts
- Every privileged API call
- Bulk operation details
- Data modification events
- Authentication failures

### Log Format
```
[TIMESTAMP] LEVEL: MESSAGE
[2025-01-01 12:00:00] INFO: Admin access granted to: admin@example.com (user-id-123) for GET /api/admin/users
[2025-01-01 12:01:00] WARN: Invalid master key provided by user: user-id-456
[2025-01-01 12:02:00] ERROR: Admin operation failed: Failed to delete marketplace item
```

## 🛠️ Development Usage

### Local Development
1. Set environment variables in `.env.local`
2. Add your development user ID to admin list
3. Generate and set master key
4. Restart development server
5. Log in and use `Ctrl+Shift+D`

### Production Deployment
1. **CRITICAL**: Only add production admin user IDs
2. Use a strong, unique master key
3. Monitor access logs regularly
4. Restrict admin access to minimal necessary users
5. Regular security audits

### Testing Admin Features
```bash
# Test admin API access
curl -H "x-admin-master-key: your-key" \
     -H "Authorization: Bearer your-jwt" \
     http://localhost:3000/api/admin/users
```

## 🚨 Security Best Practices

### Admin Account Security
- Use strong, unique passwords
- Enable 2FA on admin accounts
- Regular password rotation
- Monitor for unauthorized access

### Master Key Management
- Generate cryptographically secure keys
- Never commit keys to version control
- Rotate keys regularly
- Store securely (password manager)

### Access Control
- Minimum necessary admin users
- Regular access reviews
- Remove unused admin accounts
- Monitor admin activity patterns

### Production Monitoring
- Set up alerts for admin access
- Regular log reviews
- Monitor for unusual patterns
- Incident response procedures

## 🐛 Troubleshooting

### Panel Won't Open
1. Check if user ID is in DEVELOPER_ADMIN_IDS
2. Verify DEVELOPER_MASTER_KEY is set
3. Check browser console for errors
4. Ensure user is authenticated

### API Access Denied
1. Verify master key in request headers
2. Check user authentication status
3. Confirm admin permissions
4. Review server logs for details

### Performance Issues
1. Check system resource usage
2. Review database connection status
3. Monitor API response times
4. Check for bulk operation impacts

## 📝 Changelog

### v1.0.0 (Initial Release)
- Complete admin panel implementation
- Multi-layer security system
- Comprehensive data management
- Dangerous operation safeguards
- Full audit logging system

---

**⚠️ WARNING**: This panel provides unrestricted access to all system data and operations. Use with extreme caution and only grant access to fully trusted administrators.

**🔒 SECURITY NOTICE**: Never share master keys or admin credentials. All admin activities are logged and monitored.