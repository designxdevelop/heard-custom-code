---
name: heard-webflow-code
description: Build or modify Heard Webflow custom code embeds without leaking styles into the surrounding site. Use when working on joinheard.com Webflow embed HTML/CSS/JS, page settings snippets, minified production snippets, scoped styles, class prefixing, or issues where embed CSS affects Heard nav/footer/site styles.
---

# Heard Webflow Code

## Goal

Create Webflow embeds for Heard (`joinheard.com`) that behave like isolated components inside the existing Webflow site. Preserve the site’s nav, footer, forms, buttons, typography, and global interactions.

## Non-Negotiables

- Do not include document shell tags in embed markup: no `<!doctype>`, `<html>`, `<head>`, `<body>`, metadata, viewport, or `<title>`.
- Wrap custom embed markup in one namespaced root, for example `<div class="hlp-page">...</div>`.
- Prefix custom classes with the embed namespace, for example `hlp-`.
- Do not write global CSS selectors from embed CSS: avoid `html`, `body`, `:root`, `*`, `a`, `p`, `h1`, `button`, `ul`, `img`, `svg`.
- Do not write broad scoped link rules like `.hlp-page a` unless the embed intentionally owns every link style.
- Do not style or override Heard Webflow `.nav_link`, navbar, footer, form, modal, or other site-wide classes.
- Keep readable source separate from minified Webflow paste output.

## Preferred File Shape

Use one readable source file with three clear sections:

```html
<!-- Webflow Page Settings > Custom Code > Inside <head> tag -->
<style>
  /* scoped styles */
</style>

<!-- Webflow Designer > Embed element -->
<div class="hlp-page">...</div>

<!-- Webflow Page Settings > Custom Code > Before </body> tag -->
<script>
  ...
</script>
```

## CSS Scoping

Use wrapper-scoped variables, not `:root`:

```css
.hlp-page,
.hlp-floating-cta {
  --primary-green: #226752;
}
```

Prefer component classes:

```css
.hlp-postcard-title { ... }
.hlp-feature-row { ... }
```

Use scoped element selectors only when necessary to match existing site typography:

```css
.hlp-page h1,
.hlp-page h2,
.hlp-page h3 {
  font-family: var(--font-display);
}
```

Avoid resets inside embeds. Do not add universal `box-sizing` or margin/padding resets unless the user explicitly accepts the risk.

## Reusing Heard Webflow Styles

- If the embed should use existing Heard button classes (`btn`, `btn-primary`, `btn-secondary`, `btn-lg`, `btn-arrow`), add those classes in the markup and do not redefine them in embed CSS.
- If the embed needs portable custom buttons, use namespaced button classes (`hlp-btn`, `hlp-btn-primary`) and keep them fully scoped.
- Do not half-reuse site classes and then override them in embed CSS.
- If a user says “use the site buttons,” remove custom button CSS for those classes and let Webflow own the visual treatment.

## JavaScript

- Scope selectors to the embed wrapper when possible.
- Use namespaced selectors in scripts, for example `.hlp-faq-q`, never `.faq-q`.
- Avoid mutating `document.body`, global scroll behavior, or site layout.
- If a floating CTA must be appended to `document.body`, keep all styling on its own namespaced class/id.
- If Webflow smooth scrolling conflicts with embed anchors, handle only embed-owned anchors:

```js
document.querySelectorAll('.hlp-page a[href^="#"]').forEach(function (link) {
  link.addEventListener("click", function (event) {
    var id = link.getAttribute("href");
    if (!id || id === "#") return;
    var target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "auto", block: "start" });
  });
});
```

## Production Minification For Handoff

Assume the user may be non-technical. Do not hand them only a script or tell them to run commands unless they explicitly ask. The agent should generate the production-ready minified version before returning code to the user.

Keep the readable file as source of truth. Generate the paste-ready file from it and clearly label it as the production/Webflow paste version.

If no minifier exists yet, create one or use an appropriate local tool to produce a minified output. The minified output should:

- Remove comments and unnecessary whitespace.
- Preserve behavior in `<style>` and `<script>` blocks.
- Preserve Webflow placement sections or provide separate minified snippets for head, embed, and before-body code.
- Be regenerated after every source edit.

Never hand-edit the minified output unless the user explicitly asks. Always edit the readable source and regenerate.

When returning code to a non-technical user, include:

- The readable source file/path for future edits.
- The minified production file/path or paste-ready snippets.
- Clear placement labels:
  - Webflow Page Settings > Inside `<head>` tag
  - Webflow Designer > Embed element
  - Webflow Page Settings > Before `</body>` tag
- A short note that the minified version is the one to paste into Webflow production.

## Validation Checklist

Before finalizing:

- Search for global selectors: `html`, `body`, `:root`, `*`, bare `a`, bare `p`, bare headings, bare `button`.
- Verify all custom classes are namespaced.
- Verify no rules can affect `.nav_link` or other Heard Webflow site classes.
- Verify button strategy is consistent: site-owned or embed-owned, not mixed.
- Regenerate minified output.
- Confirm the final answer points non-technical users to the minified production output, not just the editable source.
- Check lints if available.
- Mention any behavior that must be verified in Webflow preview or staging.
