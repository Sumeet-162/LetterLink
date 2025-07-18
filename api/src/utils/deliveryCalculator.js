// Delivery delay calculator based on countries and user preferences

const DELIVERY_DELAYS = {
  // Same country: 1-3 hours
  'same_country': { min: 1, max: 3 },
  
  // Same continent delays (hours)
  'north_america': { min: 6, max: 12 },
  'europe': { min: 4, max: 8 },
  'asia': { min: 8, max: 16 },
  'africa': { min: 12, max: 24 },
  'south_america': { min: 10, max: 20 },
  'oceania': { min: 14, max: 28 },
  
  // Cross-continental delays (hours)
  'cross_continental': { min: 24, max: 72 },
  'intercontinental_far': { min: 48, max: 120 }, // 2-5 days
};

const COUNTRY_CONTINENTS = {
  // North America
  'United States': 'north_america',
  'Canada': 'north_america',
  'Mexico': 'north_america',
  
  // Europe
  'United Kingdom': 'europe',
  'France': 'europe',
  'Germany': 'europe',
  'Italy': 'europe',
  'Spain': 'europe',
  'Netherlands': 'europe',
  'Sweden': 'europe',
  'Norway': 'europe',
  'Denmark': 'europe',
  'Finland': 'europe',
  'Poland': 'europe',
  'Russia': 'europe', // Western Russia
  
  // Asia
  'Japan': 'asia',
  'China': 'asia',
  'South Korea': 'asia',
  'India': 'asia',
  'Thailand': 'asia',
  'Singapore': 'asia',
  'Malaysia': 'asia',
  'Indonesia': 'asia',
  'Philippines': 'asia',
  'Vietnam': 'asia',
  
  // Africa
  'South Africa': 'africa',
  'Nigeria': 'africa',
  'Kenya': 'africa',
  'Egypt': 'africa',
  'Morocco': 'africa',
  
  // South America
  'Brazil': 'south_america',
  'Argentina': 'south_america',
  'Chile': 'south_america',
  'Colombia': 'south_america',
  'Peru': 'south_america',
  
  // Oceania
  'Australia': 'oceania',
  'New Zealand': 'oceania',
  'Fiji': 'oceania',
};

/**
 * Calculate delivery delay based on sender and recipient countries
 * @param {string} senderCountry - Sender's country
 * @param {string} recipientCountry - Recipient's country  
 * @param {number} userPreferenceHours - User's preferred delivery delay (optional)
 * @returns {number} Delivery delay in hours
 */
export const calculateDeliveryDelay = (senderCountry, recipientCountry, userPreferenceHours = null) => {
  // If user has a specific preference, use it (but with some randomness)
  if (userPreferenceHours && userPreferenceHours > 0) {
    const variance = userPreferenceHours * 0.2; // 20% variance
    const min = userPreferenceHours - variance;
    const max = userPreferenceHours + variance;
    return Math.round(min + (Math.random() * (max - min)));
  }
  
  // Same country
  if (senderCountry === recipientCountry) {
    const delays = DELIVERY_DELAYS.same_country;
    return Math.round(delays.min + (Math.random() * (delays.max - delays.min)));
  }
  
  const senderContinent = COUNTRY_CONTINENTS[senderCountry];
  const recipientContinent = COUNTRY_CONTINENTS[recipientCountry];
  
  // Same continent
  if (senderContinent && senderContinent === recipientContinent) {
    const delays = DELIVERY_DELAYS[senderContinent] || DELIVERY_DELAYS.cross_continental;
    return Math.round(delays.min + (Math.random() * (delays.max - delays.min)));
  }
  
  // Cross-continental
  const delays = DELIVERY_DELAYS.cross_continental;
  return Math.round(delays.min + (Math.random() * (delays.max - delays.min)));
};

/**
 * Format remaining time for display
 * @param {number} milliseconds - Remaining time in milliseconds
 * @returns {string} Formatted time string
 */
export const formatRemainingTime = (milliseconds) => {
  if (milliseconds <= 0) return 'Delivered';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  
  if (days > 0) {
    const hours = totalHours % 24;
    return `${days}d ${hours}h`;
  } else if (totalHours > 0) {
    const minutes = totalMinutes % 60;
    return `${totalHours}h ${minutes}m`;
  } else {
    return `${totalMinutes}m`;
  }
};

export default {
  calculateDeliveryDelay,
  formatRemainingTime
};
