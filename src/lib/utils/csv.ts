/**
 * Characters that could trigger formula execution in spreadsheet apps.
 * Prefixing with a single quote prevents injection.
 */
const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Sanitize a cell value for CSV export to prevent formula injection.
 * If the value starts with a formula trigger character, prefix with single quote.
 */
function sanitizeCsvValue(value: string): string {
  if (value.length > 0 && FORMULA_TRIGGERS.some(trigger => value.startsWith(trigger))) {
    return `'${value}`;
  }
  return value;
}

/**
 * Escape a value for CSV format.
 * Wraps in quotes if the value contains commas, newlines, or double quotes.
 * Double quotes within the value are escaped by doubling them.
 */
function escapeCsvField(value: string): string {
  const sanitized = sanitizeCsvValue(value);
  if (sanitized.includes(',') || sanitized.includes('"') || sanitized.includes('\n') || sanitized.includes('\r')) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
}

/**
 * Convert an array of objects to a CSV string.
 * Includes UTF-8 BOM for Excel compatibility with ₹ symbol.
 * 
 * @param data Array of objects to convert
 * @param columns Column definitions with key and header label
 * @returns CSV string with BOM
 */
export function generateCsv<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const BOM = '\uFEFF';
  
  // Header row
  const headerRow = columns.map(col => escapeCsvField(col.header)).join(',');
  
  // Data rows
  const dataRows = data.map(row =>
    columns.map(col => {
      const value = row[col.key];
      const stringValue = value === null || value === undefined ? '' : String(value);
      return escapeCsvField(stringValue);
    }).join(',')
  );
  
  return BOM + [headerRow, ...dataRows].join('\n');
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 2000);
}

/**
 * Trigger a JSON file download in the browser.
 */
export function downloadJson(jsonContent: string, filename: string): void {
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 2000);
}
