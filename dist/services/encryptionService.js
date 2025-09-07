import crypto from 'crypto';
export class EncryptionService {
    static ALGORITHM = 'aes-256-gcm';
    static KEY_LENGTH = 32; // 256 bits
    static IV_LENGTH = 16; // 128 bits
    static TAG_LENGTH = 16; // 128 bits
    /**
     * Generate a random encryption key
     */
    static generateKey() {
        return crypto.randomBytes(this.KEY_LENGTH).toString('hex');
    }
    /**
     * Derive a key from a password using PBKDF2
     */
    static deriveKeyFromPassword(password, salt) {
        return crypto.pbkdf2Sync(password, salt, 100000, this.KEY_LENGTH, 'sha512').toString('hex');
    }
    /**
     * Encrypt data using AES-256-GCM
     */
    static encrypt(data, key) {
        try {
            const iv = crypto.randomBytes(this.IV_LENGTH);
            const cipher = crypto.createCipheriv(this.ALGORITHM, Buffer.from(key, 'hex'), iv);
            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const tag = cipher.getAuthTag();
            // Combine IV + Tag + Encrypted data
            const result = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
            return result;
        }
        catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }
    /**
     * Decrypt data using AES-256-GCM
     */
    static decrypt(encryptedData, key) {
        try {
            const parts = encryptedData.split(':');
            if (parts.length !== 3) {
                throw new Error('Invalid encrypted data format');
            }
            const iv = Buffer.from(parts[0], 'hex');
            const tag = Buffer.from(parts[1], 'hex');
            const encrypted = parts[2];
            const decipher = crypto.createDecipheriv(this.ALGORITHM, Buffer.from(key, 'hex'), iv);
            decipher.setAuthTag(tag);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }
    /**
     * Encrypt an object by stringifying it first
     */
    static encryptObject(obj, key) {
        const jsonString = JSON.stringify(obj);
        return this.encrypt(jsonString, key);
    }
    /**
     * Decrypt an object and parse it back to original format
     */
    static decryptObject(encryptedData, key) {
        const jsonString = this.decrypt(encryptedData, key);
        return JSON.parse(jsonString);
    }
    /**
     * Generate a user-specific encryption key based on user ID
     */
    static generateUserKey(userId, masterKey) {
        const salt = crypto.createHash('sha256').update(userId).digest('hex');
        return this.deriveKeyFromPassword(masterKey, salt);
    }
    /**
     * Hash a password for storage (one-way)
     */
    static hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
        return { hash, salt };
    }
    /**
     * Verify a password against its hash
     */
    static verifyPassword(password, hash, salt) {
        const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
        return testHash === hash;
    }
}
//# sourceMappingURL=encryptionService.js.map