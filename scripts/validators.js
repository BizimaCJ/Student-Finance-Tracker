const RE_DESCRIPTION = /^\S(?:.*\S)?$/;

const RE_AMOUNT = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

const RE_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const RE_CATEGORY = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

const RE_DUPLICATE_WORD = /\b(\w+)\s+\1\b/i;

const RE_CENTS = /\.\d{2}\b/;

const RE_BEVERAGE = /(coffee|tea|juice|water|soda|drink)/i;

export function validateDescription(value) {
  if (!value || value.trim() === '') {
    return 'Description is required.';
  }
  if (!RE_DESCRIPTION.test(value)) {
    return 'Description must not have leading or trailing spaces.';
  }
  if (RE_DUPLICATE_WORD.test(value)) {
    return 'Description contains a duplicate word (e.g. "the the").';
  }
  return '';
}

export function validateAmount(value) {
  if (!value || value.trim() === '') {
    return 'Amount is required.';
  }
  if (!RE_AMOUNT.test(value.trim())) {
    return 'Amount must be a positive number with up to 2 decimal places (e.g. 12.50).';
  }
  return '';
}

export function validateDate(value) {
  if (!value || value.trim() === '') {
    return 'Date is required.';
  }
  if (!RE_DATE.test(value.trim())) {
    return 'Date must be in YYYY-MM-DD format (e.g. 2025-09-29).';
  }
  return '';
}

export function validateCategory(value) {
  if (!value || value.trim() === '') {
    return 'Category is required.';
  }
  if (!RE_CATEGORY.test(value.trim())) {
    return 'Category must contain only letters, spaces, or hyphens.';
  }
  return '';
}

export function validateBudget(value) {
  if (!value || value.trim() === '') {
    return 'Budget is required.';
  }
  if (!RE_AMOUNT.test(value.trim())) {
    return 'Budget must be a positive number.';
  }
  return '';
}

export function validateImportRecord(record) {
  if (typeof record !== 'object' || record === null) return false;
  if (typeof record.id !== 'string') return false;
  if (typeof record.description !== 'string') return false;
  if (typeof record.amount !== 'number') return false;
  if (typeof record.category !== 'string') return false;
  if (typeof record.date !== 'string') return false;
  return true;
}

export function hasCents(amount) {
  return RE_CENTS.test(String(amount));
}

export function isBeverage(description) {
  return RE_BEVERAGE.test(description);
}