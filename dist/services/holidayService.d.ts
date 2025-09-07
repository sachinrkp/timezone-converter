import { Holiday } from '../database/database.js';
export interface HolidayAPIResponse {
    date: string;
    name: string;
    type: string;
    country: string;
}
export interface HolidayProvider {
    name: string;
    getHolidays(country: string, year: number): Promise<HolidayAPIResponse[]>;
}
declare class HolidayService {
    private providers;
    getHolidays(country: string, year: number): Promise<Holiday[]>;
    getHolidaysForCountries(countries: string[], year: number): Promise<{
        [country: string]: Holiday[];
    }>;
    getUpcomingHolidays(country: string, limit?: number): Promise<Holiday[]>;
    getHolidaysInRange(country: string, startDate: string, endDate: string): Promise<Holiday[]>;
    getSupportedCountries(): string[];
    clearCachedHolidays(country: string, year?: number): Promise<void>;
    getHolidayStats(): Promise<{
        totalHolidays: number;
        countriesWithHolidays: number;
        mostRecentHoliday: Holiday | null;
        upcomingHoliday: Holiday | null;
    }>;
}
export declare const holidayService: HolidayService;
export default holidayService;
//# sourceMappingURL=holidayService.d.ts.map