export function compileRegex(input, caseSensitive) {
  if (!input || input.trim() === '') return null;
  const flags = caseSensitive ? 'g' : 'gi';
  try {
    return new RegExp(input, flags);
  } catch (e) {
    return null;
  }
}

export function isValidRegex(input) {
  if (!input || input.trim() === '') return true;
  try {
    new RegExp(input);
    return true;
  } catch (e) {
    return false;
  }
}

export function highlight(text, re) {
  if (!re) return escapeHtml(text);
  const escaped = escapeHtml(text);
  re.lastIndex = 0;
  return escaped.replace(re, function(m) {
    return '<mark>' + m + '</mark>';
  });
}

export function matchesSearch(record, re) {
  if (!re) return true;
  re.lastIndex = 0;
  if (re.test(record.description)) return true;
  re.lastIndex = 0;
  if (re.test(record.category)) return true;
  re.lastIndex = 0;
  if (re.test(String(record.amount))) return true;
  re.lastIndex = 0;
  if (re.test(record.date)) return true;
  return false;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}