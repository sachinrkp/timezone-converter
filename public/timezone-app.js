"use strict";
// Test alert to verify new file is loading
alert('🚀 NEW VERSION LOADED! This should show the updated timezone converter with 70+ timezones!');
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
    darkToggle: document.getElementById('darkToggle'),
    swapZones: document.getElementById('swapZones'),
    errorMessage: document.getElementById('errorMessage'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    submitBtn: document.getElementById('submitBtn'),
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
    tzOffsetMinutes: (utcMs, timeZone) => {
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
    constructor(input, dropdown) {
        this.input = input;
        this.dropdown = dropdown;
        this.setupEventListeners();
    }
    setOptions(options) {
        this.allOptions = options;
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
        this.filteredOptions = this.allOptions.filter(option => option.toLowerCase().includes(query) ||
            option.toLowerCase().replace(/_/g, ' ').includes(query) ||
            this.getCityName(option).toLowerCase().includes(query));
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
        this.input.value = option;
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
// UI functions
const ui = {
    updateResults: (data) => {
        if (!elements.result)
            return;
        elements.result.innerHTML = `
      <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
        <div class="flex items-center mb-2">
          <span class="text-2xl mr-2">🕒</span>
          <span class="font-semibold text-green-800 dark:text-green-200">Input Time (${appState.fromZoneGlobal})</span>
        </div>
        <div class="text-lg font-mono text-green-700 dark:text-green-300">
          ${utils.formatLocal(appState.inputUtcMs, appState.fromZoneGlobal)}
        </div>
      </div>
      
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex items-center mb-2">
          <span class="text-2xl mr-2">➡️</span>
          <span class="font-semibold text-blue-800 dark:text-blue-200">Converted Time (${appState.toZoneGlobal})</span>
        </div>
        <div class="text-lg font-mono text-blue-700 dark:text-blue-300">
          ${utils.formatLocal(appState.inputUtcMs, appState.toZoneGlobal)}
        </div>
      </div>
    `;
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
        ui.initSliders();
    },
    initSliders: () => {
        if (!elements.sourceSlider || !elements.targetSlider)
            return;
        // Range: -1440 to +1440 minutes relative to input time
        elements.sourceSlider.min = '-1440';
        elements.sourceSlider.max = '1440';
        elements.targetSlider.min = '-1440';
        elements.targetSlider.max = '1440';
        // Start both sliders at 0 (the exact input instant)
        elements.sourceSlider.value = '0';
        elements.targetSlider.value = '0';
        ui.updateSliderLabels(0, 0);
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
    updateSliderLabels: (srcOffsetMinutes, tgtOffsetMinutes) => {
        if (!appState.inputUtcMs || !elements.sourceTimeLabel || !elements.targetTimeLabel)
            return;
        const srcUtc = appState.inputUtcMs + srcOffsetMinutes * 60000;
        const tgtUtc = appState.inputUtcMs + tgtOffsetMinutes * 60000;
        elements.sourceTimeLabel.textContent = `Selected Time (${appState.fromZoneGlobal}): ${utils.formatLocal(srcUtc, appState.fromZoneGlobal)}`;
        elements.targetTimeLabel.textContent = `Converted Time (${appState.toZoneGlobal}): ${utils.formatLocal(tgtUtc, appState.toZoneGlobal)}`;
        // Also update hour difference display based on current slider positions
        const srcOff = utils.tzOffsetMinutes(srcUtc, appState.fromZoneGlobal);
        const tgtOff = utils.tzOffsetMinutes(tgtUtc, appState.toZoneGlobal);
        const diffHours = ((tgtOff - srcOff) / 60).toFixed(2);
        if (elements.hourDifference) {
            elements.hourDifference.textContent = `🕓 Time Difference: ${diffHours} hours`;
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
    // Dark mode toggle
    if (elements.darkToggle) {
        elements.darkToggle.addEventListener('click', theme.toggle);
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
    // Form submission
    if (elements.form) {
        elements.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fromZone = elements.sourceAutocomplete.value;
            const toZone = elements.targetAutocomplete.value;
            const dateStr = document.getElementById('date').value;
            const timeStr = document.getElementById('time').value;
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
            const fromOff = utils.tzOffsetMinutes(appState.inputUtcMs, fromZone);
            const toOff = utils.tzOffsetMinutes(appState.inputUtcMs, toZone);
            appState.diffMinutesAtInput = toOff - fromOff;
            ui.updateResults({
                convertedTime: utils.formatLocal(appState.inputUtcMs, toZone),
                fromCurrent: utils.formatLocal(Date.now(), fromZone),
                toCurrent: utils.formatLocal(Date.now(), toZone),
                dst: false, // This will be calculated in updateResults
            });
        });
    }
};
// Load current times
const loadCurrentTimes = async () => {
    try {
        const timeData = await api.fetchCurrentTime();
        // Update local time display
        const localTimeElement = document.getElementById('localTime');
        if (localTimeElement) {
            const localDate = new Date(timeData.local);
            localTimeElement.textContent = localDate.toLocaleString();
        }
        // Update UTC time display
        const utcTimeElement = document.getElementById('utcTime');
        if (utcTimeElement) {
            const utcDate = new Date(timeData.utc);
            utcTimeElement.textContent = utcDate.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
        }
        // Update every second
        setInterval(async () => {
            const timeData = await api.fetchCurrentTime();
            if (localTimeElement) {
                const localDate = new Date(timeData.local);
                localTimeElement.textContent = localDate.toLocaleString();
            }
            if (utcTimeElement) {
                const utcDate = new Date(timeData.utc);
                utcTimeElement.textContent = utcDate.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
            }
        }, 1000);
    }
    catch (error) {
        console.error('❌ Failed to load current times:', error);
    }
};
// Initialize app
const initApp = async () => {
    try {
        // Initialize theme
        theme.init();
        // Setup event listeners
        setupEventListeners();
        // Load timezones
        console.log('🚀 Initializing timezone loading...');
        const zones = await api.fetchTimezones();
        console.log('📊 Loaded zones:', zones.length, 'timezones');
        console.log('🔍 Looking for Kolkata:', zones.includes('Asia/Kolkata'));
        appState.allZones = zones;
        // Initialize autocomplete handlers
        const sourceAutocomplete = new AutocompleteHandler(elements.sourceAutocomplete, elements.sourceDropdown);
        const targetAutocomplete = new AutocompleteHandler(elements.targetAutocomplete, elements.targetDropdown);
        console.log('⚙️ Setting autocomplete options...');
        sourceAutocomplete.setOptions(zones);
        targetAutocomplete.setOptions(zones);
        console.log('✅ Autocomplete initialized with', zones.length, 'timezones');
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
        // Set user's timezone as default
        const userZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (zones.includes(userZone)) {
            elements.sourceAutocomplete.value = userZone;
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
// Start the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
}
else {
    initApp();
}
//# sourceMappingURL=frontend.js.map