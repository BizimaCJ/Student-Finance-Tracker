const TRANSACTIONS_KEY = 'fintrack:transactions';
const SETTINGS_KEY = 'fintrack:settings';

export function loadTransactions() {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    return [];
  }
}

export function saveTransactions(data) {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Could not save transactions', e);
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return getDefaultSettings();
    const parsed = JSON.parse(raw);
    return Object.assign(getDefaultSettings(), parsed);
  } catch (e) {
    return getDefaultSettings();
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Could not save settings', e);
  }
}

function getDefaultSettings() {
  return {
    budget: 500,
    currency: 'USD',
    rate1Label: 'EUR',
    rate1Value: 0.92,
    rate2Label: 'GBP',
    rate2Value: 0.79,
    categories: ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'],
    theme: 'dark'
  };
}