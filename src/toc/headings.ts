/**
 * Heading discovery and processing across multiple containers
 */

export interface HeadingEntry {
  el: HTMLElement;
  level: number;
  text: string;
  id: string;
  omitted: boolean;
}

const DIRECTIVE_OMIT = /\[heard-toc-omit\]/gi;
const DIRECTIVE_LEVEL = /\[heard-toc-h([2-6])\]/gi;

/**
 * Generate a URL-friendly slug from text
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Parse and strip directives from heading text
 */
function parseDirectives(text: string): {
  cleanText: string;
  omitted: boolean;
  overrideLevel?: number;
} {
  let cleanText = text;
  let omitted = false;
  let overrideLevel: number | undefined;

  // Check for omit directive
  if (DIRECTIVE_OMIT.test(text)) {
    omitted = true;
    cleanText = cleanText.replace(DIRECTIVE_OMIT, '').trim();
  }

  // Check for level override directive
  const levelMatch = DIRECTIVE_LEVEL.exec(text);
  if (levelMatch) {
    overrideLevel = parseInt(levelMatch[1], 10);
    cleanText = cleanText.replace(DIRECTIVE_LEVEL, '').trim();
  }

  return { cleanText, omitted, overrideLevel };
}

/**
 * Extract heading level from element tag name (h2 -> 2, h3 -> 3, etc.)
 */
function getHeadingLevel(el: HTMLElement): number {
  const tagName = el.tagName.toLowerCase();
  const match = tagName.match(/^h([2-6])$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Discover all headings across multiple content containers
 */
export function discoverHeadings(): HeadingEntry[] {
  const contentsElements = document.querySelectorAll<HTMLElement>(
    '[heard-toc-element="contents"]'
  );

  if (contentsElements.length === 0) {
    console.warn('[Heard TOC] No elements with heard-toc-element="contents" found');
    return [];
  }

  const headings: HeadingEntry[] = [];
  const idMap = new Map<string, number>(); // Track IDs for deduplication

  // Process each contents element in DOM order
  contentsElements.forEach((container) => {
    const headingElements = container.querySelectorAll<HTMLElement>('h2, h3, h4, h5, h6');

    headingElements.forEach((headingEl) => {
      const level = getHeadingLevel(headingEl);
      if (level === 0) return; // Skip invalid headings

      // Get text content and parse directives
      const rawText = headingEl.textContent || '';
      const { cleanText, omitted, overrideLevel } = parseDirectives(rawText);

      if (!cleanText) return; // Skip empty headings

      // Determine effective level (use override if present)
      const effectiveLevel = overrideLevel || level;

      // Generate unique ID
      let baseId = slugify(cleanText);
      if (!baseId) {
        baseId = `heading-${headings.length + 1}`;
      }

      // Deduplicate IDs
      let finalId = baseId;
      if (idMap.has(finalId)) {
        const count = idMap.get(finalId)! + 1;
        idMap.set(finalId, count);
        finalId = `${baseId}-${count}`;
      } else {
        idMap.set(finalId, 1);
      }

      // Set ID attribute on heading element
      headingEl.id = finalId;

      headings.push({
        el: headingEl,
        level: effectiveLevel,
        text: cleanText,
        id: finalId,
        omitted,
      });
    });
  });

  return headings;
}
