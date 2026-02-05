/**
 * TOC DOM generation using existing styled elements
 */

import type { HeadingEntry } from './headings';

interface ExistingElements {
  container: HTMLElement;
  wrapperElements: HTMLElement[]; // Existing wrapper elements (fs-toc_link-wrapper or similar)
  linkTemplate: HTMLElement; // Template link element to clone if needed
  wrapperTemplate: HTMLElement; // Template wrapper element to clone if needed
}

/**
 * Find existing wrapper elements in the DOM
 * Looks for elements with classes like fs-toc_link-wrapper or similar patterns
 */
function findExistingWrappers(container: HTMLElement): HTMLElement[] {
  // Try multiple selector patterns to find existing wrappers
  const selectors = [
    '.fs-toc_link-wrapper',
    '[class*="toc_link-wrapper"]',
    '[class*="toc-wrapper"]',
    '.heard-toc-wrapper',
  ];

  for (const selector of selectors) {
    const wrappers = Array.from(container.querySelectorAll<HTMLElement>(selector));
    if (wrappers.length > 0) {
      return wrappers;
    }
  }

  // If no wrappers found with classes, look for direct children that might be wrappers
  // This handles cases where wrappers don't have specific classes
  return Array.from(container.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement
  );
}

/**
 * Find existing link elements within wrappers
 */
function findLinkInWrapper(wrapper: HTMLElement): HTMLElement | null {
  // Try multiple patterns to find the link element
  const selectors = [
    '.fs-toc_link',
    'a[class*="toc_link"]',
    'a',
    '[heard-toc-element="link"]',
  ];

  for (const selector of selectors) {
    const link = wrapper.querySelector<HTMLElement>(selector);
    if (link) {
      return link;
    }
  }

  // If no link found, the wrapper itself might be the link
  if (wrapper.tagName === 'A' || wrapper.hasAttribute('href')) {
    return wrapper;
  }

  return null;
}

/**
 * Find heading element within link (like fs-toc_link-h2, fs-toc_link-h3)
 */
function findHeadingInLink(linkEl: HTMLElement, level: number): HTMLElement | null {
  // Look for heading elements with level-specific classes
  const headingSelectors = [
    `.fs-toc_link-h${level}`,
    `h${level}[class*="toc_link"]`,
    `h${level}`,
  ];

  for (const selector of headingSelectors) {
    const heading = linkEl.querySelector<HTMLElement>(selector);
    if (heading) {
      return heading;
    }
  }

  return null;
}

/**
 * Discover existing DOM structure
 */
function findExistingElements(): ExistingElements | null {
  // Find the container
  const container = document.querySelector<HTMLElement>('[heard-toc-element="table"]') ||
                    document.querySelector<HTMLElement>('.fs-toc_link-content') ||
                    document.querySelector<HTMLElement>('[class*="toc_link-content"]');
  
  if (!container) {
    console.warn('[Heard TOC] No TOC container found. Add heard-toc-element="table" or .fs-toc_link-content');
    return null;
  }

  // Find existing wrapper elements
  const wrapperElements = findExistingWrappers(container);

  // Find template elements for cloning if needed
  const linkTemplate = document.querySelector<HTMLElement>('[heard-toc-element="link"]') ||
                       container.querySelector<HTMLElement>('.fs-toc_link') ||
                       container.querySelector<HTMLElement>('a');

  const wrapperTemplate = wrapperElements.length > 0 
    ? wrapperElements[0] 
    : container.querySelector<HTMLElement>('.fs-toc_link-wrapper') ||
      container.firstElementChild as HTMLElement;

  if (!linkTemplate || !wrapperTemplate) {
    console.warn('[Heard TOC] Could not find template elements');
    return null;
  }

  return {
    container,
    wrapperElements,
    linkTemplate,
    wrapperTemplate,
  };
}

/**
 * Populate an existing link element with heading data
 */
function populateLinkElement(
  linkEl: HTMLElement,
  heading: HeadingEntry
): void {
  // Set href on anchor element
  if (linkEl.tagName === 'A') {
    (linkEl as HTMLAnchorElement).href = `#${heading.id}`;
  } else {
    // Find nested anchor or set data attribute
    const anchor = linkEl.querySelector<HTMLAnchorElement>('a');
    if (anchor) {
      anchor.href = `#${heading.id}`;
    } else {
      linkEl.setAttribute('data-toc-link', heading.id);
      // Make it clickable
      linkEl.style.cursor = 'pointer';
      linkEl.addEventListener('click', () => {
        const target = document.getElementById(heading.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  // Set text content - look for heading element first (like fs-toc_link-h2)
  const headingEl = findHeadingInLink(linkEl, heading.level);
  if (headingEl) {
    headingEl.textContent = heading.text;
  } else if (linkEl.tagName === 'A') {
    linkEl.textContent = heading.text;
  } else {
    // Find nested anchor or text element
    const anchor = linkEl.querySelector('a');
    if (anchor) {
      anchor.textContent = heading.text;
    } else {
      // Update the element's text content directly
      linkEl.textContent = heading.text;
    }
  }
}

/**
 * Get or create a wrapper element for a heading
 */
function getOrCreateWrapper(
  existing: ExistingElements,
  heading: HeadingEntry,
  index: number
): HTMLElement {
  // Try to use existing wrapper if available
  if (index < existing.wrapperElements.length) {
    return existing.wrapperElements[index];
  }

  // Clone the template wrapper to create a new one
  const wrapper = existing.wrapperTemplate.cloneNode(true) as HTMLElement;
  
  // Remove any template attributes
  wrapper.removeAttribute('heard-toc-element');
  
  // Clear any existing content that might be template content
  const linkInWrapper = findLinkInWrapper(wrapper);
  if (linkInWrapper && linkInWrapper.hasAttribute('heard-toc-element')) {
    // Keep the structure but we'll populate it
  }

  return wrapper;
}

/**
 * Build TOC by populating existing elements
 */
function populateExistingElements(
  headings: HeadingEntry[],
  existing: ExistingElements
): void {
  const visibleHeadings = headings.filter(h => !h.omitted);
  
  if (visibleHeadings.length === 0) {
    // Hide all wrappers if no headings
    existing.wrapperElements.forEach(wrapper => {
      wrapper.style.display = 'none';
    });
    return;
  }

  // Populate existing wrappers in order, creating new ones if needed
  visibleHeadings.forEach((heading, index) => {
    // Get or create wrapper
    let wrapper = getOrCreateWrapper(existing, heading, index);
    
    // Ensure wrapper is visible
    wrapper.style.display = '';
    
    // Find or create link within wrapper
    let linkEl = findLinkInWrapper(wrapper);
    
    if (!linkEl) {
      // Clone link template and insert into wrapper
      linkEl = existing.linkTemplate.cloneNode(true) as HTMLElement;
      linkEl.removeAttribute('heard-toc-element');
      
      // Find innermost container in wrapper to insert link
      let container = wrapper;
      while (container.children.length > 0) {
        const firstChild = container.children[0];
        if (firstChild.tagName === 'DIV' || firstChild.tagName === 'SPAN') {
          container = firstChild as HTMLElement;
        } else {
          break;
        }
      }
      container.appendChild(linkEl);
    }

    // Populate the link with heading data
    populateLinkElement(linkEl, heading);
    
    // If this is a newly created wrapper, append it to container
    // (existing wrappers are already in the DOM, so we don't move them)
    if (index >= existing.wrapperElements.length && wrapper.parentElement !== existing.container) {
      existing.container.appendChild(wrapper);
    }
  });

  // Hide unused existing wrappers (but don't remove them - preserve DOM structure)
  existing.wrapperElements.forEach((wrapper, index) => {
    if (index >= visibleHeadings.length) {
      wrapper.style.display = 'none';
    }
  });

  // Remove template link element if it exists and wasn't used
  const templateLink = existing.container.querySelector('[heard-toc-element="link"]');
  if (templateLink) {
    const templateWrapper = templateLink.closest('.fs-toc_link-wrapper') || 
                            templateLink.parentElement;
    // Only remove if it's not one of the wrappers we're using
    const isUsed = existing.wrapperElements.some(w => 
      w === templateWrapper || w.contains(templateLink)
    );
    if (!isUsed) {
      templateLink.remove();
    }
  }
}

/**
 * Build and populate the TOC using existing DOM elements
 */
export function buildTOC(headings: HeadingEntry[]): boolean {
  if (headings.length === 0) {
    console.warn('[Heard TOC] No headings found to build TOC');
    return false;
  }

  const existing = findExistingElements();
  if (!existing) {
    return false;
  }

  // Populate existing elements with heading data
  populateExistingElements(headings, existing);

  const visibleCount = headings.filter(h => !h.omitted).length;
  console.log(`[Heard TOC] Populated ${visibleCount} TOC item(s) using existing DOM elements`);

  return true;
}
