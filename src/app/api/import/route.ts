import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { fetchProductImage } from '@/lib/imageFetcher'
import { fetchPhoneSpecs, generateDescriptionFromSpecs } from '@/lib/specsFetcher'

// Product interface for type safety
interface Product {
  id: string
  name: string
  brand: string
  model: string
  price: number
  description?: string
  imageUrl?: string
  specs?: Record<string, unknown>
  inStock: boolean
  stockCount: number
  category: string
  createdAt: string
  updatedAt: string
}

// Simple in-memory storage for products (shared with other routes)
declare global {
  var __products: Product[] | undefined
}

const products = globalThis.__products ?? (globalThis.__products = [])

interface PhoneSpecs {
  display?: string
  processor?: string
  memory?: string
  storage?: string
  camera?: string
  battery?: string
  os?: string
  condition?: string
  carrier?: string
  lockStatus?: string
  modelNumber?: string
}

interface ImportProduct {
  name: string
  brand: string
  model: string
  price: number
  description?: string
  imageUrl?: string
  specs?: PhoneSpecs
  inStock: boolean
  stockCount: number
  category: string
  sku?: string
  color?: string
  storage?: string
}

interface ImportResult {
  success: boolean
  imported: number
  errors: string[]
  products: ImportProduct[]
}

// Function to fetch product image from OEM websites (now using the dedicated service)
async function getProductImage(brand: string, model: string, productName?: string): Promise<string | null> {
  return await fetchProductImage(brand, model, productName)
}

// Function to map wesellcellular data to our product schema
function mapWesellCellularData(row: Record<string, unknown>): ImportProduct {
  // More comprehensive field mappings for wesellcellular
  const brand = String(row.Manufacturer || '')
  
  const model = String(row.Model || '')
  
  const name = String(
    row.Product_Name || row.product_name || row.ProductName || row.productName ||
    row.Name || row.name || row.Title || row.title || 
    `${brand} ${model}`.trim()
  )
  
  const price = parseFloat(String(row['List Price'] || 0))
  
  const stockCount = parseInt(String(row['Quantity Available'] || 0))
  
  const sku = String(row['Item #'] || '')
  
  const color = String(row.Color || '')
  
  const storage = String(row.Capacity || '')

  // Build specs object
  const specs: PhoneSpecs = {}
  if (row.Display || row.display || row.Screen || row.screen) {
    specs.display = String(row.Display || row.display || row.Screen || row.screen)
  }
  if (row.Processor || row.processor || row.CPU || row.cpu) {
    specs.processor = String(row.Processor || row.processor || row.CPU || row.cpu)
  }
  if (row.Memory || row.memory || row.RAM || row.ram) {
    specs.memory = String(row.Memory || row.memory || row.RAM || row.ram)
  }
  if (row.Camera || row.camera) {
    specs.camera = String(row.Camera || row.camera)
  }
  if (row.Battery || row.battery) {
    specs.battery = String(row.Battery || row.battery)
  }
  if (row.OS || row.os || row.Operating_System || row.operating_system) {
    specs.os = String(row.OS || row.os || row.Operating_System || row.operating_system)
  }
  if (storage) specs.storage = storage
  
  // Add wesellcellular-specific fields
  if (row.Grade) {
    specs.condition = String(row.Grade)
  }
  
  if (row.Carrier) {
    specs.carrier = String(row.Carrier)
  }
  
  if (row['Lock Status']) {
    specs.lockStatus = String(row['Lock Status'])
  }
  
  if (row['Model Number']) {
    specs.modelNumber = String(row['Model Number'])
  }

  return {
    name: name.trim(),
    brand: brand.trim(),
    model: model.trim(),
    price,
    description: String(row.Description || row.description || ''),
    imageUrl: String(
      row.Image_URL || row.image_url || row.ImageURL || row.imageURL ||
      row.Image || row.image || row.Picture || row.picture || ''
    ),
    specs: Object.keys(specs).length > 0 ? specs : undefined,
    inStock: stockCount > 0,
    stockCount,
    category: 'phone',
    sku,
    color,
    storage
  }
}

// Function to parse CSV data
function parseCSV(csvContent: string): Record<string, unknown>[] {
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  })
  
  if (result.errors.length > 0) {
    throw new Error(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`)
  }
  
  return result.data as Record<string, unknown>[]
}

// Function to parse Excel data
function parseExcel(buffer: Buffer): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  return XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[]
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fetchImages = formData.get('fetchImages') === 'true'
    const fetchSpecs = formData.get('fetchSpecs') === 'true'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let rawData: Record<string, unknown>[] = []
    
    // Parse file based on extension
    const fileName = file.name.toLowerCase()
    if (fileName.endsWith('.csv')) {
      rawData = parseCSV(buffer.toString('utf-8'))
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      rawData = parseExcel(buffer)
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload CSV or Excel files.' },
        { status: 400 }
      )
    }

    // Debug: Log the first few rows and column names
    console.log('File parsed successfully. Rows:', rawData.length)
    if (rawData.length > 0) {
      console.log('Column names:', Object.keys(rawData[0]))
      console.log('First row sample:', rawData[0])
      if (rawData.length > 1) {
        console.log('Second row sample:', rawData[1])
      }
    }

    if (rawData.length === 0) {
      return NextResponse.json(
        { error: 'No data found in file' },
        { status: 400 }
      )
    }

    const result: ImportResult = {
      success: true,
      imported: 0,
      errors: [],
      products: []
    }

    // Process each row
    for (let i = 0; i < rawData.length; i++) {
      try {
        const row = rawData[i]
        const product = mapWesellCellularData(row)
        
        // Validate required fields - only check for essential data
        if (!product.brand || !product.model || product.price <= 0) {
          result.errors.push(`Row ${i + 1}: Missing required fields (brand, model, price)`)
          continue
        }

        // Generate name if not provided
        if (!product.name) {
          product.name = `${product.brand} ${product.model}`
        }

        // Fetch image if requested and not provided
        if (fetchImages && !product.imageUrl) {
          product.imageUrl = await getProductImage(product.brand, product.model, product.name) || undefined
        }

        // Fetch specifications if requested and missing
        if (fetchSpecs) {
          const hasMissingSpecs = !product.specs || Object.keys(product.specs).length === 0
          if (hasMissingSpecs || !product.description) {
            try {
              const fetchedSpecs = await fetchPhoneSpecs(product.brand, product.model, product.specs || {})
              
              // Merge with existing specs
              product.specs = { ...product.specs, ...fetchedSpecs }
              
              // Generate description if missing
              if (!product.description) {
                product.description = generateDescriptionFromSpecs(product.specs, product.brand, product.model)
              }
            } catch (error) {
              console.log(`Failed to fetch specs for ${product.brand} ${product.model}:`, error)
            }
          }
        }

        // Check if product already exists (by name and brand)
        const existingProductIndex = products.findIndex(p => 
          p.name === product.name && p.brand === product.brand
        )

        if (existingProductIndex !== -1) {
          // Update existing product
          products[existingProductIndex] = {
            ...products[existingProductIndex],
            price: product.price,
            description: product.description,
            imageUrl: product.imageUrl,
            specs: product.specs ? JSON.parse(JSON.stringify(product.specs)) : null,
            inStock: product.inStock,
            stockCount: product.stockCount,
            updatedAt: new Date().toISOString()
          }
        } else {
          // Create new product
          const newProduct: Product = {
            id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: product.name,
            brand: product.brand,
            model: product.model,
            price: product.price,
            description: product.description,
            imageUrl: product.imageUrl,
            specs: product.specs ? JSON.parse(JSON.stringify(product.specs)) : null,
            inStock: product.inStock,
            stockCount: product.stockCount,
            category: product.category,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          products.push(newProduct)
        }

        result.imported++
        result.products.push(product)
        
      } catch (error) {
        result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import products' },
      { status: 500 }
    )
  }
}
