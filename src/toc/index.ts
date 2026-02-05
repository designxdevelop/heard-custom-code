/**
 * Table of Contents - Main entry point
 * Generates a unified TOC from multiple rich text blocks
 */

import { discoverHeadings } from './headings';
import { buildTOC } from './builder';
import { initScrollSpy } from './scroll-spy';

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
