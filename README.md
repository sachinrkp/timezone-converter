# 🕒 Timezone Converter

A modern, responsive timezone converter web application with DST awareness, built with TypeScript, Express.js, and Tailwind CSS. Features include PWA support, offline functionality, and comprehensive accessibility features.

## ✨ Features

### Core Functionality
- **Timezone Conversion**: Convert times between any two timezones worldwide
- **DST Awareness**: Automatic daylight saving time detection and handling
- **Real-time Clocks**: Live display of current times in both timezones
- **Interactive Sliders**: Visual time adjustment with synchronized sliders
- **Search & Filter**: Quick timezone search by city or timezone name

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Toggle between themes with persistent preference
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Comprehensive error messages and validation
- **Accessibility**: WCAG 2.1 compliant with screen reader support

### Progressive Web App (PWA)
- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Basic functionality works without internet
- **Service Worker**: Background sync and caching
- **App Manifest**: Native app-like experience

### Developer Experience
- **TypeScript**: Full type safety and IntelliSense
- **ESLint & Prettier**: Code formatting and linting
- **Jest Testing**: Comprehensive test suite
- **Hot Reload**: Development server with auto-reload
- **API Caching**: Intelligent caching to reduce API calls

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- TimeZoneDB API key (free at [timezonedb.com](https://timezonedb.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/timezone-converter.git
   cd timezone-converter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your TimeZoneDB API key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🛠️ Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Run TypeScript type checking |

### Project Structure

```
timezone-converter/
├── src/
│   ├── __tests__/          # Test files
│   ├── utils/              # Utility functions
│   └── server.ts           # Express server
├── public/
│   ├── index.html          # Main HTML file
│   ├── script.ts           # Frontend TypeScript
│   ├── style.css           # Tailwind CSS
│   ├── manifest.json       # PWA manifest
│   └── sw.js              # Service worker
├── dist/                   # Built files (generated)
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
├── jest.config.js         # Jest configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🧪 Testing

The project includes comprehensive tests for both backend and frontend:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage
- **API Endpoints**: All routes tested with various scenarios
- **Utility Functions**: Timezone conversion logic
- **Error Handling**: Edge cases and error conditions
- **Input Validation**: Data validation and sanitization

## 📱 PWA Features

### Installation
1. Open the app in a supported browser (Chrome, Edge, Safari)
2. Look for the install prompt or use the browser menu
3. Click "Install" to add to your home screen

### Offline Support
- Basic timezone conversion works offline
- Cached timezone data for common conversions
- Service worker handles background sync

## 🎨 Customization

### Theming
The app supports both light and dark themes. You can customize the color scheme by modifying the Tailwind configuration in `tailwind.config.js`.

### Adding New Features
1. Create new components in the `public/` directory
2. Add API endpoints in `src/server.ts`
3. Update types in TypeScript files
4. Add tests for new functionality

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TIMEZONEDB_API_KEY` | API key for TimeZoneDB | Yes |
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment mode | No |

### API Configuration
The app uses the TimeZoneDB API for timezone data. You can configure the API endpoint and caching behavior in `src/server.ts`.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker
```bash
# Build Docker image
docker build -t timezone-converter .

# Run container
docker run -p 3000:3000 -e TIMEZONEDB_API_KEY=your_key timezone-converter
```

### Other Platforms
- **Netlify**: Static hosting with serverless functions
- **Railway**: Full-stack deployment
- **Heroku**: Traditional hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure accessibility compliance
- Update documentation as needed

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TimeZoneDB](https://timezonedb.com) for timezone data API
- [Tailwind CSS](https://tailwindcss.com) for styling framework
- [Express.js](https://expressjs.com) for backend framework
- [TypeScript](https://www.typescriptlang.org) for type safety

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/timezone-converter/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

---

**Made with ❤️ by [Your Name]**
This is a Simple Website for Timezone Conversion from one TimeZone to another TimeZone 
