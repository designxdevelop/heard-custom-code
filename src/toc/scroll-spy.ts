/**
 * IntersectionObserver-based active state tracking and smooth scrolling
 */

import type { HeadingEntry } from './headings';

interface ScrollSpyConfig {
  offsetTop?: string;
  offsetBottom?: string;
  hideUrlHash: boolean;
}

/**
 * Parse CSS value to pixels (approximate)
 */
function parseCSSValue(value: string): number {
  const num = parseFloat(value);
  if (value.includes('rem')) {
    return num * 16; // 1rem = 16px (approximate)
  } else if (value.includes('em')) {
    return num * 16; // Approximate
  } else if (value.includes('px')) {
    return num;
  } else if (value.includes('vh')) {
    return (num / 100) * window.innerHeight;
  }
  return num; // Default to pixels
}

/**
 * Detect the height of fixed/sticky elements at the top of the page (e.g. navbar).
 * Returns the pixel height to use as scroll offset.
 * 
 * This is called lazily (not at init) so that Webflow/other JS frameworks have
 * time to apply position:fixed to nav elements.
 */
function detectStickyNavHeight(): number {
  // Check scroll-padding-top on html or body first
  const htmlScrollPad = getComputedStyle(document.documentElement).scrollPaddingTop;
  if (htmlScrollPad && htmlScrollPad !== 'auto') {
    const parsed = parseCSSValue(htmlScrollPad);
    if (parsed > 0) return parsed;
  }
  
  const bodyScrollPad = getComputedStyle(document.body).scrollPaddingTop;
  if (bodyScrollPad && bodyScrollPad !== 'auto') {
    const parsed = parseCSSValue(bodyScrollPad);
    if (parsed > 0) return parsed;
  }

  // Look for fixed/sticky elements at the top of the page.
  // We check ALL elements but limit to top-level structural ones to avoid
  // matching child elements inside navs. querySelectorAll with tag names
  // and direct structural selectors.
  let maxHeight = 0;

  // Strategy 1: Check <nav> and <header> tags directly
  const structuralEls = document.querySelectorAll<HTMLElement>('nav, header');
  for (const el of structuralEls) {
    const style = getComputedStyle(el);
    if (style.position === 'fixed' || style.position === 'sticky') {
      const rect = el.getBoundingClientRect();
      if (rect.top < 10 && rect.height > 0) {
        maxHeight = Math.max(maxHeight, rect.bottom);
      }
    }
  }

  // Strategy 2: If nothing found, check body's direct children for fixed/sticky
  if (maxHeight === 0) {
    for (const el of document.body.children) {
      if (!(el instanceof HTMLElement)) continue;
      const style = getComputedStyle(el);
      if (style.position === 'fixed' || style.position === 'sticky') {
        const rect = el.getBoundingClientRect();
        if (rect.top < 10 && rect.height > 0) {
          maxHeight = Math.max(maxHeight, rect.bottom);
        }
      }
    }
  }

  return maxHeight;
}

/** Cached resolved offset top in pixels. -1 means not yet computed. */
let _cachedOffsetTopPx = -1;

/**
 * Get the effective top offset in pixels, resolving it lazily.
 * This defers sticky nav detection until first use so that Webflow's JS
 * has time to apply position:fixed to nav elements.
 */
function getEffectiveOffsetTop(config: ScrollSpyConfig): number {
  if (_cachedOffsetTopPx >= 0) return _cachedOffsetTopPx;

  if (config.offsetTop) {
    _cachedOffsetTopPx = parseCSSValue(config.offsetTop);
  } else {
    const navHeight = detectStickyNavHeight();
    if (navHeight > 0) {
      _cachedOffsetTopPx = navHeight + 20; // 20px breathing room
      console.log(`[Heard TOC] Auto-detected sticky nav offset: ${_cachedOffsetTopPx}px`);
    } else {
      _cachedOffsetTopPx = 0;
    }
  }

  return _cachedOffsetTopPx;
}

/**
 * Get scroll spy configuration from DOM attributes
 * Supports both heard-toc- and fs-toc- prefixes for compatibility
 * Checks table container first, then all contents elements.
 * If no explicit offset is set, auto-detects sticky nav height.
 */
function getConfig(): ScrollSpyConfig {
  // First, try to get config from table container (most convenient)
  const tableEl = document.querySelector<HTMLElement>('[heard-toc-element="table"]') ||
                   document.querySelector<HTMLElement>('[fs-toc-element="table"]') ||
                   document.querySelector<HTMLElement>('.fs-toc_link-content');
  
  let offsetTop: string | undefined;
  let offsetBottom: string | undefined;
  let hideUrlHash = false;

  // Check table container first
  if (tableEl) {
    offsetTop = tableEl.getAttribute('fs-toc-offsettop') ||
                tableEl.getAttribute('heard-toc-offsettop') ||
                undefined;
    offsetBottom = tableEl.getAttribute('fs-toc-offsetbottom') ||
                   tableEl.getAttribute('heard-toc-offsetbottom') ||
                   undefined;
    hideUrlHash = tableEl.getAttribute('fs-toc-hideurlhash') === 'true' ||
                  tableEl.getAttribute('heard-toc-hideurlhash') === 'true';
  }

  // If not found on table, check all contents elements
  if (!offsetTop && !offsetBottom) {
    const contentsElements = document.querySelectorAll<HTMLElement>(
      '[heard-toc-element="contents"], [fs-toc-element="contents"]'
    );

    for (const contentsEl of contentsElements) {
      // Check for both heard-toc- and fs-toc- prefixes (fs-toc takes precedence)
      const elOffsetTop = contentsEl.getAttribute('fs-toc-offsettop') ||
                          contentsEl.getAttribute('heard-toc-offsettop');
      const elOffsetBottom = contentsEl.getAttribute('fs-toc-offsetbottom') ||
                             contentsEl.getAttribute('heard-toc-offsetbottom');
      const elHideUrlHash = contentsEl.getAttribute('fs-toc-hideurlhash') === 'true' ||
                           contentsEl.getAttribute('heard-toc-hideurlhash') === 'true';

      // Use first element that has offset attributes
      if (elOffsetTop || elOffsetBottom) {
        offsetTop = elOffsetTop || undefined;
        offsetBottom = elOffsetBottom || undefined;
        hideUrlHash = elHideUrlHash;
        break; // Use first one found
      }
      
      // If no offset but has hideUrlHash, still set it
      if (elHideUrlHash) {
        hideUrlHash = true;
      }
    }
  }

  return {
    offsetTop,
    offsetBottom,
    hideUrlHash,
  };
}

/**
 * Find the TOC link element corresponding to a heading ID
 */
function findTOCLink(headingId: string): HTMLElement | null {
  // Look for anchor with href matching the heading ID
  const link = document.querySelector<HTMLAnchorElement>(`a[href="#${headingId}"]`);
  if (link) {
    return link;
  }

  // Fallback: look for element with data-toc-link attribute
  return document.querySelector<HTMLElement>(`[data-toc-link="${headingId}"]`);
}

/**
 * Find the parent heading for a given heading (e.g., H3's parent H2)
 */
function findParentHeading(
  heading: HeadingEntry,
  headings: HeadingEntry[]
): HeadingEntry | null {
  // Find the most recent heading with a lower level that comes before this one
  let parent: HeadingEntry | null = null;
  
  for (let i = 0; i < headings.length; i++) {
    if (headings[i].id === heading.id) {
      break;
    }
    if (headings[i].level < heading.level && !headings[i].omitted) {
      parent = headings[i];
    }
  }
  
  return parent;
}

/**
 * Check if a heading is in context (its parent is also visible/active)
 */
function isHeadingInContext(
  heading: HeadingEntry,
  headings: HeadingEntry[]
): boolean {
  // H2s are always in context (top level)
  if (heading.level === 2) {
    return true;
  }
  
  // For H3+, check if parent exists and is visible
  const parent = findParentHeading(heading, headings);
  if (!parent) {
    return true; // No parent, so it's in context
  }
  
  // Check if parent is above viewport (we've scrolled past it)
  // This means the parent H2 is in context, so its children can be active
  const parentRect = parent.el.getBoundingClientRect();
  const viewportTop = window.scrollY;
  const parentTop = window.scrollY + parentRect.top;
  const parentBottom = window.scrollY + parentRect.bottom;
  
  // Parent is in context if:
  // 1. It's above the viewport (we've scrolled past it), OR
  // 2. It's currently visible in the viewport
  return parentTop <= viewportTop + 300 || (parentTop >= viewportTop && parentBottom <= viewportTop + window.innerHeight);
}

/**
 * Update active state of TOC links with nested structure support
 */
function updateActiveLink(activeHeadingId: string | null, headings: HeadingEntry[]) {
  // Remove current class from all links
  headings.forEach((heading) => {
    const link = findTOCLink(heading.id);
    if (link) {
      link.classList.remove('w--current');
    }
  });

  // Add current class to active link and ensure it's in context
  if (activeHeadingId) {
    const activeHeading = headings.find(h => h.id === activeHeadingId);
    if (activeHeading && isHeadingInContext(activeHeading, headings)) {
      const link = findTOCLink(activeHeadingId);
      if (link) {
        link.classList.add('w--current');
        
        // Trigger Webflow interaction if ix-trigger element exists
        const trigger = link.closest('[heard-toc-element="ix-trigger"]')?.parentElement
          || link.querySelector('[heard-toc-element="ix-trigger"]');
        if (trigger) {
          // Dispatch click event to trigger Webflow interaction
          trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      }
    }
  }
}

/**
 * Smooth scroll to heading with offset
 */
function scrollToHeading(
  headingId: string,
  config: ScrollSpyConfig
): void {
  const heading = document.getElementById(headingId);
  if (!heading) return;

  const offsetTop = getEffectiveOffsetTop(config);

  const headingRect = heading.getBoundingClientRect();
  const scrollPosition = window.scrollY + headingRect.top - offsetTop;

  window.scrollTo({
    top: Math.max(0, scrollPosition),
    behavior: 'smooth',
  });

  // Update URL hash if not hidden
  if (!config.hideUrlHash) {
    // Use replaceState to avoid adding to history
    const url = new URL(window.location.href);
    url.hash = headingId;
    window.history.replaceState(null, '', url.toString());
  }
}

/**
 * Handle TOC link clicks
 */
function setupLinkClickHandlers(headings: HeadingEntry[], config: ScrollSpyConfig): void {
  headings.forEach((heading) => {
    const link = findTOCLink(heading.id);
    if (!link) return;

    link.addEventListener('click', (e) => {
      // Only handle if it's an anchor with hash or data attribute
      const isAnchor = link.tagName === 'A';
      const href = isAnchor ? (link as HTMLAnchorElement).href : null;
      
      if (href && href.includes('#')) {
        // Let default anchor behavior handle it, but we'll still scroll
        e.preventDefault();
      }

      scrollToHeading(heading.id, config);
    });
  });
}

/**
 * Initialize scroll spy with IntersectionObserver
 */
export function initScrollSpy(headings: HeadingEntry[]): void {
  if (headings.length === 0) return;

  const config = getConfig();
  
  // Resolve offsets lazily — this defers nav detection until first scroll/click
  // For IntersectionObserver rootMargin we need a value at setup time,
  // so we resolve it now (after DOMContentLoaded, Webflow JS should have run).
  // We use requestAnimationFrame to allow one more paint cycle.
  const offsetBottom = config.offsetBottom ? parseCSSValue(config.offsetBottom) : 0;

  // Setup click handlers immediately (they resolve offset lazily on click)
  setupLinkClickHandlers(headings, config);

  // Defer the IntersectionObserver setup by one rAF so Webflow JS can
  // finish applying position:fixed to nav elements
  requestAnimationFrame(() => {
    _setupScrollSpy(headings, config, offsetBottom);
  });
}

function _setupScrollSpy(
  headings: HeadingEntry[],
  config: ScrollSpyConfig,
  offsetBottom: number,
): void {
  const offsetTop = getEffectiveOffsetTop(config);
  
  const rootMarginTop = offsetTop > 0 ? `-${offsetTop}px` : '0px';
  const rootMarginBottom = offsetBottom > 0 ? `-${offsetBottom}px` : '0px';
  const rootMargin = `${rootMarginTop} 0px ${rootMarginBottom} 0px`;

  // Track which heading is currently active
  let activeHeadingId: string | null = null;

  // Create IntersectionObserver
  const observer = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      // Find the entry with the highest intersection ratio that's intersecting
      let bestEntry: IntersectionObserverEntry | null = null;
      let bestRatio = 0;

      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
          bestRatio = entry.intersectionRatio;
          bestEntry = entry;
        }
      }

      // If we have a best entry, update active state
      if (bestEntry !== null) {
        const target = bestEntry.target as HTMLElement;
        const headingId = target.id;
        if (headingId && headingId !== activeHeadingId) {
          activeHeadingId = headingId;
          updateActiveLink(activeHeadingId, headings);
        }
      } else {
        // Check if we should activate based on scroll position
        // Find the heading closest to the top of the viewport that's in context
        const viewportTop = window.scrollY + offsetTop;
        let closestHeading: HeadingEntry | null = null;
        let closestDistance = Infinity;

        for (const heading of headings) {
          if (heading.omitted) continue;
          
          // Check if heading is in context (parent is also visible)
          if (!isHeadingInContext(heading, headings)) {
            continue;
          }
          
          const rect = heading.el.getBoundingClientRect();
          const headingTop = window.scrollY + rect.top;
          const distance = Math.abs(headingTop - viewportTop);

          if (headingTop <= viewportTop + 100 && distance < closestDistance) {
            closestDistance = distance;
            closestHeading = heading;
          }
        }

        if (closestHeading !== null && closestHeading.id !== activeHeadingId) {
          activeHeadingId = closestHeading.id;
          updateActiveLink(activeHeadingId, headings);
        }
      }
    },
    {
      rootMargin,
      threshold: [0, 0.1, 0.5, 1.0],
    }
  );

  // Observe all headings
  headings.forEach((heading) => {
    observer.observe(heading.el);
  });

  // Initial active state check
  const checkInitialActive = () => {
    const viewportTop = window.scrollY + offsetTop;
    let activeId: string | null = null;

    for (const heading of headings) {
      if (heading.omitted) continue;
      
      // Only consider headings that are in context
      if (!isHeadingInContext(heading, headings)) {
        continue;
      }
      
      const rect = heading.el.getBoundingClientRect();
      const headingTop = window.scrollY + rect.top;
      
      if (headingTop <= viewportTop + 100) {
        activeId = heading.id;
      } else {
        break;
      }
    }

    if (activeId) {
      updateActiveLink(activeId, headings);
    }
  };

  // Check on load and scroll
  checkInitialActive();
  window.addEventListener('scroll', checkInitialActive, { passive: true });
}
