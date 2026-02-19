import { getTransactions, getSettings } from './state.js';
import { highlight, matchesSearch } from './search.js';

export function renderCategorySelect(selectEl, categories) {
  selectEl.innerHTML = '';
  const blank = document.createElement('option');
  blank.value = '';
  blank.textContent = 'Select a category';
  blank.disabled = true;
  blank.selected = true;
  selectEl.appendChild(blank);
  categories.forEach(function(cat) {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    selectEl.appendChild(opt);
  });
}

export function renderTransactions(tbody, re, sortValue, monthFilter) {
  const transactions = getTransactions();
  const settings = getSettings();

  let filtered = transactions.filter(function(t) {
    if (monthFilter && t.date && t.date.slice(0, 7) !== monthFilter) return false;
    return matchesSearch(t, re);
  });

  const parts = sortValue ? sortValue.split('-') : ['date', 'desc'];
  const field = parts[0];
  const dir = parts[1];

  filtered.sort(function(a, b) {
    let av, bv;
    if (field === 'amount') {
      av = parseFloat(a.amount);
      bv = parseFloat(b.amount);
    } else if (field === 'date') {
      av = a.date;
      bv = b.date;
    } else {
      av = (a.description || '').toLowerCase();
      bv = (b.description || '').toLowerCase();
    }
    if (av < bv) return dir === 'asc' ? -1 : 1;
    if (av > bv) return dir === 'asc' ? 1 : -1;
    return 0;
  });

  tbody.innerHTML = '';

  const emptyState = document.getElementById('emptyState');

  if (filtered.length === 0) {
    if (emptyState) {
      emptyState.classList.add('visible');
    }
    return;
  }

  if (emptyState) {
    emptyState.classList.remove('visible');
  }

  const currencySymbols = { RWF: 'RWF', USD: 'USD' };
  const symbol = currencySymbols[settings.currency] || settings.currency;

  filtered.forEach(function(t) {
    const tr = document.createElement('tr');

    const descCell = document.createElement('td');
    descCell.innerHTML = highlight(t.description, re);

    const amountCell = document.createElement('td');
    amountCell.className = 'amount-cell';
    amountCell.textContent = symbol + ' ' + Math.round(parseFloat(t.amount)).toLocaleString();

    const catCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'category-badge';
    badge.innerHTML = highlight(t.category, re);
    catCell.appendChild(badge);

    const dateCell = document.createElement('td');
    dateCell.textContent = t.date;

    const actionsCell = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'action-btn edit';
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('data-id', t.id);
    editBtn.setAttribute('aria-label', 'Edit ' + t.description);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'action-btn delete';
    deleteBtn.textContent = 'Del';
    deleteBtn.setAttribute('data-id', t.id);
    deleteBtn.setAttribute('aria-label', 'Delete ' + t.description);

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);

    tr.appendChild(descCell);
    tr.appendChild(amountCell);
    tr.appendChild(catCell);
    tr.appendChild(dateCell);
    tr.appendChild(actionsCell);

    tbody.appendChild(tr);
  });
}

export function renderDashboard(selectedMonth) {
  const allTransactions = getTransactions();
  const settings = getSettings();

  const month = selectedMonth || getCurrentMonth();

  const transactions = allTransactions.filter(function(t) {
    return t.date && t.date.slice(0, 7) === month;
  });

  const total = transactions.length;
  const sum = transactions.reduce(function(acc, t) {
    return acc + parseFloat(t.amount || 0);
  }, 0);

  const catTotals = {};
  transactions.forEach(function(t) {
    catTotals[t.category] = (catTotals[t.category] || 0) + parseFloat(t.amount || 0);
  });

  const topCat = Object.keys(catTotals).sort(function(a, b) {
    return catTotals[b] - catTotals[a];
  })[0] || '-';

  const budget = parseFloat(settings.budget) || 0;
  const remaining = budget - sum;

  const currencySymbols = { RWF: 'RWF', USD: 'USD' };
  const symbol = currencySymbols[settings.currency] || settings.currency;

  const elTotal = document.getElementById('statTotal');
  const elSpent = document.getElementById('statSpent');
  const elTopCat = document.getElementById('statTopCat');
  const elRemaining = document.getElementById('statRemaining');

  if (elTotal) elTotal.textContent = total;
  if (elSpent) elSpent.textContent = symbol + ' ' + Math.round(sum).toLocaleString();
  if (elTopCat) elTopCat.textContent = topCat;
  if (elRemaining) elRemaining.textContent = symbol + ' ' + Math.round(remaining).toLocaleString();

  renderBudgetBar(sum, budget);
  renderTrend(transactions, month);
  renderCategories(catTotals, sum);
}

function getCurrentMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return y + '-' + m;
}

function renderBudgetBar(spent, budget) {
  const bar = document.getElementById('budgetBar');
  const barWrap = bar ? bar.parentElement : null;
  const spentLabel = document.getElementById('budgetSpentLabel');
  const limitLabel = document.getElementById('budgetLimitLabel');
  const msg = document.getElementById('budgetMessage');

  if (!bar) return;

  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  bar.style.width = pct + '%';

  bar.classList.remove('over', 'warn');
  if (msg) msg.classList.remove('over', 'ok');

  if (barWrap) {
    barWrap.setAttribute('aria-valuenow', Math.round(pct));
  }

  if (spent > budget && budget > 0) {
    bar.classList.add('over');
    if (msg) {
      msg.textContent = 'Budget exceeded by RWF ' + Math.round(spent - budget).toLocaleString();
      msg.classList.add('over');
      msg.setAttribute('aria-live', 'assertive');
    }
  } else if (pct > 80) {
    bar.classList.add('warn');
    if (msg) {
      msg.textContent = 'Warning: over 80% of budget used.';
      msg.classList.add('ok');
      msg.setAttribute('aria-live', 'polite');
    }
  } else if (budget > 0) {
    if (msg) {
      msg.textContent = 'Budget on track.';
      msg.classList.add('ok');
      msg.setAttribute('aria-live', 'polite');
    }
  } else {
    if (msg) msg.textContent = 'No budget set. Go to Settings to set one.';
  }

  if (spentLabel) spentLabel.textContent = 'Spent: ' + Math.round(spent).toLocaleString();
  if (limitLabel) limitLabel.textContent = 'Limit: ' + Math.round(budget).toLocaleString();
}

function renderTrend(transactions, month) {
  const chart = document.getElementById('trendChart');
  if (!chart) return;
  chart.innerHTML = '';

  const parts = month.split('-');
  const year = parseInt(parts[0]);
  const monthIndex = parseInt(parts[1]) - 1;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const isCurrentMonth = month === (today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0'));
  const cutoffDay = isCurrentMonth ? today.getDate() : daysInMonth;

  const days = [];
  for (let d = 1; d <= cutoffDay; d++) {
    const dateStr = year + '-' + String(monthIndex + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    days.push({ label: String(d), date: dateStr, total: 0 });
  }

  transactions.forEach(function(t) {
    const day = days.find(function(d) { return d.date === t.date; });
    if (day) day.total += parseFloat(t.amount || 0);
  });

  const maxTotal = Math.max.apply(null, days.map(function(d) { return d.total; })) || 1;

  days.forEach(function(day) {
    const wrap = document.createElement('div');
    wrap.className = 'trend-bar-wrap';

    const bar = document.createElement('div');
    bar.className = 'trend-bar';
    const heightPct = Math.max((day.total / maxTotal) * 100, day.total > 0 ? 4 : 2);
    bar.style.height = heightPct + 'px';
    bar.setAttribute('title', day.date + ': ' + Math.round(day.total).toLocaleString());

    const label = document.createElement('span');
    label.className = 'trend-label';
    label.textContent = day.label;

    wrap.appendChild(bar);
    wrap.appendChild(label);
    chart.appendChild(wrap);
  });
}

function renderCategories(catTotals, totalSum) {
  const list = document.getElementById('categoryList');
  if (!list) return;
  list.innerHTML = '';

  const cats = Object.keys(catTotals).sort(function(a, b) {
    return catTotals[b] - catTotals[a];
  });

  if (cats.length === 0) {
    list.textContent = 'No data yet.';
    return;
  }

  cats.forEach(function(cat) {
    const amount = catTotals[cat];
    const pct = totalSum > 0 ? (amount / totalSum) * 100 : 0;

    const row = document.createElement('div');
    row.className = 'category-row';

    const name = document.createElement('span');
    name.className = 'category-row-name';
    name.textContent = cat;

    const barWrap = document.createElement('div');
    barWrap.className = 'category-row-bar-wrap';

    const bar = document.createElement('div');
    bar.className = 'category-row-bar';
    bar.style.width = pct.toFixed(1) + '%';

    barWrap.appendChild(bar);

    const amountEl = document.createElement('span');
    amountEl.className = 'category-row-amount';
    amountEl.textContent = Math.round(amount).toLocaleString();

    row.appendChild(name);
    row.appendChild(barWrap);
    row.appendChild(amountEl);
    list.appendChild(row);
  });
}

export function renderCategoryManager(container, categories, onRemove) {
  container.innerHTML = '';
  categories.forEach(function(cat) {
    const item = document.createElement('div');
    item.className = 'category-item';

    const nameEl = document.createElement('span');
    nameEl.className = 'category-item-name';
    nameEl.textContent = cat;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'category-item-remove';
    removeBtn.textContent = 'x';
    removeBtn.setAttribute('aria-label', 'Remove category ' + cat);
    removeBtn.addEventListener('click', function() {
      onRemove(cat);
    });

    item.appendChild(nameEl);
    item.appendChild(removeBtn);
    container.appendChild(item);
  });
}

export function showToast(message, type) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast show ' + (type || '');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function() {
    toast.className = 'toast';
  }, 3000);
}

export function setFieldError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  if (field) {
    if (message) {
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', errorId);
    } else {
      field.classList.remove('error');
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
  }
  if (error) error.textContent = message || '';
}

export function clearFormErrors() {
  setFieldError('fieldDescription', 'errDescription', '');
  setFieldError('fieldAmount', 'errAmount', '');
  setFieldError('fieldDate', 'errDate', '');
}

export function fillFormForEdit(record) {
  document.getElementById('editId').value = record.id;
  document.getElementById('fieldDescription').value = record.description;
  document.getElementById('fieldAmount').value = record.amount;
  document.getElementById('fieldCategory').value = record.category;
  document.getElementById('fieldDate').value = record.date;
  document.getElementById('submitBtn').textContent = 'Update Transaction';
  document.getElementById('cancelEditBtn').style.display = 'inline-block';
  document.getElementById('add-heading').textContent = 'Edit Transaction';
}

export function resetForm() {
  document.getElementById('transactionForm').reset();
  document.getElementById('editId').value = '';
  document.getElementById('submitBtn').textContent = 'Add Transaction';
  document.getElementById('cancelEditBtn').style.display = 'none';
  document.getElementById('add-heading').textContent = 'Add Transaction';
  clearFormErrors();
}
