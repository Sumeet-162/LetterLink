// Delivery timer utilities for frontend

export interface DeliveryStatus {
  isInTransit: boolean;
  canRead: boolean;
  remainingTime: number;
  formattedTime: string;
  status: 'sent' | 'delivered' | 'read';
  scheduledDelivery?: string;
  deliveredAt?: string;
}

/**
 * Format remaining time for display
 */
export const formatRemainingTime = (milliseconds: number): string => {
  if (milliseconds <= 0) return 'Delivered';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  
  if (days > 0) {
    const hours = totalHours % 24;
    return days === 1 ? `${days} day ${hours}h` : `${days} days ${hours}h`;
  } else if (totalHours > 0) {
    const minutes = totalMinutes % 60;
    return `${totalHours}h ${minutes}m`;
  } else if (totalMinutes > 0) {
    return `${totalMinutes}m`;
  } else {
    return `${totalSeconds}s`;
  }
};

/**
 * Calculate delivery status for a letter
 */
export const getLetterDeliveryStatus = (letter: any): DeliveryStatus => {
  const now = Date.now();
  const scheduledTime = letter.scheduledDelivery ? new Date(letter.scheduledDelivery).getTime() : 0;
  const remainingTime = Math.max(0, scheduledTime - now);
  
  const isInTransit = letter.status === 'sent' || (letter.status === 'delivered' && remainingTime > 0);
  const canRead = letter.status === 'read' || (letter.status === 'delivered' && remainingTime <= 0);
  
  return {
    isInTransit,
    canRead,
    remainingTime,
    formattedTime: formatRemainingTime(remainingTime),
    status: letter.status,
    scheduledDelivery: letter.scheduledDelivery,
    deliveredAt: letter.deliveredAt
  };
};

/**
 * Get delivery emoji based on status
 */
export const getDeliveryEmoji = (status: DeliveryStatus): string => {
  if (status.isInTransit) return '🚚'; // In transit
  if (status.canRead) return '📮'; // Delivered
  return '📝'; // Sent
};

/**
 * Get delivery color based on status
 */
export const getDeliveryColor = (status: DeliveryStatus): string => {
  if (status.isInTransit) return 'text-orange-600'; // In transit
  if (status.canRead) return 'text-green-600'; // Delivered
  return 'text-blue-600'; // Sent
};
