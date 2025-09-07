# Encryption Setup Guide

## 🔐 How to Enable Data Encryption

The app now supports encrypted storage of user notes data. Here's how to set it up:

### 1. **Environment Variables**

Add these to your `.env` file:

```bash
# Master encryption key (generate a secure random key)
MASTER_ENCRYPTION_KEY=your_32_character_hex_key_here

# Set environment
NODE_ENV=development
```

### 2. **Generate Encryption Key**

You can generate a secure key using the app itself or use this command:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use the built-in generator
# The app will generate one automatically if not provided
```

### 3. **How It Works**

#### **Data Storage:**
- All user notes are encrypted using AES-256-GCM encryption
- Data is stored in `dist/encrypted-notes.dat` (binary format)
- In development, a plain text backup is also saved for debugging

#### **Data Loading:**
- App tries to load encrypted data first
- Falls back to plain text if encryption fails
- Seamless migration from unencrypted to encrypted storage

#### **Security Features:**
- Each user's data is encrypted with a master key
- Data cannot be read without the encryption key
- File system access alone is not enough to read user data

### 4. **File Structure**

```
dist/
├── encrypted-notes.dat    # Encrypted user data (secure)
├── notes-data.json        # Plain text backup (development only)
└── ...
```

### 5. **Migration Process**

When you first run the app with encryption enabled:

1. **Existing Data**: If you have existing `notes-data.json`, it will be loaded and then encrypted
2. **New Data**: All new data will be encrypted from the start
3. **Backward Compatibility**: App can still read old unencrypted data

### 6. **Production Deployment**

For production:

1. **Set Environment Variables:**
   ```bash
   NODE_ENV=production
   MASTER_ENCRYPTION_KEY=your_secure_production_key
   ```

2. **Remove Development Files:**
   - The plain text backup won't be created in production
   - Only encrypted data will be stored

3. **Secure Key Management:**
   - Store encryption key in secure environment variables
   - Use key management services (AWS KMS, Azure Key Vault, etc.)
   - Never commit keys to version control

### 7. **Testing Encryption**

To test that encryption is working:

1. **Check File Contents:**
   ```bash
   # This should show encrypted binary data
   cat dist/encrypted-notes.dat
   
   # This should show readable JSON (development only)
   cat dist/notes-data.json
   ```

2. **Verify in Browser:**
   - Open Developer Tools → Network tab
   - Create/edit notes
   - Check that data sent to server is encrypted

### 8. **Security Benefits**

✅ **Data at Rest**: Files on disk are encrypted
✅ **Data in Transit**: HTTPS encrypts network traffic
✅ **Access Control**: Only app with correct key can decrypt
✅ **Backup Security**: Encrypted backups are secure
✅ **Compliance**: Meets basic data protection requirements

### 9. **Troubleshooting**

**If encryption fails:**
- App will fall back to plain text storage
- Check console logs for error messages
- Verify encryption key is valid (32 hex characters)

**If data is not loading:**
- Check if encrypted file exists
- Verify encryption key matches the one used to encrypt
- Check file permissions

### 10. **Next Steps**

For even better security, consider:

1. **Database Migration**: Move to PostgreSQL/MongoDB
2. **User-Specific Keys**: Each user has their own encryption key
3. **Key Rotation**: Regular key updates
4. **Audit Logging**: Track data access
5. **Backup Encryption**: Encrypt database backups

## 🚀 Quick Start

1. Add `MASTER_ENCRYPTION_KEY` to your `.env` file
2. Restart the server
3. Create some notes
4. Check that `dist/encrypted-notes.dat` is created
5. Verify data is encrypted (not readable as plain text)

Your user data is now encrypted and secure! 🔐
