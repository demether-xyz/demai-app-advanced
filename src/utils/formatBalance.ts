/**
 * Format token balances preserving all meaningful decimal places
 * - Shows all decimal places that exist, removing only trailing zeros
 * - For very large numbers, uses compact notation
 */
export function formatTokenBalance(balance: string): string {
  const num = parseFloat(balance)
  
  // Handle zero or NaN
  if (!num || isNaN(num)) {
    return '0'
  }
  
  // For large numbers, use compact notation
  if (num >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(num)
  }
  
  // For numbers with thousand separators
  if (num >= 1000) {
    // Check if it has decimals
    if (num % 1 === 0) {
      return new Intl.NumberFormat('en-US').format(num)
    }
    // If it has decimals, preserve them
    const str = num.toString()
    const parts = str.split('.')
    const integerPart = new Intl.NumberFormat('en-US').format(parseInt(parts[0]))
    return integerPart + '.' + (parts[1] || '')
  }
  
  // For all other numbers, preserve the original precision
  // Remove only trailing zeros after decimal point
  const str = balance
  
  // If the string contains a decimal point
  if (str.includes('.')) {
    // Remove trailing zeros but keep the number as is
    return str.replace(/\.?0+$/, '') || '0'
  }
  
  // If no decimal point, return as is
  return str
}