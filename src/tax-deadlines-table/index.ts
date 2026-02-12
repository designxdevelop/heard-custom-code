/**
 * Tax Deadlines Table Converter
 * Dynamically converts Webflow CMS list items into a semantic HTML table
 * for better AEO (Answer Engine Optimization)
 */

interface DeadlineItem {
  date: string;
  description: string;
}

class TaxDeadlinesTableConverter {
  private sourceList: HTMLElement | null = null;
  private targetContainer: HTMLElement | null = null;
  private stylesInjected: boolean = false;

  constructor() {
    this.injectStyles();
    this.init();
  }

  private injectStyles(): void {
    // Only inject styles once
    if (this.stylesInjected) return;
    
    // Check if styles already exist
    if (document.getElementById('heard-tax-deadlines-table-styles')) {
      this.stylesInjected = true;
      return;
    }

    const style = document.createElement('style');
    style.id = 'heard-tax-deadlines-table-styles';
    style.textContent = `
.tax-deadlines-table {
  width: 100%;
  border-collapse: collapse;
  margin: 2.5rem 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}
.tax-deadlines-table thead {
  background: #226752;
  color: #ffffff;
}
.tax-deadlines-table th {
  padding: 1.25rem 1.75rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-bottom: 2px solid rgba(255, 255, 255, 0.4);
  position: relative;
}
.tax-deadlines-table th:first-child {
  border-top-left-radius: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}
.tax-deadlines-table th:last-child {
  border-top-right-radius: 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
}
.tax-deadlines-table tbody tr:first-child td {
  border-top: 1px solid #e5e7eb;
}
.tax-deadlines-table tbody tr td:first-child {
  border-left: 1px solid #e5e7eb;
}
.tax-deadlines-table tbody tr td:last-child {
  border-right: 1px solid #e5e7eb;
}
.tax-deadlines-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #ffffff;
}
.tax-deadlines-table tbody tr:nth-child(even) {
  background-color: #fafbfc;
}
.tax-deadlines-table tbody tr:last-child td {
  border-bottom: 1px solid #e5e7eb;
}
.tax-deadlines-table tbody tr:hover {
  background-color: #f0f9ff;
}
.tax-deadlines-table td {
  padding: 1.25rem 1.75rem;
  font-size: 0.9375rem;
  line-height: 1.65;
  vertical-align: top;
  text-align: left;
  border: 1px solid #e5e7eb;
  border-top: none;
}
.tax-deadline-date {
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  min-width: 160px;
  font-size: 0.9375rem;
  letter-spacing: -0.01em;
  text-align: left;
}
.tax-deadline-description {
  color: #475569;
  font-weight: 400;
  text-align: left;
}
@media (max-width: 768px) {
  .tax-deadlines-table {
    border-radius: 10px;
    margin: 2rem 0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03);
  }
  .tax-deadlines-table th {
    padding: 1rem 1.25rem;
    font-size: 0.8125rem;
  }
  .tax-deadlines-table td {
    padding: 1rem 1.25rem;
    font-size: 0.875rem;
  }
  .tax-deadline-date {
    min-width: 140px;
    font-size: 0.875rem;
  }
}
@media (max-width: 640px) {
  .tax-deadlines-table {
    border-radius: 12px;
    border: none !important;
    box-shadow: none;
    background: transparent;
  }
  .tax-deadlines-table, .tax-deadlines-table thead, .tax-deadlines-table tbody, .tax-deadlines-table tr, .tax-deadlines-table th, .tax-deadlines-table td {
    display: block;
  }
  .tax-deadlines-table thead {
    display: none;
  }
  .tax-deadlines-table tbody tr {
    margin-bottom: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.25rem;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .tax-deadlines-table tbody tr:first-child td {
    border-top: none !important;
  }
  .tax-deadlines-table tbody tr td:first-child {
    border-left: none !important;
  }
  .tax-deadlines-table tbody tr td:last-child {
    border-right: none !important;
  }
  .tax-deadlines-table tbody tr:last-child td {
    border-bottom: none !important;
  }
  .tax-deadlines-table tbody tr:nth-child(even) {
    background-color: #ffffff;
  }
  .tax-deadlines-table tbody tr:hover {
    background-color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
    border-color: #2d4a2d;
  }
  .tax-deadlines-table td {
    padding: 0;
    border: none !important;
    text-align: left;
  }
  .tax-deadlines-table th {
    border: none !important;
  }
  .tax-deadline-date {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: #2d4a2d;
    min-width: auto;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .tax-deadline-date::before {
    content: "📅";
    font-size: 1.125rem;
    opacity: 0.8;
  }
  .tax-deadline-description {
    font-size: 0.9375rem;
    padding-left: 0;
    color: #475569;
    line-height: 1.7;
  }
}
@media print {
  .tax-deadlines-table {
    box-shadow: none;
    border: 2px solid #000;
    page-break-inside: avoid;
  }
  .tax-deadlines-table thead {
    background: #000 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .tax-deadlines-table th, .tax-deadlines-table td {
    border: 1px solid #000;
    text-align: left;
  }
  .tax-deadlines-table tbody tr {
    border-bottom: 1px solid #000;
    page-break-inside: avoid;
  }
  .tax-deadlines-table tbody tr:hover {
    background-color: transparent;
    transform: none;
    box-shadow: none;
  }
  .tax-deadlines-table tbody tr:nth-child(even) {
    background-color: #f5f5f5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;

    document.head.appendChild(style);
    this.stylesInjected = true;
  }

  private init(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.convert());
    } else {
      this.convert();
    }
  }

  private convert(): void {
    // Find the CMS list container
    this.sourceList = document.querySelector('.cms-list-tax-deadlines');
    
    if (!this.sourceList) {
      console.warn('Tax deadlines list not found');
      return;
    }

    // Extract data from list items
    const deadlines = this.extractDeadlines();
    
    if (deadlines.length === 0) {
      console.warn('No deadline items found');
      return;
    }

    // Create table
    const table = this.createTable(deadlines);
    
    // Replace the list with the table
    this.replaceListWithTable(table);
  }

  private extractDeadlines(): DeadlineItem[] {
    if (!this.sourceList) return [];

    const items = this.sourceList.querySelectorAll('.cms-item-taxdeadline');
    const deadlines: DeadlineItem[] = [];

    items.forEach((item) => {
      const dateElement = item.querySelector('.text-weight-bold');
      const descriptionElement = item.querySelector('.text-size-medium');

      if (dateElement && descriptionElement) {
        deadlines.push({
          date: dateElement.textContent?.trim() || '',
          description: descriptionElement.textContent?.trim() || ''
        });
      }
    });

    return deadlines;
  }

  private createTable(deadlines: DeadlineItem[]): HTMLTableElement {
    const table = document.createElement('table');
    table.className = 'tax-deadlines-table';
    table.setAttribute('role', 'table');
    table.setAttribute('aria-label', 'Tax deadlines for therapists');

    // Create table head
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const dateHeader = document.createElement('th');
    dateHeader.textContent = 'Date';
    dateHeader.setAttribute('scope', 'col');
    
    const descriptionHeader = document.createElement('th');
    descriptionHeader.textContent = 'Deadline';
    descriptionHeader.setAttribute('scope', 'col');
    
    headerRow.appendChild(dateHeader);
    headerRow.appendChild(descriptionHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    
    deadlines.forEach((deadline) => {
      const row = document.createElement('tr');
      
      const dateCell = document.createElement('td');
      dateCell.className = 'tax-deadline-date';
      dateCell.textContent = deadline.date;
      
      const descriptionCell = document.createElement('td');
      descriptionCell.className = 'tax-deadline-description';
      descriptionCell.textContent = deadline.description;
      
      row.appendChild(dateCell);
      row.appendChild(descriptionCell);
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);

    return table;
  }

  private replaceListWithTable(table: HTMLTableElement): void {
    if (!this.sourceList) return;

    // Get the parent container
    const parent = this.sourceList.parentElement;
    
    if (!parent) {
      console.warn('Parent container not found');
      return;
    }

    // Insert table before the list
    parent.insertBefore(table, this.sourceList);
    
    // Hide the original list (keep it in DOM for Webflow CMS)
    this.sourceList.style.display = 'none';
    
    // Add a data attribute to mark it as converted
    this.sourceList.setAttribute('data-converted-to-table', 'true');
  }
}

// Initialize the converter
new TaxDeadlinesTableConverter();
