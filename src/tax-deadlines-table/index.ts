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

  constructor() {
    this.init();
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
