/* Heard Custom Code - toc */
"use strict";
(() => {
  // src/toc/headings.ts
  var DIRECTIVE_OMIT = /\[heard-toc-omit\]/gi;
  var DIRECTIVE_LEVEL = /\[heard-toc-h([2-6])\]/gi;
  function slugify(text) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function parseDirectives(text) {
    let cleanText = text;
    let omitted = false;
    let overrideLevel;
    if (DIRECTIVE_OMIT.test(text)) {
      omitted = true;
      cleanText = cleanText.replace(DIRECTIVE_OMIT, "").trim();
    }
    const levelMatch = DIRECTIVE_LEVEL.exec(text);
    if (levelMatch) {
      overrideLevel = parseInt(levelMatch[1], 10);
      cleanText = cleanText.replace(DIRECTIVE_LEVEL, "").trim();
    }
    return { cleanText, omitted, overrideLevel };
  }
  function getHeadingLevel(el) {
    const tagName = el.tagName.toLowerCase();
    const match = tagName.match(/^h([2-6])$/);
    return match ? parseInt(match[1], 10) : 0;
  }
  function discoverHeadings() {
    const contentsElements = document.querySelectorAll(
      '[heard-toc-element="contents"]'
    );
    if (contentsElements.length === 0) {
      console.warn('[Heard TOC] No elements with heard-toc-element="contents" found');
      return [];
    }
    const headings = [];
    const idMap = /* @__PURE__ */ new Map();
    contentsElements.forEach((container) => {
      const headingElements = container.querySelectorAll("h2, h3, h4, h5, h6");
      headingElements.forEach((headingEl) => {
        const level = getHeadingLevel(headingEl);
        if (level === 0)
          return;
        if (headingEl.closest(".aeo-keytakeaways"))
          return;
        const rawText = headingEl.textContent || "";
        const { cleanText, omitted, overrideLevel } = parseDirectives(rawText);
        if (!cleanText)
          return;
        const effectiveLevel = overrideLevel || level;
        let baseId = slugify(cleanText);
        if (!baseId) {
          baseId = `heading-${headings.length + 1}`;
        }
        let finalId = baseId;
        if (idMap.has(finalId)) {
          const count = idMap.get(finalId) + 1;
          idMap.set(finalId, count);
          finalId = `${baseId}-${count}`;
        } else {
          idMap.set(finalId, 1);
        }
        headingEl.id = finalId;
        headings.push({
          el: headingEl,
          level: effectiveLevel,
          text: cleanText,
          id: finalId,
          omitted
        });
      });
    });
    return headings;
  }

  // src/toc/builder.ts
  function captureTemplate() {
    const tableEl = document.querySelector('[heard-toc-element="table"]') || document.querySelector(".fs-toc_sidebar");
    if (!tableEl) {
      console.warn('[Heard TOC] No TOC table element found. Add heard-toc-element="table".');
      return null;
    }
    const linkContent = tableEl.querySelector(".fs-toc_link-content") || tableEl.querySelector('[class*="toc_link-content"]');
    if (!linkContent) {
      const firstWrapper2 = tableEl.querySelector(".fs-toc_link-wrapper") || tableEl.querySelector('[class*="toc_link-wrapper"]');
      if (!firstWrapper2) {
        console.warn("[Heard TOC] No link-content container found inside TOC table.");
        return null;
      }
      return captureFromContainer(tableEl, tableEl, firstWrapper2);
    }
    const firstWrapper = linkContent.querySelector(":scope > .fs-toc_link-wrapper") || linkContent.querySelector(".fs-toc_link-wrapper");
    if (!firstWrapper) {
      console.warn("[Heard TOC] No fs-toc_link-wrapper found inside link-content.");
      return null;
    }
    return captureFromContainer(tableEl, linkContent, firstWrapper);
  }
  function captureFromContainer(tableEl, linkContent, firstWrapper) {
    const wrapperBaseClasses = Array.from(firstWrapper.classList).filter(
      (cls) => !cls.match(/^is-h[2-6]$/)
    );
    const anchor = firstWrapper.querySelector(":scope > a.fs-toc_link") || firstWrapper.querySelector(":scope > a") || firstWrapper.querySelector("a.fs-toc_link") || firstWrapper.querySelector("a");
    if (!anchor) {
      console.warn("[Heard TOC] No anchor element found inside wrapper template.");
      return null;
    }
    const linkClasses = Array.from(anchor.classList).filter(
      (cls) => !cls.match(/^is-h[2-6]$/)
    );
    const textDiv = anchor.querySelector('[heard-toc-element="link"]') || anchor.querySelector('[class*="fs-toc_link-h"]');
    let textDivBaseClass = null;
    if (textDiv) {
      const cls = Array.from(textDiv.classList).find((c) => c.match(/fs-toc_link-h\d?/));
      if (cls) {
        textDivBaseClass = cls.replace(/\d$/, "");
      } else {
        textDivBaseClass = textDiv.className.split(" ")[0] || null;
      }
    }
    const existingWrappers = linkContent.querySelectorAll(":scope > .fs-toc_link-wrapper");
    existingWrappers.forEach((wrapper) => wrapper.remove());
    return {
      linkContent,
      tableEl,
      wrapperBaseClasses,
      linkClasses,
      textDivBaseClass
    };
  }
  function createWrapperForHeading(heading, template) {
    const wrapper = document.createElement("div");
    template.wrapperBaseClasses.forEach((cls) => wrapper.classList.add(cls));
    wrapper.classList.add(`is-h${heading.level}`);
    const anchor = document.createElement("a");
    template.linkClasses.forEach((cls) => anchor.classList.add(cls));
    anchor.href = `#${heading.id}`;
    if (heading.level >= 3 && heading.level <= 6) {
      anchor.classList.add(`is-h${heading.level}`);
    }
    if (template.textDivBaseClass) {
      const textDiv = document.createElement("div");
      textDiv.className = `${template.textDivBaseClass}${heading.level}`;
      textDiv.textContent = heading.text;
      anchor.appendChild(textDiv);
    } else {
      anchor.textContent = heading.text;
    }
    wrapper.appendChild(anchor);
    return wrapper;
  }
  function populateTOC(headings, template) {
    const visibleHeadings = headings.filter((h) => !h.omitted);
    if (visibleHeadings.length === 0) {
      return;
    }
    visibleHeadings.forEach((heading) => {
      const wrapper = createWrapperForHeading(heading, template);
      template.linkContent.appendChild(wrapper);
    });
  }
  function buildTOC(headings) {
    if (headings.length === 0) {
      console.warn("[Heard TOC] No headings found to build TOC");
      return false;
    }
    const template = captureTemplate();
    if (!template) {
      return false;
    }
    populateTOC(headings, template);
    const visibleCount = headings.filter((h) => !h.omitted).length;
    console.log(`[Heard TOC] Populated ${visibleCount} TOC item(s)`);
    return true;
  }

  // src/toc/scroll-spy.ts
  function parseCSSValue(value) {
    const num = parseFloat(value);
    if (value.includes("rem")) {
      return num * 16;
    } else if (value.includes("em")) {
      return num * 16;
    } else if (value.includes("px")) {
      return num;
    } else if (value.includes("vh")) {
      return num / 100 * window.innerHeight;
    }
    return num;
  }
  function detectStickyNavHeight() {
    const htmlScrollPad = getComputedStyle(document.documentElement).scrollPaddingTop;
    if (htmlScrollPad && htmlScrollPad !== "auto") {
      const parsed = parseCSSValue(htmlScrollPad);
      if (parsed > 0)
        return parsed;
    }
    const bodyScrollPad = getComputedStyle(document.body).scrollPaddingTop;
    if (bodyScrollPad && bodyScrollPad !== "auto") {
      const parsed = parseCSSValue(bodyScrollPad);
      if (parsed > 0)
        return parsed;
    }
    let maxHeight = 0;
    const structuralEls = document.querySelectorAll("nav, header");
    structuralEls.forEach((el) => {
      const style = getComputedStyle(el);
      if (style.position === "fixed" || style.position === "sticky") {
        const rect = el.getBoundingClientRect();
        if (rect.top < 10 && rect.height > 0) {
          maxHeight = Math.max(maxHeight, rect.bottom);
        }
      }
    });
    if (maxHeight === 0) {
      Array.from(document.body.children).forEach((el) => {
        if (el instanceof HTMLElement) {
          const style = getComputedStyle(el);
          if (style.position === "fixed" || style.position === "sticky") {
            const rect = el.getBoundingClientRect();
            if (rect.top < 10 && rect.height > 0) {
              maxHeight = Math.max(maxHeight, rect.bottom);
            }
          }
        }
      });
    }
    const topNavCandidates = document.querySelectorAll(
      '.nav-w-banner, .nav-section, [data-wf--global-navigation--variant], nav[role="banner"], header[role="banner"]'
    );
    topNavCandidates.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const intersectsTopViewport = rect.top <= 8 && rect.bottom > 0;
      if (intersectsTopViewport && rect.height > 0) {
        maxHeight = Math.max(maxHeight, rect.bottom);
      }
    });
    return maxHeight;
  }
  var _detectedOffsetTopPx = 0;
  function getEffectiveOffsetTop(config) {
    if (config.offsetTop) {
      return parseCSSValue(config.offsetTop);
    }
    const navHeight = detectStickyNavHeight();
    if (navHeight > 0) {
      const detectedWithBreathingRoom = navHeight + 20;
      if (detectedWithBreathingRoom > _detectedOffsetTopPx) {
        _detectedOffsetTopPx = detectedWithBreathingRoom;
        console.log(`[Heard TOC] Auto-detected sticky nav offset: ${_detectedOffsetTopPx}px`);
      }
    }
    return _detectedOffsetTopPx;
  }
  function getConfig() {
    const tableEl = document.querySelector('[heard-toc-element="table"]') || document.querySelector('[fs-toc-element="table"]') || document.querySelector(".fs-toc_link-content");
    let offsetTop;
    let offsetBottom;
    let hideUrlHash = false;
    if (tableEl) {
      offsetTop = tableEl.getAttribute("fs-toc-offsettop") || tableEl.getAttribute("heard-toc-offsettop") || void 0;
      offsetBottom = tableEl.getAttribute("fs-toc-offsetbottom") || tableEl.getAttribute("heard-toc-offsetbottom") || void 0;
      hideUrlHash = tableEl.getAttribute("fs-toc-hideurlhash") === "true" || tableEl.getAttribute("heard-toc-hideurlhash") === "true";
    }
    if (!offsetTop && !offsetBottom) {
      const contentsElements = document.querySelectorAll(
        '[heard-toc-element="contents"], [fs-toc-element="contents"]'
      );
      for (let i = 0; i < contentsElements.length; i++) {
        const contentsEl = contentsElements[i];
        const elOffsetTop = contentsEl.getAttribute("fs-toc-offsettop") || contentsEl.getAttribute("heard-toc-offsettop");
        const elOffsetBottom = contentsEl.getAttribute("fs-toc-offsetbottom") || contentsEl.getAttribute("heard-toc-offsetbottom");
        const elHideUrlHash = contentsEl.getAttribute("fs-toc-hideurlhash") === "true" || contentsEl.getAttribute("heard-toc-hideurlhash") === "true";
        if (elOffsetTop || elOffsetBottom) {
          offsetTop = elOffsetTop || void 0;
          offsetBottom = elOffsetBottom || void 0;
          hideUrlHash = elHideUrlHash;
          break;
        }
        if (elHideUrlHash) {
          hideUrlHash = true;
        }
      }
    }
    return {
      offsetTop,
      offsetBottom,
      hideUrlHash
    };
  }
  function findTOCLink(headingId) {
    const link = document.querySelector(`a[href="#${headingId}"]`);
    if (link) {
      return link;
    }
    return document.querySelector(`[data-toc-link="${headingId}"]`);
  }
  function findParentHeading(heading, headings) {
    let parent = null;
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
  function isHeadingInContext(heading, headings) {
    if (heading.level === 2) {
      return true;
    }
    const parent = findParentHeading(heading, headings);
    if (!parent) {
      return true;
    }
    const parentRect = parent.el.getBoundingClientRect();
    const viewportTop = window.scrollY;
    const parentTop = window.scrollY + parentRect.top;
    const parentBottom = window.scrollY + parentRect.bottom;
    return parentTop <= viewportTop + 300 || parentTop >= viewportTop && parentBottom <= viewportTop + window.innerHeight;
  }
  function updateActiveLink(activeHeadingId, headings) {
    headings.forEach((heading) => {
      const link = findTOCLink(heading.id);
      if (link) {
        link.classList.remove("w--current");
      }
    });
    if (activeHeadingId) {
      const activeHeading = headings.find((h) => h.id === activeHeadingId);
      if (activeHeading && isHeadingInContext(activeHeading, headings)) {
        const link = findTOCLink(activeHeadingId);
        if (link) {
          link.classList.add("w--current");
          const trigger = link.closest('[heard-toc-element="ix-trigger"]')?.parentElement || link.querySelector('[heard-toc-element="ix-trigger"]');
          if (trigger) {
            trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          }
        }
      }
    }
  }
  function scrollToHeading(headingId, config, options = {}) {
    const heading = document.getElementById(headingId);
    if (!heading)
      return;
    const behavior = options.behavior ?? "smooth";
    const shouldUpdateHash = options.updateHash ?? true;
    const offsetTop = getEffectiveOffsetTop(config);
    const headingRect = heading.getBoundingClientRect();
    const targetTop = Math.max(0, window.scrollY + headingRect.top - offsetTop - 8);
    window.scrollTo({
      top: targetTop,
      behavior
    });
    if (shouldUpdateHash && !config.hideUrlHash) {
      const url = new URL(window.location.href);
      url.hash = headingId;
      window.history.replaceState(null, "", url.toString());
    }
  }
  function applyHeadingScrollMargin(headings, config) {
    const offsetTop = getEffectiveOffsetTop(config);
    const scrollMarginTop = `${Math.max(0, offsetTop + 8)}px`;
    headings.forEach((heading) => {
      heading.el.style.scrollMarginTop = scrollMarginTop;
    });
  }
  function setupInitialHashOffset(config) {
    const applyHashOffset = () => {
      const rawHash = window.location.hash;
      if (!rawHash || rawHash.length < 2)
        return;
      const headingId = decodeURIComponent(rawHash.slice(1));
      if (!headingId)
        return;
      const heading = document.getElementById(headingId);
      if (!heading)
        return;
      scrollToHeading(headingId, config, { behavior: "auto", updateHash: false });
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        applyHashOffset();
        window.setTimeout(applyHashOffset, 120);
      });
    });
    window.addEventListener("hashchange", () => {
      applyHashOffset();
    });
  }
  function setupLinkClickHandlers(headings, config) {
    headings.forEach((heading) => {
      const link = findTOCLink(heading.id);
      if (!link)
        return;
      link.addEventListener("click", (e) => {
        const isAnchor = link.tagName === "A";
        const href = isAnchor ? link.href : null;
        if (href && href.includes("#")) {
          e.preventDefault();
          e.stopPropagation();
          if ("stopImmediatePropagation" in e) {
            e.stopImmediatePropagation();
          }
        }
        scrollToHeading(heading.id, config);
      });
    });
  }
  function initScrollSpy(headings) {
    if (headings.length === 0)
      return;
    const config = getConfig();
    const offsetBottom = config.offsetBottom ? parseCSSValue(config.offsetBottom) : 0;
    applyHeadingScrollMargin(headings, config);
    setupLinkClickHandlers(headings, config);
    setupInitialHashOffset(config);
    const setupObserver = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          _setupScrollSpy(headings, config, offsetBottom);
        });
      });
    };
    if (document.readyState === "complete") {
      setupObserver();
    } else {
      window.addEventListener("load", setupObserver, { once: true });
    }
    window.addEventListener("resize", () => {
      applyHeadingScrollMargin(headings, config);
    }, { passive: true });
    window.addEventListener("load", () => {
      applyHeadingScrollMargin(headings, config);
    }, { once: true });
  }
  function _setupScrollSpy(headings, config, offsetBottom) {
    const getOffsetTop = () => getEffectiveOffsetTop(config);
    const offsetTop = getOffsetTop();
    const rootMarginTop = offsetTop > 0 ? `-${offsetTop}px` : "0px";
    const rootMarginBottom = offsetBottom > 0 ? `-${offsetBottom}px` : "0px";
    const rootMargin = `${rootMarginTop} 0px ${rootMarginBottom} 0px`;
    let activeHeadingId = null;
    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry = null;
        let bestRatio = 0;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestEntry = entry;
          }
        }
        if (bestEntry !== null) {
          const target = bestEntry.target;
          const headingId = target.id;
          if (headingId && headingId !== activeHeadingId) {
            activeHeadingId = headingId;
            updateActiveLink(activeHeadingId, headings);
          }
        } else {
          const viewportTop = window.scrollY + getOffsetTop();
          let closestHeading = null;
          let closestDistance = Infinity;
          for (const heading of headings) {
            if (heading.omitted)
              continue;
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
        threshold: [0, 0.1, 0.5, 1]
      }
    );
    headings.forEach((heading) => {
      observer.observe(heading.el);
    });
    const checkInitialActive = () => {
      const viewportTop = window.scrollY + getOffsetTop();
      let activeId = null;
      for (const heading of headings) {
        if (heading.omitted)
          continue;
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
    checkInitialActive();
    window.addEventListener("scroll", checkInitialActive, { passive: true });
  }

  // src/toc/index.ts
  function enableStickyAncestors() {
    const tocTable = document.querySelector('[heard-toc-element="table"]') || document.querySelector(".fs-toc_sidebar");
    if (!tocTable)
      return;
    let current = tocTable.parentElement;
    while (current && current !== document.body) {
      const computed = getComputedStyle(current);
      const overflowY = computed.overflowY;
      const hasOverflowClipClass = current.classList.contains("overflow-clip");
      const blocksSticky = overflowY === "hidden" || overflowY === "clip";
      if (hasOverflowClipClass || blocksSticky) {
        current.style.overflowY = "visible";
      }
      current = current.parentElement;
    }
  }
  function init() {
    try {
      const headings = discoverHeadings();
      if (headings.length === 0) {
        console.warn('[Heard TOC] No headings found. Make sure you have elements with heard-toc-element="contents" containing h2-h6 headings.');
        return;
      }
      const success = buildTOC(headings);
      if (!success) {
        console.warn("[Heard TOC] Failed to build TOC. Check your template structure.");
        return;
      }
      enableStickyAncestors();
      initScrollSpy(headings);
      console.log(`[Heard TOC] Initialized with ${headings.length} heading(s)`);
    } catch (error) {
      console.error("[Heard TOC] Error initializing:", error);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
//# sourceMappingURL=heard-toc.js.map
