import { init, getSettings, getTransactions, addTransaction, updateTransaction, deleteTransaction, getTransactionById, updateSettings, replaceTransactions, generateId, clearAll } from './state.js';
import { validateDescription, validateAmount, validateDate, validateCategory, validateBudget, validateImportRecord } from './validators.js';
import { compileRegex, isValidRegex } from './search.js';
import { renderTransactions, renderDashboard, renderCategorySelect, renderCategoryManager, showToast, setFieldError, clearFormErrors, fillFormForEdit, resetForm } from './ui.js';

init();

const html = document.documentElement;
const savedTheme = getSettings().theme || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeButton(savedTheme);

function updateThemeButton(theme) {
  const btn = document.getElementById('themeToggle');
  const label = btn ? btn.querySelector('.theme-label') : null;
  if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  if (label) label.textContent = theme === 'dark' ? 'Dark' : 'Light';
}

document.getElementById('themeToggle').addEventListener('click', function() {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  updateThemeButton(next);
  updateSettings({ theme: next });
});

const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');

navToggle.addEventListener('click', function() {
  const isOpen = mobileNav.classList.contains('open');
  if (isOpen) {
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  } else {
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
  }
});

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
  });
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(function(link) {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === pageId) link.classList.add('active');
  });

  mobileNav.classList.remove('open');
  mobileNav.setAttribute('aria-hidden', 'true');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');

  window.scrollTo(0, 0);

  if (pageId === 'dashboard') {
    setMonthPickerDefault();
    renderDashboard(getSelectedMonth());
  }
  if (pageId === 'transactions') refreshTransactions();
  if (pageId === 'settings') renderSettings();
}

document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const page = link.getAttribute('data-page');
    if (page) showPage(page);
  });
});

function getCurrentMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return y + '-' + m;
}

function getSelectedMonth() {
  const picker = document.getElementById('monthPicker');
  return (picker && picker.value) ? picker.value : getCurrentMonth();
}

function setMonthPickerDefault() {
  const picker = document.getElementById('monthPicker');
  if (picker && !picker.value) {
    picker.value = getCurrentMonth();
  }
}

document.getElementById('monthPicker').addEventListener('change', function() {
  renderDashboard(this.value);
});

function getSearchRegex() {
  const input = document.getElementById('searchInput').value;
  const caseSensitive = document.getElementById('searchCaseToggle').checked;
  return compileRegex(input, caseSensitive);
}

function getSortValue() {
  return document.getElementById('sortSelect').value;
}

function refreshTransactions() {
  const re = getSearchRegex();
  const sort = getSortValue();
  const tbody = document.getElementById('transactionsBody');
  renderTransactions(tbody, re, sort);

  const emptyState = document.getElementById('emptyState');
  if (getTransactions().length === 0) {
    emptyState.classList.add('visible');
  }
}

document.getElementById('searchInput').addEventListener('input', function() {
  const val = this.value;
  const errEl = document.getElementById('searchError');
  if (val && !isValidRegex(val)) {
    errEl.textContent = 'Invalid regex pattern.';
  } else {
    errEl.textContent = '';
  }
  refreshTransactions();
});

document.getElementById('searchCaseToggle').addEventListener('change', function() {
  refreshTransactions();
});

document.getElementById('sortSelect').addEventListener('change', function() {
  refreshTransactions();
});

document.getElementById('transactionsBody').addEventListener('click', function(e) {
  const btn = e.target.closest('.action-btn');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  if (btn.classList.contains('edit')) {
    const record = getTransactionById(id);
    if (record) {
      fillFormForEdit(record);
      showPage('add');
    }
  } else if (btn.classList.contains('delete')) {
    if (window.confirm('Delete this transaction? This cannot be undone.')) {
      deleteTransaction(id);
      refreshTransactions();
      renderDashboard(getSelectedMonth());
      showToast('Transaction deleted.', 'error');
    }
  }
});

const form = document.getElementById('transactionForm');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  clearFormErrors();

  const editId = document.getElementById('editId').value;
  const description = document.getElementById('fieldDescription').value;
  const amount = document.getElementById('fieldAmount').value;
  const category = document.getElementById('fieldCategory').value;
  const date = document.getElementById('fieldDate').value;

  const errDesc = validateDescription(description);
  const errAmt = validateAmount(amount);
  const errDate = validateDate(date);

  setFieldError('fieldDescription', 'errDescription', errDesc);
  setFieldError('fieldAmount', 'errAmount', errAmt);
  setFieldError('fieldDate', 'errDate', errDate);

  if (errDesc || errAmt || errDate) return;

  const now = new Date().toISOString();

  if (editId) {
    updateTransaction(editId, {
      description: description.trim(),
      amount: parseInt(amount, 10),
      category: category,
      date: date.trim()
    });
    resetForm();
    showToast('Transaction updated.', 'success');
    renderDashboard(getSelectedMonth());
  } else {
    const record = {
      id: generateId(),
      description: description.trim(),
      amount: parseInt(amount, 10),
      category: category,
      date: date.trim(),
      createdAt: now,
      updatedAt: now
    };
    addTransaction(record);
    resetForm();
    document.getElementById('formStatus').textContent = 'Transaction added.';
    setTimeout(function() {
      document.getElementById('formStatus').textContent = '';
    }, 2000);
    showToast('Transaction added.', 'success');
    renderDashboard(getSelectedMonth());
  }
});

document.getElementById('cancelEditBtn').addEventListener('click', function() {
  resetForm();
});

document.getElementById('exportBtn').addEventListener('click', function() {
  const data = getTransactions();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'campuscoins-export.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported ' + data.length + ' transactions.', 'success');
});

document.getElementById('importFile').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const statusEl = document.getElementById('importStatus');
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (!Array.isArray(parsed)) {
        statusEl.textContent = 'Error: JSON must be an array.';
        return;
      }
      const valid = parsed.filter(validateImportRecord);
      const invalid = parsed.length - valid.length;
      replaceTransactions(valid);
      refreshTransactions();
      renderDashboard(getSelectedMonth());
      statusEl.textContent = 'Imported ' + valid.length + ' records.' + (invalid > 0 ? ' Skipped ' + invalid + ' invalid.' : '');
      showToast('Import complete.', 'success');
    } catch (err) {
      statusEl.textContent = 'Error: Could not parse JSON file.';
    }
  };
  reader.readAsText(file);
  this.value = '';
});

function renderSettings() {
  const settings = getSettings();
  document.getElementById('budgetLimit').value = settings.budget || '';
  document.getElementById('usdRate').value = settings.usdRate || '';

  const container = document.getElementById('categoryManager');
  renderCategoryManager(container, settings.categories || [], function(cat) {
    const cats = (getSettings().categories || []).filter(function(c) { return c !== cat; });
    updateSettings({ categories: cats });
    renderSettings();
    renderCategorySelect(document.getElementById('fieldCategory'), cats);
    showToast('Category removed.', '');
  });
}

document.getElementById('saveBudgetBtn').addEventListener('click', function() {
  const val = document.getElementById('budgetLimit').value;
  const err = validateBudget(val);
  setFieldError('budgetLimit', 'errBudget', err);
  if (err) return;
  updateSettings({ budget: parseInt(val, 10) });
  document.getElementById('budgetMessage').textContent = '';
  renderDashboard(getSelectedMonth());
  showToast('Budget saved.', 'success');
});

document.getElementById('saveCurrencyBtn').addEventListener('click', function() {
  const rate = document.getElementById('usdRate').value;
  updateSettings({ usdRate: parseFloat(rate) || 0 });
  document.getElementById('currencyStatus').textContent = 'Saved.';
  setTimeout(function() {
    document.getElementById('currencyStatus').textContent = '';
  }, 2000);
  showToast('Currency settings saved.', 'success');
});

document.getElementById('addCategoryBtn').addEventListener('click', function() {
  const val = document.getElementById('newCategory').value;
  const err = validateCategory(val);
  setFieldError('newCategory', 'errNewCategory', err);
  if (err) return;
  const cats = getSettings().categories || [];
  const trimmed = val.trim();
  if (cats.indexOf(trimmed) !== -1) {
    setFieldError('newCategory', 'errNewCategory', 'Category already exists.');
    return;
  }
  cats.push(trimmed);
  updateSettings({ categories: cats });
  document.getElementById('newCategory').value = '';
  renderSettings();
  renderCategorySelect(document.getElementById('fieldCategory'), cats);
  document.getElementById('categoryStatus').textContent = 'Category added.';
  setTimeout(function() {
    document.getElementById('categoryStatus').textContent = '';
  }, 2000);
  showToast('Category added.', 'success');
});

document.getElementById('clearDataBtn').addEventListener('click', function() {
  if (window.confirm('Clear ALL transactions? This cannot be undone.')) {
    clearAll();
    refreshTransactions();
    renderDashboard(getSelectedMonth());
    showToast('All data cleared.', 'error');
  }
});

renderCategorySelect(document.getElementById('fieldCategory'), getSettings().categories || []);
document.getElementById('currencyPrefix').textContent = 'RWF';
showPage('dashboard');
