export declare class EncryptionService {
    private static readonly ALGORITHM;
    private static readonly KEY_LENGTH;
    private static readonly IV_LENGTH;
    private static readonly TAG_LENGTH;
    /**
     * Generate a random encryption key
     */
    static generateKey(): string;
    /**
     * Derive a key from a password using PBKDF2
     */
    static deriveKeyFromPassword(password: string, salt: string): string;
    /**
     * Encrypt data using AES-256-GCM
     */
    static encrypt(data: string, key: string): string;
    /**
     * Decrypt data using AES-256-GCM
     */
    static decrypt(encryptedData: string, key: string): string;
    /**
     * Encrypt an object by stringifying it first
     */
    static encryptObject(obj: any, key: string): string;
    /**
     * Decrypt an object and parse it back to original format
     */
    static decryptObject<T>(encryptedData: string, key: string): T;
    /**
     * Generate a user-specific encryption key based on user ID
     */
    static generateUserKey(userId: string, masterKey: string): string;
    /**
     * Hash a password for storage (one-way)
     */
    static hashPassword(password: string): {
        hash: string;
        salt: string;
    };
    /**
     * Verify a password against its hash
     */
    static verifyPassword(password: string, hash: string, salt: string): boolean;
}
//# sourceMappingURL=encryptionService.d.ts.map