/**
 * TOC DOM generation from link template
 */

import type { HeadingEntry } from './headings';

interface TemplateStructure {
  linkEl: HTMLElement;
  wrappers: Map<number, HTMLElement>; // level -> wrapper element
  maxLevel: number;
}

/**
 * Find and parse the link template structure
 * Webflow structure: H2 wrapper > H3 wrapper > H4 wrapper > ... > link element
 */
function findTemplateStructure(): TemplateStructure | null {
  const linkEl = document.querySelector<HTMLElement>('[heard-toc-element="link"]');
  if (!linkEl) {
    console.warn('[Heard TOC] No element with heard-toc-element="link" found');
    return null;
  }

  const wrappers = new Map<number, HTMLElement>();
  
  // Walk up from the link element to find nested wrappers
  // Each parent div represents a heading level wrapper
  // Structure: outermost div (H2) > inner div (H3) > innermost div (H4) > link
  let currentEl: HTMLElement | null = linkEl.parentElement;
  let level = 2; // Start from H2 (H1 is typically page title, not in TOC)

  while (currentEl && currentEl !== document.body && level <= 6) {
    // Clone the wrapper for this level
    const wrapperClone = currentEl.cloneNode(true) as HTMLElement;
    // Remove the original link template from the clone
    const linkInClone = wrapperClone.querySelector('[heard-toc-element="link"]');
    if (linkInClone) {
      linkInClone.remove();
    }
    wrappers.set(level, wrapperClone);
    
    currentEl = currentEl.parentElement;
    level++;
  }

  const maxLevel = wrappers.size > 0 ? Math.max(...Array.from(wrappers.keys())) : 2;

  return {
    linkEl,
    wrappers,
    maxLevel: Math.max(maxLevel, 2),
  };
}

/**
 * Clone the link template
 */
function cloneLinkTemplate(template: TemplateStructure): HTMLElement {
  const clonedLink = template.linkEl.cloneNode(true) as HTMLElement;
  // Remove the heard-toc-element attribute from cloned links
  clonedLink.removeAttribute('heard-toc-element');
  return clonedLink;
}

/**
 * Create a wrapper for a specific heading level
 */
function createLevelWrapper(
  template: TemplateStructure,
  level: number,
  linkEl: HTMLElement
): HTMLElement {
  // Find the wrapper template for this level
  let wrapperTemplate = template.wrappers.get(level);
  
  if (!wrapperTemplate) {
    // Use the closest available wrapper (prefer higher level if exact match not found)
    const availableLevels = Array.from(template.wrappers.keys()).sort((a, b) => a - b);
    const closestLevel = availableLevels.find(l => l >= level) || availableLevels[availableLevels.length - 1];
    wrapperTemplate = template.wrappers.get(closestLevel)!;
  }

  // Clone the wrapper template
  const wrapper = wrapperTemplate.cloneNode(true) as HTMLElement;
  
  // Insert our link into the wrapper
  // If wrapper has nested structure, find the innermost container
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
  
  return wrapper;
}

/**
 * Build nested TOC structure from headings
 */
function buildNestedStructure(
  headings: HeadingEntry[],
  template: TemplateStructure
): HTMLElement[] {
  const items: HTMLElement[] = [];
  const stack: { level: number; wrapper: HTMLElement }[] = [];

  headings.forEach((heading) => {
    if (heading.omitted) return;

    // Clone the link template
    const linkEl = cloneLinkTemplate(template);
    
    // Set link href and text
    if (linkEl.tagName === 'A') {
      (linkEl as HTMLAnchorElement).href = `#${heading.id}`;
    } else {
      // If it's not an anchor, make it clickable or find nested anchor
      const anchor = linkEl.querySelector('a') || linkEl;
      if (anchor.tagName === 'A') {
        (anchor as HTMLAnchorElement).href = `#${heading.id}`;
      } else {
        // Create a data attribute for JavaScript click handling
        linkEl.setAttribute('data-toc-link', heading.id);
      }
    }

    // Set link text
    // The link element itself or a nested text element should contain the text
    if (linkEl.tagName === 'A') {
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

    // Create wrapper for this heading level
    let wrapper = createLevelWrapper(template, heading.level, linkEl);

    // Handle nesting: pop stack until we find the correct parent level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length > 0) {
      // Nest under the parent wrapper
      const parent = stack[stack.length - 1].wrapper;
      parent.appendChild(wrapper);
    } else {
      // Top-level item
      items.push(wrapper);
    }

    stack.push({ level: heading.level, wrapper });
  });

  return items;
}

/**
 * Find the table container where TOC should be inserted
 */
function findTableContainer(template: TemplateStructure): HTMLElement | null {
  const tableEl = document.querySelector<HTMLElement>('[heard-toc-element="table"]');
  if (tableEl) {
    return tableEl;
  }

  // Default: use the first parent wrapper of the link template
  return template.linkEl.parentElement;
}

/**
 * Build and insert the TOC into the DOM
 */
export function buildTOC(headings: HeadingEntry[]): boolean {
  if (headings.length === 0) {
    console.warn('[Heard TOC] No headings found to build TOC');
    return false;
  }

  const template = findTemplateStructure();
  if (!template) {
    return false;
  }

  // Build nested structure
  const tocItems = buildNestedStructure(headings, template);

  if (tocItems.length === 0) {
    console.warn('[Heard TOC] No TOC items generated (all headings may be omitted)');
    return false;
  }

  // Find container
  const container = findTableContainer(template);
  if (!container) {
    console.warn('[Heard TOC] Could not find table container');
    return false;
  }

  // Remove the original template elements
  template.linkEl.remove();
  
  // Clear container and insert TOC items
  container.innerHTML = '';
  tocItems.forEach((item) => container.appendChild(item));

  return true;
}
