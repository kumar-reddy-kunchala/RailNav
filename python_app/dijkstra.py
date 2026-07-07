import math

def find_shortest_path(nodes, edges, start_node_id, end_node_id):
    start_node = next((n for n in nodes if n['id'] == start_node_id), None)
    end_node = next((n for n in nodes if n['id'] == end_node_id), None)
    
    if not start_node or not end_node:
        return None
        
    if start_node_id == end_node_id:
        return {
            "path": [start_node],
            "totalDistance": 0,
            "estimatedTimeMins": 0,
            "stepsCount": 0,
            "steps": [{
                "instruction": f"You are already at {start_node['name']}",
                "distance": 0,
                "fromNode": start_node_id,
                "toNode": end_node_id
            }]
        }

    # Create adjacency list
    adjacency_list = {node['id']: [] for node in nodes}
    
    for edge in edges:
        from_node_obj = next((n for n in nodes if n['id'] == edge['fromNode']), None)
        to_node_obj = next((n for n in nodes if n['id'] == edge['toNode']), None)
        
        if from_node_obj and to_node_obj:
            adjacency_list[edge['fromNode']].append({"node": to_node_obj, "distance": edge['distance']})
            adjacency_list[edge['toNode']].append({"node": from_node_obj, "distance": edge['distance']})

    # Dijkstra tracking
    distances = {node['id']: float('inf') for node in nodes}
    previous = {node['id']: None for node in nodes}
    unvisited = set(node['id'] for node in nodes)
    
    distances[start_node_id] = 0
    
    while unvisited:
        # Find vertex with minimum distance
        current_node_id = None
        min_distance = float('inf')
        
        for node_id in unvisited:
            if distances[node_id] < min_distance:
                min_distance = distances[node_id]
                current_node_id = node_id
                
        if current_node_id is None or current_node_id == end_node_id:
            break
            
        unvisited.remove(current_node_id)
        
        neighbors = adjacency_list.get(current_node_id, [])
        for neighbor in neighbors:
            neighbor_node = neighbor["node"]
            if neighbor_node['id'] not in unvisited:
                continue
                
            alt = distances[current_node_id] + neighbor["distance"]
            if alt < distances[neighbor_node['id']]:
                distances[neighbor_node['id']] = alt
                previous[neighbor_node['id']] = current_node_id

    if distances[end_node_id] == float('inf'):
        return None

    # Reconstruct path
    path_node_ids = []
    curr = end_node_id
    while curr is not None:
        path_node_ids.insert(0, curr)
        curr = previous[curr]

    path_nodes = [next(n for n in nodes if n['id'] == i) for i in path_node_ids]
    
    # Generate steps
    steps = []
    steps.append({
        "instruction": f"Start at {start_node['name']}",
        "distance": 0,
        "fromNode": start_node_id,
        "toNode": start_node_id
    })

    for i in range(len(path_nodes) - 1):
        from_node = path_nodes[i]
        to_node = path_nodes[i + 1]
        
        # Find edge distance
        edge = next((e for e in edges if 
                     (e['fromNode'] == from_node['id'] and e['toNode'] == to_node['id']) or
                     (e['fromNode'] == to_node['id'] and e['toNode'] == from_node['id'])), None)
        distance = edge['distance'] if edge else 10
        
        turn_instruction = ''
        if i == 0:
            turn_instruction = f"Go straight towards {to_node['name']}"
        else:
            prev_node = path_nodes[i - 1]
            
            # Vectors
            v1 = {"x": from_node["x"] - prev_node["x"], "y": from_node["y"] - prev_node["y"]}
            v2 = {"x": to_node["x"] - from_node["x"], "y": to_node["y"] - from_node["y"]}
            
            # Normalize
            len1 = math.sqrt(v1["x"]**2 + v1["y"]**2) or 1
            len2 = math.sqrt(v2["x"]**2 + v2["y"]**2) or 1
            
            v1_norm = {"x": v1["x"] / len1, "y": v1["y"] / len1}
            v2_norm = {"x": v2["x"] / len2, "y": v2["y"] / len2}
            
            cross_product = v1_norm["x"] * v2_norm["y"] - v1_norm["y"] * v2_norm["x"]
            dot_product = v1_norm["x"] * v2_norm["x"] + v1_norm["y"] * v2_norm["y"]
            
            if dot_product > 0.9:
                turn_instruction = f"Go straight towards {to_node['name']}"
            elif cross_product > 0.1:
                turn_instruction = f"Turn right towards {to_node['name']}"
            elif cross_product < -0.1:
                turn_instruction = f"Turn left towards {to_node['name']}"
            else:
                turn_instruction = f"Proceed towards {to_node['name']}"

        steps.append({
            "instruction": turn_instruction,
            "distance": distance,
            "fromNode": from_node['id'],
            "toNode": to_node['id']
        })

    final_dest = path_nodes[-1]
    steps.append({
        "instruction": f"{final_dest['name']} is on your right",
        "distance": 0,
        "fromNode": final_dest['id'],
        "toNode": final_dest['id']
    })

    total_distance = distances[end_node_id]
    estimated_time = max(1, round(total_distance / 80))

    return {
        "path": path_nodes,
        "totalDistance": total_distance,
        "estimatedTimeMins": estimated_time,
        "stepsCount": len(steps),
        "steps": steps
    }
