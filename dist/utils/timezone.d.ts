export declare const utils: {
    formatLocal: (utcMs: number, timeZone: string) => string;
    getHM: (utcMs: number, timeZone: string) => {
        h: number;
        m: number;
    };
    tzOffsetMinutes: (utcMs: number, timeZone: string) => number;
    wallTimeToUtcMs: (year: number, month: number, day: number, hour: number, minute: number, timeZone: string) => number;
};
//# sourceMappingURL=timezone.d.ts.map