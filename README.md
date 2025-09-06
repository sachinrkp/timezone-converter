# 🌍 Timezone Converter

A modern, feature-rich timezone converter web application built with TypeScript, Node.js, and Tailwind CSS. Convert times between any timezones worldwide with an intuitive interface and powerful features.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge)](https://timezone-converter-pi.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/sachinrkp/timezone-converter)

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
- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **Git** (for cloning and version control)

### 1. Clone the Repository
```bash
git clone https://github.com/sachinrkp/timezone-converter.git
cd timezone-converter
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build the Project
```bash
npm run build
```

### 4. Start the Development Server
```bash
npm start
# or for development with auto-reload
npm run dev
```

### 5. Open in Browser
Navigate to `http://localhost:3000` to view the application.

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

We welcome contributions! Here's how you can help:

### 1. Fork the Repository
```bash
git clone https://github.com/your-username/timezone-converter.git
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 3. Make Changes
- Follow TypeScript best practices
- Maintain consistent code style
- Add comments for complex logic
- Test your changes thoroughly

### 4. Commit Changes
```bash
git add .
git commit -m "✨ Add amazing feature"
```

### 5. Push and Create PR
```bash
git push origin feature/amazing-feature
```

### Areas for Contribution
- 🌍 Additional timezone data sources
- 📱 Mobile app version (React Native/Flutter)
- 🔍 Advanced search filters
- 📊 More analytics and insights
- 🎨 Additional themes and customization
- 🌐 Internationalization (i18n)
- ⚡ Performance optimizations
- 🧪 Unit and integration tests

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

## 🔮 Future Roadmap

- [ ] **Calendar Integration**: Add calendar event timezone conversion
- [ ] **Meeting Scheduler**: Find optimal meeting times across timezones
- [ ] **Time Zone Map**: Interactive world map with timezone visualization
- [ ] **Notification System**: Alerts for specific times in different zones
- [ ] **API Rate Limiting**: Enhanced API security and usage limits
- [ ] **Offline Support**: PWA with offline timezone conversion
- [ ] **Browser Extension**: Quick timezone conversion from browser toolbar
- [ ] **Mobile Apps**: Native iOS and Android applications

---

⭐ **Star this repository if you find it helpful!**

Made with ❤️ by [Sachin Patel](https://github.com/sachinrkp)