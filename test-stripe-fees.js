#!/usr/bin/env node

// Test script to verify Stripe fee calculations
// This script tests the $3 flat fee + 3% fee structure

console.log('🧪 Testing Stripe Fee Calculations\n');

// Test cases
const testCases = [
  { amount: 0.05, description: 'Bid amount ($0.05)' },
  { amount: 1.00, description: 'Purchase amount ($1.00)' },
  { amount: 10.00, description: 'Item price ($10.00)' },
  { amount: 50.00, description: 'Item price ($50.00)' },
  { amount: 100.00, description: 'Item price ($100.00)' },
  { amount: 500.00, description: 'Item price ($500.00)' }
];

function calculateFees(amount) {
  const flatFee = 3.00; // $3 flat fee
  const percentageFee = amount * 0.03; // 3% of amount
  const totalFee = flatFee + percentageFee;
  const totalAmount = amount + totalFee;
  
  return {
    originalAmount: amount,
    flatFee,
    percentageFee,
    totalFee,
    totalAmount,
    totalAmountCents: Math.round(totalAmount * 100)
  };
}

console.log('Fee Structure: $3.00 flat fee + 3% of transaction amount\n');

testCases.forEach(testCase => {
  const result = calculateFees(testCase.amount);
  
  console.log(`📱 ${testCase.description}:`);
  console.log(`   Original Amount: $${result.originalAmount.toFixed(2)}`);
  console.log(`   Flat Fee: $${result.flatFee.toFixed(2)}`);
  console.log(`   Percentage Fee (3%): $${result.percentageFee.toFixed(2)}`);
  console.log(`   Total Fee: $${result.totalFee.toFixed(2)}`);
  console.log(`   Total Amount: $${result.totalAmount.toFixed(2)}`);
  console.log(`   Stripe Amount (cents): ${result.totalAmountCents}`);
  console.log('');
});

// Test edge cases
console.log('🔍 Edge Cases:\n');

const edgeCases = [
  { amount: 0.01, description: 'Minimum amount ($0.01)' },
  { amount: 0.10, description: 'Small amount ($0.10)' },
  { amount: 1000.00, description: 'Large amount ($1000.00)' }
];

edgeCases.forEach(testCase => {
  const result = calculateFees(testCase.amount);
  
  console.log(`📱 ${testCase.description}:`);
  console.log(`   Total Amount: $${result.totalAmount.toFixed(2)}`);
  console.log(`   Stripe Amount (cents): ${result.totalAmountCents}`);
  console.log('');
});

// Verify Stripe minimums
console.log('✅ Stripe Requirements Check:\n');
testCases.forEach(testCase => {
  const result = calculateFees(testCase.amount);
  const meetsMinimum = result.totalAmountCents >= 50; // Stripe minimum is $0.50
  
  console.log(`${meetsMinimum ? '✅' : '❌'} ${testCase.description}: $${result.totalAmount.toFixed(2)} ${meetsMinimum ? 'meets' : 'does not meet'} Stripe minimum ($0.50)`);
});

console.log('\n🎯 Summary:');
console.log('- All transactions include $3.00 flat fee');
console.log('- All transactions include 3% percentage fee');
console.log('- Total amount = Original amount + $3.00 + (3% of original amount)');
console.log('- Stripe receives the total amount in cents');
console.log('- Seller receives the original amount (minus any platform fees)');
