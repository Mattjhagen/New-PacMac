import { NextRequest, NextResponse } from 'next/server'

interface InventoryItem {
  itemNumber: string
  warehouse: string
  category: string
  manufacturer: string
  model: string
  grade: string
  capacity: string
  carrier: string
  color: string
  lockStatus: string
  modelNumber: string
  partsMessage: string
  incrementSize: string
  quantityAvailable: string
  listPrice: string
  transactionStatus: string
  transactionQuantity: string
  transactionPrice: string
  expires: string
  newOfferQuantity: string
  newOfferPrice: string
}

interface Product {
  id: string
  name: string
  brand: string
  model: string
  price: number
  description?: string
  imageUrl?: string
  img?: string
  tags: string[]
  specs: {
    display?: string
    processor?: string
    memory?: string
    storage?: string
    camera?: string
    battery?: string
    os?: string
    color?: string
    carrier?: string
    lockStatus?: string
    grade?: string
  }
  inStock: boolean
  stockCount: number
  category: string
  createdAt: string
  updatedAt: string
}

// Function to generate product image URL
async function getProductImage(manufacturer: string, model: string, color: string): Promise<string> {
  try {
    // Clean up the model name for better search results
    const cleanModel = model.replace(/[^\w\s]/g, '').trim()
    const cleanColor = color.replace(/[^\w\s]/g, '').trim()
    
    // Try different image sources based on manufacturer
    if (manufacturer.toLowerCase() === 'apple') {
      // Apple products - try Apple's official images first
      const appleModel = cleanModel.toLowerCase().replace(/\s+/g, '-')
      const appleColor = cleanColor.toLowerCase().replace(/\s+/g, '-')
      
      // Try Apple's CDN first
      const appleCdnUrl = `https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/${appleModel}-${appleColor}?wid=2000&hei=2000&fmt=jpeg&qlt=90&.v=0`
      
      // Test if the URL is accessible
      try {
        const response = await fetch(appleCdnUrl, { method: 'HEAD' })
        if (response.ok) {
          return appleCdnUrl
        }
      } catch {
        // Fall back to Google Images search
      }
      
      // Fallback to Google Images search
      const searchQuery = encodeURIComponent(`${manufacturer} ${cleanModel} ${cleanColor}`)
      return `https://www.google.com/search?q=${searchQuery}&tbm=isch&tbs=isz:m&hl=en&safe=active`
    } else if (manufacturer.toLowerCase() === 'samsung') {
      // Samsung products
      const searchQuery = encodeURIComponent(`${manufacturer} ${cleanModel} ${cleanColor}`)
      return `https://www.google.com/search?q=${searchQuery}&tbm=isch&tbs=isz:m&hl=en&safe=active`
    } else {
      // Other manufacturers
      const searchQuery = encodeURIComponent(`${manufacturer} ${cleanModel} ${cleanColor}`)
      return `https://www.google.com/search?q=${searchQuery}&tbm=isch&tbs=isz:m&hl=en&safe=active`
    }
  } catch (error) {
    console.error('Error generating image URL:', error)
    return '/images/no-image.png'
  }
}

// Function to generate product tags
function generateTags(item: InventoryItem): string[] {
  const tags: string[] = []
  
  // Add manufacturer
  if (item.manufacturer) {
    tags.push(item.manufacturer)
  }
  
  // Add model
  if (item.model) {
    tags.push(item.model)
  }
  
  // Add category
  if (item.category) {
    tags.push(item.category.toLowerCase())
  }
  
  // Add capacity
  if (item.capacity && item.capacity !== 'NA') {
    tags.push(item.capacity)
  }
  
  // Add color
  if (item.color && item.color !== 'NA' && item.color !== 'Mixed') {
    tags.push(item.color)
  }
  
  // Add carrier info
  if (item.carrier && item.carrier !== 'NA') {
    tags.push(item.carrier)
  }
  
  // Add grade
  if (item.grade && item.grade !== 'NA') {
    tags.push(item.grade)
  }
  
  // Add lock status
  if (item.lockStatus && item.lockStatus !== 'NA') {
    tags.push(item.lockStatus)
  }
  
  return tags
}

// Function to generate product description
function generateDescription(item: InventoryItem): string {
  const parts = []
  
  if (item.manufacturer && item.model) {
    parts.push(`${item.manufacturer} ${item.model}`)
  }
  
  if (item.capacity && item.capacity !== 'NA') {
    parts.push(`${item.capacity} storage`)
  }
  
  if (item.color && item.color !== 'NA' && item.color !== 'Mixed') {
    parts.push(`in ${item.color}`)
  }
  
  if (item.carrier && item.carrier !== 'NA') {
    parts.push(`for ${item.carrier}`)
  }
  
  if (item.grade && item.grade !== 'NA') {
    parts.push(`(${item.grade} condition)`)
  }
  
  return parts.join(' ')
}

// Function to parse the inventory data
function parseInventoryData(data: string): InventoryItem[] {
  const lines = data.trim().split('\n')
  const items: InventoryItem[] = []
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const columns = line.split('\t')
    if (columns.length < 21) continue
    
    const item: InventoryItem = {
      itemNumber: columns[0] || '',
      warehouse: columns[1] || '',
      category: columns[2] || '',
      manufacturer: columns[3] || '',
      model: columns[4] || '',
      grade: columns[5] || '',
      capacity: columns[6] || '',
      carrier: columns[7] || '',
      color: columns[8] || '',
      lockStatus: columns[9] || '',
      modelNumber: columns[10] || '',
      partsMessage: columns[11] || '',
      incrementSize: columns[12] || '',
      quantityAvailable: columns[13] || '',
      listPrice: columns[14] || '',
      transactionStatus: columns[15] || '',
      transactionQuantity: columns[16] || '',
      transactionPrice: columns[17] || '',
      expires: columns[18] || '',
      newOfferQuantity: columns[19] || '',
      newOfferPrice: columns[20] || ''
    }
    
    items.push(item)
  }
  
  return items
}

// Function to convert inventory item to product
async function convertToProduct(item: InventoryItem): Promise<Product> {
  const price = parseFloat(item.listPrice) || 0
  const stockCount = parseInt(item.quantityAvailable) || 0
  
  // Generate unique ID
  const id = `pm-product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Generate product name
  const name = `${item.manufacturer} ${item.model}${item.capacity ? ` ${item.capacity}` : ''}${item.color && item.color !== 'NA' && item.color !== 'Mixed' ? ` ${item.color}` : ''}`
  
  // Generate tags
  const tags = generateTags(item)
  
  // Generate description
  const description = generateDescription(item)
  
  // Get product image
  const img = await getProductImage(item.manufacturer, item.model, item.color)
  
  // Generate specs
  const specs: Product['specs'] = {}
  if (item.capacity && item.capacity !== 'NA') {
    specs.storage = item.capacity
  }
  if (item.color && item.color !== 'NA' && item.color !== 'Mixed') {
    specs.color = item.color
  }
  if (item.carrier && item.carrier !== 'NA') {
    specs.carrier = item.carrier
  }
  if (item.lockStatus && item.lockStatus !== 'NA') {
    specs.lockStatus = item.lockStatus
  }
  if (item.grade && item.grade !== 'NA') {
    specs.grade = item.grade
  }
  
  return {
    id,
    name,
    brand: item.manufacturer,
    model: item.model,
    price,
    description,
    imageUrl: img,
    img: img,
    tags,
    specs,
    inStock: stockCount > 0,
    stockCount,
    category: item.category.toLowerCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export async function POST(request: NextRequest) {
  try {
    const { inventoryData, testMode = false } = await request.json()
    
    if (!inventoryData) {
      return NextResponse.json(
        { error: 'Inventory data is required' },
        { status: 400 }
      )
    }
    
    console.log('Starting bulk import...')
    console.log('Test mode:', testMode)
    
    // Parse the inventory data
    const inventoryItems = parseInventoryData(inventoryData)
    console.log(`Parsed ${inventoryItems.length} inventory items`)
    
    // Limit to first 10 items in test mode
    const itemsToProcess = testMode ? inventoryItems.slice(0, 10) : inventoryItems
    console.log(`Processing ${itemsToProcess.length} items`)
    
    // Convert to products
    const products: Product[] = []
    const errors: string[] = []
    
    for (let i = 0; i < itemsToProcess.length; i++) {
      try {
        const item = itemsToProcess[i]
        console.log(`Processing item ${i + 1}/${itemsToProcess.length}: ${item.manufacturer} ${item.model}`)
        
        const product = await convertToProduct(item)
        products.push(product)
        
        // Add a small delay to avoid overwhelming the image service
        if (i % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } catch (e) {
        const errorMsg = `Error processing item ${i + 1}: ${e instanceof Error ? e.message : 'Unknown error'}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }
    
    // Store products in global storage (in-memory for now)
    if (!globalThis.__products) {
      globalThis.__products = []
    }
    
    // Add new products to existing ones
    globalThis.__products.push(...products)
    
    console.log(`Successfully imported ${products.length} products`)
    console.log(`Errors: ${errors.length}`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${products.length} products${testMode ? ' (test mode - first 10 items)' : ''}`,
      details: {
        totalItems: inventoryItems.length,
        processedItems: itemsToProcess.length,
        successfulImports: products.length,
        errors: errors.length,
        testMode,
        sampleProducts: products.slice(0, 3).map(p => ({
          name: p.name,
          price: p.price,
          brand: p.brand,
          model: p.model,
          stockCount: p.stockCount
        }))
      },
      errors: errors.slice(0, 10) // Return first 10 errors
    })
    
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to import products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
