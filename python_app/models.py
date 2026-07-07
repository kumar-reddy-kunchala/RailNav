from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(50), primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='passenger')
    passwordHash = db.Column(db.String(200), nullable=False)
    salt = db.Column(db.String(100), nullable=False)
    accessibilityMode = db.Column(db.Boolean, default=False)
    createdAt = db.Column(db.String(50))

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "accessibilityMode": self.accessibilityMode,
            "createdAt": self.createdAt
        }

class Station(db.Model):
    __tablename__ = 'stations'
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(10), nullable=False)
    distance = db.Column(db.String(50))
    facilitiesCount = db.Column(db.Integer, default=0)
    activeRoutesCount = db.Column(db.Integer, default=0)
    crowdStatus = db.Column(db.String(20), default='Medium')
    zone = db.Column(db.String(50))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "distance": self.distance,
            "facilitiesCount": self.facilitiesCount,
            "activeRoutesCount": self.activeRoutesCount,
            "crowdStatus": self.crowdStatus,
            "zone": self.zone
        }

class Facility(db.Model):
    __tablename__ = 'facilities'
    id = db.Column(db.String(50), primary_key=True)
    stationId = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(100))
    icon = db.Column(db.String(50))
    nodeId = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "stationId": self.stationId,
            "name": self.name,
            "type": self.type,
            "status": self.status,
            "icon": self.icon,
            "nodeId": self.nodeId
        }

class MapNode(db.Model):
    __tablename__ = 'map_nodes'
    id = db.Column(db.String(50), primary_key=True)
    stationId = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    x = db.Column(db.Float, nullable=False)
    y = db.Column(db.Float, nullable=False)
    floor = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "stationId": self.stationId,
            "name": self.name,
            "x": self.x,
            "y": self.y,
            "floor": self.floor
        }

class MapEdge(db.Model):
    __tablename__ = 'map_edges'
    id = db.Column(db.String(50), primary_key=True)
    stationId = db.Column(db.String(50), nullable=False)
    fromNode = db.Column(db.String(50), nullable=False)
    toNode = db.Column(db.String(50), nullable=False)
    distance = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "stationId": self.stationId,
            "fromNode": self.fromNode,
            "toNode": self.toNode,
            "distance": self.distance
        }

class TrainStatus(db.Model):
    __tablename__ = 'train_statuses'
    id = db.Column(db.String(50), primary_key=True)
    stationId = db.Column(db.String(50))
    trainNo = db.Column(db.String(20), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    arrivalTime = db.Column(db.String(50), nullable=False)
    platform = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    statusText = db.Column(db.String(100))

    def to_dict(self):
        return {
            "id": self.id,
            "stationId": self.stationId,
            "trainNo": self.trainNo,
            "name": self.name,
            "arrivalTime": self.arrivalTime,
            "platform": self.platform,
            "status": self.status,
            "statusText": self.statusText
        }

class PlatformCrowd(db.Model):
    __tablename__ = 'platform_crowds'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    stationId = db.Column(db.String(50))
    platformNo = db.Column(db.String(20), nullable=False)
    density = db.Column(db.String(20), nullable=False)
    percentage = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "stationId": self.stationId,
            "platformNo": self.platformNo,
            "density": self.density,
            "percentage": self.percentage
        }

class Trip(db.Model):
    __tablename__ = 'trips'
    id = db.Column(db.String(50), primary_key=True)
    userId = db.Column(db.String(50), nullable=False)
    stationId = db.Column(db.String(50), nullable=False)
    fromNode = db.Column(db.String(50), nullable=False)
    toNode = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.String(50), nullable=False)
    distance = db.Column(db.Integer, default=0)
    duration = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.userId,
            "stationId": self.stationId,
            "fromNode": self.fromNode,
            "toNode": self.toNode,
            "timestamp": self.timestamp,
            "distance": self.distance,
            "duration": self.duration
        }

class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.String(50), primary_key=True)
    userId = db.Column(db.String(50), nullable=False)
    userName = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comments = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.userId,
            "userName": self.userName,
            "rating": self.rating,
            "comments": self.comments,
            "category": self.category,
            "timestamp": self.timestamp
        }
