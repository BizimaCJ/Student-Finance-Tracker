const TRANSACTIONS_KEY = 'campuscoins:transactions';
const SETTINGS_KEY = 'campuscoins:settings';

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
    budget: 100000,
    currency: 'RWF',
    usdRate: 0.00073,
    categories: [
      'Food',
      'Books',
      'Transport',
      'Entertainment',
      'Repairs',
      'Utilities',
      'Rent/Dorm Fees',
      'Toiletries',
      'Hair & Skin Care',
      'Clothes & Shoes',
      'Gifts/Contributions',
      'Subscriptions',
      'Other'
    ],
    theme: 'dark'
  };
}