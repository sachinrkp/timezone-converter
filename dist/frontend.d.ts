interface SpeedInsightsWindow {
    si?: (event: string, properties?: Record<string, any>) => void;
}
interface TimezoneData {
    zoneName: string;
    gmtOffset: number;
    timestamp: number;
    dst: string;
}
interface ConvertTimeResponse {
    convertedTime: string;
    fromCurrent: string;
    toCurrent: string;
    dst: boolean;
}
interface TimezoneResponse {
    zones: string[];
}
declare class AppState {
    private _allZones;
    private _inputUtcMs;
    private _diffMinutesAtInput;
    private _fromZoneGlobal;
    private _toZoneGlobal;
    private _isLoading;
    get allZones(): string[];
    set allZones(zones: string[]);
    get inputUtcMs(): number | null;
    set inputUtcMs(ms: number | null);
    get diffMinutesAtInput(): number;
    set diffMinutesAtInput(minutes: number);
    get fromZoneGlobal(): string;
    set fromZoneGlobal(zone: string);
    get toZoneGlobal(): string;
    set toZoneGlobal(zone: string);
    get isLoading(): boolean;
    set isLoading(loading: boolean);
    private updateLoadingState;
}
declare const appState: AppState;
declare const elements: {
    sourceAutocomplete: HTMLInputElement;
    targetAutocomplete: HTMLInputElement;
    sourceDropdown: HTMLDivElement;
    targetDropdown: HTMLDivElement;
    form: HTMLFormElement;
    result: HTMLDivElement;
    currentTimes: HTMLDivElement;
    dstStatus: HTMLDivElement;
    sourceSlider: HTMLInputElement;
    targetSlider: HTMLInputElement;
    sourceTimeLabel: HTMLDivElement;
    targetTimeLabel: HTMLDivElement;
    hourDifference: HTMLDivElement;
    darkToggle: HTMLButtonElement;
    swapZones: HTMLButtonElement;
    errorMessage: HTMLDivElement;
    loadingSpinner: HTMLDivElement;
    submitBtn: HTMLButtonElement;
    presetButtons: NodeListOf<HTMLButtonElement>;
};
declare const utils: {
    two: (n: number) => string;
    formatLocal: (utcMs: number, timeZone: string) => string;
    getHM: (utcMs: number, timeZone: string) => {
        h: number;
        m: number;
    };
    tzOffsetMinutes: (utcMs: number, timeZone: string) => number;
    wallTimeToUtcMs: (year: number, month: number, day: number, hour: number, minute: number, timeZone: string) => number;
    showError: (message: string) => void;
    showSuccess: (message: string) => void;
};
declare class AutocompleteHandler {
    private input;
    private dropdown;
    private allOptions;
    private filteredOptions;
    private selectedIndex;
    constructor(input: HTMLInputElement, dropdown: HTMLDivElement);
    setOptions(options: string[]): void;
    private setupEventListeners;
    private handleInput;
    private getCityName;
    private handleKeydown;
    private renderDropdown;
    private updateSelection;
    private selectOption;
    private showDropdown;
    private hideDropdown;
    setValue(value: string): void;
}
declare const api: {
    fetchTimezones(): Promise<string[]>;
    fetchCurrentTime(): Promise<{
        utc: string;
        local: string;
        timestamp: number;
    }>;
    convertTime(fromZone: string, toZone: string, date: string, time: string): Promise<ConvertTimeResponse | null>;
};
declare const epochConverter: {
    humanToEpoch: (date: string, time: string, timezone: string) => number;
    epochToHuman: (epoch: number, timezone: string) => string;
};
declare const ui: {
    updateResults: (data: ConvertTimeResponse) => void;
    initSliders: () => void;
    updateTimelineForTimezones: () => void;
    updateSliderLabels: (srcOffsetMinutes: number, tgtOffsetMinutes: number) => void;
};
declare const theme: {
    init: () => void;
    toggle: () => void;
};
declare const setupEventListeners: () => void;
declare const loadCurrentTimes: () => Promise<void>;
declare const initApp: () => Promise<void>;
//# sourceMappingURL=frontend.d.ts.map