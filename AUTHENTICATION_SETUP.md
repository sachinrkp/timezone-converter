# 🔐 Authentication & User Management Setup Guide

This guide will help you set up the complete authentication system, user management, calendar, and notes features for the Utility Tools application.

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** (v7 or higher)
3. **API Keys** for external services (optional)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=./data/utility_tools.db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-make-it-very-long-and-random

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-in-production-make-it-very-long-and-random

# API Keys
FIXER_API_KEY=your-fixer-api-key-here
TIMEZONEDB_API_KEY=your-timezonedb-api-key-here

# Holiday API Keys (Optional)
HOLIDAY_API_KEY=your-holiday-api-key-here
CALENDARIFIC_API_KEY=your-calendarific-api-key-here

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
MICROSOFT_CLIENT_ID=your-microsoft-client-id-here
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret-here

# Google Calendar API (Optional)
GOOGLE_CALENDAR_API_KEY=your-google-calendar-api-key-here
```

### 3. Build and Start

```bash
npm run build
npm run dev
```

## 🔧 Features Overview

### 🔐 Authentication System

#### **Local Authentication**
- Email/password registration and login
- Password strength validation
- Secure password hashing with bcrypt
- JWT token-based sessions

#### **Social Authentication**
- Google OAuth 2.0 integration
- Microsoft OAuth 2.0 integration
- Automatic account linking
- Profile picture support

#### **Security Features**
- Password strength requirements
- JWT token expiration
- Session management
- Account deletion with password confirmation

### 📅 Calendar System

#### **Event Management**
- Create, read, update, delete events
- All-day and timed events
- Event categories (personal, meeting, holiday)
- Location support
- Timezone awareness

#### **Holiday Integration**
- Country-specific holiday fetching
- Holiday API integration (HolidayAPI, Calendarific)
- Automatic holiday syncing to calendar
- Upcoming holiday notifications

#### **Google Calendar Sync** (Future)
- Import events from Google Calendar
- Export events to Google Calendar
- Two-way synchronization

### 📝 Notes System

#### **Secure Notes**
- Password-protected individual notes
- Category organization
- Full-text search
- Encrypted content support

#### **Note Management**
- Create, read, update, delete notes
- Category filtering
- Search functionality
- Export capabilities (JSON, TXT, CSV)

## 🗄️ Database Schema

The application uses SQLite with the following main tables:

- **users**: User accounts and profiles
- **user_sessions**: Active user sessions
- **calendar_events**: Calendar events and holidays
- **notes**: User notes with optional encryption
- **user_preferences**: User settings and preferences
- **holidays**: Cached holiday data

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /social-login` - Social authentication
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /logout` - User logout
- `DELETE /account` - Delete account
- `GET /verify` - Verify token

### Calendar (`/api/calendar`)
- `GET /events` - Get user events
- `POST /events` - Create event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `GET /holidays/:country` - Get country holidays
- `POST /holidays/:country/sync` - Sync holidays to calendar
- `GET /stats` - Calendar statistics

### Notes (`/api/notes`)
- `GET /` - Get user notes
- `GET /:id` - Get specific note
- `POST /` - Create note
- `PUT /:id` - Update note
- `DELETE /:id` - Delete note
- `GET /categories/list` - Get note categories
- `GET /search/:query` - Search notes
- `GET /export/:format` - Export notes

### Holidays (`/api/holidays`)
- `GET /:country` - Get country holidays
- `GET /:country/upcoming` - Get upcoming holidays
- `GET /supported-countries` - Get supported countries

## 🔑 API Key Setup

### Fixer.io (Currency Exchange)
1. Visit [fixer.io](https://fixer.io)
2. Sign up for a free account
3. Get your API key
4. Add to `.env`: `FIXER_API_KEY=your_key_here`

### Holiday APIs (Optional)

#### HolidayAPI
1. Visit [holidayapi.com](https://holidayapi.com)
2. Sign up for free tier
3. Add to `.env`: `HOLIDAY_API_KEY=your_key_here`

#### Calendarific
1. Visit [calendarific.com](https://calendarific.com)
2. Sign up for free tier
3. Add to `.env`: `CALENDARIFIC_API_KEY=your_key_here`

### OAuth Setup (Optional)

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add to `.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

#### Microsoft OAuth
1. Go to [Azure Portal](https://portal.azure.com)
2. Register a new application
3. Add redirect URIs
4. Add to `.env`:
   ```
   MICROSOFT_CLIENT_ID=your_client_id
   MICROSOFT_CLIENT_SECRET=your_client_secret
   ```

## 🧪 Testing the System

### 1. Test User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User",
    "country": "US",
    "timezone": "America/New_York"
  }'
```

### 2. Test User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Test Calendar Event Creation
```bash
curl -X POST http://localhost:3000/api/calendar/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Event",
    "description": "This is a test event",
    "start": "2024-01-15T10:00:00Z",
    "end": "2024-01-15T11:00:00Z",
    "timezone": "UTC",
    "allDay": false,
    "type": "personal"
  }'
```

### 4. Test Note Creation
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Note",
    "content": "This is a test note",
    "category": "general",
    "password": "notePassword123"
  }'
```

## 🔒 Security Considerations

### Production Deployment
1. **Change all default secrets** in `.env`
2. **Use HTTPS** in production
3. **Set secure cookie flags**
4. **Implement rate limiting**
5. **Add input validation**
6. **Use environment-specific configurations**

### Password Security
- Minimum 8 characters
- Must contain uppercase, lowercase, number, and special character
- Bcrypt hashing with 12 salt rounds
- Password confirmation for sensitive operations

### Token Security
- JWT tokens with 7-day expiration
- Secure HTTP-only cookies
- Token verification on protected routes
- Automatic cleanup of expired sessions

## 🚀 Deployment

### Vercel Deployment
1. Update `vercel.json` with new environment variables
2. Set environment variables in Vercel dashboard
3. Deploy with `vercel --prod`

### Database Migration
The SQLite database will be automatically created on first run. For production:
1. Consider using PostgreSQL or MySQL
2. Set up database backups
3. Implement connection pooling

## 📱 Frontend Integration

The authentication system is designed to work with the existing frontend. Key integration points:

1. **Login/Register Forms**: Add to the main interface
2. **User Profile**: Display user information and settings
3. **Calendar View**: Show user's events and holidays
4. **Notes Interface**: Secure note-taking with password protection
5. **Social Login Buttons**: Google/Microsoft OAuth integration

## 🐛 Troubleshooting

### Common Issues

1. **Database not created**: Ensure write permissions in project directory
2. **JWT errors**: Check JWT_SECRET is set and consistent
3. **OAuth failures**: Verify client IDs and redirect URIs
4. **API key errors**: Check API key validity and quotas

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## 📞 Support

For issues or questions:
- Check the console logs for detailed error messages
- Verify all environment variables are set correctly
- Test API endpoints individually using curl or Postman
- Review the database schema and data integrity

---

**🎉 Congratulations!** You now have a complete authentication and user management system with calendar and notes functionality!
