/**
 * FAQ Schema Generator
 * Automatically generates JSON-LD FAQ schema from FAQ sections on the page
 */

interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Extract FAQs from the document by finding FAQ row elements directly
 */
function extractFAQs(): FAQItem[] {
  const faqs: FAQItem[] = [];
  
  // Find all FAQ rows (accordion items) directly by their classes
  // This is more reliable than looking for a specific section wrapper
  const faqRows = document.querySelectorAll('.pricing-faq_row, .acc-item');
  
  faqRows.forEach(row => {
    // Find the question (h5 heading)
    const questionElement = row.querySelector('h5.heading-xsmall, .pricing-faq_question h5, .acc-head h5');
    
    // Find the answer (paragraph in acc-body)
    const answerElement = row.querySelector('.acc-body p, .pricing-faq_row p.text-size-regular');
    
    if (questionElement && answerElement) {
      const question = questionElement.textContent?.trim() || '';
      // Get all text content from the answer, handling line breaks and links
      let answer = answerElement.textContent?.trim() || '';
      
      // If answer is empty, try to get innerHTML and clean it up
      if (!answer && answerElement.innerHTML) {
        // Create a temporary element to get clean text
        const temp = document.createElement('div');
        temp.innerHTML = answerElement.innerHTML;
        // Replace <br> with spaces and clean up
        answer = temp.textContent?.trim().replace(/\s+/g, ' ') || '';
      }
      
      if (question && answer) {
        faqs.push({ question, answer });
      }
    }
  });
  
  return faqs;
}

/**
 * Generate JSON-LD FAQ schema from FAQ items
 */
function generateFAQSchema(faqs: FAQItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Inject JSON-LD schema into the page
 */
function injectSchema(schema: object): void {
  // Remove existing FAQ schema if present
  const existingScript = document.querySelector('script[type="application/ld+json"][data-heard-faq-schema]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Create new script element
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-heard-faq-schema', 'true');
  script.textContent = JSON.stringify(schema, null, 2);
  
  // Insert into head
  document.head.appendChild(script);
}

/**
 * Initialize FAQ schema generation
 */
function init(): void {
  try {
    // Extract FAQs directly by finding FAQ row elements
    // This searches for .pricing-faq_row or .acc-item classes anywhere on the page
    const faqs = extractFAQs();
    
    if (faqs.length === 0) {
      console.warn('[Heard FAQ Schema] No FAQs found. Looking for elements with classes .pricing-faq_row or .acc-item containing h5 questions and .acc-body answers.');
      return;
    }
    
    // Generate schema
    const schema = generateFAQSchema(faqs);
    
    // Inject into page
    injectSchema(schema);
    
    console.log(`[Heard FAQ Schema] Generated schema for ${faqs.length} FAQ(s)`);
  } catch (error) {
    console.error('[Heard FAQ Schema] Error generating schema:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM is already ready
  init();
}
