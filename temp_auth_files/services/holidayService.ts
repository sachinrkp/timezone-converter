import fetch from 'node-fetch';
import { database, Holiday } from '../database/database.js';

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

class HolidayAPIProvider implements HolidayProvider {
  name = 'HolidayAPI';

  async getHolidays(country: string, year: number): Promise<HolidayAPIResponse[]> {
    try {
      // Using a free holiday API (you can replace with your preferred service)
      const apiKey = process.env.HOLIDAY_API_KEY || 'your-holiday-api-key';
      const url = `https://holidayapi.com/v1/holidays?key=${apiKey}&country=${country}&year=${year}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Holiday API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      if (data.status !== 200) {
        throw new Error(`Holiday API error: ${data.error}`);
      }

      return data.holidays.map((holiday: any) => ({
        date: holiday.date,
        name: holiday.name,
        type: holiday.type || 'public',
        country: country.toUpperCase()
      }));
    } catch (error) {
      console.error('HolidayAPI error:', error);
      return [];
    }
  }
}

class CalendarificProvider implements HolidayProvider {
  name = 'Calendarific';

  async getHolidays(country: string, year: number): Promise<HolidayAPIResponse[]> {
    try {
      const apiKey = process.env.CALENDARIFIC_API_KEY || 'your-calendarific-api-key';
      const url = `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=${country}&year=${year}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Calendarific API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      if (data.meta.code !== 200) {
        throw new Error(`Calendarific API error: ${data.meta.error_detail}`);
      }

      return data.response.holidays.map((holiday: any) => ({
        date: holiday.date.iso,
        name: holiday.name,
        type: holiday.type[0] || 'public',
        country: country.toUpperCase()
      }));
    } catch (error) {
      console.error('Calendarific error:', error);
      return [];
    }
  }
}

class HolidayService {
  private providers: HolidayProvider[] = [
    new HolidayAPIProvider(),
    new CalendarificProvider()
  ];

  // Get holidays for a country and year
  async getHolidays(country: string, year: number): Promise<Holiday[]> {
    try {
      // First check if we have cached holidays
      const cachedHolidays = await database.getHolidaysByCountry(country.toUpperCase(), year);
      
      if (cachedHolidays.length > 0) {
        console.log(`Returning ${cachedHolidays.length} cached holidays for ${country} ${year}`);
        return cachedHolidays;
      }

      // Fetch from API providers
      let holidays: HolidayAPIResponse[] = [];
      
      for (const provider of this.providers) {
        try {
          console.log(`Fetching holidays from ${provider.name} for ${country} ${year}`);
          holidays = await provider.getHolidays(country, year);
          
          if (holidays.length > 0) {
            console.log(`Successfully fetched ${holidays.length} holidays from ${provider.name}`);
            break; // Use first successful provider
          }
        } catch (error) {
          console.error(`Provider ${provider.name} failed:`, error);
          continue; // Try next provider
        }
      }

      if (holidays.length === 0) {
        console.log(`No holidays found for ${country} ${year}`);
        return [];
      }

      // Cache holidays in database
      const cachedHolidaysList: Holiday[] = [];
      for (const holiday of holidays) {
        try {
          const holidayId = await database.createHoliday({
            country_code: holiday.country,
            holiday_name: holiday.name,
            holiday_date: holiday.date,
            holiday_type: holiday.type
          });
          
          if (holidayId) {
            cachedHolidaysList.push({
              id: holidayId,
              country_code: holiday.country,
              holiday_name: holiday.name,
              holiday_date: holiday.date,
              holiday_type: holiday.type,
              created_at: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Error caching holiday:', error);
        }
      }

      console.log(`Cached ${cachedHolidaysList.length} holidays for ${country} ${year}`);
      return cachedHolidaysList;
    } catch (error) {
      console.error('Error getting holidays:', error);
      return [];
    }
  }

  // Get holidays for multiple countries
  async getHolidaysForCountries(countries: string[], year: number): Promise<{ [country: string]: Holiday[] }> {
    const results: { [country: string]: Holiday[] } = {};
    
    const promises = countries.map(async (country) => {
      const holidays = await this.getHolidays(country, year);
      results[country.toUpperCase()] = holidays;
    });

    await Promise.all(promises);
    return results;
  }

  // Get upcoming holidays for a country
  async getUpcomingHolidays(country: string, limit: number = 10): Promise<Holiday[]> {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    // Get holidays for current and next year
    const [currentYearHolidays, nextYearHolidays] = await Promise.all([
      this.getHolidays(country, currentYear),
      this.getHolidays(country, nextYear)
    ]);

    const allHolidays = [...currentYearHolidays, ...nextYearHolidays];
    const today = new Date().toISOString().split('T')[0];

    // Filter upcoming holidays and sort by date
    const upcomingHolidays = allHolidays
      .filter(holiday => holiday.holiday_date >= (today || ''))
      .sort((a, b) => a.holiday_date.localeCompare(b.holiday_date))
      .slice(0, limit);

    return upcomingHolidays;
  }

  // Get holidays for a specific date range
  async getHolidaysInRange(country: string, startDate: string, endDate: string): Promise<Holiday[]> {
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }

    const allHolidays: Holiday[] = [];
    for (const year of years) {
      const holidays = await this.getHolidays(country, year);
      allHolidays.push(...holidays);
    }

    // Filter holidays within date range
    return allHolidays.filter(holiday => 
      holiday.holiday_date >= startDate && holiday.holiday_date <= endDate
    );
  }

  // Get supported countries
  getSupportedCountries(): string[] {
    return [
      'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE',
      'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'HU', 'SK',
      'SI', 'HR', 'BG', 'RO', 'GR', 'CY', 'MT', 'LU', 'IE', 'PT',
      'JP', 'KR', 'CN', 'IN', 'SG', 'MY', 'TH', 'PH', 'ID', 'VN',
      'BR', 'MX', 'AR', 'CL', 'CO', 'PE', 'VE', 'UY', 'PY', 'BO',
      'ZA', 'EG', 'NG', 'KE', 'GH', 'MA', 'TN', 'DZ', 'LY', 'SD'
    ];
  }

  // Clear cached holidays for a country/year
  async clearCachedHolidays(country: string, year?: number): Promise<void> {
    try {
      let sql = 'DELETE FROM holidays WHERE country_code = ?';
      const params: any[] = [country.toUpperCase()];

      if (year) {
        sql += ' AND strftime("%Y", holiday_date) = ?';
        params.push(year.toString());
      }

      await database.run(sql, params);
      console.log(`Cleared cached holidays for ${country}${year ? ` ${year}` : ''}`);
    } catch (error) {
      console.error('Error clearing cached holidays:', error);
    }
  }

  // Get holiday statistics
  async getHolidayStats(): Promise<{
    totalHolidays: number;
    countriesWithHolidays: number;
    mostRecentHoliday: Holiday | null;
    upcomingHoliday: Holiday | null;
  }> {
    try {
      const stats = await database.getDatabaseStats();
      const allHolidays = await database.all('SELECT * FROM holidays ORDER BY holiday_date DESC');
      
      const today = new Date().toISOString().split('T')[0];
      const upcomingHoliday = allHolidays.find(h => h.holiday_date >= (today || '')) || null;
      const mostRecentHoliday = allHolidays[0] || null;
      
      const uniqueCountries = await database.all('SELECT DISTINCT country_code FROM holidays');
      
      return {
        totalHolidays: stats.holidays,
        countriesWithHolidays: uniqueCountries.length,
        mostRecentHoliday,
        upcomingHoliday
      };
    } catch (error) {
      console.error('Error getting holiday stats:', error);
      return {
        totalHolidays: 0,
        countriesWithHolidays: 0,
        mostRecentHoliday: null,
        upcomingHoliday: null
      };
    }
  }
}

export const holidayService = new HolidayService();
export default holidayService;
