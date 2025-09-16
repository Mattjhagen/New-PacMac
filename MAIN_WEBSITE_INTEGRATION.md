# Main Website Integration Guide

This guide shows how to integrate your admin portal products into your main website at `pacmacmobile.com`.

## Quick Setup

### 1. Add the Integration Files to Your Main Website

Copy these files from your admin portal to your main website:

- `public/pacmac-products.js` - JavaScript integration library
- `public/pacmac-products.css` - CSS styles for product cards
- `public/integration-example.html` - Example implementation

### 2. Add to Your Main Website HTML

Add this to your main website's HTML (in the `<head>` section):

```html
<!-- PacMac Products Integration -->
<link rel="stylesheet" href="https://admin.pacmacmobile.com/pacmac-products.css">
<script src="https://admin.pacmacmobile.com/pacmac-products.js"></script>
```

### 3. Add Product Containers

Add this HTML where you want products to appear:

```html
<!-- Products Section -->
<section class="products-section">
  <h2>Our Latest Phones & Tablets</h2>
  <div class="pacmac-products-container"></div>
</section>
```

### 4. Initialize the Integration

Add this JavaScript to initialize the product display:

```javascript
// Initialize PacMac Products
PacMacProducts.init({
  adminUrl: 'https://admin.pacmacmobile.com',
  maxProducts: 12,
  layout: 'grid' // or 'list'
});
```

## Customization Options

### Layout Options
- `layout: 'grid'` - Grid layout (default)
- `layout: 'list'` - List layout

### Product Limits
- `maxProducts: 12` - Show up to 12 products
- `maxProducts: 24` - Show up to 24 products

### Custom Container
- `containerSelector: '.my-custom-container'` - Use custom CSS selector

## Event Handling

Listen for product clicks:

```javascript
document.addEventListener('pacmacProductClick', (event) => {
  const { product, productId } = event.detail;
  console.log('Product clicked:', product);
  
  // Add your custom logic here
  // e.g., show product modal, redirect to product page, etc.
});
```

## Styling

The integration includes default styles, but you can customize them:

```css
/* Custom product card styles */
.pacmac-product-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Custom product name styles */
.pacmac-product-name {
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
}

/* Custom price styles */
.pacmac-product-price {
  color: #e74c3c;
  font-size: 1.4rem;
  font-weight: bold;
}
```

## Testing

1. **Local Testing**: Use `http://localhost:3000` as adminUrl
2. **Production Testing**: Use `https://admin.pacmacmobile.com` as adminUrl

## Troubleshooting

### Products Not Loading
- Check browser console for errors
- Verify admin portal is accessible
- Check CORS settings

### Styling Issues
- Ensure CSS file is loaded
- Check for CSS conflicts
- Use browser dev tools to inspect

### API Errors
- Verify admin portal is deployed
- Check network requests in browser dev tools
- Ensure public API endpoint is working

## Support

If you need help with the integration, check:
1. Browser console for error messages
2. Network tab for failed requests
3. Admin portal status at `https://admin.pacmacmobile.com`

## Next Steps

1. **Deploy Admin Portal**: Make sure your admin portal is deployed to `https://admin.pacmacmobile.com`
2. **Add Integration**: Add the integration code to your main website
3. **Test**: Test the integration with a few products
4. **Customize**: Customize the styling and behavior as needed
5. **Go Live**: Deploy your main website with the integration
