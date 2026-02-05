/**
 * TOC DOM generation using existing styled elements
 * 
 * Expected Webflow DOM structure:
 * 
 * <div heard-toc-element="table" class="fs-toc_sidebar">
 *   <h3>Table of Contents</h3>
 *   <div class="fs-toc_link-content">
 *     <div class="fs-toc_link-wrapper is-h2">
 *       <a class="fs-toc_link w-inline-block">
 *         <div heard-toc-element="link" class="fs-toc_link-h2">Heading text</div>
 *       </a>
 *       <div class="fs-toc_link-wrapper is-h3">
 *         <a class="fs-toc_link is-h3 w-inline-block">Sub heading text</a>
 *       </div>
 *       <div fs-toc-element="ix-trigger" class="fs-toc_h-trigger"></div>
 *     </div>
 *   </div>
 * </div>
 */

import type { HeadingEntry } from './headings';

/**
 * Captured template information from the original DOM
 */
interface TOCTemplate {
  /** The container element where TOC link wrappers are placed (fs-toc_link-content) */
  linkContent: HTMLElement;
  /** The outer table element (fs-toc_sidebar) */
  tableEl: HTMLElement;
  /** Classes for the wrapper div (e.g. "fs-toc_link-wrapper") */
  wrapperBaseClasses: string[];
  /** Classes for the anchor element (e.g. "fs-toc_link w-inline-block") */
  linkClasses: string[];
  /** Classes for the text div inside the anchor (e.g. "fs-toc_link-h2") - may be null if text is directly in the <a> */
  textDivBaseClass: string | null;
  /** Whether there's an ix-trigger element to clone per wrapper */
  ixTriggerTemplate: HTMLElement | null;
}

/**
 * Discover and capture template information from the existing Webflow DOM,
 * then clear the link-content container for fresh population.
 */
function captureTemplate(): TOCTemplate | null {
  // Find the table element
  const tableEl = document.querySelector<HTMLElement>('[heard-toc-element="table"]') ||
                  document.querySelector<HTMLElement>('.fs-toc_sidebar');

  if (!tableEl) {
    console.warn('[Heard TOC] No TOC table element found. Add heard-toc-element="table".');
    return null;
  }

  // Find the link-content container (where wrappers go)
  const linkContent = tableEl.querySelector<HTMLElement>('.fs-toc_link-content') ||
                      tableEl.querySelector<HTMLElement>('[class*="toc_link-content"]');

  if (!linkContent) {
    // If no nested link-content, the table itself might be the container
    // Look for wrapper children directly
    const firstWrapper = tableEl.querySelector<HTMLElement>('.fs-toc_link-wrapper') ||
                         tableEl.querySelector<HTMLElement>('[class*="toc_link-wrapper"]');
    if (!firstWrapper) {
      console.warn('[Heard TOC] No link-content container found inside TOC table.');
      return null;
    }
    // Use tableEl as the container
    return captureFromContainer(tableEl, tableEl, firstWrapper);
  }

  // Find the first wrapper to use as template
  const firstWrapper = linkContent.querySelector<HTMLElement>(':scope > .fs-toc_link-wrapper') ||
                       linkContent.querySelector<HTMLElement>('.fs-toc_link-wrapper');

  if (!firstWrapper) {
    console.warn('[Heard TOC] No fs-toc_link-wrapper found inside link-content.');
    return null;
  }

  return captureFromContainer(tableEl, linkContent, firstWrapper);
}

/**
 * Extract template data from a wrapper element
 */
function captureFromContainer(
  tableEl: HTMLElement,
  linkContent: HTMLElement,
  firstWrapper: HTMLElement,
): TOCTemplate | null {
  // Capture wrapper base classes (without level-specific ones like is-h2, is-h3)
  const wrapperBaseClasses = Array.from(firstWrapper.classList).filter(
    cls => !cls.match(/^is-h[2-6]$/)
  );

  // Find the anchor inside the wrapper
  const anchor = firstWrapper.querySelector<HTMLAnchorElement>(':scope > a.fs-toc_link') ||
                 firstWrapper.querySelector<HTMLAnchorElement>(':scope > a') ||
                 firstWrapper.querySelector<HTMLAnchorElement>('a.fs-toc_link') ||
                 firstWrapper.querySelector<HTMLAnchorElement>('a');

  if (!anchor) {
    console.warn('[Heard TOC] No anchor element found inside wrapper template.');
    return null;
  }

  // Capture link classes
  const linkClasses = Array.from(anchor.classList).filter(
    cls => !cls.match(/^is-h[2-6]$/)
  );

  // Check if there's a text div inside the anchor (like fs-toc_link-h2)
  const textDiv = anchor.querySelector<HTMLElement>('[heard-toc-element="link"]') ||
                  anchor.querySelector<HTMLElement>('[class*="fs-toc_link-h"]');

  let textDivBaseClass: string | null = null;
  if (textDiv) {
    // Get the base class without the level number, e.g. "fs-toc_link-h" from "fs-toc_link-h2"
    const cls = Array.from(textDiv.classList).find(c => c.match(/fs-toc_link-h\d?/));
    if (cls) {
      // Strip the trailing digit to get base
      textDivBaseClass = cls.replace(/\d$/, '');
    } else {
      textDivBaseClass = textDiv.className.split(' ')[0] || null;
    }
  }

  // Check for ix-trigger
  const ixTrigger = firstWrapper.querySelector<HTMLElement>('[fs-toc-element="ix-trigger"]') ||
                    firstWrapper.querySelector<HTMLElement>('.fs-toc_h-trigger');
  const ixTriggerTemplate = ixTrigger ? ixTrigger.cloneNode(true) as HTMLElement : null;

  // Now clear the link-content container
  linkContent.innerHTML = '';

  return {
    linkContent,
    tableEl,
    wrapperBaseClasses,
    linkClasses,
    textDivBaseClass,
    ixTriggerTemplate,
  };
}

/**
 * Create a single TOC entry wrapper for a heading
 */
function createWrapperForHeading(
  heading: HeadingEntry,
  template: TOCTemplate,
): HTMLElement {
  // Create wrapper div
  const wrapper = document.createElement('div');
  template.wrapperBaseClasses.forEach(cls => wrapper.classList.add(cls));
  
  // Add level class (is-h2, is-h3, etc.)
  wrapper.classList.add(`is-h${heading.level}`);

  // Create anchor
  const anchor = document.createElement('a');
  template.linkClasses.forEach(cls => anchor.classList.add(cls));
  anchor.href = `#${heading.id}`;

  // Add level-specific class to anchor for h3+ (e.g. "is-h3")
  if (heading.level >= 3 && heading.level <= 6) {
    anchor.classList.add(`is-h${heading.level}`);
  }

  // Create text element
  if (template.textDivBaseClass) {
    const textDiv = document.createElement('div');
    textDiv.className = `${template.textDivBaseClass}${heading.level}`;
    textDiv.textContent = heading.text;
    anchor.appendChild(textDiv);
  } else {
    anchor.textContent = heading.text;
  }

  wrapper.appendChild(anchor);

  // Add ix-trigger if template has one
  if (template.ixTriggerTemplate) {
    wrapper.appendChild(template.ixTriggerTemplate.cloneNode(true));
  }

  return wrapper;
}

/**
 * Build TOC by creating fresh elements based on the captured template.
 * All entries are placed as flat siblings in the link-content container.
 * Level-specific styling (indentation, font size) is handled via CSS classes (is-h2, is-h3, etc.)
 */
function populateTOC(
  headings: HeadingEntry[],
  template: TOCTemplate,
): void {
  const visibleHeadings = headings.filter(h => !h.omitted);

  if (visibleHeadings.length === 0) {
    return;
  }

  visibleHeadings.forEach((heading) => {
    const wrapper = createWrapperForHeading(heading, template);
    template.linkContent.appendChild(wrapper);
  });
}

/**
 * Build and populate the TOC using existing DOM elements
 */
export function buildTOC(headings: HeadingEntry[]): boolean {
  if (headings.length === 0) {
    console.warn('[Heard TOC] No headings found to build TOC');
    return false;
  }

  const template = captureTemplate();
  if (!template) {
    return false;
  }

  // Populate with heading data
  populateTOC(headings, template);

  const visibleCount = headings.filter(h => !h.omitted).length;
  console.log(`[Heard TOC] Populated ${visibleCount} TOC item(s)`);

  return true;
}
