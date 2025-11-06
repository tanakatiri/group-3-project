/**
 * Rental Calculation Service
 * Handles all rental cost calculations with discounts, fees, and taxes
 * Supports multiple currencies for Zimbabwe market
 */

const TAX_RATE = 0.15; // 15% VAT
const SERVICE_FEE_RATE = 0.05; // 5% service fee

// Exchange rates (base: USD)
const EXCHANGE_RATES = {
  USD: 1,           // US Dollar (base currency)
  ZWL: 25,          // Zimbabwean Dollar
  ZAR: 18,          // South African Rand
  GBP: 0.79,        // British Pound
  EUR: 0.92         // Euro
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  ZWL: 'ZWL',
  ZAR: 'R',
  GBP: '£',
  EUR: '€'
};

/**
 * Convert amount to different currency
 * @param {Number} amount - Amount in USD
 * @param {String} toCurrency - Target currency code
 * @returns {Number} Converted amount
 */
export function convertCurrency(amount, toCurrency = 'USD') {
  const rate = EXCHANGE_RATES[toCurrency] || 1;
  return amount * rate;
}

/**
 * Format currency amount
 * @param {Number} amount - Amount to format
 * @param {String} currency - Currency code
 * @returns {String} Formatted amount
 */
export function formatCurrency(amount, currency = 'USD') {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  if (currency === 'ZWL') {
    return `${symbol} ${formatted}`;
  }
  return `${symbol}${formatted}`;
}

/**
 * Calculate rental cost for a property
 * @param {Object} property - Property object with pricing details
 * @param {Date} checkInDate - Check-in date
 * @param {Date} checkOutDate - Check-out date
 * @param {String} currency - Currency code (USD, ZWL, ZAR, etc.)
 * @returns {Object} Complete cost breakdown
 */
export function calculateRentalCost(property, checkInDate, checkOutDate, currency = 'USD') {
  // Validate dates
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  if (checkOut <= checkIn) {
    throw new Error('Check-out date must be after check-in date');
  }
  
  // Calculate duration in days
  const durationMs = checkOut - checkIn;
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  
  // Get pricing details
  const pricing = property.pricing || {};
  const rentPeriod = property.rentPeriod || 'month';
  
  // Calculate daily rate based on rent period
  let dailyRate;
  if (rentPeriod === 'day') {
    dailyRate = property.price; // Price is already per day
  } else {
    // Price is per month, divide by 30 to get daily rate
    dailyRate = pricing.dailyRate || property.price / 30;
  }
  
  const weeklyDiscount = pricing.weeklyDiscount || 10;
  const monthlyDiscount = pricing.monthlyDiscount || 20;
  const cleaningFee = pricing.cleaningFee || 50;
  const securityDeposit = pricing.securityDeposit || property.price;
  const minimumStay = pricing.minimumStay || 1;
  const maximumStay = pricing.maximumStay || 365;
  
  // Validate duration
  if (durationDays < minimumStay) {
    throw new Error(`Minimum stay is ${minimumStay} day(s)`);
  }
  
  if (durationDays > maximumStay) {
    throw new Error(`Maximum stay is ${maximumStay} day(s)`);
  }
  
  // Calculate base rent
  let baseRent = dailyRate * durationDays;
  let discountApplied = 0;
  let discountType = 'none';
  
  // Apply discounts based on duration
  if (durationDays >= 30) {
    // Monthly discount (30+ days)
    discountApplied = (monthlyDiscount / 100) * baseRent;
    discountType = 'monthly';
  } else if (durationDays >= 7) {
    // Weekly discount (7-29 days)
    discountApplied = (weeklyDiscount / 100) * baseRent;
    discountType = 'weekly';
  }
  
  const rentAfterDiscount = baseRent - discountApplied;
  
  // Calculate fees
  const serviceFee = rentAfterDiscount * SERVICE_FEE_RATE;
  const subtotal = rentAfterDiscount + cleaningFee + serviceFee;
  
  // Calculate tax
  const tax = subtotal * TAX_RATE;
  
  // Calculate total
  const total = subtotal + tax;
  const totalWithDeposit = total + securityDeposit;
  
  // Convert to selected currency if not USD
  const conversionRate = EXCHANGE_RATES[currency] || 1;
  const convertAmount = (amount) => amount * conversionRate;
  
  // Build breakdown
  return {
    currency: currency,
    currencySymbol: CURRENCY_SYMBOLS[currency] || '$',
    exchangeRate: conversionRate,
    duration: {
      days: durationDays,
      weeks: Math.floor(durationDays / 7),
      months: Math.floor(durationDays / 30),
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString()
    },
    pricing: {
      dailyRate: convertAmount(dailyRate),
      baseRent: convertAmount(baseRent),
      discount: {
        type: discountType,
        percentage: discountType === 'monthly' ? monthlyDiscount : discountType === 'weekly' ? weeklyDiscount : 0,
        amount: convertAmount(discountApplied)
      },
      rentAfterDiscount: convertAmount(rentAfterDiscount),
      cleaningFee: convertAmount(cleaningFee),
      serviceFee: convertAmount(serviceFee),
      subtotal: convertAmount(subtotal),
      tax: {
        rate: TAX_RATE * 100,
        amount: convertAmount(tax)
      },
      total: convertAmount(total),
      securityDeposit: convertAmount(securityDeposit),
      totalWithDeposit: convertAmount(totalWithDeposit)
    },
    breakdown: [
      {
        label: 'Base Rent',
        description: `${durationDays} days × ${formatCurrency(dailyRate, currency)}/day`,
        amount: convertAmount(baseRent)
      },
      ...(discountApplied > 0 ? [{
        label: `${discountType.charAt(0).toUpperCase() + discountType.slice(1)} Discount`,
        description: `${discountType === 'monthly' ? monthlyDiscount : weeklyDiscount}% off`,
        amount: -convertAmount(discountApplied)
      }] : []),
      {
        label: 'Cleaning Fee',
        description: 'One-time fee',
        amount: convertAmount(cleaningFee)
      },
      {
        label: 'Service Fee',
        description: `${SERVICE_FEE_RATE * 100}% platform fee`,
        amount: convertAmount(serviceFee)
      },
      {
        label: 'Tax (VAT)',
        description: `${TAX_RATE * 100}% tax`,
        amount: convertAmount(tax)
      },
      {
        label: 'Total Rent',
        description: 'Amount due at booking',
        amount: convertAmount(total),
        isTotal: true
      },
      {
        label: 'Security Deposit',
        description: 'Refundable (held in escrow)',
        amount: convertAmount(securityDeposit),
        isDeposit: true
      },
      {
        label: 'Total Amount',
        description: 'Rent + Deposit',
        amount: convertAmount(totalWithDeposit),
        isFinalTotal: true
      }
    ],
    summary: {
      durationDays,
      dailyRate: convertAmount(dailyRate),
      totalRent: convertAmount(total),
      securityDeposit: convertAmount(securityDeposit),
      grandTotal: convertAmount(totalWithDeposit),
      discountSaved: convertAmount(discountApplied)
    }
  };
}

/**
 * Calculate monthly equivalent rate
 * @param {Number} dailyRate - Daily rate
 * @param {Number} monthlyDiscount - Monthly discount percentage
 * @returns {Number} Monthly rate with discount
 */
export function calculateMonthlyRate(dailyRate, monthlyDiscount = 20) {
  const baseMonthly = dailyRate * 30;
  const discount = (monthlyDiscount / 100) * baseMonthly;
  return baseMonthly - discount;
}

/**
 * Calculate weekly equivalent rate
 * @param {Number} dailyRate - Daily rate
 * @param {Number} weeklyDiscount - Weekly discount percentage
 * @returns {Number} Weekly rate with discount
 */
export function calculateWeeklyRate(dailyRate, weeklyDiscount = 10) {
  const baseWeekly = dailyRate * 7;
  const discount = (weeklyDiscount / 100) * baseWeekly;
  return baseWeekly - discount;
}

/**
 * Validate rental dates
 * @param {Date} checkIn - Check-in date
 * @param {Date} checkOut - Check-out date
 * @param {Number} minimumStay - Minimum stay in days
 * @param {Number} maximumStay - Maximum stay in days
 * @returns {Object} Validation result
 */
export function validateRentalDates(checkIn, checkOut, minimumStay = 1, maximumStay = 365) {
  const errors = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  // Check if dates are valid
  if (isNaN(checkInDate.getTime())) {
    errors.push('Invalid check-in date');
  }
  
  if (isNaN(checkOutDate.getTime())) {
    errors.push('Invalid check-out date');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  // Check if check-in is in the past
  if (checkInDate < now) {
    errors.push('Check-in date cannot be in the past');
  }
  
  // Check if check-out is after check-in
  if (checkOutDate <= checkInDate) {
    errors.push('Check-out date must be after check-in date');
  }
  
  // Calculate duration
  const durationMs = checkOutDate - checkInDate;
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  
  // Check minimum stay
  if (durationDays < minimumStay) {
    errors.push(`Minimum stay is ${minimumStay} day(s)`);
  }
  
  // Check maximum stay
  if (durationDays > maximumStay) {
    errors.push(`Maximum stay is ${maximumStay} day(s)`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    durationDays
  };
}

export default {
  calculateRentalCost,
  calculateMonthlyRate,
  calculateWeeklyRate,
  validateRentalDates
};
