# Heard Custom Code

Custom functionality components and scripts for joinheard.com.

## Features

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

See the [Finsweet TOC documentation](https://finsweet.com/attributes/table-of-contents) for the full attribute API - this implementation uses `heard-toc-` prefix instead of `fs-toc-` but follows the same conventions.

## Development

```bash
# Install dependencies
npm install

# Build all features
npm run build

# Build specific feature
npm run build:toc

# Watch mode for development
npm run dev
```

## Project Structure

```
src/
  toc/          # Table of Contents feature
  [future]/     # Additional features go here

dist/
  heard-toc.js  # Built output for Webflow
```

Each feature in `src/` builds to its own standalone JavaScript file in `dist/`.
