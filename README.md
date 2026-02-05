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

See the [Finsweet TOC documentation](https://finsweet.com/attributes/table-of-contents) for the full attribute API - this implementation uses `heard-toc-` prefix instead of `fs-toc-` but follows the same conventions.

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

# Watch mode for development
npm run dev
```

## Project Structure

This project is organized as a multi-feature repository where each feature is self-contained:

```
src/
  toc/          # Table of Contents feature
  [feature]/    # Additional features go here (each as a separate directory)

dist/
  heard-toc.js      # Built output for toc feature
  heard-[feature].js # Built output for other features
```

**Key Points:**
- Each feature lives in its own directory under `src/`
- Each feature builds to its own standalone JavaScript file in `dist/`
- Features are independent and can be used separately
- New features can be added by creating a new directory in `src/` and updating the build configuration
