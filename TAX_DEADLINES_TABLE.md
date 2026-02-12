# Tax Deadlines Table Converter

Dynamically converts Webflow CMS list items into semantic HTML tables for better AEO (Answer Engine Optimization).

## Why Tables for AEO?

Tables provide several advantages over list structures for AI engines and search optimization:

1. **Structured Data**: Clear relationships between dates and descriptions
2. **Machine Readable**: AI engines can easily parse table headers and cells
3. **Semantic HTML**: Proper use of `<thead>`, `<tbody>`, `<th>`, and `<td>` tags
4. **Accessibility**: Better support for screen readers and assistive technologies
5. **Answer Snippets**: Search engines can extract table data for featured snippets
6. **ARIA Labels**: Proper accessibility attributes for better machine understanding

## How It Works

The script automatically:
1. Detects the Webflow CMS list structure (`.cms-list-tax-deadlines`)
2. Extracts date and description data from each list item
3. Creates a semantic HTML table with proper headers
4. Replaces the list with the table while keeping the original list hidden in the DOM
5. Maintains Webflow CMS functionality (the original list stays for CMS updates)

## Implementation

### 1. Add to Webflow

In your Webflow project's custom code section (before `</body>`):

```html
<!-- Tax Deadlines Table Converter (includes all styles) -->
<script src="https://your-cdn.com/heard-tax-deadlines-table.js" defer></script>
```

**Note:** All styles are injected automatically by the JavaScript - no separate CSS file needed!

### 2. Webflow Structure Requirements

Your Webflow CMS collection list must have these classes:

```html
<div role="list" class="cms-list-tax-deadlines w-dyn-items">
  <div role="listitem" class="cms-item-taxdeadline w-dyn-item">
    <div class="text-weight-bold">[Date]</div>
    <div class="text-size-medium">[Description]</div>
  </div>
</div>
```

**Required Classes:**
- `.cms-list-tax-deadlines` - The collection list wrapper
- `.cms-item-taxdeadline` - Each collection item
- `.text-weight-bold` - The date field
- `.text-size-medium` - The description field

### 3. No Code Changes Needed

The script automatically runs on page load. No additional JavaScript or configuration required.

## Features

### Responsive Design

- **Desktop**: Full table layout with hover effects
- **Tablet**: Optimized spacing and font sizes
- **Mobile**: Converts to card-based layout for better readability

### Accessibility

- Proper ARIA labels (`role="table"`, `aria-label`)
- Semantic HTML structure
- Keyboard navigation support
- Screen reader optimized

### SEO/AEO Benefits

- Structured data format
- Clear header-cell relationships
- Machine-readable content
- Better for AI answer extraction

## Customization

### Styling

All styles are injected by JavaScript. Edit the `injectStyles()` method in `src/tax-deadlines-table/index.ts` to customize:

```typescript
private injectStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    .tax-deadlines-table {
      /* Table container styles */
    }
    .tax-deadlines-table thead {
      background: #2d4a2d; /* Header background color */
      color: #ffffff;      /* Header text color */
    }
    /* Add more styles here */
  `;
  document.head.appendChild(style);
}
```

After making changes, rebuild with `npm run build:tax-deadlines-table`.

### Table Headers

Edit `src/tax-deadlines-table/index.ts` to change column headers:

```typescript
const dateHeader = document.createElement('th');
dateHeader.textContent = 'Date'; // Change this

const descriptionHeader = document.createElement('th');
descriptionHeader.textContent = 'Deadline'; // Change this
```

## Testing

Open `test-tax-deadlines.html` in a browser to see the conversion in action.

```bash
# Build the script
npm run build

# Open test file
open test-tax-deadlines.html
```

## Development

```bash
# Watch mode for development
npm run dev tax-deadlines-table

# Build for production
npm run build
```

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support with responsive layout

## Example Output

### Before (List Structure)
```html
<div class="cms-list-tax-deadlines">
  <div class="cms-item-taxdeadline">
    <div class="text-weight-bold">January 15, 2026</div>
    <div class="text-size-medium">Deadline to make Q4 quarterly tax payment</div>
  </div>
  <!-- More items... -->
</div>
```

### After (Table Structure)
```html
<table class="tax-deadlines-table" role="table" aria-label="Tax deadlines for therapists">
  <thead>
    <tr>
      <th scope="col">Date</th>
      <th scope="col">Deadline</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tax-deadline-date">January 15, 2026</td>
      <td class="tax-deadline-description">Deadline to make Q4 quarterly tax payment</td>
    </tr>
    <!-- More rows... -->
  </tbody>
</table>

<!-- Original list hidden but preserved for CMS -->
<div class="cms-list-tax-deadlines" style="display: none;" data-converted-to-table="true">
  <!-- Original content preserved -->
</div>
```

## Troubleshooting

### Table Not Appearing

1. Check that the `.cms-list-tax-deadlines` class exists on the page
2. Verify the script is loaded after the DOM content
3. Check browser console for errors

### Styling Issues

1. Ensure the CSS file is loaded before the script
2. Check for CSS conflicts with Webflow styles
3. Use browser DevTools to inspect the generated table

### CMS Updates Not Reflecting

The script runs on page load. If CMS content updates:
1. The page needs to be refreshed for changes to appear
2. Consider adding a mutation observer if real-time updates are needed

## Performance

- **Script Size**: ~2KB minified
- **Load Time**: <10ms on modern browsers
- **No Dependencies**: Pure vanilla JavaScript
- **No Layout Shift**: Table replaces list smoothly

## License

MIT
