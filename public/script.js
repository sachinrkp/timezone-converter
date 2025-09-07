"use strict";
// Frontend application for timezone converter
// State management
class AppState {
    _allZones = [];
    _inputUtcMs = null;
    _diffMinutesAtInput = 0;
    _fromZoneGlobal = '';
    _toZoneGlobal = '';
    _isLoading = false;
    get allZones() {
        return this._allZones;
    }
    set allZones(zones) {
        this._allZones = zones;
    }
    get inputUtcMs() {
        return this._inputUtcMs;
    }
    set inputUtcMs(ms) {
        this._inputUtcMs = ms;
    }
    get diffMinutesAtInput() {
        return this._diffMinutesAtInput;
    }
    set diffMinutesAtInput(minutes) {
        this._diffMinutesAtInput = minutes;
    }
    get fromZoneGlobal() {
        return this._fromZoneGlobal;
    }
    set fromZoneGlobal(zone) {
        this._fromZoneGlobal = zone;
    }
    get toZoneGlobal() {
        return this._toZoneGlobal;
    }
    set toZoneGlobal(zone) {
        this._toZoneGlobal = zone;
    }
    get isLoading() {
        return this._isLoading;
    }
    set isLoading(loading) {
        this._isLoading = loading;
        this.updateLoadingState();
    }
    updateLoadingState() {
        const submitBtn = document.getElementById('submitBtn');
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (submitBtn) {
            submitBtn.disabled = this._isLoading;
            submitBtn.textContent = this._isLoading ? 'Converting...' : 'Convert';
        }
        if (loadingSpinner) {
            loadingSpinner.style.display = this._isLoading ? 'inline-block' : 'none';
        }
    }
}
// Global state
const appState = new AppState();
// Form submission counter for debugging
let formSubmissionCount = 0;
// DOM Elements
const elements = {
    sourceAutocomplete: document.getElementById('sourceAutocomplete'),
    targetAutocomplete: document.getElementById('targetAutocomplete'),
    sourceDropdown: document.getElementById('sourceDropdown'),
    targetDropdown: document.getElementById('targetDropdown'),
    form: document.getElementById('converterForm'),
    result: document.getElementById('result'),
    currentTimes: document.getElementById('currentTimes'),
    dstStatus: document.getElementById('dstStatus'),
    sourceSlider: document.getElementById('sourceSlider'),
    targetSlider: document.getElementById('targetSlider'),
    sourceTimeLabel: document.getElementById('sourceTimeLabel'),
    targetTimeLabel: document.getElementById('targetTimeLabel'),
    hourDifference: document.getElementById('hourDifference'),
    timeDifference: document.getElementById('timeDifference'),
    darkToggle: document.getElementById('darkToggle'),
    swapZones: document.getElementById('swapZones'),
    errorMessage: document.getElementById('errorMessage'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    submitBtn: document.getElementById('submitBtn'),
    resetBtn: document.getElementById('resetBtn'),
    presetButtons: document.querySelectorAll('.preset-btn'),
};
// Utility functions
const utils = {
    two: (n) => n.toString().padStart(2, '0'),
    formatLocal: (utcMs, timeZone) => {
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
    getHM: (utcMs, timeZone) => {
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).formatToParts(new Date(utcMs));
        const map = Object.fromEntries(parts
            .filter(p => p.type !== 'literal')
            .map(p => [p.type, p.value]));
        return {
            h: parseInt(map.hour, 10),
            m: parseInt(map.minute, 10),
        };
    },
    // City to timezone mapping cache
    cityTimezoneCache: new Map(),
    // Load city-to-timezone mappings from file
    async loadCityTimezoneMappings() {
        try {
            const response = await fetch('/city-timezone-mapping.txt');
            if (response.ok) {
                const text = await response.text();
                const lines = text.split('\n');
                lines
                    .filter(line => line.trim() && !line.startsWith('#'))
                    .forEach(line => {
                    const parts = line.split('|');
                    if (parts.length >= 2) {
                        const [city, timezone] = parts;
                        const cityKey = city?.trim().toLowerCase() || '';
                        const timezoneValue = timezone?.trim() || '';
                        if (cityKey && timezoneValue) {
                            this.cityTimezoneCache.set(cityKey, timezoneValue);
                        }
                    }
                });
                console.log(`✅ Loaded ${this.cityTimezoneCache.size} city-to-timezone mappings`);
            }
            else {
                console.warn('⚠️ Could not load city-timezone mapping file');
                this.loadDefaultCityMappings();
            }
        }
        catch (error) {
            console.warn('⚠️ Error loading city-timezone mappings:', error);
            this.loadDefaultCityMappings();
        }
    },
    // Load default city mappings if file loading fails
    loadDefaultCityMappings() {
        const defaultMappings = [
            // Indian cities
            ['pune', 'Asia/Kolkata'],
            ['mumbai', 'Asia/Kolkata'],
            ['delhi', 'Asia/Kolkata'],
            ['bangalore', 'Asia/Kolkata'],
            ['chennai', 'Asia/Kolkata'],
            ['hyderabad', 'Asia/Kolkata'],
            ['kolkata', 'Asia/Kolkata'],
            ['calcutta', 'Asia/Kolkata'],
            // US cities
            ['new york', 'America/New_York'],
            ['chicago', 'America/Chicago'],
            ['los angeles', 'America/Los_Angeles'],
            ['denver', 'America/Denver'],
            ['phoenix', 'America/Phoenix'],
            // European cities
            ['london', 'Europe/London'],
            ['dublin', 'Europe/Dublin'],
            ['paris', 'Europe/Paris'],
            ['berlin', 'Europe/Berlin'],
            ['rome', 'Europe/Rome'],
            ['madrid', 'Europe/Madrid'],
            // Asian cities
            ['tokyo', 'Asia/Tokyo'],
            ['shanghai', 'Asia/Shanghai'],
            ['seoul', 'Asia/Seoul'],
            ['singapore', 'Asia/Singapore'],
            ['hong kong', 'Asia/Hong_Kong'],
            // Australian cities
            ['sydney', 'Australia/Sydney'],
            ['melbourne', 'Australia/Melbourne'],
            ['perth', 'Australia/Perth']
        ];
        defaultMappings.forEach(([city, timezone]) => {
            if (city && timezone) {
                this.cityTimezoneCache.set(city.toLowerCase(), timezone);
            }
        });
        console.log(`✅ Loaded ${this.cityTimezoneCache.size} default city mappings`);
    },
    // Normalize timezone names to valid IANA timezone identifiers
    normalizeTimezone: (timeZone) => {
        // First, try to find city in our mapping
        const cityKey = timeZone.toLowerCase().trim();
        if (utils.cityTimezoneCache.has(cityKey)) {
            const mappedTimezone = utils.cityTimezoneCache.get(cityKey);
            console.log(`🗺️ Mapped city "${timeZone}" to timezone "${mappedTimezone}"`);
            return mappedTimezone || 'UTC';
        }
        // Check if it's already a valid IANA timezone
        try {
            new Intl.DateTimeFormat('en-GB', { timeZone }).format(new Date());
            return timeZone;
        }
        catch (error) {
            console.warn(`⚠️ Invalid timezone "${timeZone}", falling back to UTC`);
            return 'UTC';
        }
    },
    tzOffsetMinutes: (utcMs, timeZone) => {
        // Validate and normalize timezone
        const normalizedTimeZone = utils.normalizeTimezone(timeZone);
        const d = new Date(utcMs);
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: normalizedTimeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).formatToParts(d);
        const map = Object.fromEntries(parts
            .filter(p => p.type !== 'literal')
            .map(p => [p.type, p.value]));
        const asUTC = Date.UTC(parseInt(map.year, 10), parseInt(map.month, 10) - 1, parseInt(map.day, 10), parseInt(map.hour, 10), parseInt(map.minute, 10), parseInt(map.second, 10));
        return (asUTC - utcMs) / 60000;
    },
    wallTimeToUtcMs: (year, month, day, hour, minute, timeZone) => {
        let guess = Date.UTC(year, month - 1, day, hour, minute, 0);
        let offset1 = utils.tzOffsetMinutes(guess, timeZone);
        let utc = Date.UTC(year, month - 1, day, hour, minute, 0) - offset1 * 60000;
        let offset2 = utils.tzOffsetMinutes(utc, timeZone);
        if (offset2 !== offset1) {
            utc = Date.UTC(year, month - 1, day, hour, minute, 0) - offset2 * 60000;
        }
        return utc;
    },
    showError: (message) => {
        if (elements.errorMessage) {
            elements.errorMessage.textContent = message;
            elements.errorMessage.style.display = 'block';
            setTimeout(() => {
                elements.errorMessage.style.display = 'none';
            }, 5000);
        }
    },
    showSuccess: (message) => {
        console.log('Success:', message);
    },
};
// Autocomplete functionality
class AutocompleteHandler {
    input;
    dropdown;
    allOptions = [];
    filteredOptions = [];
    selectedIndex = -1;
    cityMappings = new Map();
    constructor(input, dropdown) {
        this.input = input;
        this.dropdown = dropdown;
        this.setupEventListeners();
    }
    setOptions(options) {
        this.allOptions = options;
    }
    setCityMappings(mappings) {
        this.cityMappings = mappings;
    }
    setupEventListeners() {
        this.input.addEventListener('input', () => this.handleInput());
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.input.addEventListener('blur', () => {
            setTimeout(() => this.hideDropdown(), 200);
        });
        this.input.addEventListener('focus', () => {
            if (this.input.value.length > 0) {
                this.handleInput();
            }
        });
    }
    handleInput() {
        const query = this.input.value.toLowerCase();
        // First, filter timezone options
        const timezoneFiltered = this.allOptions.filter(option => option.toLowerCase().includes(query) ||
            option.toLowerCase().replace(/_/g, ' ').includes(query) ||
            this.getCityName(option).toLowerCase().includes(query));
        // Then, add city suggestions from our mapping
        const citySuggestions = [];
        this.cityMappings.forEach((timezone, city) => {
            if (city.toLowerCase().includes(query) && !timezoneFiltered.includes(timezone)) {
                citySuggestions.push(`${city} (${timezone})`);
            }
        });
        // Combine and remove duplicates
        this.filteredOptions = [...new Set([...timezoneFiltered, ...citySuggestions])];
        this.selectedIndex = -1;
        this.renderDropdown();
    }
    getCityName(timezone) {
        // Extract city name from timezone string
        const parts = timezone.split('/');
        if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            return lastPart ? lastPart.replace(/_/g, ' ') : timezone;
        }
        return timezone;
    }
    handleKeydown(e) {
        if (!this.dropdown.classList.contains('hidden')) {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredOptions.length - 1);
                    this.updateSelection();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                    this.updateSelection();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredOptions.length) {
                        const selectedOption = this.filteredOptions[this.selectedIndex];
                        if (selectedOption) {
                            this.selectOption(selectedOption);
                        }
                    }
                    break;
                case 'Escape':
                    this.hideDropdown();
                    break;
            }
        }
    }
    renderDropdown() {
        if (this.filteredOptions.length === 0) {
            this.hideDropdown();
            return;
        }
        this.dropdown.innerHTML = '';
        this.filteredOptions.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm flex justify-between items-center';
            const cityName = this.getCityName(option);
            const timezoneCode = option;
            optionElement.innerHTML = `
        <span class="font-medium">${cityName}</span>
        <span class="text-gray-500 dark:text-gray-400 text-xs">${timezoneCode}</span>
      `;
            optionElement.addEventListener('click', () => this.selectOption(option));
            this.dropdown.appendChild(optionElement);
        });
        this.showDropdown();
    }
    updateSelection() {
        const options = this.dropdown.querySelectorAll('div');
        options.forEach((option, index) => {
            if (index === this.selectedIndex) {
                option.classList.add('bg-indigo-100', 'dark:bg-indigo-900/30');
            }
            else {
                option.classList.remove('bg-indigo-100', 'dark:bg-indigo-900/30');
            }
        });
    }
    selectOption(option) {
        // Handle city suggestions format: "City (Timezone)"
        if (option.includes(' (')) {
            const timezoneMatch = option.match(/\(([^)]+)\)/);
            if (timezoneMatch && timezoneMatch[1]) {
                this.input.value = timezoneMatch[1]; // Set the timezone
            }
            else {
                this.input.value = option;
            }
        }
        else {
            this.input.value = option;
        }
        this.hideDropdown();
        this.input.dispatchEvent(new Event('change'));
    }
    showDropdown() {
        this.dropdown.classList.remove('hidden');
    }
    hideDropdown() {
        this.dropdown.classList.add('hidden');
    }
    setValue(value) {
        this.input.value = value;
    }
}
// API functions
const api = {
    async fetchTimezones() {
        try {
            console.log('🔄 Fetching timezones from API...');
            const response = await fetch('/api/timezones');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('✅ Timezones fetched successfully:', data.zones?.length, 'timezones');
            console.log('📋 Sample timezones:', data.zones?.slice(0, 10));
            return data.zones || [];
        }
        catch (error) {
            console.error('❌ Failed to fetch timezones:', error);
            utils.showError('Failed to load timezones. Please refresh the page.');
            return [];
        }
    },
    async fetchCurrentTime() {
        try {
            const response = await fetch('/api/current-time');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('❌ Failed to fetch current time:', error);
            // Fallback to client-side time
            const now = new Date();
            return {
                utc: now.toISOString(),
                local: now.toLocaleString(),
                timestamp: now.getTime()
            };
        }
    },
    async convertTime(fromZone, toZone, date, time) {
        try {
            appState.isLoading = true;
            const response = await fetch('/api/convert-time', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fromZone, toZone, date, time }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error('Error converting time:', error);
            utils.showError(error instanceof Error ? error.message : 'Failed to convert time');
            return null;
        }
        finally {
            appState.isLoading = false;
        }
    },
};
// Epoch converter functions
const epochConverter = {
    humanToEpoch: (date, time) => {
        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes, seconds] = time.split(':').map(Number);
        if (!year || !month || !day || hours === undefined || minutes === undefined || seconds === undefined) {
            throw new Error('Invalid date or time format');
        }
        // Create a date string in ISO format
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        // Create a Date object - this will be interpreted as local time
        const localDate = new Date(dateStr);
        // Simply return the epoch time in seconds
        return Math.floor(localDate.getTime() / 1000);
    },
    epochToHuman: (epoch) => {
        const date = new Date(epoch * 1000);
        const options = {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            weekday: 'long'
        };
        return date.toLocaleString('en-GB', options);
    }
};
// Age Calculator functions
const ageCalculator = {
    calculateAge: (birthDate) => {
        const birth = new Date(birthDate);
        const today = new Date();
        if (birth > today) {
            throw new Error('Birth date cannot be in the future');
        }
        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let days = today.getDate() - birth.getDate();
        if (days < 0) {
            months--;
            const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += lastMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }
        const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
        return { years, months, days, totalDays };
    },
    formatAge: (age) => {
        const parts = [];
        if (age.years > 0)
            parts.push(`${age.years} year${age.years !== 1 ? 's' : ''}`);
        if (age.months > 0)
            parts.push(`${age.months} month${age.months !== 1 ? 's' : ''}`);
        if (age.days > 0)
            parts.push(`${age.days} day${age.days !== 1 ? 's' : ''}`);
        if (parts.length === 0)
            return 'Less than a day old';
        const mainResult = parts.join(', ');
        return `${mainResult} (${age.totalDays.toLocaleString()} total days)`;
    }
};
// Date Difference Calculator functions
const dateDifferenceCalculator = {
    calculateDifference: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
            throw new Error('Start date cannot be after end date');
        }
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();
        if (days < 0) {
            months--;
            const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
            days += lastMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }
        const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return { years, months, days, totalDays };
    },
    formatDifference: (diff) => {
        const parts = [];
        if (diff.years > 0)
            parts.push(`${diff.years} year${diff.years !== 1 ? 's' : ''}`);
        if (diff.months > 0)
            parts.push(`${diff.months} month${diff.months !== 1 ? 's' : ''}`);
        if (diff.days > 0)
            parts.push(`${diff.days} day${diff.days !== 1 ? 's' : ''}`);
        if (parts.length === 0)
            return 'Same day';
        const mainResult = parts.join(', ');
        return `${mainResult} (${diff.totalDays.toLocaleString()} total days)`;
    }
};
// Date Arithmetic Calculator functions
const dateArithmeticCalculator = {
    addToDate: (baseDate, years, months, days) => {
        const date = new Date(baseDate);
        // Add/subtract years (negative values will subtract)
        if (years !== 0) {
            date.setFullYear(date.getFullYear() + years);
        }
        // Add/subtract months (negative values will subtract)
        if (months !== 0) {
            date.setMonth(date.getMonth() + months);
        }
        // Add/subtract days (negative values will subtract)
        if (days !== 0) {
            date.setDate(date.getDate() + days);
        }
        return date;
    },
    formatDate: (date) => {
        return date.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};
// Currency Converter functions
const currencyConverter = {
    // Currency data loaded from file
    currencies: [],
    // Real-time exchange rates from API
    exchangeRates: {
        USD: 1.0,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.0,
        INR: 75.0,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        CNY: 6.45,
        KRW: 1180.0
    },
    lastUpdated: null,
    // Load currencies from file
    async loadCurrencies() {
        try {
            const response = await fetch('/currencies.txt');
            if (response.ok) {
                const text = await response.text();
                const lines = text.split('\n');
                this.currencies = lines
                    .filter(line => line.trim() && !line.startsWith('#'))
                    .map(line => {
                    const parts = line.split('|');
                    if (parts.length >= 4) {
                        const [code, name, country, flag] = parts;
                        return {
                            code: code?.trim() || '',
                            name: name?.trim() || '',
                            country: country?.trim() || '',
                            flag: flag?.trim() || '',
                            flagClass: this.getFlagClass(code?.trim() || '')
                        };
                    }
                    return null;
                })
                    .filter(currency => currency !== null);
                console.log(`✅ Loaded ${this.currencies.length} currencies from file`);
                this.populateCurrencyDropdowns();
            }
            else {
                console.warn('⚠️ Could not load currencies file, using default currencies');
                this.loadDefaultCurrencies();
            }
        }
        catch (error) {
            console.warn('⚠️ Error loading currencies:', error);
            this.loadDefaultCurrencies();
        }
    },
    // Get flag CSS class for currency code
    getFlagClass(currencyCode) {
        const flagMap = {
            'USD': 'fi fi-us',
            'EUR': 'fi fi-eu',
            'GBP': 'fi fi-gb',
            'JPY': 'fi fi-jp',
            'CHF': 'fi fi-ch',
            'CAD': 'fi fi-ca',
            'AUD': 'fi fi-au',
            'NZD': 'fi fi-nz',
            'INR': 'fi fi-in',
            'CNY': 'fi fi-cn',
            'KRW': 'fi fi-kr',
            'SGD': 'fi fi-sg',
            'HKD': 'fi fi-hk',
            'TWD': 'fi fi-tw',
            'THB': 'fi fi-th',
            'MYR': 'fi fi-my',
            'IDR': 'fi fi-id',
            'PHP': 'fi fi-ph',
            'VND': 'fi fi-vn',
            'PKR': 'fi fi-pk',
            'BDT': 'fi fi-bd',
            'LKR': 'fi fi-lk',
            'NPR': 'fi fi-np',
            'BTN': 'fi fi-bt',
            'MMK': 'fi fi-mm',
            'KHR': 'fi fi-kh',
            'LAK': 'fi fi-la',
            'AED': 'fi fi-ae',
            'SAR': 'fi fi-sa',
            'QAR': 'fi fi-qa',
            'KWD': 'fi fi-kw',
            'BHD': 'fi fi-bh',
            'OMR': 'fi fi-om',
            'JOD': 'fi fi-jo',
            'LBP': 'fi fi-lb',
            'ILS': 'fi fi-il',
            'TRY': 'fi fi-tr',
            'EGP': 'fi fi-eg',
            'ZAR': 'fi fi-za',
            'NGN': 'fi fi-ng',
            'KES': 'fi fi-ke',
            'GHS': 'fi fi-gh',
            'ETB': 'fi fi-et',
            'MAD': 'fi fi-ma',
            'TND': 'fi fi-tn',
            'DZD': 'fi fi-dz',
            'NOK': 'fi fi-no',
            'SEK': 'fi fi-se',
            'DKK': 'fi fi-dk',
            'ISK': 'fi fi-is',
            'PLN': 'fi fi-pl',
            'CZK': 'fi fi-cz',
            'HUF': 'fi fi-hu',
            'RON': 'fi fi-ro',
            'BGN': 'fi fi-bg',
            'HRK': 'fi fi-hr',
            'RSD': 'fi fi-rs',
            'UAH': 'fi fi-ua',
            'RUB': 'fi fi-ru',
            'BYN': 'fi fi-by',
            'BRL': 'fi fi-br',
            'ARS': 'fi fi-ar',
            'CLP': 'fi fi-cl',
            'COP': 'fi fi-co',
            'PEN': 'fi fi-pe',
            'UYU': 'fi fi-uy',
            'PYG': 'fi fi-py',
            'BOB': 'fi fi-bo',
            'VES': 'fi fi-ve',
            'MXN': 'fi fi-mx',
            'GTQ': 'fi fi-gt',
            'HNL': 'fi fi-hn',
            'NIO': 'fi fi-ni',
            'CRC': 'fi fi-cr',
            'PAB': 'fi fi-pa',
            'DOP': 'fi fi-do',
            'JMD': 'fi fi-jm',
            'TTD': 'fi fi-tt',
            'BBD': 'fi fi-bb',
            'KZT': 'fi fi-kz',
            'UZS': 'fi fi-uz',
            'KGS': 'fi fi-kg',
            'TJS': 'fi fi-tj',
            'TMT': 'fi fi-tm',
            'AFN': 'fi fi-af',
            'IRR': 'fi fi-ir',
            'IQD': 'fi fi-iq',
            'YER': 'fi fi-ye',
            'SYP': 'fi fi-sy'
        };
        return flagMap[currencyCode] || 'fi fi-xx';
    },
    // Load default currencies if file loading fails
    loadDefaultCurrencies() {
        this.currencies = [
            { code: 'USD', name: 'US Dollar', country: 'United States', flag: '🇺🇸', flagClass: 'fi fi-us' },
            { code: 'EUR', name: 'Euro', country: 'European Union', flag: '🇪🇺', flagClass: 'fi fi-eu' },
            { code: 'GBP', name: 'British Pound', country: 'United Kingdom', flag: '🇬🇧', flagClass: 'fi fi-gb' },
            { code: 'JPY', name: 'Japanese Yen', country: 'Japan', flag: '🇯🇵', flagClass: 'fi fi-jp' },
            { code: 'INR', name: 'Indian Rupee', country: 'India', flag: '🇮🇳', flagClass: 'fi fi-in' },
            { code: 'CAD', name: 'Canadian Dollar', country: 'Canada', flag: '🇨🇦', flagClass: 'fi fi-ca' },
            { code: 'AUD', name: 'Australian Dollar', country: 'Australia', flag: '🇦🇺', flagClass: 'fi fi-au' },
            { code: 'CHF', name: 'Swiss Franc', country: 'Switzerland', flag: '🇨🇭', flagClass: 'fi fi-ch' },
            { code: 'CNY', name: 'Chinese Yuan', country: 'China', flag: '🇨🇳', flagClass: 'fi fi-cn' },
            { code: 'KRW', name: 'South Korean Won', country: 'South Korea', flag: '🇰🇷', flagClass: 'fi fi-kr' }
        ];
        this.populateCurrencyDropdowns();
    },
    // Populate currency dropdowns with loaded currencies
    populateCurrencyDropdowns() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        if (fromSelect && toSelect) {
            // Clear existing options
            fromSelect.innerHTML = '';
            toSelect.innerHTML = '';
            // Add currency options with flags
            this.currencies.forEach(currency => {
                const option1 = document.createElement('option');
                option1.value = currency.code;
                option1.innerHTML = `<span class="${currency.flagClass}"></span> ${currency.code} - ${currency.name}`;
                fromSelect.appendChild(option1);
                const option2 = document.createElement('option');
                option2.value = currency.code;
                option2.innerHTML = `<span class="${currency.flagClass}"></span> ${currency.code} - ${currency.name}`;
                toSelect.appendChild(option2);
            });
            // Set default selections
            fromSelect.value = 'USD';
            toSelect.value = 'EUR';
        }
    },
    // Fetch real-time exchange rates from Fixer.io (with fallback)
    async fetchExchangeRates() {
        try {
            // Get API configuration from server
            let API_KEY = null;
            try {
                const configResponse = await fetch('/api/config');
                if (configResponse.ok) {
                    const config = await configResponse.json();
                    API_KEY = config.fixerApiKey;
                    console.log('🔑 API key status:', config.hasFixerApiKey ? 'Available' : 'Not configured');
                }
            }
            catch (configError) {
                console.warn('⚠️ Failed to fetch API config:', configError);
            }
            if (API_KEY) {
                // Try Fixer.io first if API key is available
                try {
                    // Get all currency codes from our loaded currencies
                    const currencyCodes = this.currencies.map(c => c.code).join(',');
                    const response = await fetch(`https://data.fixer.io/api/latest?access_key=${API_KEY}&symbols=${currencyCodes}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            // Fixer.io returns rates relative to EUR by default
                            // Convert to USD-based rates for consistency
                            const eurToUsd = data.rates.USD;
                            this.exchangeRates = {
                                USD: 1.0
                            };
                            // Convert all available rates to USD-based
                            Object.keys(data.rates).forEach(currency => {
                                if (currency !== 'USD') {
                                    this.exchangeRates[currency] = data.rates[currency] / eurToUsd;
                                }
                            });
                            this.lastUpdated = new Date();
                            console.log(`✅ Exchange rates updated from Fixer.io for ${Object.keys(this.exchangeRates).length} currencies:`, this.lastUpdated);
                            return;
                        }
                    }
                }
                catch (fixerError) {
                    console.warn('⚠️ Fixer.io API failed, trying fallback:', fixerError);
                }
            }
            else {
                console.log('ℹ️ No Fixer.io API key configured, using fallback API');
            }
            // Fallback to free exchangerate-api.com
            const fallbackResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (!fallbackResponse.ok) {
                throw new Error('Both Fixer.io and fallback API failed');
            }
            const fallbackData = await fallbackResponse.json();
            this.exchangeRates = fallbackData.rates;
            this.lastUpdated = new Date();
            console.log('✅ Exchange rates updated from fallback API:', this.lastUpdated);
        }
        catch (error) {
            console.warn('⚠️ Failed to fetch rates from all sources, using cached rates:', error);
            // Keep using the existing rates if all APIs fail
        }
    },
    convert: (amount, fromCurrency, toCurrency) => {
        if (!currencyConverter.exchangeRates[fromCurrency] || !currencyConverter.exchangeRates[toCurrency]) {
            throw new Error('Unsupported currency');
        }
        // Convert to USD first, then to target currency
        const usdAmount = amount / currencyConverter.exchangeRates[fromCurrency];
        const convertedAmount = usdAmount * currencyConverter.exchangeRates[toCurrency];
        const rate = currencyConverter.exchangeRates[toCurrency] / currencyConverter.exchangeRates[fromCurrency];
        return { convertedAmount, rate };
    },
    formatCurrency: (amount, currency) => {
        const currencySymbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            INR: '₹',
            CAD: 'C$',
            AUD: 'A$',
            CHF: 'CHF',
            CNY: '¥',
            KRW: '₩'
        };
        const symbol = currencySymbols[currency] || currency;
        return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
};
// UI functions
const ui = {
    updateResults: (data) => {
        console.log('🔄 updateResults called with:', {
            resultElement: !!elements.result,
            inputUtcMs: appState.inputUtcMs,
            fromZone: appState.fromZoneGlobal,
            toZone: appState.toZoneGlobal,
            data: data
        });
        if (!elements.result) {
            console.error('❌ Result element not found!');
            return;
        }
        // Make results visible
        elements.result.classList.remove('hidden');
        console.log('✅ Results div made visible');
        const inputTime = utils.formatLocal(appState.inputUtcMs, appState.fromZoneGlobal);
        const convertedTime = utils.formatLocal(appState.inputUtcMs, appState.toZoneGlobal);
        console.log('🔄 Updating results display with:');
        console.log('🔄 Input time:', inputTime);
        console.log('🔄 Converted time:', convertedTime);
        console.log('🔄 From zone:', appState.fromZoneGlobal);
        console.log('🔄 To zone:', appState.toZoneGlobal);
        console.log('🔄 Data passed to updateResults:', data);
        // Force a DOM update by clearing first, then setting new content
        elements.result.innerHTML = '';
        // Add a timestamp to ensure the content is actually being updated
        const timestamp = Date.now();
        console.log('🔄 Updating results HTML with timestamp:', timestamp);
        elements.result.innerHTML = `
      <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
        <div class="flex items-center mb-2">
          <span class="text-2xl mr-2">🕒</span>
          <span class="font-semibold text-green-800 dark:text-green-200">Input Time (${appState.fromZoneGlobal})</span>
        </div>
        <div class="text-lg font-mono text-green-700 dark:text-green-300">
          ${inputTime}
        </div>
        <div class="text-xs text-gray-500 mt-1">Updated: ${new Date(timestamp).toLocaleTimeString()}</div>
      </div>
      
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex items-center mb-2">
          <span class="text-2xl mr-2">➡️</span>
          <span class="font-semibold text-blue-800 dark:text-blue-200">Converted Time (${appState.toZoneGlobal})</span>
        </div>
        <div class="text-lg font-mono text-blue-700 dark:text-blue-300">
          ${convertedTime}
        </div>
        <div class="text-xs text-gray-500 mt-1">Updated: ${new Date(timestamp).toLocaleTimeString()}</div>
      </div>
    `;
        console.log('✅ Results HTML updated');
        if (elements.currentTimes) {
            const now = Date.now();
            elements.currentTimes.innerHTML = `
        <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">🕓 Live Clocks</div>
          <div class="text-sm font-mono">
            <div>${appState.fromZoneGlobal}: ${utils.formatLocal(now, appState.fromZoneGlobal)}</div>
            <div>${appState.toZoneGlobal}: ${utils.formatLocal(now, appState.toZoneGlobal)}</div>
          </div>
        </div>
      `;
        }
        if (elements.dstStatus) {
            const dstActiveNow = utils.tzOffsetMinutes(appState.inputUtcMs, appState.toZoneGlobal) !==
                Math.max(utils.tzOffsetMinutes(Date.UTC(new Date().getFullYear(), 0, 1, 12, 0, 0), appState.toZoneGlobal), utils.tzOffsetMinutes(Date.UTC(new Date().getFullYear(), 6, 1, 12, 0, 0), appState.toZoneGlobal));
            elements.dstStatus.innerHTML = `
        <div class="mt-2 p-2 rounded-lg ${dstActiveNow ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-800'}">
          <span class="text-sm font-medium ${dstActiveNow ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-600 dark:text-gray-400'}">
            ${dstActiveNow ? '✅ Daylight Saving Active' : '❌ Daylight Saving Inactive'}
          </span>
        </div>
      `;
        }
        // Update epoch time displays
        ui.updateEpochTimes();
        ui.initSliders();
    },
    updateEpochTimes: () => {
        const fromEpochElement = document.getElementById('fromEpochTime');
        const toEpochElement = document.getElementById('toEpochTime');
        console.log('🔄 Updating epoch times...', {
            fromEpochElement: !!fromEpochElement,
            toEpochElement: !!toEpochElement,
            inputUtcMs: appState.inputUtcMs,
            fromZone: appState.fromZoneGlobal,
            toZone: appState.toZoneGlobal
        });
        if (fromEpochElement && appState.inputUtcMs && appState.fromZoneGlobal) {
            // From epoch: Convert the displayed from time to epoch
            // Get the date and time from the form inputs
            const dateInput = document.getElementById('date');
            const timeInput = document.getElementById('time');
            if (dateInput && timeInput && dateInput.value && timeInput.value) {
                // Create a date object from the form inputs in the from timezone
                const localDateTime = new Date(`${dateInput.value}T${timeInput.value}`);
                const fromEpoch = Math.floor(localDateTime.getTime() / 1000);
                fromEpochElement.textContent = fromEpoch.toString();
                console.log('✅ From epoch updated:', fromEpoch, 'for local time:', localDateTime);
            }
            else {
                fromEpochElement.textContent = 'Loading...';
                console.log('⚠️ Form inputs not available for from epoch');
            }
        }
        else if (fromEpochElement) {
            fromEpochElement.textContent = 'Loading...';
            console.log('⚠️ From epoch element found but missing data');
        }
        if (toEpochElement && appState.inputUtcMs && appState.toZoneGlobal) {
            // To epoch: Convert the displayed to time to epoch
            // Calculate the converted time and get its epoch
            const convertedTime = utils.formatLocal(appState.inputUtcMs, appState.toZoneGlobal);
            console.log('🔄 Converting to epoch:', convertedTime, 'in timezone:', appState.toZoneGlobal);
            // Parse the converted time string to get date and time components
            const timeMatch = convertedTime.match(/(\d{1,2}):(\d{2})/);
            if (timeMatch && timeMatch[1] && timeMatch[2]) {
                const [, hours, minutes] = timeMatch;
                const dateInput = document.getElementById('date');
                if (dateInput && dateInput.value) {
                    // Create a date object for the converted time
                    const convertedDateTime = new Date(`${dateInput.value}T${hours.padStart(2, '0')}:${minutes}:00`);
                    const toEpoch = Math.floor(convertedDateTime.getTime() / 1000);
                    toEpochElement.textContent = toEpoch.toString();
                    console.log('✅ To epoch updated:', toEpoch, 'for converted time:', convertedDateTime);
                }
                else {
                    toEpochElement.textContent = 'Loading...';
                    console.log('⚠️ Date input not available for to epoch');
                }
            }
            else {
                toEpochElement.textContent = 'Loading...';
                console.log('⚠️ Could not parse converted time:', convertedTime);
            }
        }
        else if (toEpochElement) {
            toEpochElement.textContent = 'Loading...';
            console.log('⚠️ To epoch element found but missing data');
        }
    },
    initSliders: () => {
        if (!elements.sourceSlider || !elements.targetSlider)
            return;
        // Range: -1680 to +1680 minutes relative to input time (28 hours)
        elements.sourceSlider.min = '-1680';
        elements.sourceSlider.max = '1680';
        elements.targetSlider.min = '-1680';
        elements.targetSlider.max = '1680';
        // Position sliders based on input time or current time
        let initialSrcOffset = 0;
        let initialTgtOffset = appState.diffMinutesAtInput;
        if (appState.inputUtcMs) {
            // Position based on input time
            const inputTime = new Date(appState.inputUtcMs);
            const inputHour = inputTime.getUTCHours();
            const inputMinute = inputTime.getUTCMinutes();
            initialSrcOffset = (inputHour * 60 + inputMinute) - (12 * 60); // Relative to noon
        }
        else {
            // Position based on current time
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            initialSrcOffset = (currentHour * 60 + currentMinute) - (12 * 60); // Relative to noon
        }
        initialTgtOffset = initialSrcOffset + appState.diffMinutesAtInput;
        elements.sourceSlider.value = initialSrcOffset.toString();
        elements.targetSlider.value = initialTgtOffset.toString();
        ui.updateSliderLabels(initialSrcOffset, initialTgtOffset);
        elements.sourceSlider.disabled = false;
        elements.targetSlider.disabled = false;
        // Bind events so moving one slider updates the other
        elements.sourceSlider.addEventListener('input', () => {
            const srcOffsetMinutes = parseInt(elements.sourceSlider.value, 10);
            const tgtOffsetMinutes = srcOffsetMinutes + appState.diffMinutesAtInput;
            ui.updateSliderLabels(srcOffsetMinutes, tgtOffsetMinutes);
            elements.targetSlider.value = tgtOffsetMinutes.toString();
        });
        elements.targetSlider.addEventListener('input', () => {
            const tgtOffsetMinutes = parseInt(elements.targetSlider.value, 10);
            const srcOffsetMinutes = tgtOffsetMinutes - appState.diffMinutesAtInput;
            ui.updateSliderLabels(srcOffsetMinutes, tgtOffsetMinutes);
            elements.sourceSlider.value = srcOffsetMinutes.toString();
        });
    },
    updateTimelineForTimezones: () => {
        if (!appState.fromZoneGlobal || !appState.toZoneGlobal)
            return;
        // Calculate time difference between zones
        const now = Date.now();
        const fromOffset = utils.tzOffsetMinutes(now, appState.fromZoneGlobal);
        const toOffset = utils.tzOffsetMinutes(now, appState.toZoneGlobal);
        appState.diffMinutesAtInput = toOffset - fromOffset;
        // Update time difference display
        const diffHours = (appState.diffMinutesAtInput / 60).toFixed(1);
        if (elements.timeDifference) {
            elements.timeDifference.textContent = `Time Difference: ${diffHours} hours`;
        }
        if (elements.hourDifference) {
            elements.hourDifference.textContent = `🕓 Time Difference: ${diffHours} hours`;
        }
        // Update slider positions based on input time or current time
        let srcOffset, tgtOffset;
        if (appState.inputUtcMs) {
            // Use input time if available
            const inputTime = new Date(appState.inputUtcMs);
            const inputHour = inputTime.getUTCHours();
            const inputMinute = inputTime.getUTCMinutes();
            srcOffset = (inputHour * 60 + inputMinute) - (12 * 60); // Relative to noon
        }
        else {
            // Fall back to current time
            const currentTime = new Date();
            const currentHour = currentTime.getHours();
            const currentMinute = currentTime.getMinutes();
            srcOffset = (currentHour * 60 + currentMinute) - (12 * 60);
        }
        tgtOffset = srcOffset + appState.diffMinutesAtInput;
        if (elements.sourceSlider && elements.targetSlider) {
            elements.sourceSlider.value = srcOffset.toString();
            elements.targetSlider.value = tgtOffset.toString();
            ui.updateSliderLabels(srcOffset, tgtOffset);
        }
        else {
            // If sliders don't exist yet, just update the labels with current time
            const now = Date.now();
            const currentHour = new Date().getHours();
            const currentMinute = new Date().getMinutes();
            const currentOffsetFromNoon = (currentHour * 60 + currentMinute) - (12 * 60);
            ui.updateSliderLabels(currentOffsetFromNoon, currentOffsetFromNoon + appState.diffMinutesAtInput);
        }
    },
    updateSliderLabels: (srcOffsetMinutes, tgtOffsetMinutes) => {
        if (!elements.sourceTimeLabel || !elements.targetTimeLabel)
            return;
        // Only show times if we have inputUtcMs (i.e., after Convert button click)
        if (!appState.inputUtcMs) {
            elements.sourceTimeLabel.textContent = `From Timezone: Select timezone and click Convert`;
            elements.targetTimeLabel.textContent = `To Timezone: Select timezone and click Convert`;
            return;
        }
        // Calculate the base time (noon UTC) for slider calculations
        const baseTime = appState.inputUtcMs;
        const baseDate = new Date(baseTime);
        // Set base time to noon UTC for consistent slider calculations
        const noonUtc = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 12, 0, 0, 0);
        // Calculate adjusted times based on slider offsets
        const adjustedSrcTime = new Date(noonUtc.getTime() + (srcOffsetMinutes * 60 * 1000));
        const adjustedTgtTime = new Date(noonUtc.getTime() + (tgtOffsetMinutes * 60 * 1000));
        // Format the adjusted times for display
        const srcTimeFormatted = utils.formatLocal(adjustedSrcTime.getTime(), appState.fromZoneGlobal);
        const tgtTimeFormatted = utils.formatLocal(adjustedTgtTime.getTime(), appState.toZoneGlobal);
        // Update the labels with slider-adjusted times
        elements.sourceTimeLabel.textContent = `From Time (${appState.fromZoneGlobal}): ${srcTimeFormatted}`;
        elements.targetTimeLabel.textContent = `To Time (${appState.toZoneGlobal}): ${tgtTimeFormatted}`;
        // Calculate and display the actual time difference between the slider positions
        const actualDiffMinutes = tgtOffsetMinutes - srcOffsetMinutes;
        const actualDiffHours = (actualDiffMinutes / 60).toFixed(1);
        if (elements.hourDifference) {
            elements.hourDifference.textContent = `🕓 Time Difference: ${actualDiffHours} hours`;
        }
        if (elements.timeDifference) {
            elements.timeDifference.textContent = `Time Difference: ${actualDiffHours} hours`;
        }
        // Update epoch times for the slider-adjusted times
        ui.updateEpochTimesForSlider(adjustedSrcTime.getTime(), adjustedTgtTime.getTime());
    },
    updateEpochTimesForSlider: (srcTimeMs, tgtTimeMs) => {
        const fromEpochElement = document.getElementById('fromEpochTime');
        const toEpochElement = document.getElementById('toEpochTime');
        if (fromEpochElement && toEpochElement) {
            // Convert milliseconds to seconds for epoch time
            const srcEpochSeconds = Math.floor(srcTimeMs / 1000);
            const tgtEpochSeconds = Math.floor(tgtTimeMs / 1000);
            fromEpochElement.textContent = srcEpochSeconds.toString();
            toEpochElement.textContent = tgtEpochSeconds.toString();
        }
    },
};
// Theme management
const theme = {
    init: () => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            document.documentElement.classList.add('dark');
            if (elements.darkToggle) {
                elements.darkToggle.textContent = 'Dark Mode: ON';
            }
        }
        else {
            document.documentElement.classList.remove('dark');
            if (elements.darkToggle) {
                elements.darkToggle.textContent = 'Dark Mode: OFF';
            }
        }
    },
    toggle: () => {
        const html = document.documentElement;
        const isDark = html.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (elements.darkToggle) {
            elements.darkToggle.textContent = isDark ? 'Dark Mode: ON' : 'Dark Mode: OFF';
        }
    },
};
// Event listeners
const setupEventListeners = () => {
    // Timezone change listeners - NO conversion, just store values
    if (elements.sourceAutocomplete) {
        elements.sourceAutocomplete.addEventListener('change', () => {
            appState.fromZoneGlobal = elements.sourceAutocomplete.value;
            console.log('📍 From timezone changed to:', appState.fromZoneGlobal);
            // NO conversion logic here - only on Convert button click
        });
    }
    if (elements.targetAutocomplete) {
        elements.targetAutocomplete.addEventListener('change', () => {
            appState.toZoneGlobal = elements.targetAutocomplete.value;
            console.log('📍 To timezone changed to:', appState.toZoneGlobal);
            // NO conversion logic here - only on Convert button click
        });
    }
    // Dark mode toggle
    if (elements.darkToggle) {
        elements.darkToggle.addEventListener('click', theme.toggle);
    }
    // Mobile dark mode toggle
    const darkToggleMobile = document.getElementById('darkToggleMobile');
    if (darkToggleMobile) {
        darkToggleMobile.addEventListener('click', theme.toggle);
    }
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
    // Swap timezones
    if (elements.swapZones) {
        elements.swapZones.addEventListener('click', () => {
            const tmp = elements.sourceAutocomplete.value;
            elements.sourceAutocomplete.value = elements.targetAutocomplete.value;
            elements.targetAutocomplete.value = tmp;
            // Trigger change events
            elements.sourceAutocomplete.dispatchEvent(new Event('change'));
            elements.targetAutocomplete.dispatchEvent(new Event('change'));
        });
    }
    // Preset buttons
    elements.presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const fromZone = button.getAttribute('data-from');
            const toZone = button.getAttribute('data-to');
            if (fromZone && toZone) {
                elements.sourceAutocomplete.value = fromZone;
                elements.targetAutocomplete.value = toZone;
                // Trigger change events
                elements.sourceAutocomplete.dispatchEvent(new Event('change'));
                elements.targetAutocomplete.dispatchEvent(new Event('change'));
            }
        });
    });
    // Epoch converter forms
    const humanToEpochForm = document.getElementById('humanToEpochForm');
    const epochToHumanForm = document.getElementById('epochToHumanForm');
    if (humanToEpochForm) {
        humanToEpochForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const date = document.getElementById('humanDate').value;
            const time = document.getElementById('humanTime').value;
            try {
                const epochTime = epochConverter.humanToEpoch(date, time);
                const resultDiv = document.getElementById('humanToEpochResult');
                const outputDiv = document.getElementById('humanToEpochOutput');
                if (resultDiv && outputDiv) {
                    outputDiv.textContent = epochTime.toString();
                    resultDiv.classList.remove('hidden');
                    // Track epoch conversion event
                    const w = window;
                    if (w.si) {
                        w.si('epoch_conversion', {
                            type: 'human_to_epoch'
                        });
                    }
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('Error converting to epoch:', errorMessage);
                alert('Error: ' + errorMessage);
            }
        });
    }
    if (epochToHumanForm) {
        epochToHumanForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const epochInput = document.getElementById('epochInput').value;
            try {
                const epoch = parseInt(epochInput, 10);
                const humanTime = epochConverter.epochToHuman(epoch);
                const resultDiv = document.getElementById('epochToHumanResult');
                const outputDiv = document.getElementById('epochToHumanOutput');
                if (resultDiv && outputDiv) {
                    outputDiv.textContent = humanTime;
                    resultDiv.classList.remove('hidden');
                    // Track epoch conversion event
                    const w = window;
                    if (w.si) {
                        w.si('epoch_conversion', {
                            type: 'epoch_to_human'
                        });
                    }
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('Error converting to human time:', errorMessage);
                alert('Error: ' + errorMessage);
            }
        });
    }
    // Age Calculator form
    const ageCalculatorForm = document.getElementById('ageCalculatorForm');
    if (ageCalculatorForm) {
        ageCalculatorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const birthDate = document.getElementById('birthDate').value;
            try {
                const age = ageCalculator.calculateAge(birthDate);
                const formattedAge = ageCalculator.formatAge(age);
                const resultDiv = document.getElementById('ageResult');
                const outputDiv = document.getElementById('ageOutput');
                if (resultDiv && outputDiv) {
                    outputDiv.textContent = formattedAge;
                    resultDiv.classList.remove('hidden');
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('Error calculating age:', errorMessage);
                alert('Error: ' + errorMessage);
            }
        });
    }
    // Date Difference Calculator form
    const dateDifferenceForm = document.getElementById('dateDifferenceForm');
    if (dateDifferenceForm) {
        dateDifferenceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            try {
                const difference = dateDifferenceCalculator.calculateDifference(startDate, endDate);
                const formattedDifference = dateDifferenceCalculator.formatDifference(difference);
                const resultDiv = document.getElementById('dateDifferenceResult');
                const outputDiv = document.getElementById('dateDifferenceOutput');
                if (resultDiv && outputDiv) {
                    outputDiv.textContent = formattedDifference;
                    resultDiv.classList.remove('hidden');
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('Error calculating date difference:', errorMessage);
                alert('Error: ' + errorMessage);
            }
        });
    }
    // Date swap button
    const swapDatesBtn = document.getElementById('swapDates');
    if (swapDatesBtn) {
        swapDatesBtn.addEventListener('click', () => {
            const startDateInput = document.getElementById('startDate');
            const endDateInput = document.getElementById('endDate');
            const temp = startDateInput.value;
            startDateInput.value = endDateInput.value;
            endDateInput.value = temp;
        });
    }
    // Date Arithmetic Calculator form
    const dateArithmeticForm = document.getElementById('dateArithmeticForm');
    if (dateArithmeticForm) {
        dateArithmeticForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const baseDate = document.getElementById('baseDate').value;
            const years = parseInt(document.getElementById('yearsInput').value) || 0;
            const months = parseInt(document.getElementById('monthsInput').value) || 0;
            const days = parseInt(document.getElementById('daysInput').value) || 0;
            try {
                const resultDate = dateArithmeticCalculator.addToDate(baseDate, years, months, days);
                const formattedDate = dateArithmeticCalculator.formatDate(resultDate);
                const resultDiv = document.getElementById('dateArithmeticResult');
                const outputDiv = document.getElementById('dateArithmeticOutput');
                if (resultDiv && outputDiv) {
                    outputDiv.textContent = formattedDate;
                    resultDiv.classList.remove('hidden');
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('Error calculating date arithmetic:', errorMessage);
                alert('Error: ' + errorMessage);
            }
        });
    }
    // Currency Converter form
    const currencyConverterForm = document.getElementById('currencyConverterForm');
    if (currencyConverterForm) {
        currencyConverterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('amount').value);
            const fromCurrency = document.getElementById('fromCurrency').value;
            const toCurrency = document.getElementById('toCurrency').value;
            try {
                // Fetch latest exchange rates
                await currencyConverter.fetchExchangeRates();
                const conversion = currencyConverter.convert(amount, fromCurrency, toCurrency);
                const formattedAmount = currencyConverter.formatCurrency(conversion.convertedAmount, toCurrency);
                const formattedOriginal = currencyConverter.formatCurrency(amount, fromCurrency);
                const rateText = `1 ${fromCurrency} = ${conversion.rate.toFixed(4)} ${toCurrency}`;
                const resultDiv = document.getElementById('currencyResult');
                const outputDiv = document.getElementById('currencyOutput');
                const rateDiv = document.getElementById('currencyRate');
                const lastUpdatedDiv = document.getElementById('lastUpdated');
                if (resultDiv && outputDiv && rateDiv && lastUpdatedDiv) {
                    outputDiv.textContent = `${formattedOriginal} = ${formattedAmount}`;
                    rateDiv.textContent = rateText;
                    if (currencyConverter.lastUpdated) {
                        lastUpdatedDiv.textContent = `Last updated: ${currencyConverter.lastUpdated.toLocaleTimeString()}`;
                    }
                    resultDiv.classList.remove('hidden');
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('Error converting currency:', errorMessage);
                alert('Error: ' + errorMessage);
            }
        });
    }
    // Currency swap button
    const swapCurrenciesBtn = document.getElementById('swapCurrencies');
    if (swapCurrenciesBtn) {
        swapCurrenciesBtn.addEventListener('click', () => {
            const fromCurrencySelect = document.getElementById('fromCurrency');
            const toCurrencySelect = document.getElementById('toCurrency');
            const temp = fromCurrencySelect.value;
            fromCurrencySelect.value = toCurrencySelect.value;
            toCurrencySelect.value = temp;
        });
    }
    // Form submission
    console.log('🔍 Setting up form submission...');
    console.log('🔍 Form element found:', !!elements.form);
    console.log('🔍 Form element:', elements.form);
    if (elements.form) {
        const handleFormSubmit = async (e) => {
            e.preventDefault();
            console.log('🚀 Form submitted! (attempt #' + (++formSubmissionCount));
            console.log('🔍 Form element:', elements.form);
            console.log('🔍 Event target:', e.target);
            // Read form values fresh each time
            const fromZone = elements.sourceAutocomplete.value;
            const toZone = elements.targetAutocomplete.value;
            const dateInput = document.getElementById('date');
            const timeInput = document.getElementById('time');
            const dateStr = dateInput ? dateInput.value : '';
            const timeStr = timeInput ? timeInput.value : '';
            console.log('📝 Form values:', { fromZone, toZone, dateStr, timeStr });
            console.log('📝 Date input element:', dateInput);
            console.log('📝 Time input element:', timeInput);
            console.log('📝 Date input value:', dateInput?.value);
            console.log('📝 Time input value:', timeInput?.value);
            // Check if values are actually different from previous submission
            console.log('📝 Previous inputUtcMs:', appState.inputUtcMs);
            console.log('📝 Previous fromZone:', appState.fromZoneGlobal);
            console.log('📝 Previous toZone:', appState.toZoneGlobal);
            if (!fromZone || !toZone || !dateStr || !timeStr) {
                utils.showError('Please fill in all fields');
                return;
            }
            appState.fromZoneGlobal = fromZone;
            appState.toZoneGlobal = toZone;
            const dateParts = dateStr.split('-').map(Number);
            const timeParts = timeStr.split(':').map(Number);
            const y = dateParts[0];
            const mo = dateParts[1];
            const d = dateParts[2];
            const hh = timeParts[0];
            const mm = timeParts[1];
            if (!y || !mo || !d || !hh || !mm || isNaN(y) || isNaN(mo) || isNaN(d) || isNaN(hh) || isNaN(mm)) {
                utils.showError('Invalid date or time format');
                return;
            }
            appState.inputUtcMs = utils.wallTimeToUtcMs(y, mo, d, hh, mm, fromZone);
            console.log('⏰ Input UTC time:', appState.inputUtcMs, new Date(appState.inputUtcMs));
            const fromOff = utils.tzOffsetMinutes(appState.inputUtcMs, fromZone);
            const toOff = utils.tzOffsetMinutes(appState.inputUtcMs, toZone);
            appState.diffMinutesAtInput = toOff - fromOff;
            console.log('🕐 Time offsets:', { fromOff, toOff, diffMinutes: appState.diffMinutesAtInput });
            // Update time difference display immediately
            const diffHours = (appState.diffMinutesAtInput / 60).toFixed(1);
            if (elements.timeDifference) {
                elements.timeDifference.textContent = `Time Difference: ${diffHours} hours`;
            }
            if (elements.hourDifference) {
                elements.hourDifference.textContent = `🕓 Time Difference: ${diffHours} hours`;
            }
            console.log('🔄 Calling updateResults...');
            console.log('🔄 Current appState.inputUtcMs:', appState.inputUtcMs);
            console.log('🔄 Current fromZone:', fromZone);
            console.log('🔄 Current toZone:', toZone);
            // Clear any previous error messages
            if (elements.errorMessage) {
                elements.errorMessage.textContent = '';
                elements.errorMessage.classList.add('hidden');
            }
            // Update timeline with the input time from the form
            ui.updateTimelineForTimezones();
            console.log('🔄 About to call ui.updateResults...');
            // Update results with the new input time
            ui.updateResults({
                convertedTime: utils.formatLocal(appState.inputUtcMs, toZone),
                fromCurrent: utils.formatLocal(Date.now(), fromZone),
                toCurrent: utils.formatLocal(Date.now(), toZone),
                dst: false, // This will be calculated in updateResults
            });
            console.log('🔄 ui.updateResults called successfully');
            // Track timezone conversion event
            const w = window;
            if (w.si) {
                w.si('timezone_conversion', {
                    from_zone: fromZone,
                    to_zone: toZone,
                    time_difference: Math.abs(appState.diffMinutesAtInput / 60)
                });
            }
            console.log('✅ Form submission completed successfully');
        };
        // Attach the event listener
        elements.form.addEventListener('submit', handleFormSubmit);
        console.log('✅ Form event listener attached');
        // Also add a click handler to the submit button for debugging
        console.log('🔍 Looking for submit button...');
        console.log('🔍 Submit button element:', elements.submitBtn);
        console.log('🔍 Submit button exists:', !!elements.submitBtn);
        if (elements.submitBtn) {
            console.log('🔍 Submit button found, adding event listeners...');
            elements.submitBtn.addEventListener('click', (e) => {
                console.log('🖱️ Convert button clicked!');
                console.log('🖱️ Event:', e);
                console.log('🖱️ Button element:', elements.submitBtn);
                console.log('🖱️ Event type:', e.type);
                console.log('🖱️ Event target:', e.target);
                console.log('🖱️ Event currentTarget:', e.currentTarget);
            });
            // Also add mousedown event for debugging
            elements.submitBtn.addEventListener('mousedown', (e) => {
                console.log('🖱️ Convert button mousedown!');
                console.log('🖱️ Mousedown event:', e);
            });
            console.log('✅ Convert button click listener attached');
            // Test if button is clickable
            console.log('🧪 Testing button clickability...');
            console.log('🧪 Button disabled:', elements.submitBtn.disabled);
            console.log('🧪 Button type:', elements.submitBtn.type);
            console.log('🧪 Button parent:', elements.submitBtn.parentElement);
        }
        else {
            console.log('❌ Submit button not found!');
            console.log('🔍 Available elements:', Object.keys(elements));
        }
        // Add event listener to form inputs to detect changes
        const dateInput = document.getElementById('date');
        const timeInput = document.getElementById('time');
        if (dateInput) {
            dateInput.addEventListener('change', () => {
                console.log('📅 Date changed to:', dateInput.value);
                console.log('🔍 Submit button still exists:', !!elements.submitBtn);
                console.log('🔍 Form still exists:', !!elements.form);
            });
        }
        if (timeInput) {
            timeInput.addEventListener('change', () => {
                console.log('⏰ Time changed to:', timeInput.value);
                console.log('🔍 Submit button still exists:', !!elements.submitBtn);
                console.log('🔍 Form still exists:', !!elements.form);
            });
        }
        // Reset button functionality
        if (elements.resetBtn) {
            elements.resetBtn.addEventListener('click', () => {
                console.log('🔄 Reset button clicked!');
                // Clear form inputs
                if (elements.sourceAutocomplete)
                    elements.sourceAutocomplete.value = '';
                if (elements.targetAutocomplete)
                    elements.targetAutocomplete.value = '';
                const dateInput = document.getElementById('date');
                const timeInput = document.getElementById('time');
                if (dateInput)
                    dateInput.value = '';
                if (timeInput)
                    timeInput.value = '';
                // Hide results
                if (elements.result) {
                    elements.result.classList.add('hidden');
                }
                // Clear timeline labels
                if (elements.sourceTimeLabel) {
                    elements.sourceTimeLabel.textContent = 'From Timezone: Select timezone and click Convert';
                }
                if (elements.targetTimeLabel) {
                    elements.targetTimeLabel.textContent = 'To Timezone: Select timezone and click Convert';
                }
                // Clear time difference
                if (elements.timeDifference) {
                    elements.timeDifference.textContent = 'Time Difference: 0 hours';
                }
                if (elements.hourDifference) {
                    elements.hourDifference.textContent = '🕓 Time Difference: 0 hours';
                }
                // Clear epoch times
                const fromEpochElement = document.getElementById('fromEpochTime');
                const toEpochElement = document.getElementById('toEpochTime');
                if (fromEpochElement)
                    fromEpochElement.textContent = 'Loading...';
                if (toEpochElement)
                    toEpochElement.textContent = 'Loading...';
                // Reset app state
                appState.inputUtcMs = null;
                appState.fromZoneGlobal = '';
                appState.toZoneGlobal = '';
                appState.diffMinutesAtInput = 0;
                console.log('✅ Form reset successfully');
            });
            console.log('✅ Reset button click listener attached');
        }
        else {
            console.log('❌ Reset button not found!');
        }
    }
};
// Load current times
const loadCurrentTimes = async () => {
    try {
        // Get user's timezone
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log('🌍 User timezone detected:', userTimezone);
        // Update time displays
        const updateTimes = () => {
            const now = new Date();
            // Update navigation bar local time (user's actual timezone) - 24 hour format
            const navLocalTimeElement = document.getElementById('navLocalTime');
            const localTime = new Intl.DateTimeFormat('en-GB', {
                timeZone: userTimezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).format(now);
            if (navLocalTimeElement) {
                navLocalTimeElement.textContent = localTime;
            }
            // Update desktop local time display
            const localTimeElement = document.getElementById('localTime');
            if (localTimeElement) {
                const localTime = new Intl.DateTimeFormat('en-GB', {
                    timeZone: userTimezone,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).format(now);
                localTimeElement.textContent = `${localTime} (${userTimezone})`;
            }
            // Update mobile local time display
            const localTimeMobileElement = document.getElementById('localTimeMobile');
            const localTimeMobileMenuElement = document.getElementById('localTimeMobileMenu');
            const localTimeFull = new Intl.DateTimeFormat('en-GB', {
                timeZone: userTimezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).format(now);
            if (localTimeMobileElement) {
                localTimeMobileElement.textContent = `${localTimeFull} (${userTimezone})`;
            }
            if (localTimeMobileMenuElement) {
                localTimeMobileMenuElement.textContent = localTime;
            }
            // Update UTC time display - 24 hour format
            const utcTimeElement = document.getElementById('utcTime');
            if (utcTimeElement) {
                const utcTime = new Intl.DateTimeFormat('en-GB', {
                    timeZone: 'UTC',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).format(now);
                utcTimeElement.textContent = `${utcTime} UTC`;
            }
            // Update mobile UTC time display
            const utcTimeMobileElement = document.getElementById('utcTimeMobile');
            const utcTimeMobileMenuElement = document.getElementById('utcTimeMobileMenu');
            const utcTimeFull = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'UTC',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).format(now);
            if (utcTimeMobileElement) {
                utcTimeMobileElement.textContent = `${utcTimeFull} UTC`;
            }
            if (utcTimeMobileMenuElement) {
                utcTimeMobileMenuElement.textContent = utcTimeFull;
            }
        };
        // Initial update
        updateTimes();
        // Update every second
        setInterval(updateTimes, 1000);
    }
    catch (error) {
        console.error('❌ Failed to load current times:', error);
        // Fallback to basic Date methods
        const updateTimesFallback = () => {
            const now = new Date();
            const navLocalTimeElement = document.getElementById('navLocalTime');
            if (navLocalTimeElement) {
                navLocalTimeElement.textContent = now.toLocaleTimeString('en-GB', { hour12: false });
            }
            const localTimeElement = document.getElementById('localTime');
            if (localTimeElement) {
                localTimeElement.textContent = now.toLocaleString('en-GB');
            }
            const utcTimeElement = document.getElementById('utcTime');
            if (utcTimeElement) {
                utcTimeElement.textContent = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
            }
        };
        updateTimesFallback();
        setInterval(updateTimesFallback, 1000);
    }
};
// Initialize app
const initApp = async () => {
    try {
        console.log('🚀 Initializing app...');
        // Initialize theme
        theme.init();
        // Setup event listeners
        console.log('🔧 Setting up event listeners...');
        setupEventListeners();
        console.log('✅ Event listeners setup completed');
        // Load currencies first
        console.log('💰 Loading currencies...');
        await currencyConverter.loadCurrencies();
        // Load city-to-timezone mappings
        console.log('🗺️ Loading city-to-timezone mappings...');
        await utils.loadCityTimezoneMappings();
        // Load timezones
        console.log('🚀 Initializing timezone loading...');
        const zones = await api.fetchTimezones();
        console.log('📊 Loaded zones:', zones.length, 'timezones');
        console.log('🔍 Looking for Kolkata:', zones.includes('Asia/Kolkata'));
        appState.allZones = zones;
        // Initialize autocomplete handlers
        const sourceAutocomplete = new AutocompleteHandler(elements.sourceAutocomplete, elements.sourceDropdown);
        const targetAutocomplete = new AutocompleteHandler(elements.targetAutocomplete, elements.targetDropdown);
        // Set city mappings for autocomplete
        sourceAutocomplete.setCityMappings(utils.cityTimezoneCache);
        targetAutocomplete.setCityMappings(utils.cityTimezoneCache);
        console.log('⚙️ Setting autocomplete options...');
        sourceAutocomplete.setOptions(zones);
        targetAutocomplete.setOptions(zones);
        console.log('✅ Autocomplete initialized with', zones.length, 'timezones');
        // Initialize epoch converter autocomplete
        const humanTimezoneInput = document.getElementById('humanTimezone');
        const epochTimezoneInput = document.getElementById('epochTimezone');
        const humanTimezoneDropdown = document.getElementById('humanTimezoneDropdown');
        const epochTimezoneDropdown = document.getElementById('epochTimezoneDropdown');
        if (humanTimezoneInput && humanTimezoneDropdown) {
            const humanTimezoneAutocomplete = new AutocompleteHandler(humanTimezoneInput, humanTimezoneDropdown);
            humanTimezoneAutocomplete.setOptions(zones);
            console.log('✅ Human timezone autocomplete initialized');
        }
        if (epochTimezoneInput && epochTimezoneDropdown) {
            const epochTimezoneAutocomplete = new AutocompleteHandler(epochTimezoneInput, epochTimezoneDropdown);
            epochTimezoneAutocomplete.setOptions(zones);
            console.log('✅ Epoch timezone autocomplete initialized');
        }
        // Debug: Show timezone count on page
        const debugInfo = document.getElementById('debugInfo');
        if (debugInfo) {
            if (zones.length > 0) {
                const hasKolkata = zones.includes('Asia/Kolkata');
                debugInfo.innerHTML = `✅ Loaded ${zones.length} timezones! Kolkata: ${hasKolkata ? 'FOUND' : 'NOT FOUND'} | Sample: ${zones.slice(0, 5).join(', ')}...`;
                debugInfo.className = 'mt-4 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg text-sm text-green-800 dark:text-green-200';
            }
            else {
                debugInfo.innerHTML = '❌ No timezones loaded! Check console for errors.';
                debugInfo.className = 'mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg text-sm text-red-800 dark:text-red-200';
            }
        }
        // Load current times
        await loadCurrentTimes();
        // Initialize currency converter with real-time rates
        console.log('💰 Initializing currency converter...');
        await currencyConverter.fetchExchangeRates();
        console.log('✅ Currency converter initialized');
        // Set user's timezone as default (but don't trigger conversion)
        const userZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (zones.includes(userZone)) {
            elements.sourceAutocomplete.value = userZone;
            appState.fromZoneGlobal = userZone;
        }
        // Set a default target timezone (but don't trigger conversion)
        if (zones.includes('Europe/London')) {
            elements.targetAutocomplete.value = 'Europe/London';
            appState.toZoneGlobal = 'Europe/London';
        }
        // Initialize timeline with placeholder text
        ui.updateSliderLabels(0, 0);
        // Clear time difference initially
        if (elements.timeDifference) {
            elements.timeDifference.textContent = `Time Difference: Click Convert to see difference`;
        }
        if (elements.hourDifference) {
            elements.hourDifference.textContent = `🕓 Time Difference: Click Convert to see difference`;
        }
        // Set current date and time
        const now = new Date();
        const dateInput = document.getElementById('date');
        const timeInput = document.getElementById('time');
        if (dateInput) {
            dateInput.value = now.toISOString().split('T')[0] || '';
        }
        if (timeInput) {
            timeInput.value = now.toTimeString().slice(0, 5) || '';
        }
        console.log('✅ App initialized successfully');
    }
    catch (error) {
        console.error('❌ Failed to initialize app:', error);
        utils.showError('Failed to initialize the application. Please refresh the page.');
    }
};
class AuthManager {
    currentUser = null;
    authToken = null;
    isLoginMode = true;
    firebaseAuth = null;
    constructor() {
        this.initializeFirebase();
        this.setupEventListeners();
        this.updateUI();
    }
    async initializeFirebase() {
        try {
            // Check if Firebase is available globally
            if (typeof firebase === 'undefined') {
                console.error('❌ Firebase SDK not loaded');
                return;
            }
            // Use Firebase compat API
            const { initializeApp, auth } = firebase;
            // Firebase configuration - get from server config
            const configResponse = await fetch('/api/config');
            const config = await configResponse.json();
            console.log('Firebase config from server:', config);
            // Use server config if available, otherwise use fallback
            const firebaseConfig = {
                apiKey: config.firebaseApiKey || "AIzaSyC9UxLaYTPW...", // Your actual API key
                authDomain: config.firebaseAuthDomain || "utility-tools-12345.firebaseapp.com", // Your actual domain
                projectId: config.firebaseProjectId || "utility-tools-12345", // Your actual project ID
                storageBucket: config.firebaseStorageBucket || "utility-tools-12345.appspot.com",
                messagingSenderId: config.firebaseMessagingSenderId || "123456789",
                appId: config.firebaseAppId || "1:123456789:web:abcdef123456"
            };
            // Check if all required config values are present
            if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
                console.error('❌ Firebase configuration is incomplete:', firebaseConfig);
                console.log('Available environment variables:', {
                    FIREBASE_API_KEY: config.firebaseApiKey ? 'SET' : 'NOT SET',
                    FIREBASE_PROJECT_ID: config.firebaseProjectId ? 'SET' : 'NOT SET',
                    FIREBASE_AUTH_DOMAIN: config.firebaseAuthDomain ? 'SET' : 'NOT SET'
                });
                return;
            }
            // Initialize Firebase
            const app = initializeApp(firebaseConfig);
            this.firebaseAuth = auth(app);
            // Listen for authentication state changes
            this.firebaseAuth.onAuthStateChanged((user) => {
                if (user) {
                    this.handleFirebaseUser(user);
                }
                else {
                    this.currentUser = null;
                    this.authToken = null;
                    this.updateUI();
                }
            });
            console.log('✅ Firebase initialized successfully');
        }
        catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            // Fallback to local authentication
            this.loadStoredAuth();
        }
    }
    loadStoredAuth() {
        // Load stored authentication from localStorage
        const storedAuth = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('currentUser');
        if (storedAuth && storedUser) {
            this.authToken = storedAuth;
            this.currentUser = JSON.parse(storedUser);
            this.updateUI();
        }
    }
    async handleFirebaseUser(firebaseUser) {
        try {
            // Get Firebase ID token
            const idToken = await firebaseUser.getIdToken();
            // Sync with our backend
            const response = await fetch('/api/auth/firebase-sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    providerId: firebaseUser.providerData[0]?.providerId || 'firebase',
                    idToken: idToken
                }),
            });
            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.authToken = data.token;
                this.saveAuth();
                this.updateUI();
            }
            else {
                console.error('Failed to sync with backend');
            }
        }
        catch (error) {
            console.error('Error handling Firebase user:', error);
        }
    }
    setupEventListeners() {
        // Login/Profile button
        const loginButton = document.getElementById('loginButton');
        const profileButton = document.getElementById('profileButton');
        if (loginButton) {
            loginButton.addEventListener('click', () => this.showAuthModal());
        }
        if (profileButton) {
            profileButton.addEventListener('click', () => this.toggleProfileDropdown());
        }
        // Auth modal
        const authModal = document.getElementById('authModal');
        const closeAuthModal = document.getElementById('closeAuthModal');
        if (closeAuthModal) {
            closeAuthModal.addEventListener('click', () => this.hideAuthModal());
        }
        if (authModal) {
            authModal.addEventListener('click', (e) => {
                if (e.target === authModal) {
                    this.hideAuthModal();
                }
            });
        }
        // Form toggle
        const authToggle = document.getElementById('authToggle');
        if (authToggle) {
            authToggle.addEventListener('click', () => this.toggleAuthMode());
        }
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        // Country to timezone mapping
        const countrySelect = document.getElementById('country');
        if (countrySelect) {
            countrySelect.addEventListener('change', () => this.updateTimezoneFromCountry());
        }
        // Social login buttons
        const googleLogin = document.getElementById('googleLogin');
        if (googleLogin) {
            googleLogin.addEventListener('click', () => this.handleSocialLogin('google'));
        }
        // Profile dropdown
        const logout = document.getElementById('logout');
        if (logout) {
            logout.addEventListener('click', () => this.handleLogout());
        }
        // Close profile dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const profileDropdown = document.getElementById('userProfileDropdown');
            if (profileDropdown && !profileDropdown.contains(e.target) &&
                !profileButton?.contains(e.target)) {
                profileDropdown.classList.add('hidden');
            }
        });
    }
    showAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.remove('hidden');
            this.resetForms();
        }
    }
    hideAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.add('hidden');
        }
    }
    toggleAuthMode() {
        this.isLoginMode = !this.isLoginMode;
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authModalTitle = document.getElementById('authModalTitle');
        const authToggleText = document.getElementById('authToggleText');
        const authToggle = document.getElementById('authToggle');
        if (this.isLoginMode) {
            loginForm?.classList.remove('hidden');
            registerForm?.classList.add('hidden');
            if (authModalTitle)
                authModalTitle.textContent = 'Sign In';
            if (authToggleText)
                authToggleText.innerHTML = 'Don\'t have an account? <button id="authToggle" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium">Sign up</button>';
        }
        else {
            loginForm?.classList.add('hidden');
            registerForm?.classList.remove('hidden');
            if (authModalTitle)
                authModalTitle.textContent = 'Sign Up';
            if (authToggleText)
                authToggleText.innerHTML = 'Already have an account? <button id="authToggle" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium">Sign in</button>';
        }
        // Re-attach event listener to new toggle button
        const newAuthToggle = document.getElementById('authToggle');
        if (newAuthToggle) {
            newAuthToggle.addEventListener('click', () => this.toggleAuthMode());
        }
    }
    resetForms() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        if (loginForm)
            loginForm.reset();
        if (registerForm)
            registerForm.reset();
    }
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;
        if (!email || !password) {
            this.showError('Please fill in all fields');
            return;
        }
        try {
            if (!this.firebaseAuth) {
                this.showError('Firebase is not initialized. Please refresh the page.');
                return;
            }
            // Use Firebase for login
            const userCredential = await this.firebaseAuth.signInWithEmailAndPassword(email, password);
            // Sync with backend
            const idToken = await userCredential.user.getIdToken();
            const response = await fetch('/api/auth/firebase-sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName,
                    photoURL: userCredential.user.photoURL
                }),
            });
            const data = await response.json();
            if (response.ok) {
                this.currentUser = data.user;
                this.authToken = data.token;
                this.saveAuth();
                this.updateUI();
                this.hideAuthModal();
                this.showSuccess('Login successful!');
            }
            else {
                this.showError(data.error || 'Login failed');
            }
        }
        catch (error) {
            console.error('Login error:', error);
            this.showError(this.getFirebaseErrorMessage(error.code));
        }
    }
    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName')?.value;
        const email = document.getElementById('registerEmail')?.value;
        const password = document.getElementById('registerPassword')?.value;
        const country = document.getElementById('registerCountry')?.value;
        const timezone = document.getElementById('registerTimezone')?.value;
        if (!name || !email || !password) {
            this.showError('Please fill in all required fields');
            return;
        }
        // Validate password strength
        if (!this.validatePassword(password)) {
            this.showError('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
            return;
        }
        try {
            if (!this.firebaseAuth) {
                this.showError('Firebase is not initialized. Please refresh the page.');
                return;
            }
            // Use Firebase for registration
            const userCredential = await this.firebaseAuth.createUserWithEmailAndPassword(email, password);
            // Update display name
            if (userCredential.user) {
                await userCredential.user.updateProfile({ displayName: name });
            }
            // Sync with backend
            const idToken = await userCredential.user.getIdToken();
            const response = await fetch('/api/auth/firebase-sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: name,
                    photoURL: userCredential.user.photoURL,
                    country,
                    timezone
                }),
            });
            const data = await response.json();
            if (response.ok) {
                this.currentUser = data.user;
                this.authToken = data.token;
                this.saveAuth();
                this.updateUI();
                this.hideAuthModal();
                this.showSuccess('Registration successful! Welcome!');
            }
            else {
                this.showError(data.error || 'Registration failed');
            }
        }
        catch (error) {
            console.error('Registration error:', error);
            this.showError(this.getFirebaseErrorMessage(error.code));
        }
    }
    async handleSocialLogin(provider) {
        if (!this.firebaseAuth) {
            this.showError('Firebase is not initialized. Please refresh the page.');
            return;
        }
        try {
            const providerInstance = new firebase.auth.GoogleAuthProvider();
            const result = await this.firebaseAuth.signInWithPopup(providerInstance);
            // Sync with backend
            const idToken = await result.user.getIdToken();
            const response = await fetch('/api/auth/firebase-sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: result.user.uid,
                    email: result.user.email,
                    displayName: result.user.displayName,
                    photoURL: result.user.photoURL
                }),
            });
            const data = await response.json();
            if (response.ok) {
                this.currentUser = data.user;
                this.authToken = data.token;
                this.saveAuth();
                this.updateUI();
                this.hideAuthModal();
                this.showSuccess('Google login successful!');
            }
            else {
                this.showError(data.error || 'Login failed');
            }
        }
        catch (error) {
            console.error(`${provider} login error:`, error);
            this.showError(this.getFirebaseErrorMessage(error.code));
        }
    }
    getFirebaseErrorMessage(errorCode) {
        const errorMessages = {
            'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
            'auth/cancelled-popup-request': 'Sign-in was cancelled.',
            'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
            'auth/operation-not-allowed': 'This sign-in method is not enabled.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        };
        return errorMessages[errorCode] || 'Authentication failed. Please try again.';
    }
    updateTimezoneFromCountry() {
        const countrySelect = document.getElementById('country');
        const timezoneSelect = document.getElementById('timezone');
        if (!countrySelect || !timezoneSelect)
            return;
        const country = countrySelect.value;
        const countryTimezoneMap = {
            'India': 'Asia/Kolkata',
            'United States': 'America/New_York',
            'United Kingdom': 'Europe/London',
            'Canada': 'America/Toronto',
            'Australia': 'Australia/Sydney',
            'Germany': 'Europe/Berlin',
            'France': 'Europe/Paris',
            'Japan': 'Asia/Tokyo',
            'China': 'Asia/Shanghai',
            'Brazil': 'America/Sao_Paulo',
            'Russia': 'Europe/Moscow',
            'South Africa': 'Africa/Johannesburg',
            'Mexico': 'America/Mexico_City',
            'Argentina': 'America/Argentina/Buenos_Aires',
            'South Korea': 'Asia/Seoul',
            'Singapore': 'Asia/Singapore',
            'Thailand': 'Asia/Bangkok',
            'Indonesia': 'Asia/Jakarta',
            'Philippines': 'Asia/Manila',
            'Malaysia': 'Asia/Kuala_Lumpur',
            'New Zealand': 'Pacific/Auckland',
            'Italy': 'Europe/Rome',
            'Spain': 'Europe/Madrid',
            'Netherlands': 'Europe/Amsterdam',
            'Sweden': 'Europe/Stockholm',
            'Norway': 'Europe/Oslo',
            'Denmark': 'Europe/Copenhagen',
            'Finland': 'Europe/Helsinki',
            'Poland': 'Europe/Warsaw',
            'Czech Republic': 'Europe/Prague',
            'Hungary': 'Europe/Budapest',
            'Greece': 'Europe/Athens',
            'Turkey': 'Europe/Istanbul',
            'Israel': 'Asia/Jerusalem',
            'Saudi Arabia': 'Asia/Riyadh',
            'UAE': 'Asia/Dubai',
            'Egypt': 'Africa/Cairo',
            'Nigeria': 'Africa/Lagos',
            'Kenya': 'Africa/Nairobi',
            'Chile': 'America/Santiago',
            'Colombia': 'America/Bogota',
            'Peru': 'America/Lima',
            'Venezuela': 'America/Caracas',
            'Ecuador': 'America/Guayaquil',
            'Bolivia': 'America/La_Paz',
            'Paraguay': 'America/Asuncion',
            'Uruguay': 'America/Montevideo'
        };
        const defaultTimezone = countryTimezoneMap[country] || 'UTC';
        // Set the timezone select value
        timezoneSelect.value = defaultTimezone;
    }
    async handleLogout() {
        try {
            if (this.authToken) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                    },
                });
            }
        }
        catch (error) {
            console.error('Logout error:', error);
        }
        finally {
            this.currentUser = null;
            this.authToken = null;
            this.clearAuth();
            this.updateUI();
            this.hideProfileDropdown();
            this.showSuccess('Logged out successfully');
        }
    }
    toggleProfileDropdown() {
        const profileDropdown = document.getElementById('userProfileDropdown');
        if (profileDropdown) {
            profileDropdown.classList.toggle('hidden');
        }
    }
    hideProfileDropdown() {
        const profileDropdown = document.getElementById('userProfileDropdown');
        if (profileDropdown) {
            profileDropdown.classList.add('hidden');
        }
    }
    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    }
    saveAuth() {
        if (this.authToken && this.currentUser) {
            localStorage.setItem('authToken', this.authToken);
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }
    clearAuth() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }
    updateUI() {
        const loginButton = document.getElementById('loginButton');
        const profileButton = document.getElementById('profileButton');
        const profileDropdown = document.getElementById('userProfileDropdown');
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userAvatar = document.getElementById('userAvatar');
        const profileAvatar = document.getElementById('profileAvatar');
        // Hide both initially to prevent flash
        if (loginButton)
            loginButton.classList.add('hidden');
        if (profileButton)
            profileButton.classList.add('hidden');
        if (this.currentUser) {
            // User is logged in
            if (profileButton)
                profileButton.classList.remove('hidden');
            if (profileDropdown)
                profileDropdown.classList.add('hidden');
            // Update user info
            if (userName)
                userName.textContent = this.currentUser.name;
            if (userEmail)
                userEmail.textContent = this.currentUser.email;
            const initials = this.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
            if (userAvatar)
                userAvatar.textContent = initials;
            if (profileAvatar)
                profileAvatar.textContent = initials;
        }
        else {
            // User is not logged in
            if (loginButton)
                loginButton.classList.remove('hidden');
            if (profileDropdown)
                profileDropdown.classList.add('hidden');
        }
    }
    showError(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 5000);
    }
    showSuccess(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    }
    // Public methods
    isAuthenticated() {
        return this.currentUser !== null && this.authToken !== null;
    }
    getCurrentUser() {
        return this.currentUser;
    }
    getAuthToken() {
        return this.authToken;
    }
    async makeAuthenticatedRequest(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        return fetch(url, {
            ...options,
            headers,
        });
    }
}
// Initialize authentication manager
const authManager = new AuthManager();
// Start the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
}
else {
    initApp();
}
//# sourceMappingURL=frontend.js.map