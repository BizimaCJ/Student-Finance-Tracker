import { loadTransactions, saveTransactions, loadSettings, saveSettings } from './storage.js';

let transactions = [];
let settings = {};

export function init() {
  transactions = loadTransactions();
  settings = loadSettings();
}

export function getTransactions() {
  return transactions;
}

export function getSettings() {
  return settings;
}

export function addTransaction(record) {
  transactions.unshift(record);
  saveTransactions(transactions);
}

export function updateTransaction(id, updates) {
  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) return false;
  transactions[index] = Object.assign({}, transactions[index], updates, { updatedAt: new Date().toISOString() });
  saveTransactions(transactions);
  return true;
}

export function deleteTransaction(id) {
  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) return false;
  transactions.splice(index, 1);
  saveTransactions(transactions);
  return true;
}

export function getTransactionById(id) {
  return transactions.find(t => t.id === id) || null;
}

export function updateSettings(updates) {
  settings = Object.assign({}, settings, updates);
  saveSettings(settings);
}

export function replaceTransactions(newData) {
  transactions = newData;
  saveTransactions(transactions);
}

export function generateId() {
  const count = String(transactions.length + 1).padStart(4, '0');
  return 'rec_' + count + '_' + Date.now();
}

export function clearAll() {
  transactions = [];
  saveTransactions(transactions);
}
