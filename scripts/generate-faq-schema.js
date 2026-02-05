#!/usr/bin/env node

/**
 * Standalone utility script to generate FAQ schema from HTML
 * Usage: node scripts/generate-faq-schema.js <html-file> | <html-string>
 * Or pipe HTML: echo '<html>...</html>' | node scripts/generate-faq-schema.js
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { JSDOM } from 'jsdom';

/**
 * Extract FAQs from HTML string by finding FAQ row elements directly
 */
function extractFAQs(html) {
  // Wrap partial HTML in a full document structure if needed
  const wrappedHtml = html.trim().startsWith('<!DOCTYPE') || html.trim().startsWith('<html')
    ? html
    : `<!DOCTYPE html><html><body>${html}</body></html>`;
  
  const dom = new JSDOM(wrappedHtml);
  const document = dom.window.document;
  const faqs = [];
  
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
      let answer = answerElement.textContent?.trim() || '';
      
      // If answer is empty, try to get innerHTML and clean it up
      if (!answer && answerElement.innerHTML) {
        const temp = document.createElement('div');
        temp.innerHTML = answerElement.innerHTML;
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
function generateFAQSchema(faqs) {
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

// Main execution
async function main() {
  let html = '';
  
  // Check if we have a file argument, otherwise read from stdin
  const filePath = process.argv[2];
  
  if (filePath) {
    // Reading from file argument
    try {
      // Resolve path relative to current working directory or use as-is if absolute
      const resolvedPath = filePath.startsWith('/') ? filePath : join(process.cwd(), filePath);
      html = readFileSync(resolvedPath, 'utf-8');
      if (!html || !html.trim()) {
        console.error(`Error: File ${resolvedPath} appears to be empty (length: ${html?.length || 0})`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error reading file "${filePath}": ${error.message}`);
      process.exit(1);
    }
  } else {
    // Reading from stdin
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    html = chunks.join('');
    
    if (!html.trim()) {
      console.error('Usage: node scripts/generate-faq-schema.js <html-file>');
      console.error('   or: echo "<html>...</html>" | node scripts/generate-faq-schema.js');
      process.exit(1);
    }
  }
  
  if (!html.trim()) {
    console.error('Error: No HTML content provided');
    process.exit(1);
  }
  
  // Extract FAQs
  const faqs = extractFAQs(html);
  
  if (faqs.length === 0) {
    console.error('Warning: No FAQs found in the HTML');
    console.error('Make sure the HTML contains FAQ rows with class .pricing-faq_row or .acc-item');
    process.exit(1);
  }
  
  // Generate schema
  const schema = generateFAQSchema(faqs);
  
  // Output JSON
  console.log(JSON.stringify(schema, null, 2));
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
