from folium import plugins
from ortools.constraint_solver import routing_enums_pb2, pywrapcp
import folium
import json
import math
import numpy as np
import pandas as pd

df = pd.read_csv("Book1.csv")

source_point = {'Latitude': 22.5, 'Longitude': 88.4, 'Order Item Id': 0,
                'Shipping Date': 'N/A', 'Shipping Mode': 'N/A', 'User ID': 0,
                'Machine Prediction': 'N/A'}
df = pd.concat([pd.DataFrame([source_point]), df], ignore_index=True)

# Remove duplicate coordinates (keep only unique locations)
df_unique = df.drop_duplicates(subset=['Latitude', 'Longitude'])


def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0 # Radius of the Earth in kilometers

    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    # Haversine formula
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c

    return distance


def create_distance_matrix(locations):
    num_locations = len(locations)
    distance_matrix = np.zeros((num_locations, num_locations))

    for i in range(num_locations):
        for j in range(num_locations):
            if i != j:
                lat1, lon1 = locations.iloc[i]['Latitude'], locations.iloc[i]['Longitude']
                lat2, lon2 = locations.iloc[j]['Latitude'], locations.iloc[j]['Longitude']
                distance_matrix[i][j] = haversine_distance(lat1, lon1, lat2, lon2)

    return distance_matrix


distance_matrix = create_distance_matrix(df_unique)
# print(f"Distance Matrix (km): {distance_matrix}")


def solve_tsp(distance_matrix):
    manager = pywrapcp.RoutingIndexManager(len(distance_matrix), 1, 0)

    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int(distance_matrix[from_node][to_node] * 1000)

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
    search_parameters.time_limit.seconds = 30
    search_parameters.log_search = True

    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        route = []
        index = routing.Start(0)
        while not routing.IsEnd(index):
            route.append(manager.IndexToNode(index))
            index = solution.Value(routing.NextVar(index))
        route.append(manager.IndexToNode(index))
        total_distance = solution.ObjectiveValue() / 1000.0
        return route, total_distance
    else:
        return None, None


route, total_distance = solve_tsp(distance_matrix)

if route:
    # print(f"\nOptimal Route: {route}")
    # print(f"Total Distance: {total_distance:.2f} km")

    # Get the coordinates of the optimal route
    optimal_route_coords = df_unique.iloc[route][['Latitude', 'Longitude']]
    # print(f"\nOptimal Route Coordinates: {optimal_route_coords}")

    route_df = df_unique.iloc[route].copy()
    route_df['RouteOrder'] = range(len(route))

    features = []

    for idx, row in route_df.iterrows():
        feature = {
            "type": "Feature",
            "properties": {
                "RouteOrder": int(row['RouteOrder']),
                "OrderItemId": row['Order Item Id'],
                "ShippingMode": row['Shipping Mode'],
                "UserId": row['User ID'],
                "MachinePrediction": row['Machine Prediction']
            },
            "geometry": {
                "type": "Point",
                "coordinates": [float(row['Longitude']), float(row['Latitude'])]
            }
        }
        features.append(feature)

    line_coordinates = []
    for idx, row in route_df.iterrows():
        line_coordinates.append(
            [float(row['Longitude']), float(row['Latitude'])])

    if len(line_coordinates) > 1:
        line_coordinates.append(line_coordinates[0])

    line_feature = {
        "type": "Feature",
        "properties": {
            "RouteType": "OptimalPath",
            "TotalDistance": total_distance
        },
        "geometry": {
            "type": "LineString",
            "coordinates": line_coordinates
        }
    }
    features.append(line_feature)

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    with open('tsp_route.geojson', 'w') as f:
        json.dump(geojson, f)

    print("\nGeoJSON file created: tsp_route.geojson")

    mean_lat = df_unique['Latitude'].mean()
    mean_lon = df_unique['Longitude'].mean()
    m = folium.Map(location=[mean_lat, mean_lon], zoom_start=4)

    for idx, row in route_df.iterrows():
        popup_text = f"""
        <b>Stop {row['RouteOrder']}</b><br>
        Consignment ID: {row['Order Item Id']}<br>
        User ID: {row['User ID']}<br>
        Time Slot: {row['Machine Prediction']}
        """

        if row['Latitude'] == 22.5 and row['Longitude'] == 88.4:
            folium.Marker(
                location=[row['Latitude'], row['Longitude']],
                popup=folium.Popup(popup_text, max_width=300),
                icon=folium.Icon(color='red', icon='home')
            ).add_to(m)
        else:
            folium.Marker(
                location=[row['Latitude'], row['Longitude']],
                popup=folium.Popup(popup_text, max_width=300),
                icon=folium.Icon(color='blue', icon='info-sign'),
                tooltip=f"Stop {row['RouteOrder']}"
            ).add_to(m)

    route_coordinates = []
    for idx, row in route_df.iterrows():
        route_coordinates.append([row['Latitude'], row['Longitude']])

    if len(route_coordinates) > 1:
        route_coordinates.append(route_coordinates[0])

    folium.PolyLine(
        route_coordinates,
        color='blue',
        weight=2.5,
        opacity=0.8,
        tooltip=f"Total Distance: {total_distance:.2f} km"
    ).add_to(m)

    plugins.AntPath(
        locations=route_coordinates,
        dash_array=[10, 20],
        delay=1000,
        color='red',
        pulse_color='black',
        tooltip="Route Path"
    ).add_to(m)

    legend_html = f'''
    <div style="position: fixed; 
                bottom: 50px; left: 50px; width: 220px; height: 90px; 
                border:2px solid grey; z-index:9999; font-size:14px;
                background-color:white;
                padding: 10px;
                border-radius: 5px;
                ">
      <b>TSP Solution</b><br>
      Total Distance: {total_distance:.2f} km<br>
      Points: {len(route_df)}<br>
      <span style="color:red;">&#8226;</span> Home (22.5,88.3)<br>
      <span style="color:blue;">&#8226;</span> Delivery Points
    </div>
    '''
    m.get_root().html.add_child(folium.Element(legend_html))

    m.save('tsp_visualization.html')

    print("Interactive map created: tsp_visualization.html")

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>TSP Route Visualization</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            .container {{ max-width: 800px; margin: 0 auto; }}
            table {{ border-collapse: collapse; width: 100%; margin-top: 20px; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #f2f2f2; }}
            tr:nth-child(even) {{ background-color: #f9f9f9; }}
            .route-info {{ background-color: #e9f7ef; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
            svg {{ max-width: 100%; height: auto; border: 1px solid #ddd; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>TSP Route Visualization</h1>
            
            <div class="route-info">
                <h3>Route Summary</h3>
                <p><strong>Total Distance:</strong> {total_distance:.2f} km</p>
                <p><strong>Number of Points:</strong> {len(route_df)}</p>
                <p><strong>Route Order:</strong> {' → '.join([str(i) for i in route])}</p>
            </div>
            
            <h3>Route Points</h3>
            <table>
                <tr>
                    <th>Stop #</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Order ID</th>
                    <th>User ID</th>
                    <th>Prediction</th>
                </tr>
    """

    for idx, row in route_df.iterrows():
        html_content += f"""
                <tr>
                    <td>{row['RouteOrder']}</td>
                    <td>{row['Latitude']}</td>
                    <td>{row['Longitude']}</td>
                    <td>{row['Order Item Id']}</td>
                    <td>{row['User ID']}</td>
                    <td>{row['Machine Prediction']}</td>
                </tr>
        """

    svg_width = 600
    svg_height = 400
    padding = 50

    min_lat = min(route_df['Latitude'])
    max_lat = max(route_df['Latitude'])
    min_lon = min(route_df['Longitude'])
    max_lon = max(route_df['Longitude'])

    def scale_coord(lat, lon):
        if max_lat == min_lat:
            y = svg_height / 2
        else:
            y = padding + (svg_height - 2 * padding) * \
                (1 - (lat - min_lat) / (max_lat - min_lat))

        if max_lon == min_lon:
            x = svg_width / 2
        else:
            x = padding + (svg_width - 2 * padding) * \
                ((lon - min_lon) / (max_lon - min_lon))

        return x, y

    svg_content = f'<svg width="{svg_width}" height="{svg_height}" xmlns="http://www.w3.org/2000/svg">'

    svg_content += '<path d="M'
    for i, row in route_df.iterrows():
        x, y = scale_coord(row['Latitude'], row['Longitude'])
        if i == 0:
            svg_content += f"{x},{y}"
        else:
            svg_content += f" L{x},{y}"

    if len(route_df) > 1:
        x, y = scale_coord(
            route_df.iloc[0]['Latitude'], route_df.iloc[0]['Longitude'])
        svg_content += f" L{x},{y}"

    svg_content += '" stroke="blue" stroke-width="2" fill="none" />'

    for i, row in route_df.iterrows():
        x, y = scale_coord(row['Latitude'], row['Longitude'])
        color = "red" if i == 0 else "blue"
        svg_content += f'<circle cx="{x}" cy="{y}" r="5" fill="{color}" />'
        svg_content += f'<text x="{x + 10}" y="{y}" font-size="12">{row["RouteOrder"]}</text>'

    svg_content += '</svg>'

    html_content += f"""
            </table>
            
            <h3>Simple Route Visualization</h3>
            {svg_content}
            
            <div>
                <h3>Route Distance Matrix</h3>
                <pre>{distance_matrix}</pre>
            </div>
        </div>
    </body>
    </html>
    """
    try:
        with open('tsp_simple_visualization.html', 'w') as f:
            f.write(html_content)

        print("Simple HTML visualization created: tsp_simple_visualization.html")

        html_content = html_content.replace('GEOJSON_PLACEHOLDER', json.dumps(geojson))

        with open('tsp_visualization.html', 'w') as f:
            f.write(html_content)

        print("HTML file created: tsp_visualization.html")
    except UnicodeEncodeError:
        pass
else:
    print("No solution found for the TSP.")
