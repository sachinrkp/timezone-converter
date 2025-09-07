# 🛠️ Utility Tools - Complete Productivity Suite

A comprehensive utility web application featuring timezone conversion, currency exchange, date calculations, **user authentication**, **encrypted notes management**, **calendar integration**, and more. Built with TypeScript, Node.js, Tailwind CSS, and Firebase for modern web development.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge)](https://utility-tools.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/sachinrkp/utility-tools)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

## 🚀 Quick Start

### For Users
- **🌐 [Try Live Demo](https://utility-tools.vercel.app/)** - No installation required
- **📱 Mobile Friendly** - Works on all devices
- **⚡ Fast & Lightweight** - Optimized for performance

### For Developers
```bash
# Clone the repository
git clone https://github.com/sachinrkp/utility-tools.git
cd utility-tools

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### For Contributors
1. **Fork** this repository
2. **Clone** your fork: `git clone https://github.com/YOUR-USERNAME/utility-tools.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes and test them
5. **Commit** your changes: `git commit -m "Add amazing feature"`
6. **Push** to your fork: `git push origin feature/amazing-feature`
7. **Create** a Pull Request

## ✨ Features

### 🔐 **User Authentication & Security**
- **Firebase Authentication**: Secure login with Google, Microsoft, and email/password
- **User Profiles**: Personal profile management with photo upload
- **Session Management**: Persistent login sessions across browser tabs
- **Data Encryption**: AES-256-GCM encryption for all user notes and sensitive data
- **Privacy Protection**: User data is encrypted and stored securely

### 📝 **Advanced Notes Management**
- **OneNote-Style Structure**: Hierarchical organization with Notebooks → Sections → Pages
- **Password Protection**: Section-level password protection for sensitive notes
- **Auto-Lock Security**: Sections automatically lock after 3 minutes of inactivity
- **Rich Text Editing**: Full-featured text editor with formatting options
- **Cloud Synchronization**: Real-time sync across all devices
- **Context Menu Actions**: Right-click to rename, move, or delete notebooks/sections/pages
- **Color-Coded Organization**: Visual hierarchy with color coding for easy navigation

### 📅 **Calendar Integration**
- **Personal Calendar**: Full calendar view with event management
- **Holiday Integration**: Country-specific holidays and observances
- **Google Calendar Sync**: Import events from Google Calendar
- **Event Management**: Create, edit, and delete calendar events
- **Timezone-Aware**: All events respect user's timezone settings

### 🕐 **Core Timezone Conversion**
- **Smart City-to-Timezone Mapping**: Type any city name (Pune, Mumbai, New York) and get the correct timezone automatically
- **Comprehensive Timezone Database**: 77+ timezones with intelligent city-based search
- **Interactive Timeline**: Visual 28-hour timeline with draggable sliders
- **Real-time Clock Display**: Live local time and UTC time in 24-hour format
- **DST Awareness**: Automatic daylight saving time calculations
- **Timezone Validation**: Robust error handling with fallback to UTC

### 🔍 **Advanced Search & UI**
- **Intelligent Autocomplete**: Search by city name or timezone (e.g., "Pune", "Kolkata", "New York")
- **Smart City Suggestions**: Shows both timezone names AND city names in dropdown
- **Clickable Dropdowns**: Click dropdown arrows to see all available timezones
- **Quick Conversion Presets**: One-click conversion for popular timezone pairs
- **Swap Functionality**: Instantly swap source and destination timezones
- **Modern Navigation**: Clean profile dropdown with user management

### 💱 **Currency Converter**
- **100+ World Currencies**: Comprehensive currency database with real flag icons
- **Real-time Exchange Rates**: Powered by Fixer.io API with fallback to exchangerate-api.com
- **Professional Flag Icons**: Actual flag images instead of emoji flags
- **Swap Button**: Instantly swap between currencies
- **Easy Management**: Currencies stored in `currencies.txt` for easy updates

### 📅 **Date & Time Calculators**
- **Age Calculator**: Calculate exact age in years, months, and days
- **Date Difference Calculator**: Find difference between two dates with swap functionality
- **Date Arithmetic**: Add or subtract days, months, years from any date
- **Epoch Time Converter**: Convert between human-readable time and Unix timestamps
- **Input Validation**: Robust error handling and validation

### 🎨 **User Experience**
- **Dark/Light Mode**: Toggle between themes with persistent preference
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern Navigation**: Clean profile dropdown with user management
- **Mobile Optimization**: Improved mobile layout with better spacing
- **Loading States**: Visual feedback during API calls and processing
- **Context Menus**: Right-click functionality for all interactive elements

### 📊 **Performance & Analytics**
- **Optimized Loading**: Efficient caching and minimized bundle size
- **Smart Caching**: City-to-timezone mappings cached for performance
- **Error Handling**: Graceful fallbacks for API failures
- **PWA Ready**: Fast loading with service worker support
- **Debug Tools**: Comprehensive debugging utilities for development

## 🚀 Live Demo

Visit the live application: [https://utility-tools.vercel.app/](https://utility-tools.vercel.app/)

## 🛠️ Technology Stack

### Frontend
- **TypeScript** - Type-safe JavaScript with modern ES6+ features
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Vanilla JavaScript** - No framework dependencies for optimal performance
- **Firebase SDK** - Authentication and real-time database integration
- **Crypto-JS** - Client-side encryption for data security

### Backend
- **Node.js** - JavaScript runtime for server-side operations
- **Express.js** - Minimal web framework for API endpoints
- **Firebase Admin SDK** - Server-side authentication and database management
- **AES-256-GCM Encryption** - Military-grade encryption for user data
- **File-based Storage** - Efficient timezone and currency data management
- **Environment Variables** - Secure API key management with dotenv

### Authentication & Security
- **Firebase Authentication** - Google, Microsoft, and email/password login
- **JWT Tokens** - Secure session management
- **AES-256-GCM** - End-to-end encryption for sensitive data
- **Password Hashing** - bcrypt for secure password storage
- **Session Management** - Persistent login across browser sessions

### DevOps & Deployment
- **Vercel** - Serverless deployment platform
- **GitHub Actions** - Automated CI/CD pipeline
- **npm** - Package management and build scripts
- **Environment Variables** - Secure configuration management

### Development Tools
- **TypeScript Compiler** - Type checking and ES5 compilation
- **Tailwind CLI** - CSS processing and optimization
- **Git** - Version control and collaboration
- **Debug Utilities** - Comprehensive debugging tools for development

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (v7 or higher) - Comes with Node.js
- **Git** (for cloning and version control) - [Download here](https://git-scm.com/)

### Option 1: Clone for Development/Contribution
```bash
# Clone the repository
git clone https://github.com/sachinrkp/utility-tools.git
cd utility-tools

# Install all dependencies
npm install

# Build the project
npm run build

# Start development server with auto-reload
npm run dev

# Open http://localhost:3000 in your browser
```

### Option 2: Fork for Personal Use
```bash
# 1. Fork the repository on GitHub (click the Fork button)
# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/utility-tools.git
cd utility-tools

# 3. Add upstream remote (to sync with original repo)
git remote add upstream https://github.com/sachinrkp/utility-tools.git

# 4. Install dependencies
npm install

# 5. Start development
npm run dev
```

### Option 3: Download ZIP (No Git Required)
1. Click the **"Code"** button on GitHub
2. Select **"Download ZIP"**
3. Extract the ZIP file
4. Open terminal in the extracted folder
5. Run `npm install` then `npm run dev`

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel (recommended)
npm run vercel-build
```

### Environment Setup

#### Quick Start (No Configuration Required)
The application works out of the box with mock authentication and local data storage. No external services are required for basic functionality.

#### Optional: Enhanced Features Setup

##### Firebase Authentication (Optional)
For real user authentication and cloud data storage:

1. **Create Firebase Project**: Visit [Firebase Console](https://console.firebase.google.com/)
2. **Enable Authentication**: Enable Google and email/password providers
3. **Get Configuration**: Copy your Firebase config from Project Settings
4. **Create .env file**: Add Firebase configuration variables

##### Encryption Setup (Optional)
For enhanced data security:

1. **Generate Master Key**: Create a 32-character encryption key
2. **Add to .env**: Set `MASTER_ENCRYPTION_KEY=your_32_character_key`
3. **Restart server**: Encryption will be automatically enabled

##### Currency Exchange API (Optional)
For real-time currency exchange rates:

1. **Get API Key**: Visit [fixer.io](https://fixer.io) and get a free API key
2. **Add to .env**: Add `FIXER_API_KEY=your_api_key_here`
3. **Restart server**: The app will automatically use real-time exchange rates

#### Security Considerations
- **Data Encryption**: All user notes are encrypted using AES-256-GCM (when enabled)
- **API Keys**: Store all sensitive keys in `.env` file (never commit to git)
- **Local Storage**: Data is stored locally by default for privacy
- **HTTPS**: Always use HTTPS in production for secure data transmission

## 🏗️ Project Structure

```
utility-tools/
├── 📁 src/                    # TypeScript source files
│   ├── frontend.ts            # Main frontend application logic
│   ├── simple-server.ts       # Express.js server implementation
│   ├── 📁 firebase/           # Firebase configuration and auth
│   │   ├── config.ts          # Firebase configuration
│   │   └── auth.ts            # Authentication logic
│   └── 📁 services/           # Backend services
│       └── encryptionService.ts # AES-256-GCM encryption service
├── 📁 public/                 # Static assets and compiled files
│   ├── index.html             # Main HTML file (public access)
│   ├── profile.html           # User profile page (authenticated)
│   ├── calendar.html          # Calendar page (authenticated)
│   ├── notes.html             # Notes management page (authenticated)
│   ├── script.js              # Compiled JavaScript (auto-generated)
│   ├── style.css              # Source CSS for Tailwind
│   ├── output.css             # Compiled Tailwind CSS (auto-generated)
│   ├── favicon.svg            # Custom stopwatch icon
│   ├── timezones.txt          # Timezone database file
│   ├── currencies.txt         # Currency database with flag mappings
│   └── city-timezone-mapping.txt # City-to-timezone mapping file
├── 📁 dist/                   # Compiled TypeScript output
│   ├── frontend.js            # Compiled frontend code
│   ├── simple-server.js       # Compiled server code
│   ├── notes-data.json        # User notes data (encrypted)
│   └── encrypted-notes.dat    # Encrypted user data storage
├── 📄 .env                    # Environment variables (API keys, encryption keys)
├── 📄 debug-utils.js          # Debugging utilities for development
├── 📄 FIREBASE_SETUP.md       # Firebase setup documentation
├── 📄 ENCRYPTION_SETUP.md     # Encryption setup guide
├── 📄 SECURITY_NOTES.md       # Security considerations
├── 📄 FIXER_API_SETUP.md      # API setup documentation
├── 📄 package.json            # Node.js dependencies and scripts
├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 tailwind.config.js      # Tailwind CSS configuration
├── 📄 vercel.json             # Vercel deployment configuration
└── 📄 README.md               # This file
```

## 🔧 Development Scripts

```bash
# Install dependencies
npm install

# Build TypeScript and CSS
npm run build

# Build CSS only
npm run build:css

# Start production server
npm start

# Development with auto-reload (if configured)
npm run dev

# Deploy to Vercel
npm run vercel-build
```

## 🌐 API Endpoints

### `GET /api/timezones`
Returns a list of all available timezones.

**Response:**
```json
{
  "zones": [
    "America/New_York",
    "Asia/Kolkata",
    "Europe/London",
    "..."
  ]
}
```

### `GET /api/current-time`
Returns current UTC and local server time.

**Response:**
```json
{
  "utc": "2024-01-01T12:00:00.000Z",
  "local": "2024-01-01T17:30:00.000+05:30",
  "timestamp": 1704110400000
}
```

### `POST /api/convert-time`
Converts time between timezones (if implemented).

**Request:**
```json
{
  "fromZone": "America/New_York",
  "toZone": "Asia/Kolkata",
  "date": "2024-01-01",
  "time": "12:00"
}
```

## 🎯 Key Features Explained

### Smart City-to-Timezone Mapping
The application features an intelligent city-to-timezone mapping system that allows users to enter any city name and automatically determines the correct timezone:

- **City Input**: Type "Pune", "Mumbai", "New York", "London" - any city name
- **Automatic Mapping**: The app maps cities to their correct timezone (e.g., Pune → Asia/Kolkata)
- **Smart Autocomplete**: Shows both city names and timezone identifiers in dropdown
- **Fallback System**: If city not found, gracefully falls back to UTC
- **Easy Extension**: Add new cities by editing `city-timezone-mapping.txt`

### Smart Timezone Detection
The application automatically detects the user's timezone using the `Intl.DateTimeFormat().resolvedOptions().timeZone` API, ensuring accurate local time display regardless of the user's location.

### Interactive Timeline
- **28-hour span**: Shows times from 12 hours before to 16 hours after the selected time
- **Synchronized sliders**: Moving one slider automatically adjusts the other based on timezone difference
- **Real-time updates**: Timeline updates instantly when timezones are changed

### Comprehensive Search
- **City-based search**: Type "Kolkata" to find "Asia/Kolkata"
- **Timezone search**: Direct timezone identifier search
- **Fuzzy matching**: Handles variations in spelling and formatting

### Performance Optimization
- **Efficient caching**: Timezone data cached for optimal performance
- **Minimal dependencies**: Lightweight bundle for fast loading
- **Progressive enhancement**: Core functionality works without JavaScript

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect to GitHub:**
   - Visit [Vercel](https://vercel.com)
   - Connect your GitHub account
   - Import the `timezone-converter` repository

2. **Configure Build Settings:**
   - Build Command: `npm run vercel-build`
   - Output Directory: `public`
   - Install Command: `npm install`

3. **Deploy:**
   - Click "Deploy"
   - Your app will be live at `https://your-app-name.vercel.app`

### Deploy to Other Platforms

The application can be deployed to any platform supporting Node.js:

- **Netlify**: Configure build command as `npm run build`
- **Heroku**: Add `"start": "node dist/simple-server.js"` to package.json
- **DigitalOcean App Platform**: Use the Node.js buildpack
- **AWS Amplify**: Configure build settings for Node.js apps

## 🤝 Contributing

We welcome contributions from developers of all skill levels! This project is perfect for:
- **First-time contributors** looking to get started with open source
- **Experienced developers** wanting to add advanced features
- **Students** learning TypeScript, Node.js, or web development
- **Anyone** interested in timezone handling and web applications

### 🚀 Getting Started

#### Step 1: Fork & Clone
```bash
# Fork the repository on GitHub (click the Fork button)
# Then clone your fork
git clone https://github.com/YOUR-USERNAME/utility-tools.git
cd utility-tools

# Add upstream remote to sync with original repo
git remote add upstream https://github.com/sachinrkp/utility-tools.git
```

#### Step 2: Setup Development Environment
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 to see the app
```

#### Step 3: Create a Feature Branch
```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

#### Step 4: Make Your Changes
- **Code Style**: Follow existing TypeScript patterns
- **Testing**: Test your changes in the browser
- **Documentation**: Update README if adding new features
- **Commits**: Write clear, descriptive commit messages

#### Step 5: Submit Your Changes
```bash
# Add your changes
git add .

# Commit with a descriptive message
git commit -m "✨ Add new feature: brief description"

# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

### 🎯 Contribution Areas

#### 🟢 Good First Issues (Beginner Friendly)
- 🐛 Fix typos in documentation
- 🎨 Improve UI/UX design
- 📱 Add mobile responsiveness improvements
- 🌐 Add more timezone examples
- 📝 Improve code comments and documentation

#### 🟡 Intermediate Features
- 🔍 Enhanced search functionality
- 📊 Add more analytics and insights
- 🎨 Additional themes and customization options
- ⚡ Performance optimizations
- 🧪 Add unit tests for existing functions

#### 🔴 Advanced Features
- 🌍 Additional timezone data sources
- 📱 Mobile app version (React Native/Flutter)
- 🌐 Internationalization (i18n) support
- 🔧 Advanced configuration options
- 🚀 PWA enhancements

### 📋 Development Guidelines

#### Code Standards
- **TypeScript**: Use strict typing, avoid `any`
- **Naming**: Use descriptive variable and function names
- **Comments**: Add JSDoc comments for public functions
- **Formatting**: Use consistent indentation and spacing

#### Testing Your Changes
```bash
# Build the project to check for TypeScript errors
npm run build

# Test the application
npm run dev
# Open http://localhost:3000 and test your changes

# Check for linting issues
npm run lint  # if available
```

#### Pull Request Guidelines
- **Title**: Use clear, descriptive titles
- **Description**: Explain what your PR does and why
- **Screenshots**: Include screenshots for UI changes
- **Testing**: Describe how you tested your changes
- **Breaking Changes**: Note any breaking changes

### 🆘 Need Help?

- **Questions**: Open a [GitHub Discussion](https://github.com/sachinrkp/utility-tools/discussions)
- **Bugs**: Report issues in [GitHub Issues](https://github.com/sachinrkp/utility-tools/issues)
- **Feature Requests**: Suggest new features in [GitHub Issues](https://github.com/sachinrkp/utility-tools/issues)
- **Code Review**: Ask for help in your Pull Request

### 🏆 Recognition

Contributors will be:
- Listed in the README contributors section
- Mentioned in release notes
- Given credit in commit history
- Invited to join the project maintainers (for significant contributions)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Sachin Patel**
- 📧 Email: [sachinrkp07@gmail.com](mailto:sachinrkp07@gmail.com)
- 💼 LinkedIn: [linkedin.com/in/sachinrkp](https://linkedin.com/in/sachinrkp)
- 💻 GitHub: [github.com/sachinrkp](https://github.com/sachinrkp)

## 🙏 Acknowledgments

- **Timezone Data**: Powered by the IANA Time Zone Database
- **Icons**: Custom stopwatch favicon design
- **Inspiration**: Built to solve real-world timezone conversion challenges
- **Community**: Thanks to all contributors and users providing feedback

## 🎯 Use Cases & Applications

### Personal Use
- **Travel Planning**: Convert times for different destinations
- **Remote Work**: Coordinate with team members across timezones
- **Online Meetings**: Schedule calls with international colleagues
- **Gaming**: Coordinate with friends in different time zones
- **Social Media**: Post content at optimal times for global audiences

### Business Applications
- **Customer Support**: Provide accurate local times for global customers
- **Event Management**: Schedule webinars and events for international audiences
- **E-commerce**: Display accurate delivery times across regions
- **Scheduling Systems**: Integrate timezone conversion into booking systems
- **Analytics**: Track user activity across different time zones

### Educational Use
- **Learning Tool**: Teach students about time zones and global time
- **Research**: Study time zone patterns and daylight saving changes
- **Projects**: Use as a reference for timezone-related assignments
- **Presentations**: Demonstrate time zone concepts in educational materials

### Developer Integration
- **API Integration**: Use the timezone conversion logic in your applications
- **Customization**: Modify the UI/UX for specific use cases
- **Extension**: Build browser extensions or mobile apps
- **Learning**: Study TypeScript, Node.js, and modern web development

## 🛠️ Customization Guide

### Modifying Timezone Data
```typescript
// Add custom timezones in src/frontend.ts
const customTimezones = [
  'Custom/Timezone1',
  'Custom/Timezone2'
];

// Update the timezone list
appState.allZones = [...defaultTimezones, ...customTimezones];
```

### Adding New Features
```typescript
// Example: Add a new conversion type
const convertToEpoch = (date: string, time: string, timezone: string) => {
  // Your custom conversion logic
  return Math.floor(new Date(`${date}T${time}`).getTime() / 1000);
};
```

### Styling Customization
```css
/* Custom CSS in public/style.css */
.custom-theme {
  --primary-color: #your-color;
  --secondary-color: #your-color;
}
```

### API Extensions
```typescript
// Add new API endpoints in src/simple-server.ts
app.get('/api/custom-endpoint', (req, res) => {
  res.json({ message: 'Custom functionality' });
});
```

## 🆕 Recent Updates

### ✅ **v2.0.0 - Complete Productivity Suite** (Latest)
- **🔐 User Authentication**: Firebase integration with Google, Microsoft, and email/password login
- **📝 Advanced Notes**: OneNote-style hierarchical organization with encryption
- **📅 Calendar Integration**: Full calendar with holiday integration and Google Calendar sync
- **🔒 Data Security**: AES-256-GCM encryption for all user data
- **🎨 Enhanced UI**: Profile management, context menus, and mobile optimization
- **⚡ Performance**: Optimized code with debugging utilities and better error handling

### ✅ **v1.5.0 - Smart Features**
- **🌍 Smart City Mapping**: Intelligent city-to-timezone detection
- **💱 Currency Converter**: 100+ currencies with real-time exchange rates
- **📊 Date Calculators**: Age, difference, and arithmetic calculations
- **🎨 Modern UI**: Dark/light mode with responsive design

### ✅ **v1.0.0 - Core Features**
- **🕐 Timezone Conversion**: Basic timezone conversion with timeline
- **🔍 Search & Autocomplete**: City and timezone search functionality
- **📱 Mobile Support**: Responsive design for all devices

## 🔮 Future Roadmap

### 🚀 Upcoming Features
- [ ] **AI Integration**: Smart note suggestions and timezone recommendations
- [ ] **Team Collaboration**: Shared notebooks and real-time collaboration
- [ ] **Advanced Calendar**: Recurring events and meeting optimization
- [ ] **Time Zone Map**: Interactive world map with timezone visualization
- [ ] **Notification System**: Alerts for specific times in different zones
- [ ] **Offline Support**: PWA with offline timezone conversion and notes
- [ ] **Mobile Apps**: Native iOS and Android applications
- [ ] **API Integration**: Third-party calendar and note-taking app sync

### 🎯 Community Requests
- [ ] **Bulk Operations**: Convert multiple times and manage multiple notes at once
- [ ] **Time Zone History**: Track timezone changes over time
- [ ] **Custom Themes**: More color schemes and layouts
- [ ] **Export Options**: Save conversions and notes as CSV/PDF
- [ ] **Widget Embedding**: Embed converter in other websites
- [ ] **Voice Notes**: Audio recording and transcription for notes

## 📊 Project Statistics

- **⭐ Stars**: Growing community support
- **🍴 Forks**: Active development forks
- **🐛 Issues**: Regular bug reports and feature requests
- **📈 Downloads**: Increasing npm package usage
- **🌍 Global Usage**: Used by developers worldwide

## 🙏 Acknowledgments

- **Timezone Data**: Powered by the IANA Time Zone Database
- **Icons**: Custom stopwatch favicon design
- **Inspiration**: Built to solve real-world timezone conversion challenges
- **Community**: Thanks to all contributors and users providing feedback
- **Open Source**: Built with love for the developer community

---

## 📞 Support & Contact

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/sachinrkp/utility-tools/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/sachinrkp/utility-tools/discussions)
- **📧 Email**: [sachinrkp07@gmail.com](mailto:sachinrkp07@gmail.com)
- **💼 LinkedIn**: [linkedin.com/in/sachinrkp](https://linkedin.com/in/sachinrkp)
- **💻 GitHub**: [github.com/sachinrkp](https://github.com/sachinrkp)

---

⭐ **Star this repository if you find it helpful!**

Made with ❤️ by [Sachin Patel](https://github.com/sachinrkp)