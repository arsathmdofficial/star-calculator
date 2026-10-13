/**
 * Precision Math and Calculator Engine
 */

export const PRECISION_LIMIT = 12;

/**
 * Format a number cleanly, eliminating floating point noise like 0.30000000000000004
 */
export function cleanNumber(num: number): number {
  if (!isFinite(num)) return num;
  return parseFloat(num.toPrecision(PRECISION_LIMIT));
}

/**
 * Formats a raw display string with localized thousands separators
 * while preserving trailing decimals and minus signs during active typing.
 */
export function formatDisplayValue(val: string): string {
  if (!val || val === 'Error' || val === 'Cannot divide by zero' || val === 'Invalid Input') {
    return val;
  }

  // If number in scientific notation (e.g. 1.23e+15)
  if (val.includes('e') || val.includes('E')) {
    return val;
  }

  const isNegative = val.startsWith('-');
  const unsigned = isNegative ? val.slice(1) : val;

  const parts = unsigned.split('.');
  const integerPart = parts[0] || '0';
  const decimalPart = parts[1];

  // Add commas to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  let result = (isNegative ? '-' : '') + formattedInteger;
  if (val.includes('.')) {
    result += '.' + (decimalPart !== undefined ? decimalPart : '');
  }

  return result;
}

/**
 * Safe expression evaluation for mathematical formulas with order of operations
 */
export function evaluateSafeExpression(expr: string): { result: number; error: string | null } {
  try {
    // Sanitize expression: replace visual math symbols with JS operators
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/\^/g, '**')
      .replace(/mod/g, '%')
      .replace(/π/g, `(${Math.PI})`)
      .replace(/e(?!\d)/g, `(${Math.E})`);

    // Only allow safe math tokens: numbers, operators, parens, decimal, spaces, Math constants
    const safeRegex = /^[0-9+\-*/().%\s*]+$/;
    if (!safeRegex.test(sanitized)) {
      return { result: 0, error: 'Invalid characters in expression' };
    }

    // Check for division by zero before eval
    if (/\/0(?!\.)(?!\d)/.test(sanitized) || /\/\s*0(?!\.)(?!\d)/.test(sanitized)) {
      return { result: 0, error: 'Cannot divide by zero' };
    }

    // Use Function constructor in a closed scope without window/global access
    const evalFn = new Function(`"use strict"; return (${sanitized});`);
    const rawResult = evalFn();

    if (typeof rawResult !== 'number' || isNaN(rawResult)) {
      return { result: 0, error: 'Invalid Expression' };
    }

    if (!isFinite(rawResult)) {
      return { result: 0, error: 'Cannot divide by zero' };
    }

    return { result: cleanNumber(rawResult), error: null };
  } catch (err) {
    return { result: 0, error: 'Invalid Expression' };
  }
}

/**
 * Execute a single binary operation
 */
export function executeBinaryOp(
  a: number,
  b: number,
  op: '+' | '−' | '×' | '÷' | '^' | 'mod'
): { result: number; error: string | null } {
  let res: number;
  switch (op) {
    case '+':
      res = cleanNumber(a + b);
      break;
    case '−':
      res = cleanNumber(a - b);
      break;
    case '×':
      res = cleanNumber(a * b);
      break;
    case '÷':
      if (b === 0) return { result: 0, error: 'Cannot divide by zero' };
      res = cleanNumber(a / b);
      break;
    case '^':
      res = cleanNumber(Math.pow(a, b));
      break;
    case 'mod':
      if (b === 0) return { result: 0, error: 'Cannot divide by zero' };
      res = cleanNumber(a % b);
      break;
    default:
      return { result: b, error: null };
  }

  if (!isFinite(res)) {
    return { result: 0, error: 'Value out of range' };
  }
  return { result: res, error: null };
}

/**
 * Validates a restored history payload
 */
export function validateHistoryImport(data: unknown): { isValid: boolean; error?: string; count?: number } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'File content is not a valid JSON object.' };
  }

  const payload = data as Record<string, unknown>;

  // Check array either directly or under history property
  const items = Array.isArray(payload) ? payload : Array.isArray(payload.history) ? payload.history : null;

  if (!items) {
    return { isValid: false, error: 'No history records found in backup.' };
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (
      !item ||
      typeof item !== 'object' ||
      typeof (item as Record<string, unknown>).expression !== 'string' ||
      typeof (item as Record<string, unknown>).result !== 'string'
    ) {
      return { isValid: false, error: `Invalid entry structure found at record #${i + 1}.` };
    }
  }

  return { isValid: true, count: items.length };
}
