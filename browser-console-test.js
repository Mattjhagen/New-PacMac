// Copy and paste this into the browser console on pacmacmobile.com

console.log('🧪 Starting diagnostic test...');

// Test 1: Check if PRODUCTS array exists and has data
console.log('1. PRODUCTS array:', PRODUCTS);
console.log('   Length:', PRODUCTS ? PRODUCTS.length : 'undefined');

// Test 2: Check if product-grid element exists
const productGrid = document.getElementById('product-grid');
console.log('2. product-grid element:', productGrid);
console.log('   Display style:', productGrid ? window.getComputedStyle(productGrid).display : 'N/A');

// Test 3: Check if functions exist
console.log('3. initializeApp function:', typeof initializeApp);
console.log('4. showProducts function:', typeof showProducts);

// Test 4: Try to call initializeApp manually
if (typeof initializeApp === 'function') {
    console.log('5. Calling initializeApp...');
    try {
        initializeApp();
        console.log('   ✅ initializeApp called successfully');
    } catch (error) {
        console.log('   ❌ Error calling initializeApp:', error);
    }
} else {
    console.log('5. ❌ initializeApp function not found');
}

// Test 5: Try to call showProducts manually
if (typeof showProducts === 'function') {
    console.log('6. Calling showProducts...');
    try {
        showProducts();
        console.log('   ✅ showProducts called successfully');
    } catch (error) {
        console.log('   ❌ Error calling showProducts:', error);
    }
} else {
    console.log('6. ❌ showProducts function not found');
}

// Test 6: Check if products are in the grid
if (productGrid) {
    const productCards = productGrid.querySelectorAll('.card');
    console.log('7. Product cards in grid:', productCards.length);
    
    if (productCards.length === 0) {
        console.log('   ❌ No product cards found in grid');
        console.log('   Grid innerHTML:', productGrid.innerHTML.substring(0, 200) + '...');
    } else {
        console.log('   ✅ Product cards found');
    }
}

console.log('🏁 Diagnostic test complete!');
