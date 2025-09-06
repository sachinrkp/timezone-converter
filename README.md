# 🌍 Timezone Converter

A modern, feature-rich timezone converter web application built with TypeScript, Node.js, and Tailwind CSS. Convert times between any timezones worldwide with an intuitive interface and powerful features.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge)](https://timezone-converter-pi.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/sachinrkp/timezone-converter)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

## 🚀 Quick Start

### For Users
- **🌐 [Try Live Demo](https://timezone-converter-pi.vercel.app/)** - No installation required
- **📱 Mobile Friendly** - Works on all devices
- **⚡ Fast & Lightweight** - Optimized for performance

### For Developers
```bash
# Clone the repository
git clone https://github.com/sachinrkp/timezone-converter.git
cd timezone-converter

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### For Contributors
1. **Fork** this repository
2. **Clone** your fork: `git clone https://github.com/YOUR-USERNAME/timezone-converter.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes and test them
5. **Commit** your changes: `git commit -m "Add amazing feature"`
6. **Push** to your fork: `git push origin feature/amazing-feature`
7. **Create** a Pull Request

## ✨ Features

### 🕐 **Core Timezone Conversion**
- **Smart Timezone Detection**: Automatically detects user's timezone on page load
- **Comprehensive Timezone Database**: 78+ timezones with city-based search
- **Interactive Timeline**: Visual 28-hour timeline with draggable sliders
- **Real-time Clock Display**: Live local time and UTC time in 24-hour format
- **DST Awareness**: Automatic daylight saving time calculations

### 🔍 **Advanced Search & UI**
- **Intelligent Autocomplete**: Search by city name or timezone (e.g., "Kolkata", "New York")
- **Clickable Dropdowns**: Click dropdown arrows to see all available timezones
- **Quick Conversion Presets**: One-click conversion for popular timezone pairs
- **Swap Functionality**: Instantly swap source and destination timezones
- **Duplicate Prevention**: Smart filtering removes duplicate timezone suggestions

### ⏰ **Epoch Time Converter**
- **Human to Epoch**: Convert human-readable dates to Unix timestamps
- **Epoch to Human**: Convert Unix timestamps to human-readable format
- **Timezone-Aware**: All epoch conversions respect selected timezones
- **Input Validation**: Robust error handling and validation

### 🎨 **User Experience**
- **Dark/Light Mode**: Toggle between themes with persistent preference
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Desktop Layout**: Side-by-side form and timeline for efficient workflow
- **Mobile Optimization**: Stacked layout with touch-friendly controls
- **Loading States**: Visual feedback during API calls and processing

### 📊 **Performance & Analytics**
- **Vercel Speed Insights**: Performance monitoring and analytics
- **Custom Event Tracking**: Tracks timezone and epoch conversions
- **Optimized Loading**: Efficient caching and minimized bundle size
- **PWA Ready**: Fast loading with service worker support

## 🚀 Live Demo

Visit the live application: [https://timezone-converter-pi.vercel.app/](https://timezone-converter-pi.vercel.app/)

## 🛠️ Technology Stack

### Frontend
- **TypeScript** - Type-safe JavaScript with modern ES6+ features
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Vanilla JavaScript** - No framework dependencies for optimal performance

### Backend
- **Node.js** - JavaScript runtime for server-side operations
- **Express.js** - Minimal web framework for API endpoints
- **File-based Storage** - Efficient timezone data management

### DevOps & Deployment
- **Vercel** - Serverless deployment platform
- **GitHub Actions** - Automated CI/CD pipeline
- **npm** - Package management and build scripts

### Development Tools
- **TypeScript Compiler** - Type checking and ES5 compilation
- **Tailwind CLI** - CSS processing and optimization
- **Git** - Version control and collaboration

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (v7 or higher) - Comes with Node.js
- **Git** (for cloning and version control) - [Download here](https://git-scm.com/)

### Option 1: Clone for Development/Contribution
```bash
# Clone the repository
git clone https://github.com/sachinrkp/timezone-converter.git
cd timezone-converter

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
git clone https://github.com/YOUR-USERNAME/timezone-converter.git
cd timezone-converter

# 3. Add upstream remote (to sync with original repo)
git remote add upstream https://github.com/sachinrkp/timezone-converter.git

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
The application works out of the box with no additional configuration required. All timezone data is included in the repository.

## 🏗️ Project Structure

```
timezone-converter/
├── 📁 src/                    # TypeScript source files
│   ├── frontend.ts            # Main frontend application logic
│   └── simple-server.ts       # Express.js server implementation
├── 📁 public/                 # Static assets and compiled files
│   ├── index.html             # Main HTML file
│   ├── script.js              # Compiled JavaScript (auto-generated)
│   ├── style.css              # Source CSS for Tailwind
│   ├── output.css             # Compiled Tailwind CSS (auto-generated)
│   ├── favicon.svg            # Custom stopwatch icon
│   └── timezones.txt          # Timezone database file
├── 📁 dist/                   # Compiled TypeScript output
│   ├── frontend.js            # Compiled frontend code
│   └── simple-server.js       # Compiled server code
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
git clone https://github.com/YOUR-USERNAME/timezone-converter.git
cd timezone-converter

# Add upstream remote to sync with original repo
git remote add upstream https://github.com/sachinrkp/timezone-converter.git
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

- **Questions**: Open a [GitHub Discussion](https://github.com/sachinrkp/timezone-converter/discussions)
- **Bugs**: Report issues in [GitHub Issues](https://github.com/sachinrkp/timezone-converter/issues)
- **Feature Requests**: Suggest new features in [GitHub Issues](https://github.com/sachinrkp/timezone-converter/issues)
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

## 🔮 Future Roadmap

### 🚀 Upcoming Features
- [ ] **Calendar Integration**: Add calendar event timezone conversion
- [ ] **Meeting Scheduler**: Find optimal meeting times across timezones
- [ ] **Time Zone Map**: Interactive world map with timezone visualization
- [ ] **Notification System**: Alerts for specific times in different zones
- [ ] **API Rate Limiting**: Enhanced API security and usage limits
- [ ] **Offline Support**: PWA with offline timezone conversion
- [ ] **Browser Extension**: Quick timezone conversion from browser toolbar
- [ ] **Mobile Apps**: Native iOS and Android applications

### 🎯 Community Requests
- [ ] **Bulk Conversion**: Convert multiple times at once
- [ ] **Time Zone History**: Track timezone changes over time
- [ ] **Custom Themes**: More color schemes and layouts
- [ ] **Export Options**: Save conversions as CSV/PDF
- [ ] **Widget Embedding**: Embed converter in other websites

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

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/sachinrkp/timezone-converter/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/sachinrkp/timezone-converter/discussions)
- **📧 Email**: [sachinrkp07@gmail.com](mailto:sachinrkp07@gmail.com)
- **💼 LinkedIn**: [linkedin.com/in/sachinrkp](https://linkedin.com/in/sachinrkp)
- **💻 GitHub**: [github.com/sachinrkp](https://github.com/sachinrkp)

---

⭐ **Star this repository if you find it helpful!**

Made with ❤️ by [Sachin Patel](https://github.com/sachinrkp)