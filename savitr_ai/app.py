from flask import Flask, jsonify, request
import pandas as pd
import pickle
import os
from flask_cors import CORS
import logging
import numpy as np
import math
import json
from ortools.constraint_solver import routing_enums_pb2, pywrapcp

app = Flask(__name__)
# Enable CORS for all routes with proper configuration
CORS(app, 
     resources={r"/*": {
         "origins": "*", 
         "methods": ["GET", "POST", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin"]
     }})
app.config.from_object("config.Config")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route("/")
def hello():
    logger.info("Root endpoint called")
    return "Savitr AI API is running", 200

# Add CORS preflight response for the route endpoint
@app.route("/api/route", methods=["OPTIONS"])
def route_options():
    response = jsonify({"status": "ok"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin")
    return response, 200

@app.route("/api/slot")
def slot():
    logger.info(f"Received slot prediction request: {request.args}")
    
    def load_delivery_prediction_model(model_path='saved_models/logistic_regression_pipeline.pkl', encoders_path='saved_models/encoders.pkl'):
        with open(model_path, 'rb') as file:
            model = pickle.load(file)
        with open(encoders_path, 'rb') as file:
            encoders = pickle.load(file)
        return model, encoders

    def predict_delivery_slot(data, model, y_encoder):
        if isinstance(data, dict):
            data = pd.DataFrame([data])
        pred_encoded = model.predict(data)
        pred_decoded = y_encoder.inverse_transform(pred_encoded.reshape(-1, 1))
        return pred_decoded[0][0]

    def preprocess_new_order(order_data):
        order_data = order_data.copy()
        order_data['order_date'] = pd.to_datetime(order_data['order date (DateOrders)'], errors='coerce')
        order_data['shipping_date'] = pd.to_datetime(order_data['shipping date (DateOrders)'], errors='coerce')
        order_data['order_day_of_week'] = order_data['order_date'].dayofweek
        order_data['order_month'] = order_data['order_date'].month
        order_data['order_day'] = order_data['order_date'].day
        order_data['order_hour'] = order_data['order_date'].hour
        order_data['shipping_day_of_week'] = order_data['shipping_date'].dayofweek
        order_data['shipping_month'] = order_data['shipping_date'].month
        order_data['shipping_day'] = order_data['shipping_date'].day        
        order_data['distance_proxy'] = abs(order_data['Latitude']) + abs(order_data['Longitude'])
        order_data['shipping_delay'] = order_data['Days for shipping (real)'] - order_data['Days for shipment (scheduled)']
        order_data['user_id_encoded'] = order_data['User ID']
        return order_data

    model, encoders = load_delivery_prediction_model()
    y_encoder = encoders['y_encoder']
    
    if request.args:
        logger.info("Using request parameters")
        try:
            new_order = dict(request.args)
            logger.info(f"Request parameters converted to dict: {new_order}")
        except Exception as e:
            logger.error(f"Error processing request parameters: {e}")
            new_order = get_default_order()
    else:
        logger.info("Using default order data")
        new_order = get_default_order()
    
    try:
        preprocessed_order = preprocess_new_order(new_order)
        predicted_slot = predict_delivery_slot(preprocessed_order, model, y_encoder)
        logger.info(f"Predicted slot: {predicted_slot}")
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
        predicted_slot = "10:00 AM - 12:00 PM"  # Default prediction if something fails
    
    single_order_result = {
        "customer": new_order.get('Customer Segment', 'Consumer'),
        "Latitude": new_order.get('Latitude', 0),
        "Longitude": new_order.get('Longitude', 0),
        "location": f"{new_order.get('Order City', 'Unknown')}, {new_order.get('Order State', 'Unknown')}",
        "predicted_optimal_slot": predicted_slot
    }
    
    response = {
        "prediction": single_order_result,
    }
    
    logger.info(f"Sending response: {response}")
    return jsonify(response), 200


@app.route("/api/route", methods=["POST"])
def optimize_route():
    logger.info("Received route optimization request")
    
    try:
        # Get delivery points from request
        data = request.json
        logger.info(f"Request data type: {type(data)}")
        
        if not data:
            logger.error("No JSON data received in request")
            return jsonify({
                'error': 'No data received',
                'message': 'Request body must contain JSON data'
            }), 400
            
        deliveries = data.get('deliveries', [])
        source_point = data.get('source_point', {'lat': 22.5, 'lng': 88.4})
        
        logger.info(f"Processing {len(deliveries)} delivery points")
        logger.info(f"Source point: {source_point}")
        
        # Validate data
        if not deliveries:
            logger.warning("No deliveries provided in request")
            return jsonify({
                'error': 'No deliveries provided',
                'message': 'At least one delivery point is required'
            }), 400
            
        # Create a list of all locations (source + deliveries)
        locations = [source_point] + deliveries
        
        # Create distance matrix
        distance_matrix = create_distance_matrix(locations)
        
        # Solve TSP
        route, total_distance = solve_tsp(distance_matrix)
        
        if not route:
            return jsonify({
                'error': 'Failed to find optimal route',
                'message': 'The route optimizer could not find a solution'
            }), 400
            
        # Create response
        response = {
            'total_distance': round(total_distance, 2),
            'total_points': len(route),
            'route': route,
            'ordered_deliveries': [
                # Skip the first point (depot) in the returned deliveries
                {**locations[point_idx], 'route_order': i}
                for i, point_idx in enumerate(route[1:], 1)  # Start indexing from 1
            ]
        }
        
        logger.info(f"Route optimization successful: {len(route)} points, {total_distance:.2f} km")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in route optimization: {str(e)}")
        return jsonify({
            'error': 'Route optimization failed',
            'message': str(e)
        }), 500


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points on earth."""
    R = 6371.0  # Earth radius in kilometers
    
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance


def create_distance_matrix(locations):
    """Create a matrix of distances between all locations."""
    num_locations = len(locations)
    distance_matrix = np.zeros((num_locations, num_locations))
    
    for i in range(num_locations):
        for j in range(num_locations):
            if i != j:
                # Extract coordinates - handle both lat/lng and latitude/longitude formats
                lat1 = locations[i].get('lat', locations[i].get('latitude', 0))
                lon1 = locations[i].get('lng', locations[i].get('longitude', 0))
                lat2 = locations[j].get('lat', locations[j].get('latitude', 0))
                lon2 = locations[j].get('lng', locations[j].get('longitude', 0))
                
                # Calculate distance
                distance_matrix[i][j] = haversine_distance(lat1, lon1, lat2, lon2)
    
    return distance_matrix


def solve_tsp(distance_matrix):
    """Solve the Traveling Salesman Problem using OR-Tools."""
    num_locations = len(distance_matrix)
    
    # Create routing model
    manager = pywrapcp.RoutingIndexManager(num_locations, 1, 0)
    routing = pywrapcp.RoutingModel(manager)
    
    # Define distance callback
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int(distance_matrix[from_node][to_node] * 1000)  # Convert to meters for integer precision
    
    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    
    # Set search parameters
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
    search_parameters.time_limit.seconds = 30
    
    # Solve the problem
    solution = routing.SolveWithParameters(search_parameters)
    
    if not solution:
        return None, None
    
    # Extract the route
    route = []
    index = routing.Start(0)
    while not routing.IsEnd(index):
        route.append(manager.IndexToNode(index))
        index = solution.Value(routing.NextVar(index))
    route.append(manager.IndexToNode(index))  # Add the depot at the end to complete the loop
    
    # Calculate total distance
    total_distance = solution.ObjectiveValue() / 1000.0  # Convert back to kilometers
    
    return route, total_distance


def get_default_order():
    return {
        'Days for shipping (real)': 4, 
        'Days for shipment (scheduled)': 3,
        'Delivery Status': 'Advance shipping',
        'Customer Segment': 'Consumer',
        'Latitude': 22.123456,
        'Longitude': -78.654321,
        'Order City': 'Mumbai',
        'order date (DateOrders)': '4/15/2016 10:23',
        'Order Item Id': 80001,
        'Order Item Quantity': 2,
        'Order State': 'Maharashtra',
        'shipping date (DateOrders)': '4/19/2016 10:23',
        'Shipping Mode': 'Standard Class',
        'User ID': 45,
        'Admin Recomended Slots/Previous Optimized Delivered Slots': '10:00 AM - 12:00 PM',
        'Parcel Delivered in This Slot': '12:00 PM - 03:00 PM'
    }

if __name__ == "__main__":
    # Explicitly bind to all network interfaces (0.0.0.0) and use port 5000
    print("Starting Savitr AI API server on http://0.0.0.0:5000")
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)