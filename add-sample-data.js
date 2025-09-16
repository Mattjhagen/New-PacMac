#!/usr/bin/env node

// Script to add sample products to the database

const sampleProducts = [
  {
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    price: 1199,
    description: "Latest iPhone with Pro Max features, 256GB storage, Blue Titanium finish.",
    imageUrl: "https://via.placeholder.com/300x400?text=iPhone15+Pro+Max",
    tags: ["smartphone", "apple", "pro", "max"],
    specs: {
      display: "6.7 inch Super Retina XDR",
      processor: "A17 Pro",
      storage: "256GB",
      camera: "48MP Main Camera with 5x Telephoto",
      battery: "Up to 29 hours video playback",
      os: "iOS 17",
      color: "Blue Titanium",
      carrier: "Unlocked",
      lockStatus: "Unlocked",
      grade: "A+"
    },
    inStock: true,
    stockCount: 3,
    category: "smartphones"
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    price: 1299,
    description: "Premium Android smartphone with S Pen, 512GB storage, Titanium Black.",
    imageUrl: "https://via.placeholder.com/300x400?text=Galaxy+S24+Ultra",
    tags: ["smartphone", "samsung", "ultra", "s-pen"],
    specs: {
      display: "6.8 inch Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 3",
      storage: "512GB",
      camera: "200MP Main Camera with 10x Optical Zoom",
      battery: "5000mAh",
      os: "Android 14",
      color: "Titanium Black",
      carrier: "Unlocked",
      lockStatus: "Unlocked",
      grade: "A+"
    },
    inStock: true,
    stockCount: 2,
    category: "smartphones"
  },
  {
    name: "Google Pixel 8 Pro",
    brand: "Google",
    model: "Pixel 8 Pro",
    price: 999,
    description: "Google's flagship with AI features, 128GB storage, Obsidian finish.",
    imageUrl: "https://via.placeholder.com/300x400?text=Pixel+8+Pro",
    tags: ["smartphone", "google", "pixel", "ai"],
    specs: {
      display: "6.7 inch LTPO OLED",
      processor: "Google Tensor G3",
      storage: "128GB",
      camera: "50MP Main Camera with AI features",
      battery: "5050mAh",
      os: "Android 14",
      color: "Obsidian",
      carrier: "Unlocked",
      lockStatus: "Unlocked",
      grade: "A"
    },
    inStock: true,
    stockCount: 4,
    category: "smartphones"
  },
  {
    name: "MacBook Air M3",
    brand: "Apple",
    model: "MacBook Air M3",
    price: 1099,
    description: "Ultra-thin laptop with M3 chip, 8GB RAM, 256GB SSD, Midnight finish.",
    imageUrl: "https://via.placeholder.com/300x400?text=MacBook+Air+M3",
    tags: ["laptop", "apple", "macbook", "m3"],
    specs: {
      display: "13.6 inch Liquid Retina",
      processor: "Apple M3",
      memory: "8GB Unified Memory",
      storage: "256GB SSD",
      battery: "Up to 18 hours",
      os: "macOS Sonoma",
      color: "Midnight",
      grade: "A+"
    },
    inStock: true,
    stockCount: 2,
    category: "laptops"
  },
  {
    name: "iPad Pro 12.9-inch M2",
    brand: "Apple",
    model: "iPad Pro 12.9-inch M2",
    price: 1099,
    description: "Professional tablet with M2 chip, 128GB storage, Space Gray.",
    imageUrl: "https://via.placeholder.com/300x400?text=iPad+Pro+12.9",
    tags: ["tablet", "apple", "ipad", "pro", "m2"],
    specs: {
      display: "12.9 inch Liquid Retina XDR",
      processor: "Apple M2",
      storage: "128GB",
      camera: "12MP Wide Camera",
      battery: "Up to 10 hours",
      os: "iPadOS 17",
      color: "Space Gray",
      grade: "A+"
    },
    inStock: true,
    stockCount: 3,
    category: "tablets"
  }
];

async function addSampleProducts() {
  console.log('📱 Adding sample products to database...');
  
  for (const product of sampleProducts) {
    try {
      const response = await fetch('http://localhost:3002/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Added: ${product.name} (ID: ${result.id})`);
      } else {
        console.error(`❌ Failed to add: ${product.name}`, await response.text());
      }
    } catch (error) {
      console.error(`❌ Error adding ${product.name}:`, error.message);
    }
  }
  
  console.log('');
  console.log('🎉 Sample products added!');
  console.log('📊 Check the database: http://localhost:3002/api/public/products');
}

// Run the script
addSampleProducts().catch(console.error);
