// Utility functions for calculating letter delivery times based on geographical distance

const COUNTRY_COORDINATES = {
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
  'Japan': { lat: 36.2048, lng: 138.2529, name: 'Japan' },
  'South Korea': { lat: 35.9078, lng: 127.7669, name: 'South Korea' },
  'China': { lat: 35.8617, lng: 104.1954, name: 'China' },
  'India': { lat: 20.5937, lng: 78.9629, name: 'India' },
  'Australia': { lat: -25.2744, lng: 133.7751, name: 'Australia' },
  'New Zealand': { lat: -40.9006, lng: 174.8860, name: 'New Zealand' },
  'Singapore': { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
  'Malaysia': { lat: 4.2105, lng: 101.9758, name: 'Malaysia' },
  'Thailand': { lat: 15.8700, lng: 100.9925, name: 'Thailand' },
  'Brazil': { lat: -14.2350, lng: -51.9253, name: 'Brazil' },
  'Argentina': { lat: -38.4161, lng: -63.6167, name: 'Argentina' },
  'Chile': { lat: -35.6751, lng: -71.5430, name: 'Chile' },
  'Mexico': { lat: 23.6345, lng: -102.5528, name: 'Mexico' },
  'South Africa': { lat: -30.5595, lng: 22.9375, name: 'South Africa' },
  'Egypt': { lat: 26.0975, lng: 29.9097, name: 'Egypt' },
  'Nigeria': { lat: 9.0820, lng: 8.6753, name: 'Nigeria' },
  'Default': { lat: 0, lng: 0, name: 'Unknown' }
};

/**
 * Calculate the great circle distance between two points on Earth
 * Using the Haversine formula
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
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

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Get coordinates for a country
 */
function getCountryCoordinates(country) {
  const normalizedCountry = country.trim();
  return COUNTRY_COORDINATES[normalizedCountry] || COUNTRY_COORDINATES['Default'];
}

/**
 * Calculate delivery time based on distance
 */
export function calculateDeliveryTime(senderCountry, receiverCountry) {
  // Same country - local delivery (10 minutes)
  if (senderCountry === receiverCountry) {
    const deliveryTimeMinutes = 10;
    const deliveryDate = new Date(Date.now() + deliveryTimeMinutes * 60 * 1000);
    
    return {
      deliveryTimeMinutes,
      deliveryTimeDays: 0,
      estimatedDeliveryText: `10 minutes (Local delivery)`,
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

  let deliveryTimeMinutes;
  let deliveryType;

  if (distance < 100) {
    // Local delivery - within 100km
    deliveryTimeMinutes = 10;
    deliveryType = "Local delivery";
  } else if (distance < 1500) {
    // Regional delivery - cross-country (1-6 hours)
    deliveryTimeMinutes = Math.floor(Math.random() * 300) + 60; // 1-6 hours
    deliveryType = "Regional delivery";
  } else {
    // International delivery - global (12-24 hours)
    deliveryTimeMinutes = Math.floor(Math.random() * 720) + 720; // 12-24 hours
    deliveryType = "International delivery";
  }

  const deliveryDate = new Date(Date.now() + deliveryTimeMinutes * 60 * 1000);

  return {
    deliveryTimeMinutes,
    deliveryTimeDays: 0,
    estimatedDeliveryText: `${formatDeliveryTime(deliveryTimeMinutes)} (${deliveryType})`,
    deliveryDate
  };
}

/**
 * Format delivery time in a human-readable way
 */
function formatDeliveryTime(minutes) {
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  }
}

/**
 * For development/testing - same realistic delivery times
 */
export function calculateTestDeliveryTime(senderCountry, receiverCountry) {
  // Use the same realistic delivery times for testing
  return calculateDeliveryTime(senderCountry, receiverCountry);
}

/**
 * Format remaining time for display
 */
export function formatRemainingTime(deliveryDate) {
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
export function shouldDeliverLetter(deliveryDate) {
  return new Date() >= deliveryDate;
}
