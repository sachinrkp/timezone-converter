import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
class Database {
    db;
    dbPath;
    constructor(dbPath = 'data/utility_tools.db') {
        this.dbPath = dbPath;
        this.ensureDataDirectory();
        this.db = new sqlite3.Database(dbPath);
        this.initializeDatabase();
    }
    ensureDataDirectory() {
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }
    async initializeDatabase() {
        try {
            // Read and execute schema
            const schemaPath = path.join(process.cwd(), 'src', 'database', 'schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            // Split schema into individual statements
            const statements = schema
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);
            for (const statement of statements) {
                await this.run(statement);
            }
            console.log('✅ Database initialized successfully');
        }
        catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }
    // Promisified database methods
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this);
            });
        });
    }
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }
    // User management methods
    async createUser(userData) {
        const sql = `
      INSERT INTO users (email, password_hash, name, profile_picture, country, timezone, provider, provider_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const result = await this.run(sql, [
            userData.email,
            userData.password_hash,
            userData.name,
            userData.profile_picture,
            userData.country || 'US',
            userData.timezone || 'UTC',
            userData.provider || 'local',
            userData.provider_id
        ]);
        return result.lastID;
    }
    async getUserByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
        return await this.get(sql, [email]);
    }
    async getUserById(id) {
        const sql = 'SELECT * FROM users WHERE id = ? AND is_active = 1';
        return await this.get(sql, [id]);
    }
    async getUserByProvider(provider, providerId) {
        const sql = 'SELECT * FROM users WHERE provider = ? AND provider_id = ? AND is_active = 1';
        return await this.get(sql, [provider, providerId]);
    }
    async updateUserLastLogin(id) {
        const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
        await this.run(sql, [id]);
    }
    // Session management methods
    async createSession(userId, token, expiresAt) {
        const sql = 'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)';
        await this.run(sql, [userId, token, expiresAt.toISOString()]);
    }
    async getSession(token) {
        const sql = 'SELECT user_id, expires_at FROM user_sessions WHERE session_token = ?';
        return await this.get(sql, [token]);
    }
    async deleteSession(token) {
        const sql = 'DELETE FROM user_sessions WHERE session_token = ?';
        await this.run(sql, [token]);
    }
    async deleteExpiredSessions() {
        const sql = 'DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP';
        await this.run(sql);
    }
    // Calendar event methods
    async createEvent(eventData) {
        const sql = `
      INSERT INTO calendar_events (user_id, title, description, start_datetime, end_datetime, timezone, is_all_day, is_holiday, holiday_country, location, event_type, google_event_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const result = await this.run(sql, [
            eventData.user_id,
            eventData.title,
            eventData.description,
            eventData.start_datetime,
            eventData.end_datetime,
            eventData.timezone,
            eventData.is_all_day || false,
            eventData.is_holiday || false,
            eventData.holiday_country,
            eventData.location,
            eventData.event_type || 'personal',
            eventData.google_event_id
        ]);
        return result.lastID;
    }
    async getEventsByUser(userId, startDate, endDate) {
        let sql = 'SELECT * FROM calendar_events WHERE user_id = ?';
        const params = [userId];
        if (startDate && endDate) {
            sql += ' AND start_datetime >= ? AND start_datetime <= ?';
            params.push(startDate, endDate);
        }
        sql += ' ORDER BY start_datetime ASC';
        return await this.all(sql, params);
    }
    async updateEvent(id, eventData) {
        const sql = `
      UPDATE calendar_events 
      SET title = ?, description = ?, start_datetime = ?, end_datetime = ?, timezone = ?, is_all_day = ?, location = ?, event_type = ?
      WHERE id = ?
    `;
        await this.run(sql, [
            eventData.title,
            eventData.description,
            eventData.start_datetime,
            eventData.end_datetime,
            eventData.timezone,
            eventData.is_all_day,
            eventData.location,
            eventData.event_type,
            id
        ]);
    }
    async deleteEvent(id) {
        const sql = 'DELETE FROM calendar_events WHERE id = ?';
        await this.run(sql, [id]);
    }
    // Notes methods
    async createNote(noteData) {
        const sql = `
      INSERT INTO notes (user_id, title, content, password_hash, category, is_encrypted)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        const result = await this.run(sql, [
            noteData.user_id,
            noteData.title,
            noteData.content,
            noteData.password_hash,
            noteData.category || 'general',
            noteData.is_encrypted || false
        ]);
        return result.lastID;
    }
    async getNotesByUser(userId, category) {
        let sql = 'SELECT * FROM notes WHERE user_id = ?';
        const params = [userId];
        if (category) {
            sql += ' AND category = ?';
            params.push(category);
        }
        sql += ' ORDER BY updated_at DESC';
        return await this.all(sql, params);
    }
    async updateNote(id, noteData) {
        const sql = `
      UPDATE notes 
      SET title = ?, content = ?, password_hash = ?, category = ?, is_encrypted = ?
      WHERE id = ?
    `;
        await this.run(sql, [
            noteData.title,
            noteData.content,
            noteData.password_hash,
            noteData.category,
            noteData.is_encrypted,
            id
        ]);
    }
    async deleteNote(id) {
        const sql = 'DELETE FROM notes WHERE id = ?';
        await this.run(sql, [id]);
    }
    // Holiday methods
    async createHoliday(holidayData) {
        const sql = `
      INSERT OR IGNORE INTO holidays (country_code, holiday_name, holiday_date, holiday_type)
      VALUES (?, ?, ?, ?)
    `;
        const result = await this.run(sql, [
            holidayData.country_code,
            holidayData.holiday_name,
            holidayData.holiday_date,
            holidayData.holiday_type || 'public'
        ]);
        return result.lastID;
    }
    async getHolidaysByCountry(countryCode, year) {
        let sql = 'SELECT * FROM holidays WHERE country_code = ?';
        const params = [countryCode];
        if (year) {
            sql += ' AND strftime("%Y", holiday_date) = ?';
            params.push(year.toString());
        }
        sql += ' ORDER BY holiday_date ASC';
        return await this.all(sql, params);
    }
    // User preferences methods
    async setUserPreference(userId, key, value) {
        const sql = `
      INSERT OR REPLACE INTO user_preferences (user_id, preference_key, preference_value)
      VALUES (?, ?, ?)
    `;
        await this.run(sql, [userId, key, value]);
    }
    async getUserPreference(userId, key) {
        const sql = 'SELECT preference_value FROM user_preferences WHERE user_id = ? AND preference_key = ?';
        const result = await this.get(sql, [userId, key]);
        return result?.preference_value || null;
    }
    async getUserPreferences(userId) {
        const sql = 'SELECT * FROM user_preferences WHERE user_id = ?';
        return await this.all(sql, [userId]);
    }
    // Cleanup methods
    async close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    // Maintenance methods
    async cleanupExpiredSessions() {
        await this.deleteExpiredSessions();
    }
    async getDatabaseStats() {
        const [users, events, notes, holidays] = await Promise.all([
            this.get('SELECT COUNT(*) as count FROM users'),
            this.get('SELECT COUNT(*) as count FROM calendar_events'),
            this.get('SELECT COUNT(*) as count FROM notes'),
            this.get('SELECT COUNT(*) as count FROM holidays')
        ]);
        return {
            users: users.count,
            events: events.count,
            notes: notes.count,
            holidays: holidays.count
        };
    }
}
// Export singleton instance
export const database = new Database();
export default database;
//# sourceMappingURL=database.js.map