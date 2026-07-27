/* Heard Custom Code - faq-schema */
"use strict";
(() => {
  // src/faq-schema/index.ts
  function extractFAQs() {
    const faqs = [];
    const faqRows = document.querySelectorAll(".pricing-faq_row, .acc-item");
    faqRows.forEach((row) => {
      const questionElement = row.querySelector("h5.heading-xsmall, .pricing-faq_question h5, .acc-head h5");
      const answerElement = row.querySelector(".acc-body p, .pricing-faq_row p.text-size-regular");
      if (questionElement && answerElement) {
        const question = questionElement.textContent?.trim() || "";
        let answer = answerElement.textContent?.trim() || "";
        if (!answer && answerElement.innerHTML) {
          const temp = document.createElement("div");
          temp.innerHTML = answerElement.innerHTML;
          answer = temp.textContent?.trim().replace(/\s+/g, " ") || "";
        }
        if (question && answer) {
          faqs.push({ question, answer });
        }
      }
    });
    return faqs;
  }
  function generateFAQSchema(faqs) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer
        }
      }))
    };
  }
  function injectSchema(schema) {
    const existingScript = document.querySelector('script[type="application/ld+json"][data-heard-faq-schema]');
    if (existingScript) {
      existingScript.remove();
    }
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-heard-faq-schema", "true");
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }
  function init() {
    try {
      const faqs = extractFAQs();
      if (faqs.length === 0) {
        console.warn("[Heard FAQ Schema] No FAQs found. Looking for elements with classes .pricing-faq_row or .acc-item containing h5 questions and .acc-body answers.");
        return;
      }
      const schema = generateFAQSchema(faqs);
      injectSchema(schema);
      console.log(`[Heard FAQ Schema] Generated schema for ${faqs.length} FAQ(s)`);
    } catch (error) {
      console.error("[Heard FAQ Schema] Error generating schema:", error);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
//# sourceMappingURL=heard-faq-schema.js.map
