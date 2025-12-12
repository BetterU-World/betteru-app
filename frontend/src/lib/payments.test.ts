/**
 * Revenue Split Test
 * 
 * This file tests the revenue split logic to ensure it correctly
 * allocates 30% to affiliates, 10% to charity, and 60% to business.
 */

import { calculateRevenueSplit } from './payments';

console.log('=== Revenue Split Tests ===\n');

// Test 1: $10 subscription with affiliate
console.log('Test 1: $10 subscription WITH affiliate');
const test1 = calculateRevenueSplit(10, true);
console.log('Gross:', test1.gross);
console.log('Affiliate (30%):', test1.affiliateAmount);
console.log('Charity (10%):', test1.charityAmount);
console.log('Business (60%):', test1.businessNet);
console.log('Total:', test1.affiliateAmount + test1.charityAmount + test1.businessNet);
console.log('');

// Test 2: $10 subscription without affiliate
console.log('Test 2: $10 subscription WITHOUT affiliate');
const test2 = calculateRevenueSplit(10, false);
console.log('Gross:', test2.gross);
console.log('Affiliate (0%):', test2.affiliateAmount);
console.log('Charity (10%):', test2.charityAmount);
console.log('Business (90%):', test2.businessNet);
console.log('Total:', test2.affiliateAmount + test2.charityAmount + test2.businessNet);
console.log('');

// Test 3: $9.99 subscription with affiliate (realistic Stripe amount)
console.log('Test 3: $9.99 subscription WITH affiliate');
const test3 = calculateRevenueSplit(9.99, true);
console.log('Gross:', test3.gross);
console.log('Affiliate (30%):', test3.affiliateAmount.toFixed(2));
console.log('Charity (10%):', test3.charityAmount.toFixed(2));
console.log('Business (60%):', test3.businessNet.toFixed(2));
console.log('');

// Test 4: $29.99 subscription without affiliate
console.log('Test 4: $29.99 subscription WITHOUT affiliate');
const test4 = calculateRevenueSplit(29.99, false);
console.log('Gross:', test4.gross);
console.log('Affiliate (0%):', test4.affiliateAmount.toFixed(2));
console.log('Charity (10%):', test4.charityAmount.toFixed(2));
console.log('Business (90%):', test4.businessNet.toFixed(2));
console.log('');

console.log('=== All tests completed ===');
