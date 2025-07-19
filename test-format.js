// Test the formatTokenBalance function
function formatTokenBalance(balance) {
  const num = parseFloat(balance)
  
  // Handle zero or NaN
  if (!num || isNaN(num)) {
    return '0'
  }
  
  // For very small numbers, show more precision
  if (num > 0 && num < 0.000001) {
    // Convert to string with up to 18 decimals and remove trailing zeros
    const formatted = num.toFixed(18)
    // Remove trailing zeros after decimal point, but keep at least one decimal place
    return formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '.0')
  }
  
  // For small numbers, show up to 6 decimals
  if (num < 1) {
    const formatted = num.toFixed(6)
    // Remove trailing zeros but keep at least 2 decimal places for clarity
    const trimmed = formatted.replace(/(\.\d*?[1-9])0+$/, '$1')
    // If all decimals were zeros, show at least .00
    return trimmed === num.toFixed(0) ? num.toFixed(2) : trimmed
  }
  
  // For numbers 1-10, show up to 4 decimals but at least 2
  if (num < 10) {
    const formatted = num.toFixed(4)
    const trimmed = formatted.replace(/(\.\d*?[1-9])0+$/, '$1')
    // Ensure at least 2 decimal places for consistency
    const parts = trimmed.split('.')
    if (!parts[1] || parts[1].length < 2) {
      return num.toFixed(2)
    }
    return trimmed
  }
  
  // For numbers 10-1000, show exactly 2 decimals
  if (num < 1000) {
    return num.toFixed(2)
  }
  
  // For large numbers, use compact notation
  if (num >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }
  
  // For numbers 1000+, use thousand separators with 2 decimals
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

// Test cases
const testCases = [
  "0",
  "0.0000001",
  "0.000001",
  "0.123456789",
  "1",
  "1.0",
  "1.123456",
  "10",
  "10.5",
  "100.99",
  "1000",
  "1000000",
  "1234567.89"
];

console.log("Testing formatTokenBalance:");
testCases.forEach(test => {
  console.log(`${test} => ${formatTokenBalance(test)}`);
});