# Heard Custom Code

Custom functionality components and scripts for joinheard.com. This repository contains multiple standalone features, each building to its own JavaScript file for use in Webflow.

## Features

This project includes the following features:

### Table of Contents (`toc`)

A Webflow-compatible table of contents generator that supports collecting headings from **multiple rich text blocks** into a single unified TOC. This solves a key limitation of Finsweet's TOC solution.

**Usage:**

1. Add the script to your Webflow page:
```html
<script src="https://cdn.example.com/heard-toc.js" defer></script>
```

2. Apply attributes in Webflow Designer:
- `heard-toc-element="contents"` on one or more Rich Text or Div elements containing headings
- `heard-toc-element="link"` on a link element that serves as the template for TOC entries
- `heard-toc-element="table"` (optional) on the container where the TOC should appear

**Scroll Offset Attributes:**
- `heard-toc-offsettop` or `fs-toc-offsettop` - Top offset for scroll spy (e.g., `"80px"`, `"5rem"`)
- `heard-toc-offsetbottom` or `fs-toc-offsetbottom` - Bottom offset for scroll spy
- `heard-toc-hideurlhash` or `fs-toc-hideurlhash` - Set to `"true"` to prevent URL hash updates

See the [Finsweet TOC documentation](https://finsweet.com/attributes/table-of-contents) for the full attribute API - this implementation uses `heard-toc-` prefix but also supports `fs-toc-` prefix for scroll offset attributes for compatibility.

### FAQ Schema Generator (`faq-schema`)

Automatically generates JSON-LD FAQ schema from FAQ sections on the page. This improves SEO by providing structured data that search engines can use to display rich snippets.

**Usage:**

1. Add the script to your Webflow page:
```html
<script src="https://cdn.example.com/heard-faq-schema.js" defer></script>
```

2. The script automatically finds FAQ rows anywhere on the page by their classes and generates the schema.

**Supported HTML Structure:**
- FAQ rows: `.pricing-faq_row` or `.acc-item` (searched directly, no section wrapper required)
- Questions: `h5.heading-xsmall` or `.pricing-faq_question h5` or `.acc-head h5`
- Answers: `.acc-body p` or `.pricing-faq_row p.text-size-regular`

The script searches for FAQ row elements directly by their classes, making it more reliable regardless of what section wrapper is used.

**Standalone Utility Script:**

For generating FAQ schema from HTML files or snippets:

```bash
# From a file
node scripts/generate-faq-schema.js path/to/file.html

# From stdin
echo '<html>...</html>' | node scripts/generate-faq-schema.js

# Or use npm script
npm run generate-faq-schema path/to/file.html
```

### Tax Deadlines Table (`tax-deadlines-table`)

Dynamically converts Webflow CMS list items into semantic HTML tables for better AEO (Answer Engine Optimization). Tables provide better structured data for AI engines, making it easier to extract and present information in answer snippets.

**Usage:**

1. Add the script to your Webflow page (all styles are included):
```html
<script src="https://cdn.example.com/heard-tax-deadlines-table.js" defer></script>
```

2. Ensure your Webflow CMS collection list has these classes:
```html
<div role="list" class="cms-list-tax-deadlines w-dyn-items">
  <div role="listitem" class="cms-item-taxdeadline w-dyn-item">
    <div class="text-weight-bold">[Date]</div>
    <div class="text-size-medium">[Description]</div>
  </div>
</div>
```

**Features:**
- Automatic conversion on page load
- Responsive design (desktop table, mobile cards)
- Semantic HTML with proper ARIA labels
- Original list preserved for CMS functionality
- Better for AI answer extraction and featured snippets

See [TAX_DEADLINES_TABLE.md](./TAX_DEADLINES_TABLE.md) for detailed documentation.

---

*More features coming soon. Each feature is independently built and can be used standalone.*

## Development

```bash
# Install dependencies
npm install

# Build all features
npm run build

# Build specific feature
npm run build:toc
npm run build:faq-schema
npm run build:tax-deadlines-table

# Watch mode for development
npm run dev
```

## Project Structure

This project is organized as a multi-feature repository where each feature is self-contained:

```
src/
  toc/                  # Table of Contents feature (+ test.html)
  faq-schema/           # FAQ Schema Generator feature
  tax-deadlines-table/  # Tax Deadlines Table Converter feature (+ test.html)
  embeds/               # Static Webflow HTML embeds (not built by esbuild)
  [feature]/            # JS features: directory with index.ts

dist/
  heard-toc.js                  # Built output for toc feature
  heard-faq-schema.js           # Built output for faq-schema feature
  heard-tax-deadlines-table.js  # Built output for tax-deadlines-table feature
  heard-[feature].js            # Built output for other features

scripts/
  generate-faq-schema.js # Standalone utility for generating FAQ schema
```

**Key Points:**
- Each JS feature lives in its own directory under `src/` with an `index.ts` entrypoint
- Static Webflow HTML embeds live in `src/embeds/`
- Feature test pages live next to their feature (e.g. `src/toc/test.html`)
- Each JS feature builds to its own standalone file in `dist/`
- Features are independent and can be used separately
- New JS features need a `src/[feature]/index.ts`; dirs without `index.ts` are skipped by the build
