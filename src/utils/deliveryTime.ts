// Utility functions for calculating letter delivery times based on geographical distance

interface CountryCoordinates {
  [key: string]: {
    lat: number;
    lng: number;
    name: string;
  };
}

// Major countries with their approximate coordinates (capital cities)
const COUNTRY_COORDINATES: CountryCoordinates = {
  'United States': { lat: 39.8283, lng: -98.5795, name: 'United States' },
  'Canada': { lat: 56.1304, lng: -106.3468, name: 'Canada' },
  'United Kingdom': { lat: 55.3781, lng: -3.4360, name: 'United Kingdom' },
  'Germany': { lat: 51.1657, lng: 10.4515, name: 'Germany' },
  'France': { lat: 46.6034, lng: 1.8883, name: 'France' },
  'Spain': { lat: 40.4637, lng: -3.7492, name: 'Spain' },
  'Italy': { lat: 41.8719, lng: 12.5674, name: 'Italy' },
  'Netherlands': { lat: 52.1326, lng: 5.2913, name: 'Netherlands' },
  'Sweden': { lat: 60.1282, lng: 18.6435, name: 'Sweden' },
  'Norway': { lat: 60.4720, lng: 8.4689, name: 'Norway' },
  'Denmark': { lat: 56.2639, lng: 9.5018, name: 'Denmark' },
  'Finland': { lat: 61.9241, lng: 25.7482, name: 'Finland' },
  'Poland': { lat: 51.9194, lng: 19.1451, name: 'Poland' },
  'Russia': { lat: 61.5240, lng: 105.3188, name: 'Russia' },
  'Ukraine': { lat: 48.3794, lng: 31.1656, name: 'Ukraine' },
  'Turkey': { lat: 38.9637, lng: 35.2433, name: 'Turkey' },
  'Greece': { lat: 39.0742, lng: 21.8243, name: 'Greece' },
  'Romania': { lat: 45.9432, lng: 24.9668, name: 'Romania' },
  'Hungary': { lat: 47.1625, lng: 19.5033, name: 'Hungary' },
  'Czech Republic': { lat: 49.8175, lng: 15.4730, name: 'Czech Republic' },
  'Austria': { lat: 47.5162, lng: 14.5501, name: 'Austria' },
  'Switzerland': { lat: 46.8182, lng: 8.2275, name: 'Switzerland' },
  'Belgium': { lat: 50.5039, lng: 4.4699, name: 'Belgium' },
  'Portugal': { lat: 39.3999, lng: -8.2245, name: 'Portugal' },
  'Ireland': { lat: 53.4129, lng: -8.2439, name: 'Ireland' },
  'Croatia': { lat: 45.1000, lng: 15.2000, name: 'Croatia' },
  'Serbia': { lat: 44.0165, lng: 21.0059, name: 'Serbia' },
  'Bulgaria': { lat: 42.7339, lng: 25.4858, name: 'Bulgaria' },
  'Lithuania': { lat: 55.1694, lng: 23.8813, name: 'Lithuania' },
  'Latvia': { lat: 56.8796, lng: 24.6032, name: 'Latvia' },
  'Estonia': { lat: 58.5953, lng: 25.0136, name: 'Estonia' },
  'Slovenia': { lat: 46.1512, lng: 14.9955, name: 'Slovenia' },
  'Slovakia': { lat: 48.6690, lng: 19.6990, name: 'Slovakia' },
  'Japan': { lat: 36.2048, lng: 138.2529, name: 'Japan' },
  'South Korea': { lat: 35.9078, lng: 127.7669, name: 'South Korea' },
  'China': { lat: 35.8617, lng: 104.1954, name: 'China' },
  'India': { lat: 20.5937, lng: 78.9629, name: 'India' },
  'Australia': { lat: -25.2744, lng: 133.7751, name: 'Australia' },
  'New Zealand': { lat: -40.9006, lng: 174.8860, name: 'New Zealand' },
  'Singapore': { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
  'Malaysia': { lat: 4.2105, lng: 101.9758, name: 'Malaysia' },
  'Thailand': { lat: 15.8700, lng: 100.9925, name: 'Thailand' },
  'Vietnam': { lat: 14.0583, lng: 108.2772, name: 'Vietnam' },
  'Philippines': { lat: 12.8797, lng: 121.7740, name: 'Philippines' },
  'Indonesia': { lat: -0.7893, lng: 113.9213, name: 'Indonesia' },
  'Brazil': { lat: -14.2350, lng: -51.9253, name: 'Brazil' },
  'Argentina': { lat: -38.4161, lng: -63.6167, name: 'Argentina' },
  'Chile': { lat: -35.6751, lng: -71.5430, name: 'Chile' },
  'Mexico': { lat: 23.6345, lng: -102.5528, name: 'Mexico' },
  'Colombia': { lat: 4.5709, lng: -74.2973, name: 'Colombia' },
  'Peru': { lat: -9.1900, lng: -75.0152, name: 'Peru' },
  'Venezuela': { lat: 6.4238, lng: -66.5897, name: 'Venezuela' },
  'Uruguay': { lat: -32.5228, lng: -55.7658, name: 'Uruguay' },
  'Paraguay': { lat: -23.4425, lng: -58.4438, name: 'Paraguay' },
  'Bolivia': { lat: -16.2902, lng: -63.5887, name: 'Bolivia' },
  'Ecuador': { lat: -1.8312, lng: -78.1834, name: 'Ecuador' },
  'South Africa': { lat: -30.5595, lng: 22.9375, name: 'South Africa' },
  'Egypt': { lat: 26.0975, lng: 29.9097, name: 'Egypt' },
  'Nigeria': { lat: 9.0820, lng: 8.6753, name: 'Nigeria' },
  'Kenya': { lat: -0.0236, lng: 37.9062, name: 'Kenya' },
  'Morocco': { lat: 31.7917, lng: -7.0926, name: 'Morocco' },
  'Tunisia': { lat: 33.8869, lng: 9.5375, name: 'Tunisia' },
  'Algeria': { lat: 28.0339, lng: 1.6596, name: 'Algeria' },
  'Ghana': { lat: 7.9465, lng: -1.0232, name: 'Ghana' },
  'Ethiopia': { lat: 9.1450, lng: 40.4897, name: 'Ethiopia' },
  'Tanzania': { lat: -6.3690, lng: 34.8888, name: 'Tanzania' },
  'Uganda': { lat: 1.3733, lng: 32.2903, name: 'Uganda' },
  'Zimbabwe': { lat: -19.0154, lng: 29.1549, name: 'Zimbabwe' },
  'Botswana': { lat: -22.3285, lng: 24.6849, name: 'Botswana' },
  'Namibia': { lat: -22.9576, lng: 18.4904, name: 'Namibia' },
  'Zambia': { lat: -13.1339, lng: 27.8493, name: 'Zambia' },
  'Default': { lat: 0, lng: 0, name: 'Unknown' }
};

/**
 * Calculate the great circle distance between two points on Earth
 * Using the Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get coordinates for a country
 */
function getCountryCoordinates(country: string): { lat: number; lng: number } {
  const normalizedCountry = country.trim();
  return COUNTRY_COORDINATES[normalizedCountry] || COUNTRY_COORDINATES['Default'];
}

/**
 * Calculate delivery time based on distance
 * Letter delivery simulation:
 * - Same country: 1-3 days
 * - Same continent: 3-7 days  
 * - Different continents: 7-14 days
 * - Very remote locations: 14-21 days
 */
export function calculateDeliveryTime(senderCountry: string, receiverCountry: string): {
  deliveryTimeMinutes: number;
  deliveryTimeDays: number;
  estimatedDeliveryText: string;
  deliveryDate: Date;
} {
  // Same country - quick delivery
  if (senderCountry === receiverCountry) {
    const daysRange = Math.floor(Math.random() * 3) + 1; // 1-3 days
    const deliveryTimeMinutes = daysRange * 24 * 60; // Convert to minutes
    const deliveryDate = new Date(Date.now() + deliveryTimeMinutes * 60 * 1000);
    
    return {
      deliveryTimeMinutes,
      deliveryTimeDays: daysRange,
      estimatedDeliveryText: `${daysRange} day${daysRange > 1 ? 's' : ''} (Domestic delivery)`,
      deliveryDate
    };
  }

  // Calculate actual distance between countries
  const senderCoords = getCountryCoordinates(senderCountry);
  const receiverCoords = getCountryCoordinates(receiverCountry);
  
  const distance = calculateDistance(
    senderCoords.lat, 
    senderCoords.lng, 
    receiverCoords.lat, 
    receiverCoords.lng
  );

  let deliveryTimeDays: number;
  let deliveryType: string;

  if (distance < 1000) {
    // Close countries (neighboring) - 2-4 days
    deliveryTimeDays = Math.floor(Math.random() * 3) + 2;
    deliveryType = "Regional delivery";
  } else if (distance < 3000) {
    // Regional delivery - 3-6 days
    deliveryTimeDays = Math.floor(Math.random() * 4) + 3;
    deliveryType = "Continental delivery";
  } else if (distance < 8000) {
    // Continental delivery - 5-10 days
    deliveryTimeDays = Math.floor(Math.random() * 6) + 5;
    deliveryType = "Intercontinental delivery";
  } else if (distance < 15000) {
    // Long distance - 8-14 days
    deliveryTimeDays = Math.floor(Math.random() * 7) + 8;
    deliveryType = "Long-distance delivery";
  } else {
    // Very remote - 12-21 days
    deliveryTimeDays = Math.floor(Math.random() * 10) + 12;
    deliveryType = "Remote delivery";
  }

  const deliveryTimeMinutes = deliveryTimeDays * 24 * 60;
  const deliveryDate = new Date(Date.now() + deliveryTimeMinutes * 60 * 1000);

  return {
    deliveryTimeMinutes,
    deliveryTimeDays,
    estimatedDeliveryText: `${deliveryTimeDays} day${deliveryTimeDays > 1 ? 's' : ''} (${deliveryType})`,
    deliveryDate
  };
}

/**
 * For development/testing - accelerated delivery times (minutes instead of days)
 */
export function calculateTestDeliveryTime(senderCountry: string, receiverCountry: string): {
  deliveryTimeMinutes: number;
  deliveryTimeDays: number;
  estimatedDeliveryText: string;
  deliveryDate: Date;
} {
  const realDelivery = calculateDeliveryTime(senderCountry, receiverCountry);
  
  // Convert days to minutes for testing (1 day = 1 minute)
  const testDeliveryMinutes = realDelivery.deliveryTimeDays;
  const deliveryDate = new Date(Date.now() + testDeliveryMinutes * 60 * 1000);
  
  return {
    deliveryTimeMinutes: testDeliveryMinutes,
    deliveryTimeDays: realDelivery.deliveryTimeDays,
    estimatedDeliveryText: `${testDeliveryMinutes} minute${testDeliveryMinutes > 1 ? 's' : ''} (Test mode: ${realDelivery.estimatedDeliveryText})`,
    deliveryDate
  };
}

/**
 * Format remaining time for display
 */
export function formatRemainingTime(deliveryDate: Date): string {
  const now = new Date();
  const remaining = deliveryDate.getTime() - now.getTime();
  
  if (remaining <= 0) {
    return "Delivered";
  }
  
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Check if a letter should be delivered (time has passed)
 */
export function shouldDeliverLetter(deliveryDate: Date): boolean {
  return new Date() >= deliveryDate;
}
