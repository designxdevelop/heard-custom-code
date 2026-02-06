/**
 * Table of Contents - Main entry point
 * Generates a unified TOC from multiple rich text blocks
 */

import { discoverHeadings } from './headings';
import { buildTOC } from './builder';
import { initScrollSpy } from './scroll-spy';

/**
 * Webflow utility classes like `overflow-clip` on TOC ancestors prevent
 * `position: sticky` from working. Relax vertical overflow so sticky sidebars
 * can stick while preserving horizontal overflow behavior.
 */
function enableStickyAncestors(): void {
  const tocTable = document.querySelector<HTMLElement>('[heard-toc-element="table"]') ||
    document.querySelector<HTMLElement>('.fs-toc_sidebar');

  if (!tocTable) return;

  let current = tocTable.parentElement;
  while (current && current !== document.body) {
    const computed = getComputedStyle(current);
    const overflowY = computed.overflowY;
    const hasOverflowClipClass = current.classList.contains('overflow-clip');
    const blocksSticky = overflowY === 'hidden' || overflowY === 'clip';

    if (hasOverflowClipClass || blocksSticky) {
      current.style.overflowY = 'visible';
    }

    current = current.parentElement;
  }
}

/**
 * Initialize the Table of Contents
 */
function init(): void {
  try {
    // Discover headings across all content containers
    const headings = discoverHeadings();

    if (headings.length === 0) {
      console.warn('[Heard TOC] No headings found. Make sure you have elements with heard-toc-element="contents" containing h2-h6 headings.');
      return;
    }

    // Build the TOC structure
    const success = buildTOC(headings);

    if (!success) {
      console.warn('[Heard TOC] Failed to build TOC. Check your template structure.');
      return;
    }

    // Ensure sticky TOC/CTA can function inside Webflow layout wrappers
    enableStickyAncestors();

    // Initialize scroll spy for active state tracking
    initScrollSpy(headings);

    console.log(`[Heard TOC] Initialized with ${headings.length} heading(s)`);
  } catch (error) {
    console.error('[Heard TOC] Error initializing:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM is already ready
  init();
}
