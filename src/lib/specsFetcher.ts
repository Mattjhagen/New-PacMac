import axios from 'axios'
import * as cheerio from 'cheerio'

interface PhoneSpecs {
  display?: string
  processor?: string
  memory?: string
  storage?: string
  camera?: string
  battery?: string
  os?: string
  description?: string
}

interface SearchResult {
  specs: PhoneSpecs
  confidence: number
  source: string
}

// Phone specification search sources
const SPEC_SOURCES = {
  gsmarena: {
    baseUrl: 'https://www.gsmarena.com',
    searchPath: '/results.php3',
    selectors: {
      display: '.specs-list .specs-list__item:contains("Display") .specs-list__value',
      processor: '.specs-list .specs-list__item:contains("Chipset") .specs-list__value, .specs-list .specs-list__item:contains("Processor") .specs-list__value',
      memory: '.specs-list .specs-list__item:contains("Memory") .specs-list__value, .specs-list .specs-list__item:contains("RAM") .specs-list__value',
      storage: '.specs-list .specs-list__item:contains("Storage") .specs-list__value, .specs-list .specs-list__item:contains("Internal") .specs-list__value',
      camera: '.specs-list .specs-list__item:contains("Camera") .specs-list__value',
      battery: '.specs-list .specs-list__item:contains("Battery") .specs-list__value',
      os: '.specs-list .specs-list__item:contains("OS") .specs-list__value, .specs-list .specs-list__item:contains("Operating System") .specs-list__value'
    }
  },
  phonearena: {
    baseUrl: 'https://www.phonearena.com',
    searchPath: '/search',
    selectors: {
      display: '.specs-table tr:contains("Display") td:last-child',
      processor: '.specs-table tr:contains("Processor") td:last-child, .specs-table tr:contains("Chipset") td:last-child',
      memory: '.specs-table tr:contains("RAM") td:last-child, .specs-table tr:contains("Memory") td:last-child',
      storage: '.specs-table tr:contains("Storage") td:last-child, .specs-table tr:contains("Internal") td:last-child',
      camera: '.specs-table tr:contains("Camera") td:last-child',
      battery: '.specs-table tr:contains("Battery") td:last-child',
      os: '.specs-table tr:contains("OS") td:last-child, .specs-table tr:contains("Operating System") td:last-child'
    }
  }
}

// Generic specification patterns for common phone specs
const SPEC_PATTERNS = {
  display: [
    /(\d+\.?\d*)\s*inch/i,
    /(\d+\.?\d*)\s*"/
  ],
  memory: [
    /(\d+)\s*GB\s*RAM/i,
    /(\d+)\s*GB\s*LPDDR/i
  ],
  storage: [
    /(\d+)\s*GB\s*storage/i,
    /(\d+)\s*GB\s*internal/i
  ],
  battery: [
    /(\d+)\s*mAh/i,
    /(\d+)\s*Wh/i
  ]
}

export async function fetchPhoneSpecs(
  brand: string, 
  model: string, 
  existingSpecs: PhoneSpecs = {}
): Promise<PhoneSpecs> {
  try {
    const searchQueries = [
      `${brand} ${model} specifications`,
      `${brand} ${model} specs`,
      `${brand} ${model} technical specifications`
    ]

    const results: SearchResult[] = []

    // Search multiple sources
    for (const [sourceName, source] of Object.entries(SPEC_SOURCES)) {
      try {
        const result = await searchSpecSource(sourceName, source, brand, model, searchQueries)
        if (result && result.confidence > 0.3) {
          results.push(result)
        }
      } catch (error) {
        console.log(`Failed to search ${sourceName} for ${brand} ${model}:`, error)
        continue
      }
    }

    // Merge results with existing specs
    const mergedSpecs = mergeSpecs(existingSpecs, results)
    
    return mergedSpecs
  } catch (error) {
    console.error('Error fetching phone specs:', error)
    return existingSpecs
  }
}

async function searchSpecSource(
  sourceName: string, 
  source: Record<string, unknown>, 
  brand: string, 
  model: string, 
  searchQueries: string[]
): Promise<SearchResult | null> {
  for (const query of searchQueries) {
    try {
      const searchUrl = `${source.baseUrl as string}${source.searchPath as string}?s=${encodeURIComponent(query)}`
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      })

      const $ = cheerio.load(response.data)
      const specs: PhoneSpecs = {}
      let confidence = 0

      // Extract specifications using selectors
      for (const [specType, selector] of Object.entries(source.selectors as Record<string, string>)) {
        try {
          const element = $(selector).first()
          const text = element.text().trim()
          
          if (text && text.length > 0) {
            specs[specType as keyof PhoneSpecs] = text
            confidence += 0.1
          }
        } catch (error) {
          console.log(`Failed to extract ${specType} from ${sourceName}:`, error)
        }
      }

      // Try to find product page link and scrape detailed specs
      const productLink = $('a[href*="' + brand.toLowerCase() + '"]').first().attr('href')
      if (productLink) {
        const detailedSpecs = await scrapeDetailedSpecs((source.baseUrl as string) + productLink, source.selectors as Record<string, string>)
        Object.assign(specs, detailedSpecs)
        confidence += 0.2
      }

      if (Object.keys(specs).length > 0) {
        return {
          specs,
          confidence: Math.min(confidence, 1.0),
          source: sourceName
        }
      }
    } catch (error) {
      console.log(`Failed to search ${sourceName} with query "${query}":`, error)
      continue
    }
  }

  return null
}

async function scrapeDetailedSpecs(url: string, selectors: Record<string, string>): Promise<PhoneSpecs> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    })

    const $ = cheerio.load(response.data)
    const specs: PhoneSpecs = {}

    for (const [specType, selector] of Object.entries(selectors)) {
      try {
        const element = $(selector).first()
        const text = element.text().trim()
        
        if (text && text.length > 0) {
          specs[specType as keyof PhoneSpecs] = text
        }
      } catch (error) {
        console.log(`Failed to extract ${specType} from detailed page:`, error)
      }
    }

    return specs
  } catch (error) {
    console.error('Error scraping detailed specs:', error)
    return {}
  }
}

function mergeSpecs(existingSpecs: PhoneSpecs, results: SearchResult[]): PhoneSpecs {
  const merged: PhoneSpecs = { ...existingSpecs }

  // Sort results by confidence
  const sortedResults = results.sort((a, b) => b.confidence - a.confidence)

  // Merge specs from highest confidence sources first
  for (const result of sortedResults) {
    for (const [key, value] of Object.entries(result.specs)) {
      if (!merged[key as keyof PhoneSpecs] && value) {
        merged[key as keyof PhoneSpecs] = value
      }
    }
  }

  // Apply pattern matching to extract specific values
  for (const [specType, patterns] of Object.entries(SPEC_PATTERNS)) {
    const currentValue = merged[specType as keyof PhoneSpecs]
    if (currentValue) {
      for (const pattern of patterns) {
        const match = currentValue.match(pattern)
        if (match) {
          // Keep the original value but ensure it's properly formatted
          break
        }
      }
    }
  }

  return merged
}

// Batch fetch specs for multiple products
export async function fetchMultipleProductSpecs(
  products: Array<{ brand: string; model: string; specs?: PhoneSpecs }>
): Promise<Map<string, PhoneSpecs>> {
  const results = new Map<string, PhoneSpecs>()
  
  // Process in batches to avoid overwhelming servers
  const batchSize = 3
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)
    
    const promises = batch.map(async (product, index) => {
      const key = `${product.brand}-${product.model}`
      const specs = await fetchPhoneSpecs(product.brand, product.model, product.specs)
      results.set(key, specs)
      
      // Add delay between requests to be respectful
      if (index < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    })
    
    await Promise.all(promises)
    
    // Add delay between batches
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  return results
}

// Generate description from specs
export function generateDescriptionFromSpecs(specs: PhoneSpecs, brand: string, model: string): string {
  const parts: string[] = []
  
  if (specs.display) {
    parts.push(`Features a ${specs.display}`)
  }
  
  if (specs.processor) {
    parts.push(`powered by ${specs.processor}`)
  }
  
  if (specs.memory && specs.storage) {
    parts.push(`with ${specs.memory} RAM and ${specs.storage} storage`)
  } else if (specs.memory) {
    parts.push(`with ${specs.memory} RAM`)
  } else if (specs.storage) {
    parts.push(`with ${specs.storage} storage`)
  }
  
  if (specs.camera) {
    parts.push(`and ${specs.camera}`)
  }
  
  if (specs.battery) {
    parts.push(`with ${specs.battery} battery`)
  }
  
  if (specs.os) {
    parts.push(`running ${specs.os}`)
  }
  
  if (parts.length === 0) {
    return `${brand} ${model} - A high-quality smartphone with modern features and specifications.`
  }
  
  return `${brand} ${model} - ${parts.join(', ')}.`
}
