# Fixer.io API Setup Instructions

## How to Set Up Your Fixer.io API Key

### Step 1: Get Your API Key
1. Go to [fixer.io](https://fixer.io/)
2. Sign up for an account (if you haven't already)
3. Get your API access key from your dashboard

### Step 2: Add Your API Key to Environment Variables

**Recommended Method: Environment Variable**
1. Create or edit the `.env` file in your project root
2. Add your Fixer.io API key:
   ```
   FIXER_API_KEY=your_actual_api_key_here
   ```
3. Example:
   ```
   FIXER_API_KEY=abc123def456ghi789
   ```
4. The server will automatically read this and provide it to the frontend securely

### Step 3: Test the Integration
1. Start your development server: `node dist/simple-server.js`
2. Open the website in your browser
3. Go to the Currency Converter section
4. Try converting between currencies
5. Check the browser console for "✅ Exchange rates updated from Fixer.io"

### Features
- **Primary**: Uses Fixer.io API for accurate, real-time exchange rates
- **Fallback**: Automatically falls back to free exchangerate-api.com if Fixer.io fails
- **Error Handling**: Graceful degradation with cached rates if all APIs fail
- **Security**: API key is only used on the frontend (consider server-side implementation for production)

### API Endpoint Used
```
http://data.fixer.io/api/latest?access_key=YOUR_API_KEY&base=USD&symbols=USD,EUR,GBP,JPY,INR,CAD,AUD,CHF,CNY,KRW
```

### Supported Currencies
- 🇺🇸 USD - US Dollar
- 🇪🇺 EUR - Euro  
- 🇬🇧 GBP - British Pound
- 🇯🇵 JPY - Japanese Yen
- 🇮🇳 INR - Indian Rupee
- 🇨🇦 CAD - Canadian Dollar
- 🇦🇺 AUD - Australian Dollar
- 🇨🇭 CHF - Swiss Franc
- 🇨🇳 CNY - Chinese Yuan
- 🇰🇷 KRW - South Korean Won

### Troubleshooting
- If you see "ℹ️ No Fixer.io API key configured" in console, make sure you've added `FIXER_API_KEY` to your `.env` file
- If you see "⚠️ Fixer.io API failed, trying fallback", the system will automatically use the backup API
- Check your Fixer.io account for API usage limits and billing
- Make sure your `.env` file is in the project root directory
- Restart the server after adding the API key to the `.env` file
