/**
 * Shared mock data store for development environment
 * This provides centralized access to mock data across API endpoints
 */

// Create a global store for storing mock data between requests
let mockStore: Record<string, any> = {};

/**
 * Check if running in development mode
 */
export const isDevelopmentMode = () => process.env.NODE_ENV === 'development';

/**
 * Add a delivery to the mock store
 */
export const addMockDelivery = (delivery: any) => {
  if (!delivery?.trackingId) {
    console.error('Cannot add mock delivery without trackingId');
    return false;
  }
  
  mockStore[delivery.trackingId] = delivery;
  console.log(`Added mock delivery to shared store: ${delivery.trackingId}`);
  return true;
};

/**
 * Get a delivery from the mock store
 */
export const getMockDelivery = (trackingId: string) => {
  return mockStore[trackingId] || null;
};

/**
 * Update a delivery in the mock store
 */
export const updateMockDelivery = (trackingId: string, update: Partial<any>) => {
  const delivery = mockStore[trackingId];
  if (!delivery) return false;
  
  mockStore[trackingId] = { ...delivery, ...update };
  return true;
};

/**
 * Remove a delivery from the mock store
 */
export const removeMockDelivery = (trackingId: string) => {
  if (mockStore[trackingId]) {
    delete mockStore[trackingId];
    return true;
  }
  return false;
};

/**
 * Get all deliveries from the mock store
 */
export const getAllMockDeliveries = () => {
  return Object.values(mockStore);
};

/**
 * Clear all mock data
 */
export const clearMockData = () => {
  mockStore = {};
};

/**
 * Mock delivery store object with Map-like interface for compatibility
 */
export const mockDeliveryStore = {
  set: (key: string, value: any) => {
    mockStore[key] = value;
    return mockDeliveryStore;
  },
  get: (key: string) => mockStore[key] || null,
  delete: (key: string) => {
    const result = removeMockDelivery(key);
    return result;
  },
  has: (key: string) => key in mockStore,
  clear: () => {
    clearMockData();
    return mockDeliveryStore;
  },
  size: () => Object.keys(mockStore).length,
  values: () => Object.values(mockStore),
  entries: () => Object.entries(mockStore).map(([k, v]) => [k, v]),
  keys: () => Object.keys(mockStore),
  getMockDelivery: (trackingId: string) => getMockDelivery(trackingId)
}; 