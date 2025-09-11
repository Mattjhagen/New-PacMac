import axios from 'axios'

// Known image URL patterns for OEM sites
const OEM_IMAGE_PATTERNS = {
  apple: {
    baseUrl: 'https://store.storeimages.cdn-apple.com',
    patterns: [
      '/4982/as-images.apple.com/is/iphone-15-pro-finish-select-{color}-{year}',
      '/4982/as-images.apple.com/is/iphone-16-finish-select-{color}-{year}',
      '/4982/as-images.apple.com/is/ipad-air-finish-select-{color}-{year}',
      '/4982/as-images.apple.com/is/ipad-pro-finish-select-{color}-{year}'
    ],
    fallbackUrls: [
      'https://www.apple.com/v/iphone/home/images/overview/hero/hero_iphone_15_pro__eqhxej1p7kaq_large.jpg',
      'https://www.apple.com/v/iphone/home/images/overview/hero/hero_iphone_16__eqhxej1p7kaq_large.jpg'
    ]
  },
  samsung: {
    baseUrl: 'https://images.samsung.com',
    patterns: [
      '/is/image/samsung/galaxy-s24-ultra-5g-{color}-sm-s928bzkdeua-front',
      '/is/image/samsung/galaxy-s24-5g-{color}-sm-s921bzkdeua-front',
      '/is/image/samsung/galaxy-s23-ultra-5g-{color}-sm-s918bzkdeua-front'
    ],
    fallbackUrls: [
      'https://images.samsung.com/is/image/samsung/galaxy-s24-ultra-5g-titanium-gray-sm-s928bzkdeua-front',
      'https://images.samsung.com/is/image/samsung/galaxy-s24-5g-cobalt-violet-sm-s921bzkdeua-front'
    ]
  },
  google: {
    baseUrl: 'https://lh3.googleusercontent.com',
    patterns: [
      '/pixel-8-pro-{color}-hero',
      '/pixel-8-{color}-hero',
      '/pixel-7-pro-{color}-hero'
    ],
    fallbackUrls: [
      'https://lh3.googleusercontent.com/pixel-8-pro-obsidian-hero',
      'https://lh3.googleusercontent.com/pixel-8-hazel-hero'
    ]
  }
}

// Product image mapping for known devices
const PRODUCT_IMAGE_MAP: Record<string, string> = {
  // iPhone 16 Series
  'iphone 16 pro': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-natural-titanium-202409?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1723703843576',
  'iphone 16 pro max': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-max-finish-select-natural-titanium-202409?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1723703843576',
  'iphone 16': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-pink-202409?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1723703843576',
  'iphone 16 plus': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-plus-finish-select-pink-202409?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1723703843576',
  
  // iPhone 15 Series
  'iphone 15 pro': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-natural-titanium-202309?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279824',
  'iphone 15 pro max': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-finish-select-natural-titanium-202309?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279824',
  'iphone 15': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-pink-202309?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279824',
  'iphone 15 plus': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-plus-finish-select-pink-202309?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279824',
  
  // iPad Series
  'ipad air': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-finish-select-blue-202403?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1709841208484',
  'ipad pro': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-finish-select-silver-202403?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1709841208484',
  
  // Samsung Galaxy S24 Series
  'galaxy s24 ultra': 'https://images.samsung.com/is/image/samsung/galaxy-s24-ultra-5g-titanium-gray-sm-s928bzkdeua-front',
  'galaxy s24': 'https://images.samsung.com/is/image/samsung/galaxy-s24-5g-cobalt-violet-sm-s921bzkdeua-front',
  'galaxy s24+': 'https://images.samsung.com/is/image/samsung/galaxy-s24-plus-5g-cobalt-violet-sm-s926bzkdeua-front',
  
  // Samsung Galaxy S23 Series
  'galaxy s23 ultra': 'https://images.samsung.com/is/image/samsung/galaxy-s23-ultra-5g-phantom-black-sm-s918bzkdeua-front',
  'galaxy s23': 'https://images.samsung.com/is/image/samsung/galaxy-s23-5g-phantom-black-sm-s911bzkdeua-front',
  'galaxy s23+': 'https://images.samsung.com/is/image/samsung/galaxy-s23-plus-5g-phantom-black-sm-s916bzkdeua-front',
  
  // Google Pixel Series
  'pixel 8 pro': 'https://lh3.googleusercontent.com/pixel-8-pro-obsidian-hero',
  'pixel 8': 'https://lh3.googleusercontent.com/pixel-8-hazel-hero',
  'pixel 7 pro': 'https://lh3.googleusercontent.com/pixel-7-pro-obsidian-hero',
  'pixel 7': 'https://lh3.googleusercontent.com/pixel-7-lemongrass-hero'
}

// Generic image search using multiple strategies
export async function fetchProductImage(
  brand: string, 
  model: string, 
  productName?: string
): Promise<string | null> {
  const normalizedBrand = brand.toLowerCase().trim()
  const normalizedModel = model.toLowerCase().trim()
  const searchKey = `${normalizedModel}`.toLowerCase()
  
  try {
    // Strategy 1: Check direct product mapping
    const directImage = PRODUCT_IMAGE_MAP[searchKey]
    if (directImage) {
      console.log(`Found direct image for ${brand} ${model}: ${directImage}`)
      return directImage
    }

    // Strategy 2: Try OEM-specific patterns
    const oemImage = await searchOEMPatterns(normalizedBrand, normalizedModel, productName)
    if (oemImage) return oemImage

    // Strategy 3: Try fallback URLs
    const fallbackImage = await tryFallbackUrls(normalizedBrand, normalizedModel)
    if (fallbackImage) return fallbackImage

    console.log(`No image found for ${brand} ${model}`)
    return null
  } catch (error) {
    console.error('Error fetching product image:', error)
    return null
  }
}

// Search OEM-specific patterns
async function searchOEMPatterns(brand: string, model: string, _productName?: string): Promise<string | null> {
  const oemConfig = OEM_IMAGE_PATTERNS[brand as keyof typeof OEM_IMAGE_PATTERNS]
  if (!oemConfig) return null

  try {
    // Try known patterns for this brand
    for (const pattern of oemConfig.patterns) {
      const testUrl = `${oemConfig.baseUrl}${pattern}`
      if (await isValidImageUrl(testUrl)) {
        console.log(`Found valid OEM image for ${brand} ${model}: ${testUrl}`)
        return testUrl
      }
    }
    return null
  } catch (error) {
    console.error(`Error searching ${brand} patterns:`, error)
    return null
  }
}

// Try fallback URLs for known brands
async function tryFallbackUrls(brand: string, model: string): Promise<string | null> {
  const oemConfig = OEM_IMAGE_PATTERNS[brand as keyof typeof OEM_IMAGE_PATTERNS]
  if (!oemConfig) return null

  try {
    // Try fallback URLs
    for (const fallbackUrl of oemConfig.fallbackUrls) {
      if (await isValidImageUrl(fallbackUrl)) {
        console.log(`Found fallback image for ${brand} ${model}: ${fallbackUrl}`)
        return fallbackUrl
      }
    }
    return null
  } catch (error) {
    console.error(`Error trying fallback URLs for ${brand}:`, error)
    return null
  }
}

// Search stock photo services
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function searchStockPhotos(_brand: string, _model: string): Promise<string | null> {
  // This would typically use APIs like Unsplash, Pexels, etc.
  // For now, we'll use a simple approach with common stock photo patterns
  
  // const stockQueries = [
  //   `${brand} ${model} phone`,
  //   `${brand} smartphone`,
  //   `${model} mobile phone`
  // ]

  // In a real implementation, you would use the actual APIs
  // For now, return null as this requires API keys
  return null
}

// Utility function to check if image URL is valid
async function isValidImageUrl(url: string): Promise<boolean> {
  if (!url || typeof url !== 'string') return false
  
  try {
    // Check if it's a valid URL
    new URL(url)
    
    // Check if it's an image URL by extension or domain
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext))
    
    const imageDomains = [
      'images.samsung.com',
      'store.storeimages.cdn-apple.com',
      'lh3.googleusercontent.com',
      'images.apple.com',
      'cdn.shopify.com'
    ]
    const hasImageDomain = imageDomains.some(domain => url.includes(domain))
    
    if (!hasImageExtension && !hasImageDomain) return false
    
    // Try to fetch the image to verify it exists
    const response = await axios.head(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    return response.status === 200
  } catch (error) {
    console.log(`Image URL validation failed for ${url}:`, error)
    return false
  }
}

// function isGoogleImage(url: string): boolean {
//   return url.includes('googleusercontent.com') || url.includes('google.com')
// }

// function makeAbsoluteUrl(url: string, baseUrl: string): string {
//   if (url.startsWith('http')) return url
//   if (url.startsWith('//')) return `https:${url}`
//   if (url.startsWith('/')) return `${baseUrl}${url}`
//   return `${baseUrl}/${url}`
// }

// Batch image fetching for multiple products
export async function fetchMultipleProductImages(
  products: Array<{ brand: string; model: string; name?: string }>
): Promise<Map<string, string>> {
  const results = new Map<string, string>()
  
  // Process in batches to avoid overwhelming servers
  const batchSize = 5
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)
    
    const promises = batch.map(async (product, index) => {
      const key = `${product.brand}-${product.model}`
      const imageUrl = await fetchProductImage(product.brand, product.model, product.name)
      if (imageUrl) {
        results.set(key, imageUrl)
      }
      
      // Add delay between requests to be respectful
      if (index < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    })
    
    await Promise.all(promises)
    
    // Add delay between batches
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  return results
}
