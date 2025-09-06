import { utils } from '../utils/timezone';

describe('Timezone Utils', () => {
  describe('formatLocal', () => {
    it('should format UTC time to local timezone', () => {
      const utcMs = new Date('2024-01-15T12:00:00Z').getTime();
      const formatted = utils.formatLocal(utcMs, 'America/New_York');
      
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
    });
  });

  describe('getHM', () => {
    it('should extract hours and minutes from UTC time', () => {
      const utcMs = new Date('2024-01-15T12:30:00Z').getTime();
      const { h, m } = utils.getHM(utcMs, 'UTC');
      
      expect(h).toBe(12);
      expect(m).toBe(30);
    });
  });

  describe('tzOffsetMinutes', () => {
    it('should calculate timezone offset in minutes', () => {
      const utcMs = new Date('2024-01-15T12:00:00Z').getTime();
      const offset = utils.tzOffsetMinutes(utcMs, 'America/New_York');
      
      // EST is UTC-5, so offset should be -300 minutes
      expect(offset).toBe(-300);
    });
  });

  describe('wallTimeToUtcMs', () => {
    it('should convert wall time to UTC milliseconds', () => {
      const utcMs = utils.wallTimeToUtcMs(2024, 1, 15, 12, 0, 'UTC');
      const expected = new Date('2024-01-15T12:00:00Z').getTime();
      
      expect(utcMs).toBe(expected);
    });
  });
});
