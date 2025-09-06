export const utils = {
  formatLocal: (utcMs: number, timeZone: string): string => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return fmt.format(new Date(utcMs)).replace(',', '');
  },

  getHM: (utcMs: number, timeZone: string): { h: number; m: number } => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date(utcMs));
    const map = Object.fromEntries(
      parts
        .filter(p => p.type !== 'literal')
        .map(p => [p.type, p.value])
    );
    return {
      h: parseInt(map.hour as string, 10),
      m: parseInt(map.minute as string, 10),
    };
  },

  tzOffsetMinutes: (utcMs: number, timeZone: string): number => {
    const d = new Date(utcMs);
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(d);
    const map = Object.fromEntries(
      parts
        .filter(p => p.type !== 'literal')
        .map(p => [p.type, p.value])
    );
    const asUTC = Date.UTC(
      parseInt(map.year as string, 10),
      parseInt(map.month as string, 10) - 1,
      parseInt(map.day as string, 10),
      parseInt(map.hour as string, 10),
      parseInt(map.minute as string, 10),
      parseInt(map.second as string, 10)
    );
    return (asUTC - utcMs) / 60000;
  },

  wallTimeToUtcMs: (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    timeZone: string
  ): number => {
    let guess = Date.UTC(year, month - 1, day, hour, minute, 0);
    let offset1 = utils.tzOffsetMinutes(guess, timeZone);
    let utc = Date.UTC(year, month - 1, day, hour, minute, 0) - offset1 * 60000;
    let offset2 = utils.tzOffsetMinutes(utc, timeZone);
    if (offset2 !== offset1) {
      utc = Date.UTC(year, month - 1, day, hour, minute, 0) - offset2 * 60000;
    }
    return utc;
  },
};
