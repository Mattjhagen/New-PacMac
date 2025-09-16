# WesellCellular Import Guide

This guide explains how to import your inventory from wesellcellular and automatically fetch product images from OEM websites.

## 🚀 Quick Start

1. **Export your inventory** from wesellcellular as CSV or Excel
2. **Click "Import from wesellcellular"** in the admin dashboard
3. **Upload your file** and enable automatic image fetching
4. **Review the results** and fix any errors

## 📋 Supported File Formats

- **CSV** (.csv) - Recommended for large datasets
- **Excel** (.xlsx, .xls) - Good for complex data with multiple sheets

## 📊 Required Fields

Your wesellcellular export must include these **essential fields only**:

| Field Name | Description | Example |
|------------|-------------|---------|
| `Brand` | Phone manufacturer | Apple, Samsung, Google |
| `Model` | Phone model | iPhone 15 Pro, Galaxy S24 |
| `Price` | Product price | 999.99 |

**Note:** `Product_Name` is optional - the system will automatically generate it from Brand + Model if not provided.

## 🔧 Optional Fields

These fields will enhance your product data:

| Field Name | Description | Example |
|------------|-------------|---------|
| `Stock` / `Quantity` | Available inventory | 10 |
| `Color` | Phone color | Natural Titanium |
| `Storage` / `Capacity` | Storage size | 128GB, 256GB |
| `Display` | Screen specifications | 6.1-inch Super Retina XDR |
| `Processor` | CPU information | A17 Pro chip |
| `Memory` | RAM amount | 8GB |
| `Camera` | Camera specifications | 48MP Main, 12MP Ultra Wide |
| `Battery` | Battery information | Up to 23 hours video playback |
| `OS` | Operating system | iOS 17, Android 14 |
| `Description` | Product description | Latest iPhone with titanium design |
| `Image_URL` | Product image URL | https://example.com/image.jpg |
| `SKU` | Product SKU | IPH15P-128-NT |

## 🖼️ Automatic Image Fetching

The system can automatically fetch product images from OEM websites:

### Supported Brands
- **Apple** - iPhone, iPad, Mac products
- **Samsung** - Galaxy phones and tablets
- **Google** - Pixel phones and accessories
- **OnePlus** - OnePlus smartphones
- **Generic** - Other brands via image search

### How It Works
1. **OEM Website Search** - Searches official manufacturer websites first
2. **Generic Image Search** - Falls back to general product image search
3. **Stock Photo Services** - Uses stock photo APIs as last resort
4. **Validation** - Ensures images are valid and not placeholders

### Import Options
- ✅ **Fetch Images** - Automatically get product images from OEM websites
- ✅ **Fetch Specifications** - Automatically fill missing specs via web search
- ✅ **Batch processing** - Handles multiple products efficiently
- ✅ **Flexible validation** - Only requires essential fields (Brand, Model, Price)

## 📝 Import Process

### Step 1: Prepare Your Data
1. Export your wesellcellular inventory
2. Ensure required fields are present
3. Check data quality (no empty required fields)

### Step 2: Upload and Configure
1. Click "Import from wesellcellular"
2. Select your file (CSV/Excel)
3. Choose import options:
   - ✅ **Fetch Images** - Get product images from OEM websites
   - ✅ **Fetch Specifications** - Fill missing specs via web search
   - ✅ Update existing products
   - ✅ Skip invalid rows

### Step 3: Review Results
- **Success count** - Number of products imported
- **Error list** - Issues that need attention
- **Product preview** - Sample of imported products

## 🔍 Field Mapping

The system automatically maps common wesellcellular field names:

| WesellCellular Field | Mapped To | Notes |
|---------------------|-----------|-------|
| `Brand` / `Manufacturer` | `brand` | Phone manufacturer |
| `Model` | `model` | Phone model |
| `Product_Name` / `Name` | `name` | Full product name |
| `Price` / `Cost` | `price` | Product price |
| `Stock` / `Quantity` | `stockCount` | Available inventory |
| `Color` | `color` | Phone color |
| `Storage` / `Capacity` | `storage` | Storage size |
| `Image_URL` | `imageUrl` | Product image |

## ⚠️ Common Issues & Solutions

### Missing Required Fields
**Error**: "Missing required fields (brand, model, price)"
**Solution**: Ensure your export includes Brand, Model, and Price columns

### Invalid Price Format
**Error**: "Invalid price format"
**Solution**: Use numeric values (999.99) not text ("$999.99")

### Duplicate Products
**Behavior**: System updates existing products instead of creating duplicates
**Solution**: This is intentional - prevents duplicate inventory

### Image Fetching Failures
**Issue**: Some products don't get images
**Solutions**:
- Check if product names are accurate
- Try the "Fetch Images" button later
- Manually add image URLs in the product form

## 📊 Import Statistics

After import, you'll see:
- **Total processed** - Number of rows in your file
- **Successfully imported** - Products added/updated
- **Errors** - Rows that couldn't be processed
- **Images fetched** - Products that got automatic images

## 🔄 Updating Existing Products

The system intelligently handles existing products:
- **Updates** existing products with new data
- **Preserves** existing images if new ones aren't found
- **Maintains** product IDs and relationships
- **Logs** all changes for audit purposes

## 📈 Best Practices

### Data Preparation
1. **Clean your data** before export
2. **Use consistent naming** for brands and models
3. **Include all specifications** for better product pages
4. **Verify prices** are accurate and in correct format

### Import Strategy
1. **Start small** - Test with a few products first
2. **Enable image fetching** for better product presentation
3. **Review errors** and fix data issues
4. **Schedule imports** during off-peak hours

### Post-Import
1. **Review imported products** for accuracy
2. **Fetch images** for products that need them
3. **Update descriptions** and specifications
4. **Set proper stock levels** and availability

## 🛠️ Advanced Features

### Batch Processing
- **Fetch Images** button - Updates existing products with images
- **Fetch Specs** button - Fills missing specifications via web search
- Processes products in batches to avoid overwhelming servers
- Includes delays between requests to be respectful

### Error Handling
- Detailed error messages for each failed row
- Continues processing even if some rows fail
- Provides suggestions for fixing common issues

### Data Validation
- Validates required fields before import
- Checks price formats and numeric values
- Ensures image URLs are valid
- Prevents duplicate product creation

## 📞 Support

If you encounter issues:
1. **Check the error messages** for specific problems
2. **Download the template** to see expected format
3. **Review your data** against the field mapping table
4. **Try importing a small sample** first

## 🔮 Future Enhancements

Planned features:
- **Bulk image upload** from local files
- **Advanced field mapping** configuration
- **Import scheduling** and automation
- **Data transformation** rules
- **Integration** with other wholesellers
- **Analytics** and import reporting
