import os
import json
from models import db, User, Station, Facility, MapNode, MapEdge, TrainStatus, PlatformCrowd, Trip, Feedback

def init_db(app):
    db_path = os.path.join(os.path.dirname(__file__), 'railway.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    with app.app_context():
        # Check if we need to create and seed
        db.create_all()
        
        # Check if tables are empty and seed them
        if Station.query.first() is None:
            seed_database()

def seed_database():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    db_json_path = os.path.join(root_dir, 'db.json')
    
    data = None
    if os.path.exists(db_json_path):
        try:
            with open(db_json_path, 'r') as f:
                data = json.load(f)
        except Exception as e:
            print(f"Error reading root db.json: {e}")
            
    if not data:
        print("db.json not found, seeding default minimal database.")
        data = {
            "stations": [
                {"id": "central", "name": "Central Station", "code": "CEN", "distance": "0.4 km away", "facilitiesCount": 24, "activeRoutesCount": 8, "crowdStatus": "Medium", "zone": "other"}
            ],
            "nodes": [
                {"id": "node_entrance", "stationId": "central", "name": "Main Entrance", "x": 73, "y": 69, "floor": 0},
                {"id": "node_restroom", "stationId": "central", "name": "Restroom", "x": 78, "y": 56, "floor": 0},
                {"id": "node_platform4", "stationId": "central", "name": "Platform 4", "x": 70, "y": 25, "floor": 1}
            ],
            "edges": [
                {"id": "e1", "stationId": "central", "fromNode": "node_entrance", "toNode": "node_restroom", "distance": 30},
                {"id": "e2", "stationId": "central", "fromNode": "node_restroom", "toNode": "node_platform4", "distance": 60}
            ],
            "facilities": [
                {"id": "fac_restroom", "stationId": "central", "name": "Restroom", "type": "restroom", "status": "2 Available", "icon": "Restroom", "nodeId": "node_restroom"}
            ],
            "users": [],
            "feedback": [],
            "trips": [],
            "trains": [
                {"id": "t1", "trainNo": "12863", "name": "Superfast Express", "arrivalTime": "10:36 AM", "platform": "2", "status": "On Time", "statusText": "On Time"}
            ],
            "crowd": [
                {"platformNo": "Platform 1", "density": "Low", "percentage": 22}
            ]
        }

    # Seed Users
    for u in data.get('users', []):
        if not User.query.get(u['id']):
            user = User(
                id=u['id'],
                email=u['email'].lower(),
                name=u['name'],
                role=u.get('role', 'passenger'),
                passwordHash=u['passwordHash'],
                salt=u['salt'],
                accessibilityMode=u.get('accessibilityMode', False),
                createdAt=u.get('createdAt')
            )
            db.session.add(user)
            
    # Seed Stations
    for s in data.get('stations', []):
        if not Station.query.get(s['id']):
            station = Station(
                id=s['id'],
                name=s['name'],
                code=s['code'],
                distance=s['distance'],
                facilitiesCount=s.get('facilitiesCount', 0),
                activeRoutesCount=s.get('activeRoutesCount', 0),
                crowdStatus=s.get('crowdStatus', 'Medium'),
                zone=s.get('zone', 'other')
            )
            db.session.add(station)

    # Seed Facilities
    for f in data.get('facilities', []):
        if not Facility.query.get(f['id']):
            fac = Facility(
                id=f['id'],
                stationId=f['stationId'],
                name=f['name'],
                type=f['type'],
                status=f.get('status', 'Available'),
                icon=f.get('icon'),
                nodeId=f['nodeId']
            )
            db.session.add(fac)

    # Seed Map Nodes
    for n in data.get('nodes', []):
        if not MapNode.query.get(n['id']):
            node = MapNode(
                id=n['id'],
                stationId=n['stationId'],
                name=n['name'],
                x=n['x'],
                y=n['y'],
                floor=n.get('floor', 0)
            )
            db.session.add(node)

    # Seed Map Edges
    for e in data.get('edges', []):
        if not MapEdge.query.get(e['id']):
            edge = MapEdge(
                id=e['id'],
                stationId=e['stationId'],
                fromNode=e['fromNode'],
                toNode=e['toNode'],
                distance=e['distance']
            )
            db.session.add(edge)

    # Seed Train Status
    for t in data.get('trains', []):
        t_id = t.get('id', 't_' + t['trainNo'])
        if not TrainStatus.query.get(t_id):
            train = TrainStatus(
                id=t_id,
                stationId=t.get('stationId', 'central'),
                trainNo=t['trainNo'],
                name=t['name'],
                arrivalTime=t['arrivalTime'],
                platform=t['platform'],
                status=t['status'],
                statusText=t.get('statusText')
            )
            db.session.add(train)

    # Seed Platform Crowd
    for idx, c in enumerate(data.get('crowd', [])):
        crowd = PlatformCrowd(
            stationId=c.get('stationId', 'central'),
            platformNo=c['platformNo'],
            density=c['density'],
            percentage=c['percentage']
        )
        db.session.add(crowd)

    # Seed Trips
    for tr in data.get('trips', []):
        if not Trip.query.get(tr['id']):
            trip = Trip(
                id=tr['id'],
                userId=tr['userId'],
                stationId=tr['stationId'],
                fromNode=tr['fromNode'],
                toNode=tr['toNode'],
                timestamp=tr['timestamp'],
                distance=tr.get('distance', 0),
                duration=tr.get('duration', 0)
            )
            db.session.add(trip)

    # Seed Feedback
    for fb in data.get('feedback', []):
        if not Feedback.query.get(fb['id']):
            feedback = Feedback(
                id=fb['id'],
                userId=fb['userId'],
                userName=fb['userName'],
                rating=fb['rating'],
                comments=fb['comments'],
                category=fb.get('category', 'General'),
                timestamp=fb['timestamp']
            )
            db.session.add(feedback)

    db.session.commit()
    print("Database seeded successfully with initial data from db.json.")
