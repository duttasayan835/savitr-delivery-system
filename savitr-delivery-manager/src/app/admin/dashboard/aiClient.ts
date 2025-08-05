export async function getPredictedSlot(orderData: any): Promise<string | null> {
  console.log("Calling AI API for slot prediction with data:", {
    ...orderData,
    latitude: orderData.latitude !== undefined ? Number(orderData.latitude) : undefined,
    longitude: orderData.longitude !== undefined ? Number(orderData.longitude) : undefined
  });
  
  try {
    // Simply log the data and return a default value
    // This completely bypasses making any fetch calls
    console.log("Using default predicted slot for development");
    
    // Based on time of day, we can return different slots for testing
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return "10:00 AM - 12:00 PM";
    } else if (hour < 15) {
      return "12:00 PM - 03:00 PM";
    } else {
      return "03:00 PM - 05:00 PM";
    }
    
    /* 
    // Keeping this code here for reference, but it won't execute
    
    // Create a simplified order object with just the required fields
    const simplifiedOrder = {
      'Days for shipping (real)': orderData.daysForShipping || 4,
      'Days for shipment (scheduled)': orderData.scheduledDays || 3,
      'Delivery Status': orderData.status || 'Advance shipping',
      'Customer Segment': orderData.customerType || 'Consumer',
      'Latitude': orderData.latitude || 22.123456,
      'Longitude': orderData.longitude || -78.654321,
      'Order City': orderData.city || 'Mumbai',
      'order date (DateOrders)': orderData.orderDate || '4/15/2023 10:23',
      'Order Item Id': orderData.id || 80001,
      'Order Item Quantity': orderData.quantity || 2,
      'Order State': orderData.state || 'Maharashtra',
      'shipping date (DateOrders)': orderData.shippingDate || '4/19/2023 10:23',
      'Shipping Mode': orderData.shippingMode || 'Standard Class',
      'User ID': orderData.userId || 45,
      'Admin Recomended Slots/Previous Optimized Delivered Slots': '10:00 AM - 12:00 PM',
      'Parcel Delivered in This Slot': '12:00 PM - 03:00 PM'
    };
    
    // Convert to query parameters
    const params = new URLSearchParams();
    Object.entries(simplifiedOrder).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    
    console.log("Making request to:", `http://localhost:5000/api/slot?${params.toString()}`);
    
    // Make the API call
    const response = await fetch(`http://localhost:5000/api/slot?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("API response:", data);
    
    const predictedSlot = data.prediction?.predicted_optimal_slot || null;
    console.log("Predicted slot:", predictedSlot);
    
    return predictedSlot;
    */
  } catch (error) {
    console.error('Error in getPredictedSlot:', error);
    return "12:00 PM - 03:00 PM"; // Default fallback
  }
}

export interface DeliveryPoint {
  trackingId: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  product?: string;
  deliveryTime?: string;
}

export interface OptimizedRoute {
  total_distance: number;
  total_points: number;
  route: number[];
  ordered_deliveries: (DeliveryPoint & { route_order: number })[];
}

export interface RouteSourcePoint {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
}

export async function getOptimizedRoute(
  deliveries: DeliveryPoint[],
  source: RouteSourcePoint
): Promise<OptimizedRoute | null> {
  console.log(`Optimizing route for ${deliveries.length} deliveries`);
  
  try {
    // Attempt to call the real API
    try {
      console.log("Calling Flask TSP API...");
      
      // Print first few coordinates to verify format
      if (deliveries.length > 0) {
        console.log("Sample delivery coordinates:", {
          lat: deliveries[0].lat,
          lng: deliveries[0].lng,
          type: `lat: ${typeof deliveries[0].lat}, lng: ${typeof deliveries[0].lng}`
        });
      }
      
      const payload = {
        deliveries: deliveries.map(d => ({
          trackingId: d.trackingId,
          name: d.name,
          lat: d.lat,
          lng: d.lng,
          address: d.address,
          product: d.product,
          deliveryTime: d.deliveryTime
        })),
        source_point: source
      };
      
      console.log("API Endpoint:", 'http://localhost:5000/api/route');
      console.log("Payload sample:", JSON.stringify(payload).substring(0, 200) + "...");
      
      // Use fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch('http://localhost:5000/api/route', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          signal: controller.signal,
          body: JSON.stringify(payload)
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const result = await response.json();
          console.log("API route optimization result:", result);
          return result as OptimizedRoute;
        } else {
          console.warn(`API returned ${response.status}: ${response.statusText}`);
          throw new Error(`API call failed with status ${response.status}`);
        }
      } catch (fetchError) {
        // Handle timeout or network errors
        if (fetchError.name === 'AbortError') {
          console.error("API request timed out after 10 seconds");
          throw new Error("API request timed out");
        }
        
        console.error("Fetch error:", fetchError);
        throw fetchError;
      }
    } catch (apiError) {
      console.error("API call failed, using fallback algorithm:", apiError);
      
      // Fallback: simple nearest neighbor heuristic
      console.log("Using fallback route optimization algorithm");
      
      // Calculate distances between all points
      const allPoints = [source, ...deliveries];
      const distances: number[][] = [];
      
      for (let i = 0; i < allPoints.length; i++) {
        distances[i] = [];
        for (let j = 0; j < allPoints.length; j++) {
          if (i === j) {
            distances[i][j] = 0;
          } else {
            // Simplified distance calculation (Euclidean)
            const p1 = allPoints[i];
            const p2 = allPoints[j];
            const dx = (p1.lat - p2.lat) * 111; // ~111km per degree latitude
            const dy = (p1.lng - p2.lng) * 111 * Math.cos(p1.lat * Math.PI / 180);
            distances[i][j] = Math.sqrt(dx*dx + dy*dy);
          }
        }
      }
      
      // Nearest neighbor algorithm
      const route = [0]; // Start at depot (index 0)
      let currentPoint = 0;
      let totalDistance = 0;
      
      // Visit each delivery point
      while (route.length < allPoints.length) {
        let bestDistance = Infinity;
        let bestNext = -1;
        
        // Find nearest unvisited point
        for (let i = 1; i < allPoints.length; i++) {
          if (!route.includes(i) && distances[currentPoint][i] < bestDistance) {
            bestDistance = distances[currentPoint][i];
            bestNext = i;
          }
        }
        
        if (bestNext !== -1) {
          route.push(bestNext);
          totalDistance += bestDistance;
          currentPoint = bestNext;
        } else {
          break;
        }
      }
      
      // Return to depot
      if (route.length > 1) {
        totalDistance += distances[currentPoint][0];
      }
      
      route.push(0); // Complete the loop back to depot
      
      const orderedDeliveries = route
        .slice(1, -1) // Remove depot from both ends
        .map((pointIndex, i) => {
          const delivery = deliveries[pointIndex - 1]; // -1 because deliveries doesn't include depot
          return {
            ...delivery,
            route_order: i + 1 // Start ordering from 1
          };
        });
      
      return {
        total_distance: parseFloat(totalDistance.toFixed(2)),
        total_points: route.length,
        route: route,
        ordered_deliveries: orderedDeliveries
      };
    }
  } catch (error) {
    console.error('Error in getOptimizedRoute:', error);
    return null;
  }
} 