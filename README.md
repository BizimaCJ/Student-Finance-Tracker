# FinTrack - Student Finance Tracker

A simple, accessible student finance tracker built with plain HTML, CSS, and JavaScript.

Live URL: https://yourusername.github.io/student-finance-tracker

## Overview

FinTrack lets you record spending, set a monthly budget, search and sort transactions, and view a spending dashboard. All data is stored in your browser using localStorage. You can export your data as JSON and import it back.

## How to Run Locally

1. Clone the repository:
   git clone https://github.com/yourusername/student-finance-tracker.git

2. Open the folder in a code editor such as VS Code.

3. Use the Live Server extension in VS Code (right-click index.html and choose Open with Live Server) or any local HTTP server. You cannot open index.html directly as a file because ES modules require a server.

4. The app opens in your browser at localhost.

5. To run tests, open tests.html in the same server.

## Features

- Add, edit, and delete transactions
- Sort transactions by date, amount, or name
- Live regex search with match highlighting
- Dashboard with total spent, top category, 7-day trend chart, and category breakdown
- Monthly budget with progress bar and over-budget alert
- Dark and light mode toggle (default: dark)
- Import and export transactions as JSON
- Manage custom categories in Settings
- Multi-currency display with manual exchange rates
- Data saved automatically in localStorage
- Fully keyboard navigable
- ARIA live regions for budget messages and status updates

## File Structure

```
index.html          main page
tests.html          validator and search tests
seed.json           sample data (import via Transactions page)
styles/
  main.css          all styles
scripts/
  app.js            main controller, wires everything together
  state.js          in-memory state and localStorage helpers
  storage.js        raw localStorage read/write
  validators.js     all regex validation functions
  search.js         regex compiler and highlight helpers
  ui.js             all DOM rendering functions
```

## Regex Catalog

| Pattern | Purpose | Example Match |
|---|---|---|
| /^\S(?:.*\S)?$/ | Description: no leading/trailing spaces | "Lunch" passes, " Lunch" fails |
| /^(0|[1-9]\d*)(\.\d{1,2})?$/ | Amount: positive number, up to 2 decimal places | "12.50" passes, "1.234" fails |
| /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/ | Date: YYYY-MM-DD format | "2025-09-29" passes, "29-09-2025" fails |
| /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/ | Category: letters, spaces, hyphens only | "Fast Food" passes, "Food123" fails |
| /\b(\w+)\s+\1\b/i | Advanced: duplicate word detection (back-reference) | "the the" matches |
| /\.\d{2}\b/ | Search example: find amounts with cents | "12.50" matches |
| /(coffee|tea|juice|water|soda|drink)/i | Search example: find beverages | "Coffee with friends" matches |

## Keyboard Map

| Key | Action |
|---|---|
| Tab | Move to next focusable element |
| Shift+Tab | Move to previous focusable element |
| Enter | Activate link or button |
| Space | Activate button or checkbox |
| Arrow keys | Move within select dropdowns |
| Escape | (browser default for dialogs) |

Skip-to-content link: Press Tab on page load to reveal it, then Enter to jump to main content.

## Accessibility Notes

- All pages use semantic landmarks: header, nav, main, section, footer
- All headings follow a logical h1 > h2 hierarchy
- All inputs have associated label elements
- Error messages use role="alert" for immediate announcement
- Status messages use role="status" and aria-live="polite"
- Budget over-limit message uses aria-live="assertive"
- Focus styles are visible on all interactive elements
- Skip-to-content link is present at the top of the page
- Color contrast meets WCAG AA in both dark and light themes
- The transactions table uses scope="col" on all headers

## Testing

Open tests.html in a local server. All tests run automatically and results display on screen. Tests cover:
- Description validation (valid, empty, leading/trailing space, duplicate word)
- Amount validation (valid, empty, negative, too many decimals, letters)
- Date validation (valid, empty, wrong format, invalid month, invalid day)
- Category validation (valid, empty, with numbers)
- Budget validation
- Import record validation
- hasCents and isBeverage helpers
- Regex compiler (valid, invalid, empty)
- matchesSearch (match, no match)

## Milestones

- M1: HTML structure, data model, semantic layout
- M2: Base CSS, mobile-first layout, three breakpoints
- M3: Form validation with 4+ regex rules including back-reference
- M4: Transactions table, sorting, live regex search with highlight
- M5: Dashboard stats, budget bar, trend chart, category breakdown
- M6: localStorage persistence, JSON import/export, settings page
- M7: Dark/light theme, animations, keyboard pass, accessibility audit

## Deploy to GitHub Pages

See the GitHub Pages section below for step-by-step instructions.