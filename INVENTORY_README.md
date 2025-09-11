# 📱 PacMac Mobile Inventory Management System

## Overview
This inventory management system allows you to easily add, edit, and manage products for your PacMac Mobile website without touching code.

## Files Created
- `admin.html` - Main inventory management interface
- `sync-inventory.js` - Helper script for syncing inventory to main site
- `INVENTORY_README.md` - This documentation

## How to Use

### 1. Access the Admin Panel
Open `admin.html` in your web browser. This gives you a user-friendly interface to manage your inventory.

### 2. Add Products
1. Click the "Add Product" tab
2. Fill in the product details:
   - **Product Name**: e.g., "iPhone 15 Pro Max"
   - **Product ID**: e.g., "pm-iphone15promax" (must be unique)
   - **Price**: Base price (22% markup will be applied automatically)
   - **Category**: Main Product, Refurbished, or Accessory
   - **Description**: Brief product description
   - **Specifications**: JSON format (optional)
   - **Tags**: Comma-separated tags
   - **Image**: Upload or drag & drop product image

3. Click "Add Product"

### 3. Manage Inventory
- View all products in the "Manage Inventory" tab
- Edit products by clicking the "Edit" button
- Delete products by clicking the "Delete" button
- See inventory statistics on the Dashboard

### 4. Sync to Main Site
1. Click "Sync to Main Site" button
2. A new window will open with generated JavaScript code
3. Click "Copy to Clipboard"
4. Open your `index.html` file
5. Find the `PRODUCTS` array (around line 400)
6. Replace the entire array with the copied code
7. Save and deploy your site

## Features

### ✅ Easy Product Management
- Add products with a simple form
- Upload images with drag & drop
- Edit existing products
- Delete products you no longer need

### ✅ Automatic Pricing
- 22% markup applied automatically
- Consistent pricing across all products
- Easy to adjust markup percentage in code

### ✅ Image Management
- Upload images directly in the admin panel
- Images are stored as base64 data (no file server needed)
- Automatic image preview and validation

### ✅ Data Export/Import
- Export inventory as JSON for backup
- Import inventory from JSON files
- Easy data migration and sharing

### ✅ Real-time Statistics
- Total products count
- Total inventory value
- New products this week

## Technical Details

### Data Storage
- Inventory data is stored in browser's localStorage
- Data persists between sessions
- No server required - works entirely in the browser

### Image Handling
- Images are converted to base64 and stored with product data
- No external file dependencies
- Images work immediately after sync

### Markup Calculation
- Base price × 1.22 = Final price
- Applied automatically when syncing to main site
- Easy to modify in the `generateProductsArrayCode()` function

## Troubleshooting

### Products Not Showing After Sync
1. Make sure you replaced the entire `PRODUCTS` array
2. Check for JavaScript syntax errors in browser console
3. Verify the `initializeApp()` function is being called

### Images Not Displaying
1. Check that images were uploaded successfully in admin panel
2. Verify image paths in the generated code
3. Make sure image files exist in the `products/` folder

### Data Not Saving
1. Check browser console for errors
2. Ensure localStorage is enabled in your browser
3. Try refreshing the admin panel

## Customization

### Changing Markup Percentage
Edit the `markupPercentage` variable in the `generateProductsArrayCode()` function:
```javascript
const markupPercentage = 25; // Change to 25% markup
```

### Adding New Product Categories
Edit the category options in the admin form:
```html
<select id="product-category">
    <option value="main">Main Product</option>
    <option value="refurbished">Refurbished</option>
    <option value="accessory">Accessory</option>
    <option value="new-category">New Category</option>
</select>
```

## Security Notes
- This system stores data locally in the browser
- No sensitive data should be stored in product descriptions
- Consider implementing user authentication for production use
- Regular backups recommended via export functionality

## Support
If you encounter any issues:
1. Check the browser console for error messages
2. Verify all required fields are filled when adding products
3. Ensure product IDs are unique
4. Test with a simple product first

---

**Happy inventory managing! 🚀**
