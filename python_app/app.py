import os
import json
import random
import uuid
import hmac
import hashlib
import base64
import time
import threading
from datetime import datetime
from functools import wraps
from flask import Flask, jsonify, request, g, send_from_directory
from werkzeug.utils import secure_filename

# Import SQLAlchemy & Models
from models import db, User, Station, Facility, MapNode, MapEdge, TrainStatus, PlatformCrowd, Trip, Feedback
from database import init_db
from dijkstra import find_shortest_path

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "railway_station_planner_secret_key_123!@#")

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB limit
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize SQLite database and seed initial data
init_db(app)

# ==================== PURE PYTHON JWT IMPLEMENTATION ====================
JWT_SECRET = "railway-navigation-secret-key-2026-wayfinding"

def base64url_encode(data):
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def base64url_decode(data):
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def sign_token(payload):
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64url_encode(json.dumps(header).encode('utf-8'))
    
    payload_copy = dict(payload)
    payload_copy['exp'] = int(time.time()) + 24 * 60 * 60  # 24 hours expiry
    payload_b64 = base64url_encode(json.dumps(payload_copy).encode('utf-8'))
    
    msg = f"{header_b64}.{payload_b64}".encode('utf-8')
    sig = hmac.new(JWT_SECRET.encode('utf-8'), msg, hashlib.sha256).digest()
    sig_b64 = base64url_encode(sig)
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_token(token):
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        msg = f"{header_b64}.{payload_b64}".encode('utf-8')
        sig = hmac.new(JWT_SECRET.encode('utf-8'), msg, hashlib.sha256).digest()
        expected_sig_b64 = base64url_encode(sig)
        if sig_b64 != expected_sig_b64:
            return None
        payload = json.loads(base64url_decode(payload_b64).decode('utf-8'))
        if payload.get('exp', 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None

# ==================== PASSWORD HASHING UTILS ====================
def generate_salt():
    return os.urandom(16).hex()

def hash_password(password, salt):
    pw_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 1000, dklen=64)
    return pw_hash.hex()

# ==================== AUTHENTICATION MIDDLEWARE ====================
def authenticate_jwt(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            decoded = verify_token(token)
            if decoded:
                g.user = decoded
                return f(*args, **kwargs)
        return jsonify({"error": "Unauthorized. Please login again."}), 401
    return decorated_function

# ==================== AUTH API ENDPOINTS ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    role = data.get('role', 'passenger')
    accessibility_mode = bool(data.get('accessibilityMode', False))

    if not email or not password or not name:
        return jsonify({"error": "Please provide email, password and name."}), 400

    existing_user = User.query.filter(db.func.lower(User.email) == email.lower()).first()
    if existing_user:
        return jsonify({"error": "Email already registered."}), 400

    salt = generate_salt()
    pw_hash = hash_password(password, salt)

    new_user = User(
        id='user_' + str(uuid.uuid4().hex)[:7],
        email=email.lower(),
        name=name,
        role='admin' if role == 'admin' else 'passenger',
        passwordHash=pw_hash,
        salt=salt,
        accessibilityMode=accessibility_mode,
        createdAt=datetime.utcnow().isoformat() + "Z"
    )

    db.session.add(new_user)
    db.session.commit()

    token = sign_token({
        "id": new_user.id,
        "email": new_user.email,
        "name": new_user.name,
        "role": new_user.role
    })

    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "name": new_user.name,
            "role": new_user.role,
            "accessibilityMode": new_user.accessibilityMode
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Please provide email and password."}), 400

    user = User.query.filter(db.func.lower(User.email) == email.lower()).first()
    
    # Auto-provision standard demo accounts if logging in with demo credentials
    if not user:
        if email.lower() in ['admin@railway.gov', 'admin@railnav.gov', 'admin@demo.com']:
            salt = generate_salt()
            user = User(
                id='admin_demo_1',
                email=email.lower(),
                name='Railway System Admin',
                role='admin',
                passwordHash=hash_password(password, salt),
                salt=salt,
                accessibilityMode=False,
                createdAt=datetime.utcnow().isoformat() + "Z"
            )
            db.session.add(user)
            db.session.commit()
        elif email.lower() in ['passenger@railway.gov', 'passenger@demo.com', 'user@railway.gov', 'passenger@gmail.com']:
            salt = generate_salt()
            user = User(
                id='passenger_demo_1',
                email=email.lower(),
                name='Rahul Passenger',
                role='passenger',
                passwordHash=hash_password(password, salt),
                salt=salt,
                accessibilityMode=False,
                createdAt=datetime.utcnow().isoformat() + "Z"
            )
            db.session.add(user)
            db.session.commit()
        else:
            return jsonify({"error": "Invalid email or password."}), 400

    hashed_input = hash_password(password, user.salt)
    if hashed_input != user.passwordHash:
        # If it is a recognized demo account, allow password update to match
        if email.lower() in ['admin@railway.gov', 'admin@railnav.gov', 'admin@demo.com', 'passenger@railway.gov', 'passenger@demo.com', 'user@railway.gov', 'passenger@gmail.com']:
            user.salt = generate_salt()
            user.passwordHash = hash_password(password, user.salt)
            db.session.commit()
        else:
            return jsonify({"error": "Invalid email or password."}), 400

    token = sign_token({
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role
    })

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "accessibilityMode": user.accessibilityMode
        }
    })

@app.route('/api/auth/me', methods=['GET'])
@authenticate_jwt
def get_me():
    user = User.query.get(g.user['id'])
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "accessibilityMode": user.accessibilityMode
    })

@app.route('/api/auth/accessibility', methods=['PUT'])
@authenticate_jwt
def update_accessibility():
    data = request.get_json() or {}
    accessibility_mode = bool(data.get('accessibilityMode', False))

    user = User.query.get(g.user['id'])
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.accessibilityMode = accessibility_mode
    db.session.commit()

    return jsonify({
        "message": "Accessibility mode updated",
        "accessibilityMode": user.accessibilityMode
    })

# ==================== STATIONS & FACILITIES API ====================

@app.route('/api/stations', methods=['GET'])
def get_stations():
    stations = Station.query.all()
    return jsonify([s.to_dict() for s in stations])

@app.route('/api/stations', methods=['POST'])
@authenticate_jwt
def create_station():
    if g.user.get('role') != 'admin':
        return jsonify({"error": "Admin permissions required"}), 403

    data = request.get_json() or {}
    name = data.get('name')
    code = data.get('code')
    distance = data.get('distance')
    crowd_status = data.get('crowdStatus', 'Medium')
    zone = data.get('zone', 'other')
    map_url = data.get('mapUrl')

    if not name or not code:
        return jsonify({"error": "Station name and code are required"}), 400

    station_id = name.lower().replace(" ", "_")
    station_id = "".join(c for c in station_id if c.isalnum() or c == "_")

    existing_station = Station.query.get(station_id)
    if existing_station:
        return jsonify({"error": "A station with this name/ID already exists."}), 400

    # Create default interactive map dataset (nodes, edges, facilities)
    default_nodes = [
        {"id": f"node_entrance_{station_id}", "name": "Main Entrance Gate", "x": 73.0, "y": 69.0, "floor": 0},
        {"id": f"node_restroom_{station_id}", "name": "Premium Restrooms", "x": 78.0, "y": 56.0, "floor": 0},
        {"id": f"node_food_{station_id}", "name": "Food Court Plaza", "x": 78.0, "y": 45.0, "floor": 0},
        {"id": f"node_coffee_{station_id}", "name": "Brewed Coffee Express", "x": 78.0, "y": 32.0, "floor": 0},
        {"id": f"node_waiting_{station_id}", "name": "Passenger Waiting Hall", "x": 67.0, "y": 47.0, "floor": 0},
        {"id": f"node_atm_{station_id}", "name": "ATM Terminal Booth", "x": 55.0, "y": 65.0, "floor": 0},
        {"id": f"node_elevator_{station_id}", "name": "Accessible Elevator & Ramp", "x": 55.0, "y": 40.0, "floor": 0},
        {"id": f"node_platform_info_{station_id}", "name": "Passenger Information Center", "x": 55.0, "y": 53.0, "floor": 0},
        {"id": f"node_platform_junction_{station_id}", "name": "Walkway to Platforms", "x": 70.0, "y": 29.0, "floor": 1},
        {"id": f"node_platform1_{station_id}", "name": "Platform 1 (Standard)", "x": 25.0, "y": 25.0, "floor": 1},
        {"id": f"node_platform2_{station_id}", "name": "Platform 2 (Premium)", "x": 45.0, "y": 25.0, "floor": 1},
        {"id": f"node_platform3_{station_id}", "name": "Platform 3 (Express)", "x": 65.0, "y": 25.0, "floor": 1},
        {"id": f"node_platform4_{station_id}", "name": "Platform 4 (Superfast)", "x": 70.0, "y": 25.0, "floor": 1}
    ]

    default_edges = [
        {"id": f"e1_{station_id}", "fromNode": f"node_entrance_{station_id}", "toNode": f"node_restroom_{station_id}", "distance": 30},
        {"id": f"e2_{station_id}", "fromNode": f"node_restroom_{station_id}", "toNode": f"node_food_{station_id}", "distance": 25},
        {"id": f"e3_{station_id}", "fromNode": f"node_food_{station_id}", "toNode": f"node_coffee_{station_id}", "distance": 20},
        {"id": f"e4_{station_id}", "fromNode": f"node_entrance_{station_id}", "toNode": f"node_atm_{station_id}", "distance": 50},
        {"id": f"e5_{station_id}", "fromNode": f"node_atm_{station_id}", "toNode": f"node_platform_info_{station_id}", "distance": 40},
        {"id": f"e6_{station_id}", "fromNode": f"node_platform_info_{station_id}", "toNode": f"node_elevator_{station_id}", "distance": 35},
        {"id": f"e7_{station_id}", "fromNode": f"node_elevator_{station_id}", "toNode": f"node_waiting_{station_id}", "distance": 45},
        {"id": f"e8_{station_id}", "fromNode": f"node_waiting_{station_id}", "toNode": f"node_platform_junction_{station_id}", "distance": 60},
        {"id": f"e9_{station_id}", "fromNode": f"node_coffee_{station_id}", "toNode": f"node_platform_junction_{station_id}", "distance": 25},
        {"id": f"e10_{station_id}", "fromNode": f"node_platform_junction_{station_id}", "toNode": f"node_platform4_{station_id}", "distance": 10},
        {"id": f"e11_{station_id}", "fromNode": f"node_platform_junction_{station_id}", "toNode": f"node_platform3_{station_id}", "distance": 20},
        {"id": f"e12_{station_id}", "fromNode": f"node_platform_junction_{station_id}", "toNode": f"node_platform2_{station_id}", "distance": 80},
        {"id": f"e13_{station_id}", "fromNode": f"node_platform_junction_{station_id}", "toNode": f"node_platform1_{station_id}", "distance": 120},
        {"id": f"e14_{station_id}", "fromNode": f"node_restroom_{station_id}", "toNode": f"node_waiting_{station_id}", "distance": 40},
        {"id": f"e15_{station_id}", "fromNode": f"node_entrance_{station_id}", "toNode": f"node_platform_info_{station_id}", "distance": 60}
    ]

    default_facilities = [
        {"id": f"fac_restroom_{station_id}", "name": "Restroom Block A", "type": "restroom", "status": "2 Available", "icon": "Restroom", "nodeId": f"node_restroom_{station_id}"},
        {"id": f"fac_food_{station_id}", "name": "Main Food Court", "type": "food_court", "status": "Open", "icon": "FoodCourt", "nodeId": f"node_food_{station_id}"},
        {"id": f"fac_coffee_{station_id}", "name": "Chai & Coffee point", "type": "coffee_shop", "status": "Open", "icon": "CoffeeStore", "nodeId": f"node_coffee_{station_id}"},
        {"id": f"fac_atm_{station_id}", "name": "SBI / HDFC ATM Counter", "type": "atm", "status": "Available", "icon": "ATM", "nodeId": f"node_atm_{station_id}"},
        {"id": f"fac_waiting_{station_id}", "name": "Air-Conditioned Waiting Lounge", "type": "waiting_area", "status": "Available", "icon": "WaitingArea", "nodeId": f"node_waiting_{station_id}"},
        {"id": f"fac_wheelchair_{station_id}", "name": "Wheelchair Elevator & Ramp Access", "type": "accessibility", "status": "Available", "icon": "WheelchairAccessible", "nodeId": f"node_elevator_{station_id}"}
    ]

    new_station = Station(
        id=station_id,
        name=name,
        code=code.upper(),
        distance=distance or f"{(random.random() * 4 + 0.5):.1f} km away",
        facilitiesCount=len(default_facilities),
        activeRoutesCount=6,
        crowdStatus=crowd_status,
        zone=zone,
        mapUrl=map_url
    )
    db.session.add(new_station)

    # Add Nodes
    for n in default_nodes:
        node = MapNode(
            id=n['id'],
            stationId=station_id,
            name=n['name'],
            x=n['x'],
            y=n['y'],
            floor=n['floor']
        )
        db.session.add(node)

    # Add Edges
    for e in default_edges:
        edge = MapEdge(
            id=e['id'],
            stationId=station_id,
            fromNode=e['fromNode'],
            toNode=e['toNode'],
            distance=e['distance']
        )
        db.session.add(edge)

    # Add Facilities
    for f in default_facilities:
        fac = Facility(
            id=f['id'],
            stationId=station_id,
            name=f['name'],
            type=f['type'],
            status=f['status'],
            icon=f['icon'],
            nodeId=f['nodeId']
        )
        db.session.add(fac)

    # Add sample trains and platform crowd for new station to populate dashboard properly
    train_no_1 = str(random.randint(10000, 99999))
    train_no_2 = str(random.randint(10000, 99999))
    db.session.add(TrainStatus(
        id=f"t_{train_no_1}", stationId=station_id, trainNo=train_no_1, name="Express Link",
        arrivalTime="10 mins", platform="1", status="On Time", statusText="On Time"
    ))
    db.session.add(TrainStatus(
        id=f"t_{train_no_2}", stationId=station_id, trainNo=train_no_2, name="Superfast",
        arrivalTime="18 mins", platform="2", status="On Time", statusText="On Time"
    ))

    db.session.add(PlatformCrowd(stationId=station_id, platformNo="Platform 1", density="Low", percentage=24))
    db.session.add(PlatformCrowd(stationId=station_id, platformNo="Platform 2", density="Medium", percentage=55))

    db.session.commit()
    return jsonify(new_station.to_dict()), 201

@app.route('/api/facilities/<station_id>', methods=['GET'])
def get_station_facilities(station_id):
    facs = Facility.query.filter_by(stationId=station_id).all()
    return jsonify([f.to_dict() for f in facs])

@app.route('/api/facilities', methods=['POST'])
@authenticate_jwt
def create_facility():
    if g.user.get('role') != 'admin':
        return jsonify({"error": "Admin permissions required"}), 403

    data = request.get_json() or {}
    station_id = data.get('stationId')
    name = data.get('name')
    type_ = data.get('type')
    status = data.get('status', 'Available')
    icon = data.get('icon', 'HelpCircle')
    node_id = data.get('nodeId')

    if not station_id or not name or not type_ or not node_id:
        return jsonify({"error": "Missing required facility details"}), 400

    new_facility = Facility(
        id='fac_' + str(uuid.uuid4().hex)[:7],
        stationId=station_id,
        name=name,
        type=type_,
        status=status,
        icon=icon,
        nodeId=node_id
    )
    db.session.add(new_facility)

    station = Station.query.get(station_id)
    if station:
        station.facilitiesCount += 1

    db.session.commit()
    return jsonify(new_facility.to_dict()), 201

@app.route('/api/facilities/<id>', methods=['PUT'])
@authenticate_jwt
def update_facility_status(id):
    if g.user.get('role') != 'admin':
        return jsonify({"error": "Admin permissions required"}), 403

    data = request.get_json() or {}
    status = data.get('status')

    fac = Facility.query.get(id)
    if not fac:
        return jsonify({"error": "Facility not found"}), 404

    fac.status = status
    db.session.commit()
    return jsonify(fac.to_dict())

# ==================== ADMIN ANALYTICS ENDPOINT ====================

@app.route('/api/admin/analytics', methods=['GET'])
@authenticate_jwt
def get_admin_analytics():
    if g.user.get('role') != 'admin':
        return jsonify({"error": "Admin permissions required"}), 403

    total_stations = Station.query.count()
    total_facilities = Facility.query.count()
    total_trips = Trip.query.count()
    total_feedback = Feedback.query.count()

    feedbacks = Feedback.query.all()
    avg_rating = 4.7
    if total_feedback > 0:
        avg_rating = round(sum(f.rating for f in feedbacks) / total_feedback, 1)

    # Trips per station
    stations = Station.query.all()
    trips_per_station = []
    for s in stations:
        count = Trip.query.filter_by(stationId=s.id).count()
        trips_per_station.append({"name": s.name, "code": s.code, "count": count})

    # Facility distribution
    facility_types = ['restroom', 'food_court', 'coffee_shop', 'atm', 'waiting_area', 'accessibility']
    facility_distribution = []
    for t in facility_types:
        count = Facility.query.filter_by(type=t).count()
        facility_distribution.append({"type": t, "count": count})

    # Recent feedback (sorted newest first, max 5)
    recent_feedbacks = Feedback.query.order_by(Feedback.timestamp.desc()).limit(5).all()

    return jsonify({
        "totalStations": total_stations,
        "totalFacilities": total_facilities,
        "totalTrips": total_trips,
        "totalFeedback": total_feedback,
        "avgRating": avg_rating,
        "tripsPerStation": trips_per_station,
        "facilityDistribution": facility_distribution,
        "recentFeedback": [f.to_dict() for f in recent_feedbacks],
        "activeNavigationUsersCount": 14 + random.randint(0, 6),
        "qrScannerScanHits": 325 + total_trips * 4,
        "mapInteractionUptime": '99.98%',
        "systemCpuLoad": f"{(18.5 + random.random() * 12.0):.1f}%",
        "memoryUtilization": f"{(44.2 + random.random() * 5.0):.1f}%"
    })

# ==================== PATHFINDING & NAVIGATION API ====================

@app.route('/api/navigation/nodes/<station_id>', methods=['GET'])
def get_nodes(station_id):
    nodes = MapNode.query.filter_by(stationId=station_id).all()
    return jsonify([n.to_dict() for n in nodes])

@app.route('/api/navigation/route', methods=['GET'])
def get_route():
    station_id = request.args.get('stationId')
    from_node = request.args.get('fromNode')
    to_node = request.args.get('toNode')

    if not station_id or not from_node or not to_node:
        return jsonify({"error": "Missing stationId, fromNode, or toNode parameters"}), 400

    nodes = [n.to_dict() for n in MapNode.query.filter_by(stationId=station_id).all()]
    edges = [e.to_dict() for e in MapEdge.query.filter_by(stationId=station_id).all()]

    result = find_shortest_path(nodes, edges, from_node, to_node)
    if not result:
        return jsonify({"error": "No route found between selected points"}), 404

    return jsonify(result)

@app.route('/api/navigation/trip', methods=['POST'])
@authenticate_jwt
def save_trip():
    data = request.get_json() or {}
    station_id = data.get('stationId')
    from_node = data.get('fromNode')
    to_node = data.get('toNode')
    distance = data.get('distance', 0)
    duration = data.get('duration', 0)

    if not station_id or not from_node or not to_node:
        return jsonify({"error": "Missing trip details"}), 400

    new_trip = Trip(
        id='trip_' + str(uuid.uuid4().hex)[:7],
        userId=g.user['id'],
        stationId=station_id,
        fromNode=from_node,
        toNode=to_node,
        timestamp=datetime.utcnow().isoformat() + "Z",
        distance=distance,
        duration=duration
    )
    db.session.add(new_trip)
    db.session.commit()

    return jsonify(new_trip.to_dict()), 201

@app.route('/api/navigation/trips', methods=['GET'])
@authenticate_jwt
def get_user_trips():
    trips = Trip.query.filter_by(userId=g.user['id']).all()
    return jsonify([t.to_dict() for t in trips])

# ==================== LIVE DATA API ====================

@app.route('/api/trains', methods=['GET'])
def get_trains():
    station_id = request.args.get('stationId')
    if station_id:
        trains = TrainStatus.query.filter_by(stationId=station_id).all()
    else:
        trains = TrainStatus.query.all()
    return jsonify([t.to_dict() for t in trains])

@app.route('/api/crowd', methods=['GET'])
def get_crowd():
    station_id = request.args.get('stationId')
    if station_id:
        crowd = PlatformCrowd.query.filter_by(stationId=station_id).all()
    else:
        crowd = PlatformCrowd.query.all()
    return jsonify([c.to_dict() for c in crowd])

# ==================== FEEDBACK API ====================

@app.route('/api/feedback', methods=['POST'])
@authenticate_jwt
def post_feedback_user():
    data = request.get_json() or {}
    rating = data.get('rating')
    comments = data.get('comments')
    category = data.get('category', 'General')

    if not rating or not comments:
        return jsonify({"error": "Rating and comments are required"}), 400

    new_fb = Feedback(
        id='feed_' + str(uuid.uuid4().hex)[:7],
        userId=g.user['id'],
        userName=g.user['name'],
        rating=int(rating),
        comments=comments,
        category=category,
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
    db.session.add(new_fb)
    db.session.commit()

    return jsonify(new_fb.to_dict()), 201

@app.route('/api/feedback', methods=['GET'])
def get_feedback_history():
    feedback = Feedback.query.all()
    return jsonify([f.to_dict() for f in feedback])

# ==================== MAP UPLOADS & NAVIGATION MANAGEMENT API ====================

@app.route('/api/uploads/<filename>', methods=['GET'])
def get_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/stations/upload_map', methods=['POST'])
@authenticate_jwt
def upload_station_map():
    if g.user.get('role') != 'admin':
        return jsonify({"error": "Admin permissions required"}), 403
    
    if 'map_file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['map_file']
    station_id = request.form.get('stationId')
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if not station_id:
        return jsonify({"error": "Station ID is required"}), 400
        
    station = Station.query.get(station_id)
    if not station:
        return jsonify({"error": "Station not found"}), 404
        
    if file:
        filename = secure_filename(f"{station_id}_{int(time.time())}_{file.filename}")
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        map_url = f"/api/uploads/{filename}"
        station.mapUrl = map_url
        db.session.commit()
        
        return jsonify({
            "message": "Map uploaded successfully",
            "mapUrl": map_url,
            "station": station.to_dict()
        }), 200

@app.route('/api/navigation/edges/<station_id>', methods=['GET'])
def get_edges(station_id):
    edges = MapEdge.query.filter_by(stationId=station_id).all()
    return jsonify([e.to_dict() for e in edges])

@app.route('/api/navigation/edges', methods=['POST'])
@authenticate_jwt
def create_or_update_edge():
    if g.user.get('role') != 'admin':
        return jsonify({"error": "Admin permissions required"}), 403
    
    data = request.get_json() or {}
    station_id = data.get('stationId')
    from_node = data.get('fromNode')
    to_node = data.get('toNode')
    distance = data.get('distance')

    if not station_id or not from_node or not to_node or distance is None:
        return jsonify({"error": "Missing stationId, fromNode, toNode, or distance"}), 400

    # Try to find existing edge between these nodes in either direction
    edge = MapEdge.query.filter_by(stationId=station_id, fromNode=from_node, toNode=to_node).first()
    if not edge:
        edge = MapEdge.query.filter_by(stationId=station_id, fromNode=to_node, toNode=from_node).first()

    if edge:
        edge.distance = int(distance)
        db.session.commit()
        return jsonify({
            "message": "Edge distance updated successfully",
            "edge": edge.to_dict()
        }), 200
    else:
        edge_id = f"e_{from_node}_{to_node}_{str(uuid.uuid4().hex)[:4]}"
        new_edge = MapEdge(
            id=edge_id,
            stationId=station_id,
            fromNode=from_node,
            toNode=to_node,
            distance=int(distance)
        )
        db.session.add(new_edge)
        db.session.commit()
        return jsonify({
            "message": "Edge created successfully",
            "edge": new_edge.to_dict()
        }), 201

@app.route('/api/navigation/edges/<edge_id>', methods=['DELETE'])
@authenticate_jwt
def delete_edge(edge_id):
    if g.user.get('role') != 'admin':
        return jsonify({"error": "Admin permissions required"}), 403
    
    edge = MapEdge.query.get(edge_id)
    if not edge:
        return jsonify({"error": "Edge not found"}), 404

    db.session.delete(edge)
    db.session.commit()
    return jsonify({"message": "Edge deleted successfully"}), 200

@app.route('/api/navigation/nodes', methods=['POST'])
@authenticate_jwt
def create_node():
    if g.user.get('role') != 'admin':
        return jsonify({"error": "Admin permissions required"}), 403
    
    data = request.get_json() or {}
    station_id = data.get('stationId')
    name = data.get('name')
    x = data.get('x')
    y = data.get('y')
    floor = data.get('floor', 0)

    if not station_id or not name or x is None or y is None:
        return jsonify({"error": "Missing stationId, name, x, or y"}), 400

    node_id = f"node_{name.lower().replace(' ', '_')}_{str(uuid.uuid4().hex)[:4]}"
    node_id = "".join(c for c in node_id if c.isalnum() or c == "_")

    new_node = MapNode(
        id=node_id,
        stationId=station_id,
        name=name,
        x=float(x),
        y=float(y),
        floor=int(floor)
    )
    db.session.add(new_node)
    db.session.commit()
    return jsonify(new_node.to_dict()), 201

# ==================== AI CHATBOT WITH DYNAMIC FALLBACK ====================

def get_intelligent_fallback(message, station, facilities):
    normalized = message.lower()
    station_name = station.name
    code = station.code
    crowd_status = station.crowdStatus

    restrooms = [f for f in facilities if f.type == 'restroom']
    atms = [f for f in facilities if f.type == 'atm']
    food_stalls = [f for f in facilities if f.type in ['food_court', 'coffee_shop']]
    elevators = [f for f in facilities if f.type == 'accessibility']
    lounges = [f for f in facilities if f.type == 'waiting_area']

    if 'restroom' in normalized or 'toilet' in normalized or 'washroom' in normalized:
        if restrooms:
            r = restrooms[0]
            status_text = '🟢 fully operational and open' if r.status == 'operational' else '🔴 temporarily closed for maintenance'
            return f"Yes, **{r.name}** is available at {station_name}. It is currently {status_text}. You can find it on the interactive map near the platform gates. To map a direct route, select it as your destination in the navigation planner panel on the left!"
        return f"While I don't see a dedicated restroom listed in the map nodes for {station_name}, you can generally find restrooms located near the main platform waiting lounges or ticket gates."

    elif 'atm' in normalized or 'cash' in normalized or 'money' in normalized or 'bank' in normalized:
        if atms:
            atm = atms[0]
            status_text = '🟢 fully functional and loaded with cash' if atm.status == 'operational' else '🔴 undergoing cash replenishment'
            return f"Yes, we have a **{atm.name}** at {station_name}. It is {status_text}. It is located near the main foyer entrance. You can select it in the planner to view its exact position and get walking directions!"
        return f"ATMs at {station_name} are typically situated near the main ticket counters or station exits."

    elif any(kw in normalized for kw in ['coffee', 'cafe', 'food', 'eat', 'drink', 'restaurant']):
        if food_stalls:
            lst = ", ".join([f"**{f.name}** ({'🟢 open' if f.status == 'operational' else '🔴 closed'})" for f in food_stalls])
            return f"We have several great food and beverage options at {station_name}: {lst}. You can head over to enjoy a quick bite or hot beverage. Simply choose them from the facility list on the left to map out your directions!"
        return "Local tea and snack counters are situated on Platforms 1, 2, and 3."

    elif any(kw in normalized for kw in ['elevator', 'lift', 'ramp', 'escalator', 'wheelchair']):
        if elevators:
            e = elevators[0]
            status_text = '🟢 fully operational' if e.status == 'operational' else '🔴 under inspection'
            return f"To ensure accessibility, {station_name} features **{e.name}**. It is currently {status_text}. Our routes are fully optimized for wheelchair users. Simply check the **Wheelchair Routing Only** checkbox in the pathfinder to plan a route using only ramps and elevators!"
        return f"{station_name} supports accessibility. Escalators and lifts are located at the center bridge connecting Platforms 1, 2, and 3/4."

    elif 'waiting' in normalized or 'lounge' in normalized or 'sit' in normalized or 'rest' in normalized:
        if lounges:
            l = lounges[0]
            status_text = '🟢 open' if l.status == 'operational' else '🔴 fully occupied'
            return f"Yes, you can rest at **{l.name}** ({status_text}). It features comfortable seating and charging ports. Map a route to it in the **Plan Your Route** panel!"
        return "The general passenger seating hall is located on Platform 1 near the ticket window."

    elif 'platform' in normalized or 'train' in normalized or 'track' in normalized:
        crowd_status_text = '🟢 low passenger density' if crowd_status == 'Low' else '🟡 moderate passenger density' if crowd_status == 'Medium' else '🔴 heavy crowd flow'
        return f"{station_name} features 4 active platforms. Currently, the overall station crowd level is **{crowd_status.upper()}** ({crowd_status_text}). All platform stairs, escalators, and security gates are operating smoothly. You can select any platform as your pathfinder target on the map."

    elif any(kw in normalized for kw in ['hello', 'hi', 'hey', 'greet', 'help']):
        return f"Hello there! I am your AI Railway Station Assistant for **{station_name}**.\n\nI can help you locate amenities, check crowd densities, find restrooms, ATMs, or elevators, and give you optimal directions. What can I help you find today?"

    else:
        open_facs = ", ".join([f.name for f in facilities if f.status == 'operational'][:3])
        return f"Hello! I am your AI Companion for **{station_name}**.\n\nHere are some quick details about this station:\n- **Crowd flow**: Currently **{crowd_status.upper()}**.\n- **Open Amenities**: We have {open_facs or 'Restrooms, Tickets, Food Counters, and ATMs'} active and functional.\n- **Station Code**: **{code}**.\n\nTo find walking directions, select any source and target locations in the **Plan Your Route** panel or click on the map. Let me know if you need help finding restrooms, elevators, coffee stalls, or anything else!"

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json() or {}
    message = data.get('message', '')
    station_id = data.get('stationId', 'central')
    current_location_node_id = data.get('currentLocationNodeId')

    if not message:
        return jsonify({"error": "Message is required"}), 400

    station = Station.query.get(station_id)
    if not station:
        station = Station.query.first() or Station(id="central", name="Central Station", code="CEN", crowdStatus="Medium")

    facilities = Facility.query.filter_by(stationId=station.id).all()
    station_nodes = MapNode.query.filter_by(stationId=station.id).all()

    # Check for Gemini API Key in environment
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key and gemini_key != "MY_GEMINI_API_KEY":
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-3.5-flash')
            
            curr_node_name = "Main Entrance"
            if current_location_node_id:
                matched_node = MapNode.query.get(current_location_node_id)
                if matched_node:
                    curr_node_name = matched_node.name

            # Formulate detailed station context prompt matching server.ts
            context_prompt = f"""
You are the interactive AI Station Assistant for the "Railway Station Navigation & Wayfinding" application.
The user is asking a question about railway navigation, facility finding, or directions.

CURRENT STATION CONTEXT:
- Station Name: {station.name} ({station.code})
- Crowd Level: {station.crowdStatus}
- Facilities available at this station:
{chr(10).join([f"  * {f.name} (Type: {f.type}, Status: {f.status})" for f in facilities])}
- Locations (Map Nodes):
{chr(10).join([f"  * {n.name} (Map location: x:{n.x}%, y:{n.y}%)" for n in station_nodes])}

USER DETAILS:
- Current Location: {curr_node_name}

INSTRUCTIONS:
1. Provide extremely clear, helpful, concise navigation instructions or station assistance.
2. If the user asks how to get somewhere, describe the pathway clearly (e.g. "go straight past the food court", "the elevator is near the information desk").
3. Always maintain a highly professional, friendly, and passenger-supportive tone.
4. Keep answers brief (maximum 3 paragraphs) for rapid reading on-the-go.

USER MESSAGE:
"{message}"
"""
            
            response = model.generate_content(context_prompt)
            return jsonify({"reply": response.text.strip()})
        except Exception as e:
            print(f"Gemini API Error, falling back to intelligent parser: {e}")

    # Fallback to intelligent parser
    reply_text = get_intelligent_fallback(message, station, facilities)
    return jsonify({"reply": reply_text})

# ==================== LIVE SIMULATION THREAD ====================

def start_crowd_simulation(app_context):
    def run_simulation():
        while True:
            time.sleep(30)
            with app_context:
                try:
                    # Small randomized changes
                    crowds = PlatformCrowd.query.all()
                    for c in crowds:
                        delta = random.randint(-5, 5)
                        c.percentage = max(10, min(95, c.percentage + delta))
                        if c.percentage < 35:
                            c.density = 'Low'
                        elif c.percentage < 70:
                            c.density = 'Medium'
                        else:
                            c.density = 'High'
                    db.session.commit()
                except Exception as e:
                    pass

    thread = threading.Thread(target=run_simulation, daemon=True)
    thread.start()

# ==================== RUN APPLICATION ====================

if __name__ == '__main__':
    # Start the live background update simulation
    start_crowd_simulation(app.app_context())

    port = int(os.getenv("PORT", 3000))
    app.run(host='0.0.0.0', port=port, debug=True)
