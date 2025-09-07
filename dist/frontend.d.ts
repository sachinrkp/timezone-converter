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
declare let formSubmissionCount: number;
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
    timeDifference: HTMLDivElement;
    darkToggle: HTMLButtonElement;
    swapZones: HTMLButtonElement;
    errorMessage: HTMLDivElement;
    loadingSpinner: HTMLDivElement;
    submitBtn: HTMLButtonElement;
    resetBtn: HTMLButtonElement;
    presetButtons: NodeListOf<HTMLButtonElement>;
};
declare const utils: {
    two: (n: number) => string;
    formatLocal: (utcMs: number, timeZone: string) => string;
    getHM: (utcMs: number, timeZone: string) => {
        h: number;
        m: number;
    };
    cityTimezoneCache: Map<string, string>;
    loadCityTimezoneMappings(): Promise<void>;
    loadDefaultCityMappings(): void;
    normalizeTimezone: (timeZone: string) => string;
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
    private cityMappings;
    constructor(input: HTMLInputElement, dropdown: HTMLDivElement);
    setOptions(options: string[]): void;
    setCityMappings(mappings: Map<string, string>): void;
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
    humanToEpoch: (date: string, time: string) => number;
    epochToHuman: (epoch: number) => string;
};
declare const ageCalculator: {
    calculateAge: (birthDate: string) => {
        years: number;
        months: number;
        days: number;
        totalDays: number;
    };
    formatAge: (age: {
        years: number;
        months: number;
        days: number;
        totalDays: number;
    }) => string;
};
declare const dateDifferenceCalculator: {
    calculateDifference: (startDate: string, endDate: string) => {
        years: number;
        months: number;
        days: number;
        totalDays: number;
    };
    formatDifference: (diff: {
        years: number;
        months: number;
        days: number;
        totalDays: number;
    }) => string;
};
declare const dateArithmeticCalculator: {
    addToDate: (baseDate: string, years: number, months: number, days: number) => Date;
    formatDate: (date: Date) => string;
};
interface CurrencyData {
    code: string;
    name: string;
    country: string;
    flag: string;
    flagClass: string;
}
declare const currencyConverter: {
    currencies: CurrencyData[];
    exchangeRates: {
        [key: string]: number;
    };
    lastUpdated: Date | null;
    loadCurrencies(): Promise<void>;
    getFlagClass(currencyCode: string): string;
    loadDefaultCurrencies(): void;
    populateCurrencyDropdowns(): void;
    fetchExchangeRates(): Promise<void>;
    convert: (amount: number, fromCurrency: string, toCurrency: string) => {
        convertedAmount: number;
        rate: number;
    };
    formatCurrency: (amount: number, currency: string) => string;
};
declare const ui: {
    updateResults: (data: ConvertTimeResponse) => void;
    updateEpochTimes: () => void;
    initSliders: () => void;
    updateTimelineForTimezones: () => void;
    updateSliderLabels: (srcOffsetMinutes: number, tgtOffsetMinutes: number) => void;
    updateEpochTimesForSlider: (srcTimeMs: number, tgtTimeMs: number) => void;
};
declare const theme: {
    init: () => void;
    toggle: () => void;
};
declare const setupEventListeners: () => void;
declare const loadCurrentTimes: () => Promise<void>;
declare const initApp: () => Promise<void>;
interface FirebaseUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    providerId: string;
}
interface User {
    id: number;
    email: string;
    name: string;
    country: string;
    timezone: string;
    profile_picture?: string;
    provider: string;
    created_at: string;
    last_login?: string;
}
interface AuthResponse {
    user: User;
    token: string;
    message: string;
}
declare class AuthManager {
    private currentUser;
    private authToken;
    private isLoginMode;
    private firebaseAuth;
    constructor();
    private initializeFirebase;
    private loadStoredAuth;
    private handleFirebaseUser;
    private setupEventListeners;
    private showAuthModal;
    private hideAuthModal;
    private toggleAuthMode;
    private resetForms;
    private handleLogin;
    private handleRegister;
    private handleSocialLogin;
    private getFirebaseErrorMessage;
    private updateTimezoneFromCountry;
    private handleLogout;
    private toggleProfileDropdown;
    private hideProfileDropdown;
    private validatePassword;
    private saveAuth;
    private clearAuth;
    private updateUI;
    private showError;
    private showSuccess;
    isAuthenticated(): boolean;
    getCurrentUser(): User | null;
    getAuthToken(): string | null;
    makeAuthenticatedRequest(url: string, options?: RequestInit): Promise<Response>;
}
declare const authManager: AuthManager;
//# sourceMappingURL=frontend.d.ts.map