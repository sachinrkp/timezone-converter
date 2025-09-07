import sqlite3 from 'sqlite3';
export interface User {
    id: number;
    email: string;
    password_hash?: string;
    name: string;
    profile_picture?: string;
    country: string;
    timezone: string;
    provider: string;
    provider_id?: string;
    created_at: string;
    updated_at: string;
    last_login?: string;
    is_active: boolean;
}
export interface CalendarEvent {
    id: number;
    user_id: number;
    title: string;
    description?: string;
    start_datetime: string;
    end_datetime: string;
    timezone: string;
    is_all_day: boolean;
    is_holiday: boolean;
    holiday_country?: string;
    location?: string;
    event_type: string;
    google_event_id?: string;
    created_at: string;
    updated_at: string;
}
export interface Note {
    id: number;
    user_id: number;
    title: string;
    content: string;
    password_hash?: string;
    category: string;
    is_encrypted: boolean;
    created_at: string;
    updated_at: string;
}
export interface Holiday {
    id: number;
    country_code: string;
    holiday_name: string;
    holiday_date: string;
    holiday_type: string;
    created_at: string;
}
export interface UserPreference {
    id: number;
    user_id: number;
    preference_key: string;
    preference_value?: string;
    created_at: string;
    updated_at: string;
}
declare class Database {
    private db;
    private dbPath;
    constructor(dbPath?: string);
    private ensureDataDirectory;
    private initializeDatabase;
    run(sql: string, params?: any[]): Promise<sqlite3.RunResult>;
    get(sql: string, params?: any[]): Promise<any>;
    all(sql: string, params?: any[]): Promise<any[]>;
    createUser(userData: Partial<User>): Promise<number>;
    getUserByEmail(email: string): Promise<User | null>;
    getUserById(id: number): Promise<User | null>;
    getUserByProvider(provider: string, providerId: string): Promise<User | null>;
    updateUserLastLogin(id: number): Promise<void>;
    createSession(userId: number, token: string, expiresAt: Date): Promise<void>;
    getSession(token: string): Promise<{
        user_id: number;
        expires_at: string;
    } | null>;
    deleteSession(token: string): Promise<void>;
    deleteExpiredSessions(): Promise<void>;
    createEvent(eventData: Partial<CalendarEvent>): Promise<number>;
    getEventsByUser(userId: number, startDate?: string, endDate?: string): Promise<CalendarEvent[]>;
    updateEvent(id: number, eventData: Partial<CalendarEvent>): Promise<void>;
    deleteEvent(id: number): Promise<void>;
    createNote(noteData: Partial<Note>): Promise<number>;
    getNotesByUser(userId: number, category?: string): Promise<Note[]>;
    updateNote(id: number, noteData: Partial<Note>): Promise<void>;
    deleteNote(id: number): Promise<void>;
    createHoliday(holidayData: Partial<Holiday>): Promise<number>;
    getHolidaysByCountry(countryCode: string, year?: number): Promise<Holiday[]>;
    setUserPreference(userId: number, key: string, value: string): Promise<void>;
    getUserPreference(userId: number, key: string): Promise<string | null>;
    getUserPreferences(userId: number): Promise<UserPreference[]>;
    close(): Promise<void>;
    cleanupExpiredSessions(): Promise<void>;
    getDatabaseStats(): Promise<{
        users: number;
        events: number;
        notes: number;
        holidays: number;
    }>;
}
export declare const database: Database;
export default database;
//# sourceMappingURL=database.d.ts.map