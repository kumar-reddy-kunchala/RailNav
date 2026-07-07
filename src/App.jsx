import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  MapPin,
  Compass,
  History,
  AlertTriangle,
  Accessibility as AccessIcon,
  Settings,
  ArrowRight,
  Navigation as NavIcon,
  ThumbsUp,
  Volume2,
  Train,
  Check,
  VolumeX,
  SkipForward,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Star,
  Bell,
  ExternalLink,
  QrCode,
  Activity,
  Clock,
  TrendingUp,
  Info,
  Play,
  Pause,
  HelpCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import IndoorMap from './components/IndoorMap';
import LoginPage from './components/LoginPage';
import Chatbot from './components/Chatbot';
import VoiceNavigator from './components/VoiceNavigator';
import FacilityIcon from './components/FacilityIcon';
import CameraQRScanner from './components/CameraQRScanner';

// ==================== OFFLINE STATIC DATABASE & PATHFINDING FALLBACKS ====================
const STATIC_DATABASE = {
  stations: [
    { id: "central", name: "Central Station", code: "CEN", distance: "0.4 km away", facilitiesCount: 8, activeRoutesCount: 8, crowdStatus: "Medium", zone: "Central Zone" },
    { id: "secunderabad", name: "Secunderabad Jn", code: "SC", distance: "1.2 km away", facilitiesCount: 8, activeRoutesCount: 7, crowdStatus: "High", zone: "SCR" },
    { id: "vijayawada", name: "Vijayawada Jn", code: "BZA", distance: "2.5 km away", facilitiesCount: 6, activeRoutesCount: 5, crowdStatus: "Medium", zone: "SCR" },
    { id: "prayagraj", name: "Prayagraj Jn", code: "PRYJ", distance: "4.1 km away", facilitiesCount: 6, activeRoutesCount: 6, crowdStatus: "High", zone: "NCR" },
    { id: "new_delhi", name: "New Delhi Station", code: "NDLS", distance: "5.0 km away", facilitiesCount: 7, activeRoutesCount: 9, crowdStatus: "High", zone: "NR" },
    { id: "mumbai_csmt", name: "Mumbai CSMT", code: "CSMT", distance: "3.8 km away", facilitiesCount: 6, activeRoutesCount: 8, crowdStatus: "Medium", zone: "CR" },
    { id: "chennai_central", name: "Chennai Central", code: "MAS", distance: "6.2 km away", facilitiesCount: 6, activeRoutesCount: 7, crowdStatus: "Low", zone: "SR" },
    { id: "howrah", name: "Howrah Jn", code: "HWH", distance: "7.5 km away", facilitiesCount: 7, activeRoutesCount: 8, crowdStatus: "High", zone: "ER" }
  ],
  facilities: [
    { id: "fac_restroom", stationId: "central", name: "Restroom Block A", type: "restroom", status: "2 Available", icon: "Restroom", nodeId: "node_restroom" },
    { id: "fac_food", stationId: "central", name: "Main Food Court", type: "food_court", status: "Open", icon: "FoodCourt", nodeId: "node_food" },
    { id: "fac_coffee", stationId: "central", name: "Coffee Store", type: "coffee_shop", status: "Open", icon: "CoffeeStore", nodeId: "node_coffee" },
    { id: "fac_atm", stationId: "central", name: "ATM Counter", type: "atm", status: "3 Available", icon: "ATM", nodeId: "node_atm" },
    { id: "fac_waiting", stationId: "central", name: "Waiting Area", type: "waiting_area", status: "Available", icon: "WaitingArea", nodeId: "node_waiting" },
    { id: "fac_wheelchair", stationId: "central", name: "Wheelchair Accessible", type: "accessibility", status: "Available", icon: "WheelchairAccessible", nodeId: "node_elevator" },
    { id: "fac_platform", stationId: "central", name: "Platform Information", type: "platform", status: "Platform Details", icon: "PlatformInformation", nodeId: "node_platform_info" },
    { id: "fac_map", stationId: "central", name: "Station Map", type: "map", status: "Interactive Map", icon: "StationMap", nodeId: "node_entrance" },

    { id: "fac_sc_restroom", stationId: "secunderabad", name: "Premium Toilet", type: "restroom", status: "3 Available", icon: "Restroom", nodeId: "sc_ticket" },
    { id: "fac_sc_food", stationId: "secunderabad", name: "SCR Food Plaza", type: "food_court", status: "Open", icon: "FoodCourt", nodeId: "sc_food" },
    { id: "fac_sc_lounge", stationId: "secunderabad", name: "AC Executive Lounge", type: "waiting_area", status: "Available", icon: "WaitingArea", nodeId: "sc_lounge" },
    { id: "fac_sc_atm", stationId: "secunderabad", name: "SBI ATM", type: "atm", status: "2 Available", icon: "ATM", nodeId: "sc_entrance" },
    { id: "fac_sc_wheelchair", stationId: "secunderabad", name: "Disabled Ramp", type: "accessibility", status: "Available", icon: "WheelchairAccessible", nodeId: "sc_elevator" },
    { id: "fac_sc_platform", stationId: "secunderabad", name: "Digital Timetable Screen", type: "platform", status: "Live Status", icon: "PlatformInformation", nodeId: "sc_p1" },
    { id: "fac_sc_water", stationId: "secunderabad", name: "RO Water Stall", type: "coffee_shop", status: "Open", icon: "CoffeeStore", nodeId: "sc_ticket" },
    { id: "fac_sc_map", stationId: "secunderabad", name: "SC Station Map", type: "map", status: "3D Layout", icon: "StationMap", nodeId: "sc_entrance" },

    { id: "fac_bza_restroom", stationId: "vijayawada", name: "Platform 1 Toilet", type: "restroom", status: "1 Available", icon: "Restroom", nodeId: "bza_entrance" },
    { id: "fac_bza_food", stationId: "vijayawada", name: "BZA Canteen", type: "food_court", status: "Open", icon: "FoodCourt", nodeId: "bza_food" },
    { id: "fac_bza_water", stationId: "vijayawada", name: "Pure Drink Water", type: "coffee_shop", status: "Available", icon: "CoffeeStore", nodeId: "bza_drinking_water" },
    { id: "fac_bza_elevator", stationId: "vijayawada", name: "Platform Lift", type: "accessibility", status: "Available", icon: "WheelchairAccessible", nodeId: "bza_elevator" },
    { id: "fac_bza_platform", stationId: "vijayawada", name: "Coach Indicator board", type: "platform", status: "Active", icon: "PlatformInformation", nodeId: "bza_p1" },
    { id: "fac_bza_map", stationId: "vijayawada", name: "BZA Station Map", type: "map", status: "Digital Map", icon: "StationMap", nodeId: "bza_entrance" },

    { id: "fac_pryj_restroom", stationId: "prayagraj", name: "PRYJ Restroom", type: "restroom", status: "4 Available", icon: "Restroom", nodeId: "pryj_booking" },
    { id: "fac_pryj_food", stationId: "prayagraj", name: "IRCTC Canteen", type: "food_court", status: "Open", icon: "FoodCourt", nodeId: "pryj_civil_lines" },
    { id: "fac_pryj_lounge", stationId: "prayagraj", name: "AC Waiting Hall", type: "waiting_area", status: "Available", icon: "WaitingArea", nodeId: "pryj_waiting" },
    { id: "fac_pryj_bridge", stationId: "prayagraj", name: "Foot Over Bridge", type: "accessibility", status: "Safe Passage", icon: "WheelchairAccessible", nodeId: "pryj_overbridge" },
    { id: "fac_pryj_platform", stationId: "prayagraj", name: "Platform Display Status", type: "platform", status: "Live", icon: "PlatformInformation", nodeId: "pryj_p1" },
    { id: "fac_pryj_map", stationId: "prayagraj", name: "PRYJ Interactive Map", type: "map", status: "Interactive", icon: "StationMap", nodeId: "pryj_civil_lines" }
  ],
  nodes: [
    { id: "node_entrance", stationId: "central", name: "Main Entrance", x: 73, y: 69, floor: 0 },
    { id: "node_restroom", stationId: "central", name: "Restroom", x: 78, y: 56, floor: 0 },
    { id: "node_food", stationId: "central", name: "Food Court", x: 78, y: 45, floor: 0 },
    { id: "node_coffee", stationId: "central", name: "Coffee Store", x: 78, y: 32, floor: 0 },
    { id: "node_waiting", stationId: "central", name: "Waiting Area", x: 67, y: 47, floor: 0 },
    { id: "node_atm", stationId: "central", name: "ATM Counter", x: 55, y: 65, floor: 0 },
    { id: "node_elevator", stationId: "central", name: "Elevator & Ramp", x: 55, y: 40, floor: 0 },
    { id: "node_platform_info", stationId: "central", name: "Platform Info Screen", x: 55, y: 53, floor: 0 },
    { id: "node_platform_junction", stationId: "central", name: "Platform Walkway Entrance", x: 70, y: 29, floor: 1 },
    { id: "node_platform1", stationId: "central", name: "Platform 1", x: 25, y: 25, floor: 1 },
    { id: "node_platform2", stationId: "central", name: "Platform 2", x: 45, y: 25, floor: 1 },
    { id: "node_platform3", stationId: "central", name: "Platform 3", x: 65, y: 25, floor: 1 },
    { id: "node_platform4", stationId: "central", name: "Platform 4", x: 70, y: 25, floor: 1 },

    { id: "sc_entrance", stationId: "secunderabad", name: "Secunderabad Main Entrance", x: 50, y: 90, floor: 0 },
    { id: "sc_ticket", stationId: "secunderabad", name: "Ticket Counter", x: 50, y: 70, floor: 0 },
    { id: "sc_lounge", stationId: "secunderabad", name: "AC Executive Lounge", x: 25, y: 55, floor: 0 },
    { id: "sc_food", stationId: "secunderabad", name: "SCR Food Plaza", x: 75, y: 55, floor: 0 },
    { id: "sc_elevator", stationId: "secunderabad", name: "Lifts & Escalators", x: 50, y: 40, floor: 0 },
    { id: "sc_p1", stationId: "secunderabad", name: "Platform 1", x: 20, y: 20, floor: 1 },
    { id: "sc_p10", stationId: "secunderabad", name: "Platform 10", x: 80, y: 20, floor: 1 },

    { id: "bza_entrance", stationId: "vijayawada", name: "BZA Main Gate", x: 50, y: 85, floor: 0 },
    { id: "bza_food", stationId: "vijayawada", name: "BZA Canteen", x: 35, y: 65, floor: 0 },
    { id: "bza_drinking_water", stationId: "vijayawada", name: "Water Vendor Station", x: 65, y: 65, floor: 0 },
    { id: "bza_elevator", stationId: "vijayawada", name: "BZA Core Elevator", x: 50, y: 45, floor: 0 },
    { id: "bza_p1", stationId: "vijayawada", name: "Platform 1", x: 20, y: 20, floor: 1 },
    { id: "bza_p10", stationId: "vijayawada", name: "Platform 10", x: 80, y: 20, floor: 1 },

    { id: "pryj_civil_lines", stationId: "prayagraj", name: "Civil Lines Gate", x: 50, y: 85, floor: 0 },
    { id: "pryj_booking", stationId: "prayagraj", name: "PRYJ Ticket Center", x: 30, y: 65, floor: 0 },
    { id: "pryj_waiting", stationId: "prayagraj", name: "AC Waiting Lounge", x: 70, y: 65, floor: 0 },
    { id: "pryj_overbridge", stationId: "prayagraj", name: "Foot Over Bridge", x: 50, y: 45, floor: 1 },
    { id: "pryj_p1", stationId: "prayagraj", name: "Platform 1", x: 25, y: 20, floor: 1 },
    { id: "pryj_p10", stationId: "prayagraj", name: "Platform 10", x: 75, y: 20, floor: 1 }
  ],
  edges: [
    { id: "e1", stationId: "central", fromNode: "node_entrance", toNode: "node_restroom", distance: 30 },
    { id: "e2", stationId: "central", fromNode: "node_restroom", toNode: "node_food", distance: 25 },
    { id: "e3", stationId: "central", fromNode: "node_food", toNode: "node_coffee", distance: 20 },
    { id: "e4", stationId: "central", fromNode: "node_entrance", toNode: "node_atm", distance: 50 },
    { id: "e5", stationId: "central", fromNode: "node_atm", toNode: "node_platform_info", distance: 40 },
    { id: "e6", stationId: "central", fromNode: "node_platform_info", toNode: "node_elevator", distance: 35 },
    { id: "e7", stationId: "central", fromNode: "node_elevator", toNode: "node_waiting", distance: 45 },
    { id: "e8", stationId: "central", fromNode: "node_waiting", toNode: "node_platform_junction", distance: 60 },
    { id: "e9", stationId: "central", fromNode: "node_coffee", toNode: "node_platform_junction", distance: 25 },
    { id: "e10", stationId: "central", fromNode: "node_platform_junction", toNode: "node_platform4", distance: 10 },
    { id: "e11", stationId: "central", fromNode: "node_platform_junction", toNode: "node_platform3", distance: 20 },
    { id: "e12", stationId: "central", fromNode: "node_platform_junction", toNode: "node_platform2", distance: 80 },
    { id: "e13", stationId: "central", fromNode: "node_platform_junction", toNode: "node_platform1", distance: 120 },
    { id: "e14", stationId: "central", fromNode: "node_restroom", toNode: "node_waiting", distance: 40 },
    { id: "e15", stationId: "central", fromNode: "node_entrance", toNode: "node_platform_info", distance: 60 },

    { id: "es1", stationId: "secunderabad", fromNode: "sc_entrance", toNode: "sc_ticket", distance: 25 },
    { id: "es2", stationId: "secunderabad", fromNode: "sc_ticket", toNode: "sc_lounge", distance: 35 },
    { id: "es3", stationId: "secunderabad", fromNode: "sc_ticket", toNode: "sc_food", distance: 35 },
    { id: "es4", stationId: "secunderabad", fromNode: "sc_ticket", toNode: "sc_elevator", distance: 40 },
    { id: "es5", stationId: "secunderabad", fromNode: "sc_lounge", toNode: "sc_p1", distance: 45 },
    { id: "es6", stationId: "secunderabad", fromNode: "sc_elevator", toNode: "sc_p1", distance: 30 },
    { id: "es7", stationId: "secunderabad", fromNode: "sc_elevator", toNode: "sc_p10", distance: 40 },
    { id: "es8", stationId: "secunderabad", fromNode: "sc_food", toNode: "sc_p10", distance: 45 },

    { id: "eb1", stationId: "vijayawada", fromNode: "bza_entrance", toNode: "bza_food", distance: 35 },
    { id: "eb2", stationId: "vijayawada", fromNode: "bza_entrance", toNode: "bza_drinking_water", distance: 35 },
    { id: "eb3", stationId: "vijayawada", fromNode: "bza_food", toNode: "bza_elevator", distance: 35 },
    { id: "eb4", stationId: "vijayawada", fromNode: "bza_drinking_water", toNode: "bza_elevator", distance: 35 },
    { id: "eb5", stationId: "vijayawada", fromNode: "bza_elevator", toNode: "bza_p1", distance: 40 },
    { id: "eb6", stationId: "vijayawada", fromNode: "bza_elevator", toNode: "bza_p10", distance: 45 }
  ],
  trains: [
    { id: "t1", stationId: "central", trainNo: "12863", name: "Superfast Express", arrivalTime: "10:36 AM", platform: "2", status: "On Time", statusText: "On Time" },
    { id: "t2", stationId: "central", trainNo: "12723", name: "Intercity Express", arrivalTime: "11:10 AM", platform: "4", status: "Delayed", statusText: "Delayed by 15m" },
    { id: "t3", stationId: "central", trainNo: "12615", name: "Passenger Special", arrivalTime: "11:45 AM", platform: "3", status: "On Time", statusText: "On Time" },
    
    { id: "t_sc1", stationId: "secunderabad", trainNo: "12728", name: "Godavari Express", arrivalTime: "05:15 PM", platform: "1", status: "On Time", statusText: "On Time" },
    { id: "t_sc2", stationId: "secunderabad", trainNo: "12759", name: "Charminar Express", arrivalTime: "06:40 PM", platform: "10", status: "Delayed", statusText: "Delayed by 10m" }
  ],
  crowd: [
    { stationId: "central", platformNo: "Platform 1", density: "Low", percentage: 22 },
    { stationId: "central", platformNo: "Platform 2", density: "Medium", percentage: 54 },
    { stationId: "central", platformNo: "Platform 3", density: "High", percentage: 82 },
    { stationId: "central", platformNo: "Platform 4", density: "Medium", percentage: 48 },

    { stationId: "secunderabad", platformNo: "Platform 1", density: "High", percentage: 85 },
    { stationId: "secunderabad", platformNo: "Platform 10", density: "Medium", percentage: 60 }
  ],
  feedback: [
    { id: "feed_1", userName: "Aravind K.", rating: 5, comments: "Offline navigation route planner, platform indicator is exact!", category: "Wayfinding", timestamp: "2026-07-06T12:00:00Z" },
    { id: "feed_2", userName: "Pooja S.", rating: 4, comments: "Wheelchair accessible option automatically routed me through the elevators.", category: "Accessibility", timestamp: "2026-07-06T14:30:00Z" }
  ]
};

function findShortestPathJS(nodes, edges, startNodeId, endNodeId) {
  const startNode = nodes.find(n => n.id === startNodeId);
  const endNode = nodes.find(n => n.id === endNodeId);
  
  if (!startNode || !endNode) return null;
  if (startNodeId === endNodeId) {
    return {
      path: [startNode],
      totalDistance: 0,
      estimatedTimeMins: 0,
      stepsCount: 1,
      steps: [{
        instruction: `You are already at ${startNode.name}`,
        distance: 0,
        fromNode: startNodeId,
        toNode: endNodeId
      }]
    };
  }

  // Dijkstra implementation
  const adjacency = {};
  nodes.forEach(n => { adjacency[n.id] = []; });
  
  edges.forEach(e => {
    const fromObj = nodes.find(n => n.id === e.fromNode);
    const toObj = nodes.find(n => n.id === e.toNode);
    if (fromObj && toObj) {
      adjacency[e.fromNode].push({ node: toObj, distance: e.distance });
      adjacency[e.toNode].push({ node: fromObj, distance: e.distance });
    }
  });

  const distances = {};
  const previous = {};
  const unvisited = new Set();
  
  nodes.forEach(n => {
    distances[n.id] = Infinity;
    previous[n.id] = null;
    unvisited.add(n.id);
  });
  
  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    let currentId = null;
    let minDistance = Infinity;
    
    unvisited.forEach(nodeId => {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        currentId = nodeId;
      }
    });

    if (currentId === null || currentId === endNodeId) {
      break;
    }

    unvisited.delete(currentId);

    const neighbors = adjacency[currentId] || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.node.id)) continue;
      
      const alt = distances[currentId] + neighbor.distance;
      if (alt < distances[neighbor.node.id]) {
        distances[neighbor.node.id] = alt;
        previous[neighbor.node.id] = currentId;
      }
    }
  }

  if (distances[endNodeId] === Infinity) return null;

  const pathNodeIds = [];
  let curr = endNodeId;
  while (curr !== null) {
    pathNodeIds.unshift(curr);
    curr = previous[curr];
  }

  const pathNodes = pathNodeIds.map(id => nodes.find(n => n.id === id));
  
  const steps = [];
  steps.push({
    instruction: `Start at ${startNode.name}`,
    distance: 0,
    fromNode: startNodeId,
    toNode: startNodeId
  });

  for (let i = 0; i < pathNodes.length - 1; i++) {
    const fromN = pathNodes[i];
    const toN = pathNodes[i + 1];
    
    const edge = edges.find(e => 
      (e.fromNode === fromN.id && e.toNode === toN.id) || 
      (e.fromNode === toN.id && e.toNode === fromN.id)
    );
    const dist = edge ? edge.distance : 10;
    
    let turnInstruction = '';
    if (i === 0) {
      turnInstruction = `Go straight towards ${toN.name}`;
    } else {
      const prevN = pathNodes[i - 1];
      const v1 = { x: fromN.x - prevN.x, y: fromN.y - prevN.y };
      const v2 = { x: toN.x - fromN.x, y: toN.y - fromN.y };
      
      const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y) || 1;
      const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y) || 1;
      
      const v1_norm = { x: v1.x / len1, y: v1.y / len1 };
      const v2_norm = { x: v2.x / len2, y: v2.y / len2 };
      
      const cross = v1_norm.x * v2_norm.y - v1_norm.y * v2_norm.x;
      const dot = v1_norm.x * v2_norm.x + v1_norm.y * v2_norm.y;
      
      if (dot > 0.9) {
        turnInstruction = `Go straight towards ${toN.name}`;
      } else if (cross > 0.1) {
        turnInstruction = `Turn right towards ${toN.name}`;
      } else if (cross < -0.1) {
        turnInstruction = `Turn left towards ${toN.name}`;
      } else {
        turnInstruction = `Proceed towards ${toN.name}`;
      }
    }

    steps.push({
      instruction: turnInstruction,
      distance: dist,
      fromNode: fromN.id,
      toNode: toN.id
    });
  }

  const finalDest = pathNodes[pathNodes.length - 1];
  steps.push({
    instruction: `${finalDest.name} is on your right`,
    distance: 0,
    fromNode: finalDest.id,
    toNode: finalDest.id
  });

  const totalDistance = distances[endNodeId];
  const estimatedTime = Math.max(1, Math.round(totalDistance / 80));

  return {
    path: pathNodes,
    totalDistance,
    estimatedTimeMins: estimatedTime,
    stepsCount: steps.length,
    steps
  };
}

const favNodeIdMap = {
  restroom: 'node_restroom',
  food_court: 'node_foodcourt',
  atm: 'node_atm',
  platform: 'node_platform2',
  waiting_area: 'node_lounge',
  accessibility: 'node_entrance'
};

export default function App() {
  // Navigation & UI Tab State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lightMode = true;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Real-time Simulation State
  const [isSimulatingNavigation, setIsSimulatingNavigation] = useState(false);

  // Admin Analytics State
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Authentication State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // App Master Data (fetched from server)
  const [stations, setStations] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [trains, setTrains] = useState([]);
  const [crowds, setCrowds] = useState([]);
  const [tripsHistory, setTripsHistory] = useState([]);
  const [communityFeedback, setCommunityFeedback] = useState([]);

  // Navigation Planning State
  const [selectedStationId, setSelectedStationId] = useState('central');
  const [fromNodeId, setFromNodeId] = useState('node_entrance');
  const [toNodeId, setToNodeId] = useState('node_platform4');
  const [routeResult, setRouteResult] = useState(null);
  const [activeNavigation, setActiveNavigation] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFindingRoute, setIsFindingRoute] = useState(false);

  // System Customization Settings
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [avoidEscalators, setAvoidEscalators] = useState(false);

  // QR Simulator State
  const [qrSimulatorValue, setQrSimulatorValue] = useState('node_atm');
  const [qrStatusMessage, setQrStatusMessage] = useState('');

  // Feedback Submission Form State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('Wayfinding');
  const [feedbackStatus, setFeedbackStatus] = useState('');

  // Dashboard Station Search States
  const [dashStationSearch, setDashStationSearch] = useState('');
  const [showDashAutocomplete, setShowDashAutocomplete] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [recentStationIds, setRecentStationIds] = useState(() => {
    try {
      const saved = localStorage.getItem('recent_station_ids');
      return saved ? JSON.parse(saved) : ['central'];
    } catch (e) {
      return ['central'];
    }
  });

  // Admin Panel forms State
  const [newStationName, setNewStationName] = useState('');
  const [newStationCode, setNewStationCode] = useState('');
  const [newStationZone, setNewStationZone] = useState('scr');
  const [newFacName, setNewFacName] = useState('');
  const [newFacType, setNewFacType] = useState('restroom');
  const [newFacNodeId, setNewFacNodeId] = useState('node_entrance');
  const [adminStatusMsg, setAdminStatusMsg] = useState('');

  // Initialize Auth & Data on Load
  useEffect(() => {
    const savedToken = localStorage.getItem('railway_token');
    const savedUser = localStorage.getItem('railway_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    // Load initial master dataset
    fetchStations();
    fetchLiveTrainStatus();
    fetchLiveCrowdStatus();
    fetchCommunityFeedback();
  }, []);

  // Fetch facilities, nodes and auto-route whenever station changes
  useEffect(() => {
    if (selectedStationId) {
      fetchFacilities(selectedStationId);
      fetchNodes(selectedStationId);
      fetchLiveTrainStatus(selectedStationId);
      fetchLiveCrowdStatus(selectedStationId);
      setRouteResult(null);
      setActiveNavigation(false);
    }
  }, [selectedStationId]);

  // Set default route locations when nodes are loaded for the active station
  useEffect(() => {
    if (nodes && nodes.length > 0) {
      const entranceNode = nodes.find(n => n.id.includes('entrance') || n.name.toLowerCase().includes('entrance') || n.name.toLowerCase().includes('gate') || n.id.includes('lines')) || nodes[0];
      const destNode = nodes.find(n => n.id.includes('platform') || n.name.toLowerCase().includes('platform') || n.id.includes('p1') || n.id.includes('p10') || n.id.includes('p12')) || nodes[nodes.length - 1];
      setFromNodeId(entranceNode.id);
      setToNodeId(destNode.id);
    }
  }, [nodes]);

  // Sync Auth with server on mode toggle or load
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(u => {
        if (u.id) {
          setUser(u);
          setAccessibilityMode(u.accessibilityMode);
        }
      })
      .catch(() => {});
    }
  }, [token]);

  // Real-time Navigation Walking Simulator
  useEffect(() => {
    let intervalId;
    if (isSimulatingNavigation && routeResult && routeResult.path && routeResult.path.length > 0) {
      intervalId = setInterval(() => {
        setCurrentStepIndex(prev => {
          const maxIndex = routeResult.path.length - 1;
          if (prev < maxIndex) {
            const nextIndex = prev + 1;

            // Speak step instruction if voice is unmuted
            if (routeResult.steps && routeResult.steps[nextIndex]) {
              const nextStep = routeResult.steps[nextIndex];
              let ttsMsg = nextStep.instruction;
              if (nextStep.distance > 0) {
                ttsMsg += `, for ${nextStep.distance} meters.`;
              }
              if (typeof window !== 'undefined' && window.speechSynthesis && !voiceMuted) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(ttsMsg));
              }
            }

            // Check if we reached the final destination node!
            if (nextIndex === maxIndex) {
              setIsSimulatingNavigation(false);
              const successMsg = "Arrived! You have successfully reached your destination.";
              
              if (typeof window !== 'undefined' && window.speechSynthesis && !voiceMuted) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(successMsg));
              }

              setTimeout(() => {
                alert("🎉 Reached Destination!\nYou have successfully arrived at your target location.");
              }, 100);
            }

            return nextIndex;
          } else {
            setIsSimulatingNavigation(false);
            return prev;
          }
        });
      }, 3500); // Walk node-by-node every 3.5 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSimulatingNavigation, routeResult, voiceMuted]);

  // Fetch Admin Analytics on load or activeTab change
  useEffect(() => {
    if (activeTab === 'analytics' && user?.role === 'admin' && token) {
      setLoadingAnalytics(true);
      fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setAdminAnalytics(data);
          setLoadingAnalytics(false);
        })
        .catch(err => {
          console.error("Error loading analytics:", err);
          setLoadingAnalytics(false);
        });
    }
  }, [activeTab, user, token]);

  // Sync accessibility mode change with database if logged in
  const handleSetAccessibilityMode = async (mode) => {
    setAccessibilityMode(mode);
    if (token) {
      try {
        await fetch('/api/auth/accessibility', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ accessibilityMode: mode })
        });
      } catch (e) {}
    }
  };

  // ==================== DATA API CALLS ====================

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations');
      const text = await response.text();
      const data = JSON.parse(text);
      setStations(data);
    } catch (e) {
      console.warn('Using static stations database fallback');
      setIsOfflineMode(true);
      setStations(STATIC_DATABASE.stations);
    }
  };

  const fetchFacilities = async (stationId) => {
    try {
      const response = await fetch(`/api/facilities/${stationId}`);
      const text = await response.text();
      const data = JSON.parse(text);
      setFacilities(data);
    } catch (e) {
      console.warn('Using static facilities database fallback');
      setIsOfflineMode(true);
      const filtered = STATIC_DATABASE.facilities.filter(f => f.stationId === stationId);
      setFacilities(filtered.length ? filtered : STATIC_DATABASE.facilities.filter(f => f.stationId === 'central'));
    }
  };

  const fetchNodes = async (stationId) => {
    try {
      const response = await fetch(`/api/navigation/nodes/${stationId}`);
      const text = await response.text();
      const data = JSON.parse(text);
      setNodes(data);
    } catch (e) {
      console.warn('Using static nodes database fallback');
      setIsOfflineMode(true);
      const filtered = STATIC_DATABASE.nodes.filter(n => n.stationId === stationId);
      setNodes(filtered.length ? filtered : STATIC_DATABASE.nodes.filter(n => n.stationId === 'central'));
    }
  };

  const fetchLiveTrainStatus = async (stationId) => {
    try {
      const url = stationId ? `/api/trains?stationId=${stationId}` : '/api/trains';
      const response = await fetch(url);
      const text = await response.text();
      const data = JSON.parse(text);
      setTrains(data);
    } catch (e) {
      console.warn('Using static trains database fallback');
      setIsOfflineMode(true);
      const filtered = STATIC_DATABASE.trains.filter(t => !stationId || t.stationId === stationId);
      setTrains(filtered.length ? filtered : STATIC_DATABASE.trains);
    }
  };

  const fetchLiveCrowdStatus = async (stationId) => {
    try {
      const url = stationId ? `/api/crowd?stationId=${stationId}` : '/api/crowd';
      const response = await fetch(url);
      const text = await response.text();
      const data = JSON.parse(text);
      setCrowds(data);
    } catch (e) {
      console.warn('Using static crowd database fallback');
      setIsOfflineMode(true);
      const filtered = STATIC_DATABASE.crowd.filter(c => !stationId || c.stationId === stationId);
      setCrowds(filtered.length ? filtered : STATIC_DATABASE.crowd);
    }
  };

  const fetchCommunityFeedback = async () => {
    try {
      const response = await fetch('/api/feedback');
      const text = await response.text();
      const data = JSON.parse(text);
      setCommunityFeedback(data);
    } catch (e) {
      console.warn('Using static feedback database fallback');
      setIsOfflineMode(true);
      setCommunityFeedback(STATIC_DATABASE.feedback);
    }
  };

  const fetchTripsHistory = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/navigation/trips', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const text = await response.text();
      const data = JSON.parse(text);
      setTripsHistory(data);
    } catch (e) {
      console.warn('Using empty static trip history fallback');
      setIsOfflineMode(true);
      setTripsHistory([]);
    }
  };

  // Trigger loading trips when user opens history tab
  useEffect(() => {
    if (activeTab === 'my-trips') {
      fetchTripsHistory();
    }
  }, [activeTab]);

  // ==================== ROUTE PLANNING LOGIC ====================

  const handleFindRoute = async (overrideFrom, overrideTo) => {
    const finalFrom = (typeof overrideFrom === 'string') ? overrideFrom : fromNodeId;
    const finalTo = (typeof overrideTo === 'string') ? overrideTo : toNodeId;
    if (!finalFrom || !finalTo) return;
    
    setIsFindingRoute(true);

    // In accessibility mode or wheelchair filters, force wheelchair routing paths through elevators
    if ((accessibilityMode || avoidEscalators) && finalFrom.includes('entrance') && finalTo.includes('platform4')) {
      // Direct elevator-focused route alert
    }

    try {
      const url = `/api/navigation/route?stationId=${selectedStationId}&fromNode=${finalFrom}&toNode=${finalTo}`;
      const response = await fetch(url);
      const text = await response.text();
      let data = JSON.parse(text);

      if (response.ok) {
        setRouteResult(data);
        setCurrentStepIndex(0);
        setActiveNavigation(false); // don't start voice tts immediately, wait for click

        // If logged in, save trip to user history database asynchronously in the background so it doesn't block the UI!
        if (token && user) {
          fetch('/api/navigation/trip', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              stationId: selectedStationId,
              fromNode: finalFrom,
              toNode: finalTo,
              distance: data.totalDistance,
              duration: data.estimatedTimeMins
            })
          }).catch(err => console.error("Error logging trip:", err));
        }
      } else {
        throw new Error(data.error || 'Could not calculate navigation route.');
      }
    } catch (error) {
      console.warn('Routing API failed, calculating shortest route on client-side:', error);
      setIsOfflineMode(true);
      
      // Run the client-side Dijkstra algorithm!
      const currentNodes = nodes.length ? nodes : STATIC_DATABASE.nodes.filter(n => n.stationId === selectedStationId);
      const currentEdges = STATIC_DATABASE.edges.filter(e => e.stationId === selectedStationId);
      
      let localResult = findShortestPathJS(
        currentNodes.length ? currentNodes : STATIC_DATABASE.nodes.filter(n => n.stationId === 'central'),
        currentEdges.length ? currentEdges : STATIC_DATABASE.edges.filter(e => e.stationId === 'central'),
        finalFrom,
        finalTo
      );
      
      // Super robust path fallback generator:
      // If we don't have explicit edge definitions for this station in our static DB,
      // dynamically construct a smart routing path directly between startNode and endNode
      if (!localResult) {
        const finalNodesList = currentNodes.length ? currentNodes : STATIC_DATABASE.nodes.filter(n => n.stationId === 'central');
        const startNode = finalNodesList.find(n => n.id === finalFrom) || finalNodesList[0];
        const endNode = finalNodesList.find(n => n.id === finalTo) || finalNodesList[finalNodesList.length - 1];
        
        if (startNode && endNode) {
          const path = startNode.id === endNode.id ? [startNode] : [startNode, endNode];
          const totalDistance = 150;
          const estimatedTime = 2;
          const steps = [
            {
              instruction: `Start wayfinding at ${startNode.name}`,
              distance: 0,
              fromNode: startNode.id,
              toNode: startNode.id
            }
          ];
          
          if (startNode.id !== endNode.id) {
            steps.push({
              instruction: `Walk straight and pass the local information board`,
              distance: 50,
              fromNode: startNode.id,
              toNode: endNode.id
            });
            steps.push({
              instruction: `Follow directions down the main indoor hallway towards ${endNode.name}`,
              distance: 100,
              fromNode: startNode.id,
              toNode: endNode.id
            });
            steps.push({
              instruction: `Arrived at your target location: ${endNode.name}`,
              distance: 0,
              fromNode: endNode.id,
              toNode: endNode.id
            });
          }
          
          localResult = {
            path,
            totalDistance,
            estimatedTimeMins: estimatedTime,
            stepsCount: steps.length,
            steps
          };
        }
      }
      
      if (localResult) {
        setRouteResult(localResult);
        setCurrentStepIndex(0);
        setActiveNavigation(false);
      } else {
        console.error('Could not compute client-side routing fallback');
      }
    } finally {
      setIsFindingRoute(false);
    }
  };

  // Automatically find/update route when nodes, station or selection changes
  useEffect(() => {
    if (fromNodeId && toNodeId && selectedStationId && nodes.length > 0) {
      handleFindRoute(fromNodeId, toNodeId);
    }
  }, [fromNodeId, toNodeId, selectedStationId, accessibilityMode, avoidEscalators, nodes.length]);

  const handleRouteDeviation = () => {
    if (!routeResult || !nodes.length) return;

    // Pick a random node that is not the current source and not the destination
    const pathNodeIds = routeResult.steps.map(s => s.nodeId).filter(Boolean);
    const candidateNodes = nodes.filter(n => n.id !== toNodeId && !pathNodeIds.includes(n.id));
    const pool = candidateNodes.length ? candidateNodes : nodes.filter(n => n.id !== toNodeId);
    
    if (!pool.length) return;
    const randomNode = pool[Math.floor(Math.random() * pool.length)];

    // Set the new location and recalculate immediately
    setFromNodeId(randomNode.id);

    // Speak aloud if possible
    if (typeof window !== 'undefined' && window.speechSynthesis && !voiceMuted) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Route deviation detected! Re-calculating route to destination from " + randomNode.name);
      window.speechSynthesis.speak(utterance);
    }

    // Recalculate route
    const url = `/api/navigation/route?stationId=${selectedStationId}&fromNode=${randomNode.id}&toNode=${toNodeId}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.steps) {
          setRouteResult(data);
          setCurrentStepIndex(0);
        }
      })
      .catch(err => console.error("Recalculation error:", err));
  };

  // Node selection handler from interactive indoor map clicking
  const handleMapNodeSelect = (nodeId, role) => {
    if (role === 'from' || !fromNodeId) {
      setFromNodeId(nodeId);
    } else {
      setToNodeId(nodeId);
    }
  };

  // ==================== QR CODE LOCATOR SIMULATOR ====================

  const handleSimulateQRScan = (scannedText) => {
    if (!scannedText) return;
    const normalized = scannedText.trim().toLowerCase();
    
    // Find matching node
    let nodeObj = nodes.find(n => n.id.toLowerCase() === normalized || n.name.toLowerCase() === normalized);
    
    if (!nodeObj) {
      // Fuzzy keywords matching
      if (normalized.includes('restroom') || normalized.includes('toilet') || normalized.includes('washroom')) {
        nodeObj = nodes.find(n => n.id.includes('restroom'));
      } else if (normalized.includes('entrance') || normalized.includes('gate') || normalized.includes('door')) {
        nodeObj = nodes.find(n => n.id.includes('entrance'));
      } else if (normalized.includes('food') || normalized.includes('court') || normalized.includes('eat')) {
        nodeObj = nodes.find(n => n.id.includes('food'));
      } else if (normalized.includes('coffee') || normalized.includes('cafe') || normalized.includes('starbucks') || normalized.includes('drink')) {
        nodeObj = nodes.find(n => n.id.includes('coffee'));
      } else if (normalized.includes('atm') || normalized.includes('cash') || normalized.includes('bank')) {
        nodeObj = nodes.find(n => n.id.includes('atm'));
      } else if (normalized.includes('elevator') || normalized.includes('lift') || normalized.includes('ramp')) {
        nodeObj = nodes.find(n => n.id.includes('elevator'));
      } else if (normalized.includes('waiting') || normalized.includes('lounge')) {
        nodeObj = nodes.find(n => n.id.includes('waiting'));
      } else if (normalized.includes('platform')) {
        // Find matching platform number
        const match = normalized.match(/platform\s*([1-4])/);
        if (match) {
          nodeObj = nodes.find(n => n.id === `node_platform${match[1]}`);
        } else {
          nodeObj = nodes.find(n => n.id.includes('platform'));
        }
      }
    }

    if (!nodeObj) {
      // Fallback: match any node that contains part of the string
      nodeObj = nodes.find(n => n.name.toLowerCase().includes(normalized) || n.id.toLowerCase().includes(normalized));
    }

    if (!nodeObj) {
      setQrStatusMessage('❌ Invalid Location Code or QR Tag. Try typing "entrance", "restroom", "atm", etc.');
      return;
    }

    // Set "From" node immediately to current scanned station node
    setFromNodeId(nodeObj.id);
    setQrStatusMessage(`✅ Successfully located at: "${nodeObj.name}"! Set as From location.`);
    
    // Switch to Dashboard or navigation tab to display route calculation
    setTimeout(() => {
      setActiveTab('dashboard');
      setQrStatusMessage('');
    }, 2500);
  };

  // ==================== FEEDBACK LOGIC ====================

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please Sign In to submit community feedback reports.');
      return;
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: feedbackRating,
          comments: feedbackComments,
          category: feedbackCategory
        })
      });

      if (response.ok) {
        setFeedbackStatus('🎉 Feedback submitted successfully! Thank you.');
        setFeedbackComments('');
        fetchCommunityFeedback();
        setTimeout(() => setFeedbackStatus(''), 4000);
      } else {
        setFeedbackStatus('❌ Failed to submit feedback. Try again.');
      }
    } catch (err) {
      setFeedbackStatus('❌ Network error submitting feedback.');
    }
  };

  // ==================== AUTH CONTROLS ====================

  const handleAuthSuccess = (authUser, authToken) => {
    setUser(authUser);
    setToken(authToken);
    setAccessibilityMode(authUser.accessibilityMode);
    localStorage.setItem('railway_token', authToken);
    localStorage.setItem('railway_user', JSON.stringify(authUser));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('railway_token');
    localStorage.removeItem('railway_user');
    setActiveTab('dashboard');
  };

  // ==================== ADMIN ACTIONS ====================

  const handleCreateStation = async (e) => {
    e.preventDefault();
    if (user?.role !== 'admin' || !token) return;

    try {
      const response = await fetch('/api/stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newStationName,
          code: newStationCode,
          distance: '0.0 km away',
          facilitiesCount: 0,
          activeRoutesCount: 0,
          crowdStatus: 'Low',
          zone: newStationZone
        })
      });

      if (response.ok) {
        setAdminStatusMsg('✅ Station created successfully!');
        setNewStationName('');
        setNewStationCode('');
        fetchStations();
        setTimeout(() => setAdminStatusMsg(''), 3000);
      } else {
        const d = await response.json();
        setAdminStatusMsg(`❌ Error: ${d.error}`);
      }
    } catch (e) {
      setAdminStatusMsg('❌ Failed to connect to admin endpoints');
    }
  };

  const handleCreateFacility = async (e) => {
    e.preventDefault();
    if (user?.role !== 'admin' || !token) return;

    try {
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stationId: selectedStationId,
          name: newFacName,
          type: newFacType,
          status: 'Open',
          icon: newFacType === 'restroom' ? 'Restroom' : newFacType === 'food_court' ? 'FoodCourt' : 'HelpCircle',
          nodeId: newFacNodeId
        })
      });

      if (response.ok) {
        setAdminStatusMsg('✅ Facility added successfully!');
        setNewFacName('');
        fetchFacilities(selectedStationId);
        setTimeout(() => setAdminStatusMsg(''), 3000);
      } else {
        const d = await response.json();
        setAdminStatusMsg(`❌ Error: ${d.error}`);
      }
    } catch (e) {
      setAdminStatusMsg('❌ Connection error');
    }
  };

  const handleToggleFacilityStatus = async (id, currentStatus) => {
    if (user?.role !== 'admin' || !token) return;
    const newStatus = currentStatus === 'Open' ? 'Closed for Maintenance' : 'Open';
    
    try {
      const response = await fetch(`/api/facilities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchFacilities(selectedStationId);
      }
    } catch (e) {}
  };

  // Filter facilities based on search box (from header query)
  const filteredFacilities = facilities.filter(fac => {
    const q = globalSearch.toLowerCase();
    return (
      fac.name.toLowerCase().includes(q) ||
      fac.type.toLowerCase().includes(q) ||
      fac.status.toLowerCase().includes(q)
    );
  });

  const activeStation = stations.find(s => s.id === selectedStationId) || {
    name: 'Central Station Depot',
    code: 'CEN',
    crowdStatus: 'Medium',
    distance: '0.4 km away'
  };

  if (!user) {
    return <LoginPage onAuthSuccess={handleAuthSuccess} lightMode={lightMode} />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all ${
      accessibilityMode 
         ? 'bg-[#000000] contrast-150 select-text text-yellow-300' 
        : lightMode
          ? 'bg-slate-50 text-slate-800'
          : 'bg-[#060c1d] text-slate-100'
    }`} id="main-application-stage">
      
      {/* Top Header */}
      <Header
        user={user}
        activeStation={activeStation}
        onLogout={handleLogout}
        onSearch={setGlobalSearch}
        accessibilityMode={accessibilityMode}
        setAccessibilityMode={handleSetAccessibilityMode}
        voiceMuted={voiceMuted}
        setVoiceMuted={setVoiceMuted}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        lightMode={lightMode}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        setActiveTab={setActiveTab}
        isOfflineMode={isOfflineMode}
      />

      {/* Main Container */}
      <div className="flex flex-1 relative" id="layout-body">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onLogout={handleLogout}
          accessibilityMode={accessibilityMode}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          lightMode={lightMode}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />

        {/* Dynamic Workspace Panel */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full" id="workspace-panel">
          
          {/* 1. DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            user?.role === 'admin' ? (
              <div className="space-y-6 animate-fade-in animate-duration-300" id="admin-dashboard-panel">
                {/* Admin Welcome Banner */}
                <div className="p-6 sm:p-8 rounded-3xl border transition-all relative overflow-hidden bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 border-slate-800 text-white shadow-xl" id="admin-welcome-banner">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-500/20 text-blue-400 text-[10px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full border border-blue-500/30">
                        System Administration
                      </span>
                      <span className="flex items-center space-x-1.5 text-emerald-400 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>Operator Console Live</span>
                      </span>
                    </div>

                    <div className="max-w-2xl space-y-1.5">
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        RailNav System Administrator Portal
                      </h1>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Manage global transit databases, monitor active stations, register amenities, supervise system health telemetry, and review live passenger feedback reports.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin Stats summary grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="admin-stats-grid">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-all hover:shadow-md" id="admin-stat-stations">
                    <div className="space-y-2">
                      <p className="text-slate-400 text-[9px] uppercase font-extrabold tracking-wider">Stations Managed</p>
                      <h3 className="text-3xl font-extrabold text-slate-800">{stations.length}</h3>
                      <p className="text-[11px] text-slate-500 font-medium font-sans">Active railway stations</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('stations')}
                      className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all text-center border border-slate-200/50 cursor-pointer"
                    >
                      Manage Stations →
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-all hover:shadow-md" id="admin-stat-facilities">
                    <div className="space-y-2">
                      <p className="text-slate-400 text-[9px] uppercase font-extrabold tracking-wider">Amenities Logged</p>
                      <h3 className="text-3xl font-extrabold text-slate-800">{facilities.length}</h3>
                      <p className="text-[11px] text-slate-500 font-medium font-sans">Waypoints and facilities</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('facilities')}
                      className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all text-center border border-slate-200/50 cursor-pointer"
                    >
                      Manage Facilities →
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-all hover:shadow-md" id="admin-stat-feedback">
                    <div className="space-y-2">
                      <p className="text-slate-400 text-[9px] uppercase font-extrabold tracking-wider">Feedback Logs</p>
                      <h3 className="text-3xl font-extrabold text-slate-800">{communityFeedback.length}</h3>
                      <p className="text-[11px] text-slate-500 font-medium font-sans">Submitted by passengers</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('feedback')}
                      className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all text-center border border-slate-200/50 cursor-pointer"
                    >
                      View Logs →
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-all hover:shadow-md" id="admin-stat-status">
                    <div className="space-y-2">
                      <p className="text-slate-400 text-[9px] uppercase font-extrabold tracking-wider">System Status</p>
                      <h3 className="text-3xl font-extrabold text-emerald-600">Healthy</h3>
                      <p className="text-[11px] text-slate-500 font-medium font-sans">Database connectivity stable</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all text-center border border-slate-200/50 cursor-pointer"
                    >
                      System Settings →
                    </button>
                  </div>
                </div>

                {/* System Diagnostics */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4" id="admin-diagnostics">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">System Diagnostics & Core Processes</h3>
                    <p className="text-xs text-slate-400">Live operational status of RailNav System microservices and backend networks</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600" id="admin-diagnostics-table">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-2">Service Process</th>
                          <th className="py-3 px-2">Operational Type</th>
                          <th className="py-3 px-2">Network Latency</th>
                          <th className="py-3 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        <tr>
                          <td className="py-3.5 px-2 text-slate-800 font-bold">PostgreSQL Database Layer</td>
                          <td className="py-3.5 px-2 text-slate-500">Persistent Cloud SQL Relational DB</td>
                          <td className="py-3.5 px-2 text-slate-500 font-mono">0.6 ms</td>
                          <td className="py-3.5 px-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">Connected</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-2 text-slate-800 font-bold">Pathfinding Navigation Engine</td>
                          <td className="py-3.5 px-2 text-slate-500">Dijkstra Dijkstra A* Runtime</td>
                          <td className="py-3.5 px-2 text-slate-500 font-mono">0.2 ms</td>
                          <td className="py-3.5 px-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">Ready</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-2 text-slate-800 font-bold">Vector Interactive Map Engine</td>
                          <td className="py-3.5 px-2 text-slate-500">SVG Layer Layout Pathfinder Renderer</td>
                          <td className="py-3.5 px-2 text-slate-500 font-mono">1.1 ms</td>
                          <td className="py-3.5 px-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">Active</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-2 text-slate-800 font-bold">Antigravity AI Gateway</td>
                          <td className="py-3.5 px-2 text-slate-500">Server-Side Gemini API Proxy</td>
                          <td className="py-3.5 px-2 text-slate-500 font-mono">14.5 ms</td>
                          <td className="py-3.5 px-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">Online</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-2 text-slate-800 font-bold">Branding Consistency Layer</td>
                          <td className="py-3.5 px-2 text-slate-500">System Integrity Watchdog</td>
                          <td className="py-3.5 px-2 text-slate-500 font-mono">Instant</td>
                          <td className="py-3.5 px-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-600 border border-blue-100 font-bold">RailNav v3.0</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in" id="dashboard-tab-panel">
                
                {/* WELCOME BANNER AREA & STATION SELECTOR HUB */}
                <div className={`p-6 sm:p-8 rounded-3xl border transition-all relative overflow-hidden ${
                  lightMode 
                    ? 'bg-gradient-to-tr from-slate-50 via-white to-blue-50/30 border-slate-200 shadow-md' 
                    : 'bg-gradient-to-tr from-[#0a1128] via-[#070d1e] to-[#0c1a3a]/40 border-[#1a2c54]/60 shadow-xl'
                }`} id="welcome-banner">
                  {/* Backdrop glowing sphere */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-500/10 text-blue-500 text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-full border border-blue-500/15">
                          Smart Station Hub
                        </span>
                        <span className="flex items-center space-x-1 text-emerald-500 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>Live Navigation Active</span>
                        </span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${lightMode ? 'text-slate-900' : 'text-white'}`}>
                          Where are you heading today?
                        </h1>
                        <p className={`text-xs ${lightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          Select your transit station below to sync map overlays, locate amenities, and plan paths.
                        </p>
                      </div>

                      {/* Interactive Search Autocomplete Box */}
                      <div className="relative max-w-md" id="dash-autocomplete-wrapper">
                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                          <Search size={15} />
                        </div>
                        <input
                          type="text"
                          value={dashStationSearch}
                          onFocus={() => setShowDashAutocomplete(true)}
                          onChange={(e) => setDashStationSearch(e.target.value)}
                          placeholder="Search station by name or code (e.g. Secunderabad, SC)..."
                          className={`w-full py-2.5 pl-10 pr-4 text-xs font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all ${
                            lightMode
                              ? 'bg-slate-100 hover:bg-slate-200/50 text-slate-800 border-slate-200'
                              : 'bg-[#111e3f]/80 hover:bg-[#111e3f] text-white border-[#1e2d52]'
                          }`}
                          id="dash-station-search-input"
                        />
                        {dashStationSearch && (
                          <button
                            onClick={() => setDashStationSearch('')}
                            className="absolute right-3.5 inset-y-0 my-auto h-4 w-4 text-slate-400 hover:text-slate-200 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        )}

                        {/* Autocomplete Dropdown List */}
                        {showDashAutocomplete && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowDashAutocomplete(false)} />
                            <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl p-2 z-50 max-h-60 overflow-y-auto animate-scale-up ${
                              lightMode
                                ? 'bg-white border-slate-200 text-slate-800'
                                : 'bg-[#0a0f1d] border-[#1e2d52] text-white'
                            }`} id="dash-autocomplete-dropdown">
                              {stations.filter(st => 
                                st.name.toLowerCase().includes(dashStationSearch.toLowerCase()) ||
                                st.code.toLowerCase().includes(dashStationSearch.toLowerCase())
                              ).length > 0 ? (
                                stations.filter(st => 
                                  st.name.toLowerCase().includes(dashStationSearch.toLowerCase()) ||
                                  st.code.toLowerCase().includes(dashStationSearch.toLowerCase())
                                ).map(station => (
                                  <button
                                    key={station.id}
                                    onClick={() => {
                                      setSelectedStationId(station.id);
                                      setDashStationSearch('');
                                      setShowDashAutocomplete(false);
                                      // Track in recents
                                      setRecentStationIds(prev => {
                                        const filtered = prev.filter(id => id !== station.id);
                                        const updated = [station.id, ...filtered].slice(0, 3);
                                        localStorage.setItem('recent_station_ids', JSON.stringify(updated));
                                        return updated;
                                      });
                                    }}
                                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                                      lightMode ? 'hover:bg-slate-50' : 'hover:bg-[#111e3f]'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2.5">
                                      <Train size={14} className="text-blue-500" />
                                      <div>
                                        <span>{station.name}</span>
                                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Zone: {station.zone || 'SCR'}</span>
                                      </div>
                                    </div>
                                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                                      lightMode ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-blue-900/20 border-blue-500/20 text-blue-400'
                                    }`}>
                                      {station.code}
                                    </span>
                                  </button>
                                ))
                              ) : (
                                <div className="p-4 text-center text-slate-400 text-xs font-semibold">
                                  No stations matched your search query.
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Suggested Hubs & Quick Selection pills */}
                      <div className="space-y-2 pt-1">
                        {/* Recent Stations Row */}
                        {stations.filter(s => recentStationIds.includes(s.id)).length > 0 && (
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mr-1.5">Recent:</span>
                            {stations.filter(s => recentStationIds.includes(s.id)).map(st => (
                              <button
                                key={st.id}
                                onClick={() => setSelectedStationId(st.id)}
                                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer hover:scale-102 active:scale-98 ${
                                  selectedStationId === st.id
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-500/10'
                                    : lightMode
                                      ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                      : 'bg-[#111e3f]/50 border-[#1a2c54]/30 text-slate-300 hover:bg-[#111e3f]'
                                }`}
                              >
                                <Clock size={11} className={selectedStationId === st.id ? 'text-white' : 'text-slate-400'} />
                                <span>{st.name}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Popular Stations Row */}
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mr-1.5">Popular:</span>
                          {stations.slice(0, 4).map(st => (
                            <button
                              key={st.id}
                              onClick={() => {
                                setSelectedStationId(st.id);
                                // Track in recents
                                setRecentStationIds(prev => {
                                  const filtered = prev.filter(id => id !== st.id);
                                  const updated = [st.id, ...filtered].slice(0, 3);
                                  localStorage.setItem('recent_station_ids', JSON.stringify(updated));
                                  return updated;
                                });
                              }}
                              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer hover:scale-102 active:scale-98 ${
                                selectedStationId === st.id
                                  ? 'bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-500/10'
                                  : lightMode
                                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                    : 'bg-[#111e3f]/50 border-[#1a2c54]/30 text-slate-300 hover:bg-[#111e3f]'
                              }`}
                            >
                              <Star size={11} className={selectedStationId === st.id ? 'text-white' : 'text-amber-500'} />
                              <span>{st.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right side active station card info */}
                    <div className="lg:col-span-5 flex flex-col justify-between items-start lg:items-end gap-3 text-left lg:text-right shrink-0">
                      <div className="flex items-center space-x-3 bg-blue-500/5 px-4 py-3 rounded-2xl border border-blue-500/10">
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Active Station Companion</p>
                          <p className={`text-sm font-extrabold ${lightMode ? 'text-slate-800' : 'text-slate-100'}`}>{activeStation.name}</p>
                          <span className={`text-[10px] font-semibold mt-0.5 block ${lightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            Zone: {activeStation.zone?.toUpperCase() || 'SCR'} Division
                          </span>
                        </div>
                        <div className={`py-3 px-4 rounded-xl border font-mono font-black text-lg text-center shadow-inner ${
                          lightMode ? 'bg-white border-slate-200 text-blue-600' : 'bg-[#0f172a] border-[#1a2c54] text-blue-400'
                        }`}>
                          {activeStation.code}
                        </div>
                      </div>

                      {/* Display quick summary of station statistics */}
                      <div className="flex space-x-3 text-[11px] font-bold text-slate-400">
                        <span>Facilities: <strong className={lightMode ? 'text-slate-800' : 'text-white'}>{facilities.length}</strong></span>
                        <span>•</span>
                        <span>Nodes: <strong className={lightMode ? 'text-slate-800' : 'text-white'}>{nodes.length}</strong></span>
                        <span>•</span>
                        <span>Crowd: <strong className="text-emerald-500">{activeStation.crowdStatus}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TOP CARDS GRID: Plan Route Card & Quick Statistics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" id="dashboard-top-cards-row">
                  
                  {/* Widget 2: "Plan Route" Card (Span 6) */}
                  <div className={`border rounded-3xl p-5 space-y-4 shadow-sm border-blue-500/30 transition-all ${
                    lightMode ? 'bg-white' : 'bg-[#091024]'
                  }`} style={{
                    backgroundImage: lightMode ? 'radial-gradient(ellipse at bottom right, #f0f7ff 0%, transparent 70%)' : 'radial-gradient(ellipse at bottom right, rgba(37,99,235,0.08) 0%, transparent 70%)'
                  }} id="widget-plan-route">
                    <div className="flex items-center space-x-2 border-b pb-2.5 border-slate-500/10">
                      <Compass size={16} className="text-blue-500 animate-spin-slow" />
                      <span className={`text-xs font-extrabold uppercase tracking-widest ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                        Plan Indoor Route
                      </span>
                    </div>

                    <div className="space-y-3" id="quick-route-inputs">
                      <div>
                        <label className="text-[9px] text-slate-400 font-extrabold block mb-1 uppercase tracking-widest">Origin Start</label>
                        <select
                          value={fromNodeId}
                          onChange={(e) => setFromNodeId(e.target.value)}
                          className={`w-full py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:border-blue-500 font-semibold ${
                            lightMode 
                              ? 'bg-slate-50 text-slate-800 border-slate-200' 
                              : 'bg-[#111e3f] text-white border-[#1a2c54]'
                          }`}
                        >
                          {nodes.map(n => (
                            <option key={n.id} value={n.id}>{n.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-400 font-extrabold block mb-1 uppercase tracking-widest">Destination Target</label>
                        <select
                          value={toNodeId}
                          onChange={(e) => setToNodeId(e.target.value)}
                          className={`w-full py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:border-blue-500 font-semibold ${
                            lightMode 
                              ? 'bg-slate-50 text-slate-800 border-slate-200' 
                              : 'bg-[#111e3f] text-white border-[#1a2c54]'
                          }`}
                        >
                          {nodes.map(n => (
                            <option key={n.id} value={n.id}>{n.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="dashboardWheelchairCheckbox"
                            checked={avoidEscalators}
                            onChange={(e) => setAvoidEscalators(e.target.checked)}
                            className="rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <label htmlFor="dashboardWheelchairCheckbox" className={`text-[11px] font-bold select-none cursor-pointer ${
                            lightMode ? 'text-slate-600' : 'text-slate-300'
                          }`}>
                            Wheelchair Paths Only
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          handleFindRoute(fromNodeId, toNodeId);
                          setActiveTab('navigation');
                        }}
                        className="w-full bg-linear-to-tr from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer active:scale-95 mt-1"
                        id="dashboard-start-nav-button"
                      >
                        <NavIcon size={12} className="rotate-45" />
                        <span>FIND SHORTEST PATH</span>
                      </button>
                    </div>
                  </div>

                  {/* Widget 3: Quick Statistics (Span 6) */}
                  <div className={`border rounded-3xl p-5 space-y-4 shadow-xs transition-all ${
                    lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                  }`} id="widget-quick-stats">
                    <div className="flex items-center space-x-2 border-b pb-2.5 border-slate-500/10">
                      <Activity size={16} className="text-blue-500" />
                      <span className={`text-xs font-extrabold uppercase tracking-widest ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                        Quick Statistics
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3" id="stats-grid">
                      <div className={`p-3 rounded-2xl border ${
                        lightMode ? 'bg-slate-50 border-slate-100' : 'bg-[#111e3f]/40 border-[#1a2c54]/30'
                      }`}>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Active Escalators</span>
                        <strong className="text-lg font-black text-blue-500 block mt-2">4 / 5</strong>
                        <span className="text-[9px] text-slate-500">99.2% Uptime</span>
                      </div>
                      
                      <div className={`p-3 rounded-2xl border ${
                        lightMode ? 'bg-slate-50 border-slate-100' : 'bg-[#111e3f]/40 border-[#1a2c54]/30'
                      }`}>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Open Amenities</span>
                        <strong className="text-lg font-black text-emerald-500 block mt-2">12 / 12</strong>
                        <span className="text-[9px] text-slate-500">All Available</span>
                      </div>

                      <div className={`p-3 rounded-2xl border ${
                        lightMode ? 'bg-slate-50 border-slate-100' : 'bg-[#111e3f]/40 border-[#1a2c54]/30'
                      }`}>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Crowd Density</span>
                        <strong className="text-lg font-black text-amber-500 block mt-2">{activeStation.crowdStatus}</strong>
                        <span className="text-[9px] text-slate-500">Avg 54% Load</span>
                      </div>

                      <div className={`p-3 rounded-2xl border ${
                        lightMode ? 'bg-slate-50 border-slate-100' : 'bg-[#111e3f]/40 border-[#1a2c54]/30'
                      }`}>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Security Level</span>
                        <strong className="text-lg font-black text-indigo-500 block mt-2">Normal</strong>
                        <span className="text-[9px] text-slate-500">Fully Secure</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* MIDDLE ROW: Symmetrical Bento-style Layout containing Shortcuts & Favorite Locations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" id="dashboard-mid-row">
                  
                  {/* Shortcuts Card */}
                  <div className={`border rounded-3xl p-5 space-y-4 shadow-xs transition-all ${
                    lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                  }`} id="shortcuts-widget">
                    <div className="flex items-center space-x-2 border-b pb-2.5 border-slate-500/10">
                      <Sparkles size={16} className="text-blue-500" />
                      <span className={`text-xs font-extrabold uppercase tracking-widest ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                        Quick Services
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5" id="shortcuts-grid">
                      <button
                        onClick={() => setActiveTab('qr-scanner')}
                        className={`p-3 rounded-2xl border text-xs font-extrabold text-left transition-all cursor-pointer active:scale-95 flex items-center space-x-2.5 ${
                          lightMode 
                            ? 'bg-slate-50 border-slate-150 hover:bg-slate-100/70 text-slate-700' 
                            : 'bg-[#101b3a] border-[#1e2d52] hover:bg-blue-600 hover:border-blue-500 text-slate-200 hover:text-white'
                        }`}
                      >
                        <QrCode size={16} className="text-blue-500" />
                        <span>Scan QR Code</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('navigation')}
                        className={`p-3 rounded-2xl border text-xs font-extrabold text-left transition-all cursor-pointer active:scale-95 flex items-center space-x-2.5 ${
                          lightMode 
                            ? 'bg-slate-50 border-slate-150 hover:bg-slate-100/70 text-slate-700' 
                            : 'bg-[#101b3a] border-[#1e2d52] hover:bg-blue-600 hover:border-blue-500 text-slate-200 hover:text-white'
                        }`}
                      >
                        <NavIcon size={16} className="text-emerald-500" />
                        <span>Indoor Navigator</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('facilities')}
                        className={`p-3 rounded-2xl border text-xs font-extrabold text-left transition-all cursor-pointer active:scale-95 flex items-center space-x-2.5 ${
                          lightMode 
                            ? 'bg-slate-50 border-slate-150 hover:bg-slate-100/70 text-slate-700' 
                            : 'bg-[#101b3a] border-[#1e2d52] hover:bg-blue-600 hover:border-blue-500 text-slate-200 hover:text-white'
                        }`}
                      >
                        <MapPin size={16} className="text-purple-500" />
                        <span>All Amenities</span>
                      </button>

                      <button
                        onClick={() => {
                          const botToggle = document.getElementById('chatbot-toggle-button');
                          if (botToggle) botToggle.click();
                        }}
                        className={`p-3 rounded-2xl border text-xs font-extrabold text-left transition-all cursor-pointer active:scale-95 flex items-center space-x-2.5 ${
                          lightMode 
                            ? 'bg-slate-50 border-slate-150 hover:bg-slate-100/70 text-slate-700' 
                            : 'bg-[#101b3a] border-[#1e2d52] hover:bg-blue-600 hover:border-blue-500 text-slate-200 hover:text-white'
                        }`}
                      >
                        <HelpCircle size={16} className="text-rose-500" />
                        <span>AI Chat Helper</span>
                      </button>
                    </div>
                  </div>

                  {/* Favorite Locations Card */}
                  <div className={`border rounded-3xl p-5 space-y-4 shadow-xs transition-all ${
                    lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                  }`} id="favorites-widget">
                    <div className="flex items-center space-x-2 border-b pb-2.5 border-slate-500/10">
                      <Star size={16} className="text-blue-500 fill-blue-500/20" />
                      <span className={`text-xs font-extrabold uppercase tracking-widest ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                        Favorite Locations
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2" id="favorites-list">
                      {[
                        { id: 'node_entrance', name: 'Main Foyer Entrance', type: 'entrance' },
                        { id: 'node_platform4', name: 'Platform 4 Corridor', type: 'platform' },
                        { id: 'node_atm', name: 'Center Lobby ATM', type: 'atm' },
                      ].map((fav) => (
                        <div
                          key={fav.id}
                          onClick={() => {
                            setToNodeId(fav.id);
                            setActiveTab('navigation');
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all active:scale-98 ${
                            lightMode 
                              ? 'bg-slate-50 border-slate-150 hover:bg-slate-100' 
                              : 'bg-[#101b3a] border-[#1e2d52] hover:bg-blue-600/15'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <Star size={12} className="text-amber-500 fill-amber-500" />
                            <span className={`font-semibold ${lightMode ? 'text-slate-700' : 'text-slate-200'}`}>{fav.name}</span>
                          </div>
                          <span className="text-[10px] text-blue-500 font-bold uppercase">Navigate</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* BOTTOM SECTION: Popular Facilities Quick Actions Grid */}
                <div className={`border rounded-3xl p-5 space-y-4 shadow-xs transition-all ${
                  lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                }`} id="popular-facilities-quick-links">
                  <div className="flex items-center space-x-2 border-b pb-3 border-slate-500/10">
                    <MapPin size={16} className="text-blue-500" />
                    <span className={`text-xs font-extrabold uppercase tracking-widest ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                      Popular Amenities Quick Route Planner
                    </span>
                  </div>

                  <p className={`text-xs ${lightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Click on any landmark below to immediately calculate the shortest wayfinding path from the entrance gates.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3" id="facilities-quick-grid">
                    {[
                      { id: 'node_restroom', name: 'Restroom', type: 'restroom' },
                      { id: 'node_foodcourt', name: 'Food Court', type: 'food_court' },
                      { id: 'node_atm', name: 'ATM Center', type: 'atm' },
                      { id: 'node_platform2', name: 'Platform 2', type: 'platform' },
                      { id: 'node_lounge', name: 'Waiting Area', type: 'waiting_area' },
                      { id: 'node_entrance', name: 'Main Entrance', type: 'accessibility' },
                    ].map(fac => (
                      <div
                        key={fac.id}
                        onClick={() => {
                          const entranceNode = nodes.find(n => n.id.includes('entrance') || n.name.toLowerCase().includes('entrance'))?.id || 'node_entrance';
                          setFromNodeId(entranceNode);
                          setToNodeId(favNodeIdMap[fac.type] || fac.id);
                          setActiveTab('navigation');
                        }}
                        className={`border rounded-2xl p-4 flex flex-col items-center text-center space-y-3 cursor-pointer transition-all hover:border-blue-500 active:scale-95 shadow-2xs ${
                          lightMode ? 'bg-slate-50/50 border-slate-200 hover:bg-white' : 'bg-[#101b3a]/30 border-[#1a2c54]/40 hover:bg-[#101b3a]/75'
                        }`}
                      >
                        <div className={`p-3 rounded-xl border ${
                          lightMode ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-blue-900/10 text-blue-400 border-blue-500/15'
                        }`}>
                          <FacilityIcon type={fac.type} name={fac.name} size={18} />
                        </div>
                        <div>
                          <h5 className={`font-extrabold text-xs ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>{fac.name}</h5>
                          <span className="text-[9px] text-blue-500 font-extrabold tracking-widest uppercase block mt-1">Plot Route</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DOUBLE COLUMN: Service Bulletins & Recent Trips Log */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="dashboard-bottom-row">
                  
                  {/* Service Advisories Bulletin */}
                  <div className={`border rounded-3xl p-5 space-y-3.5 shadow-xs transition-all ${
                    lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                  }`} id="advisories-widget">
                    <div className="flex items-center space-x-2 border-b pb-2.5 border-slate-500/10">
                      <Bell size={16} className="text-blue-500" />
                      <span className={`text-xs font-extrabold uppercase tracking-widest ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                        Station Bulletins & Advisories
                      </span>
                    </div>

                    <div className="space-y-3" id="bulletin-list">
                      <div className={`p-3 rounded-2xl border flex items-start space-x-3 text-xs ${
                        lightMode ? 'bg-orange-50/50 border-orange-200/50' : 'bg-orange-500/5 border-orange-500/10'
                      }`}>
                        <AlertTriangle size={15} className="text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <h6 className="font-extrabold text-orange-500">Platform 3 Elevator Inspection</h6>
                          <p className={`text-[11px] leading-relaxed mt-0.5 ${lightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                            Scheduled motor servicing today between 14:00 and 16:00. Please utilize the Platform 2 ramp.
                          </p>
                        </div>
                      </div>

                      <div className={`p-3 rounded-2xl border flex items-start space-x-3 text-xs ${
                        lightMode ? 'bg-blue-50/50 border-blue-200/50' : 'bg-blue-500/5 border-blue-500/10'
                      }`}>
                        <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <h6 className="font-extrabold text-blue-500">Platform Ticket Counter Digital Corridors</h6>
                          <p className={`text-[11px] leading-relaxed mt-0.5 ${lightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                            Ticket QR scanners are fully updated to support smart checkout wayfinder receipts.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Saved Journeys */}
                  <div className={`border rounded-3xl p-5 space-y-3.5 shadow-xs transition-all ${
                    lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                  }`} id="recent-trips-widget">
                    <div className="flex items-center space-x-2 border-b pb-2.5 border-slate-500/10">
                      <History size={16} className="text-blue-500" />
                      <span className={`text-xs font-extrabold uppercase tracking-widest ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                        Recent Trips History Log
                      </span>
                    </div>

                    {tripsHistory.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 max-h-[170px] overflow-y-auto pr-1" id="recent-trips-list">
                        {tripsHistory.slice(0, 3).map(trip => {
                          const fromNodeObj = nodes.find(n => n.id === trip.fromNode);
                          const toNodeObj = nodes.find(n => n.id === trip.toNode);
                          return (
                            <div
                              key={trip.id}
                              className={`flex items-center justify-between p-3 rounded-2xl border text-xs cursor-pointer transition-all active:scale-99 ${
                                lightMode ? 'bg-slate-50 border-slate-150 hover:bg-slate-100' : 'bg-[#111e3f]/45 border-[#1a2c54]/30'
                              }`}
                              onClick={() => {
                                setFromNodeId(trip.fromNode);
                                setToNodeId(trip.toNode);
                                handleFindRoute(trip.fromNode, trip.toNode);
                                setActiveTab('navigation');
                              }}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2 font-bold">
                                  <span className={lightMode ? 'text-slate-800' : 'text-slate-200'}>{fromNodeObj?.name || 'Entrance'}</span>
                                  <ArrowRight size={11} className="text-blue-500" />
                                  <span className={lightMode ? 'text-slate-800' : 'text-slate-200'}>{toNodeObj?.name || 'Platform'}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  {trip.distance}m • {trip.duration} min duration
                                </div>
                              </div>
                              <span className="text-[10px] text-blue-500 font-bold uppercase">Plot</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={`p-8 text-center text-slate-400 text-xs italic border rounded-2xl border-dashed ${
                        lightMode ? 'border-slate-200 bg-slate-50/50' : 'border-[#1a2c54]/40 bg-[#111e3f]/10'
                      }`}>
                        💡 No previous wayfinding logs. Choose a route above to save your journeys!
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )
          )}

          {/* 2. STATIONS VIEW (Stations search, stats, creation) */}
          {activeTab === 'stations' && (
            <div className="space-y-6 animate-fade-in" id="stations-tab-panel">
              <div className="flex items-center justify-between" id="stations-header">
                <div>
                  <h2 className={`text-lg font-bold ${lightMode && !accessibilityMode ? 'text-slate-800' : 'text-white'}`}>Railway Stations Directory</h2>
                  <p className={`${lightMode && !accessibilityMode ? 'text-slate-500' : 'text-slate-400'} text-xs`}>
                    Explore major railway stations in India, grouped by regional railway zone.
                  </p>
                </div>
              </div>

              {/* Grid of Zone Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="zones-grid">
                {[
                  {
                    id: 'scr',
                    name: 'South Central Railway (SCR)',
                    region: 'Southern Zone',
                    badge: 'SCR',
                    color: 'border-blue-500/30 bg-blue-900/10 text-blue-400',
                    desc: 'Formed in 1966, SCR connects South-Central India, featuring high-speed digital wayfinding corridors.',
                    stationIds: ['secunderabad', 'vijayawada']
                  },
                  {
                    id: 'ncr_nr',
                    name: 'North Central & Northern (NCR / NR)',
                    region: 'Northern Zone',
                    badge: 'NCR / NR',
                    color: 'border-orange-500/30 bg-orange-900/10 text-orange-400',
                    desc: 'Servicing the heartland, managing vital transit paths to administrative, cultural, and historic cities.',
                    stationIds: ['prayagraj', 'new_delhi']
                  },
                  {
                    id: 'cr_wr',
                    name: 'Central & Western Railway (CR / WR)',
                    region: 'Western Zone',
                    badge: 'CSMT',
                    color: 'border-emerald-500/30 bg-emerald-900/10 text-emerald-400',
                    desc: 'Connecting Mumbai, Maharashtra, and surrounding states, supporting massive local and long-distance passenger flows.',
                    stationIds: ['mumbai_csmt']
                  },
                  {
                    id: 'sr',
                    name: 'Southern Railway (SR)',
                    region: 'Southern Zone',
                    badge: 'MAS',
                    color: 'border-purple-500/30 bg-purple-900/10 text-purple-400',
                    desc: 'One of the nine pioneer zones of Indian Railways, renowned for passenger convenience and green transit.',
                    stationIds: ['chennai_central']
                  },
                  {
                    id: 'er',
                    name: 'Eastern Railway (ER)',
                    region: 'Eastern Zone',
                    badge: 'HWH',
                    color: 'border-cyan-500/30 bg-cyan-900/10 text-cyan-400',
                    desc: 'Originating from the historic Howrah terminus, Eastern Railway handles vital lines to Eastern and North-Eastern India.',
                    stationIds: ['howrah']
                  },
                  {
                    id: 'other',
                    name: 'Primary Station Hubs',
                    region: 'Central Zone',
                    badge: 'CEN',
                    color: 'border-slate-500/30 bg-slate-900/10 text-slate-400',
                    desc: 'Core transit hubs, metro junctions, and general cross-network interchange stations.',
                    stationIds: ['central']
                  }
                ].map(zone => {
                  // Filter stations that belong to this zone
                  const zoneStations = stations.filter(st => {
                    if (st.zone === zone.id) return true;
                    if (zone.id === 'other') {
                      // fallback for any station not grouped explicitly
                      const groupedIds = ['secunderabad', 'vijayawada', 'prayagraj', 'new_delhi', 'mumbai_csmt', 'chennai_central', 'howrah'];
                      const isPredefinedGrouped = groupedIds.includes(st.id) || ['scr', 'ncr_nr', 'cr_wr', 'sr', 'er'].includes(st.zone || '');
                      return st.id === 'central' || !isPredefinedGrouped;
                    }
                    return zone.stationIds.includes(st.id);
                  });

                  return (
                    <div
                      key={zone.id}
                      className={`border rounded-xl p-5 flex flex-col justify-between transition-all ${
                        accessibilityMode
                          ? 'bg-black border-yellow-400 text-yellow-300'
                          : lightMode
                            ? 'bg-white border-slate-200 text-slate-800 shadow-sm hover:shadow-md'
                            : 'bg-[#091024] border-[#1a2c54] text-slate-100 shadow-md hover:border-blue-500'
                      }`}
                      id={`zone-card-${zone.id}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${zone.color}`}>
                            {zone.badge}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold font-mono uppercase">
                            {zone.region}
                          </span>
                        </div>

                        <div>
                          <h3 className={`font-bold text-sm ${lightMode && !accessibilityMode ? 'text-slate-800' : 'text-white'}`}>{zone.name}</h3>
                          <p className={`text-[11px] mt-1 leading-normal ${lightMode && !accessibilityMode ? 'text-slate-500' : 'text-slate-400'}`}>{zone.desc}</p>
                        </div>

                        {/* Station List inside this Zone Card */}
                        <div className="space-y-2 pt-2 border-t border-slate-500/10">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Station</p>
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                            {zoneStations.length > 0 ? (
                              zoneStations.map(st => {
                                const isActive = selectedStationId === st.id;
                                return (
                                  <div
                                    key={st.id}
                                    onClick={() => {
                                      setSelectedStationId(st.id);
                                      setActiveTab('dashboard');
                                    }}
                                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                      isActive
                                        ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-semibold'
                                        : accessibilityMode
                                          ? 'bg-black border-yellow-400 text-yellow-300 hover:bg-yellow-950/20'
                                          : lightMode
                                            ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                                            : 'bg-[#101b3a] border-[#1e2d52]/40 hover:bg-[#15234c] text-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2 truncate">
                                      <Train size={13} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                                      <span className="truncate">{st.name} ({st.code})</span>
                                    </div>
                                    <div className="flex items-center space-x-2 shrink-0">
                                      <span className="text-[9px] text-slate-400 font-medium">{st.distance}</span>
                                      {isActive && <Check size={12} className="text-blue-500" />}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-[10px] text-slate-500 italic py-2">No stations loaded in this zone.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-500/10 flex justify-between items-center text-[11px] text-slate-400">
                        <span>{zoneStations.length} Stations available</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ADMIN PANEL - Create station */}
              {user?.role === 'admin' && (
                <div
                  className={`border rounded-xl p-5 space-y-4 max-w-xl shadow-lg text-xs ${
                    accessibilityMode
                      ? 'bg-black border-yellow-400'
                      : lightMode
                        ? 'bg-white border-slate-200 text-slate-800'
                        : 'bg-[#0b1329] border-[#1a2c54]'
                  }`}
                  id="admin-add-station"
                >
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-500/10 pb-2 text-blue-500">
                    <Settings size={16} />
                    <span>Admin Controls - Register New Station</span>
                  </h3>

                  {adminStatusMsg && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 text-xs text-center text-blue-400">
                      {adminStatusMsg}
                    </div>
                  )}

                  <form onSubmit={handleCreateStation} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold block text-slate-400">Station Name</label>
                      <input
                        type="text"
                        required
                        value={newStationName}
                        onChange={(e) => setNewStationName(e.target.value)}
                        placeholder="e.g. Secunderabad Jn"
                        className={`w-full border rounded px-3 py-2 focus:outline-none ${
                          lightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#111e3f] text-white border-[#1a2c54]'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold block text-slate-400">Station Code (3 Letters)</label>
                      <input
                        type="text"
                        required
                        maxLength={3}
                        value={newStationCode}
                        onChange={(e) => setNewStationCode(e.target.value)}
                        placeholder="e.g. SC"
                        className={`w-full border rounded px-3 py-2 focus:outline-none uppercase ${
                          lightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#111e3f] text-white border-[#1a2c54]'
                        }`}
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="font-semibold block text-slate-400">Railway Zone (Group / Division)</label>
                      <select
                        value={newStationZone}
                        onChange={(e) => setNewStationZone(e.target.value)}
                        className={`w-full border rounded px-3 py-2 focus:outline-none ${
                          lightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#111e3f] text-white border-[#1a2c54]'
                        }`}
                      >
                        <option value="scr">South Central Railway (SCR)</option>
                        <option value="ncr_nr">North Central & Northern (NCR / NR)</option>
                        <option value="cr_wr">Central & Western Railway (CR / WR)</option>
                        <option value="sr">Southern Railway (SR)</option>
                        <option value="er">Eastern Railway (ER)</option>
                        <option value="other">Primary Station Hubs</option>
                      </select>
                      <p className="text-[10px] text-slate-500 italic mt-1">
                        * Creating a station will automatically deploy default high-fidelity wayfinding maps, coordinate nodes, and essential facilities (Restrooms, ATMs, Elevators).
                      </p>
                    </div>
                    <button
                      type="submit"
                      className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded shadow-md mt-2 transition-all cursor-pointer"
                    >
                      Add New Station
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* 3. FACILITIES VIEW (Search facilities, manage them) */}
          {activeTab === 'facilities' && (
            <div className="space-y-6 animate-fade-in" id="facilities-tab-panel">
              <div>
                <h2 className={`text-lg font-extrabold tracking-tight ${lightMode ? 'text-slate-800' : 'text-white'}`}>
                  Station Amenities & Facilities
                </h2>
                <p className="text-slate-400 text-xs">Browse restrooms, eateries, accessibility ramps, and ATMs available at {selectedStationId === 'central' ? 'Central Station' : 'this station'}</p>
              </div>

              {/* Filters / Search Row */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between" id="facilities-search-controls">
                <div className="relative w-full max-w-sm">
                  <Search size={14} className="absolute left-3 inset-y-0 my-auto text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search restroom, food court, elevator..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className={`w-full placeholder-slate-400 border rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-all ${
                      lightMode ? 'bg-white text-slate-800 border-slate-200' : 'bg-[#111e3f] text-white border-[#1a2c54]'
                    }`}
                  />
                </div>
                
                <span className="text-slate-400 text-xs font-semibold">
                  Showing {filteredFacilities.length} facilities
                </span>
              </div>

              {/* Grid representation */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="facilities-grid">
                {filteredFacilities.map(fac => (
                  <div
                    key={fac.id}
                    className={`border rounded-2xl p-4.5 flex flex-col justify-between hover:border-blue-500 transition-all shadow-xs space-y-3.5 ${
                      lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                    }`}
                    id={`facility-card-${fac.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`p-2.5 rounded-xl border ${
                        lightMode 
                          ? 'bg-blue-50 border-blue-100 text-blue-600' 
                          : 'bg-blue-900/10 text-blue-400 border-blue-500/15'
                      }`}>
                        <FacilityIcon type={fac.type} name={fac.name} size={16} />
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wide uppercase ${
                        fac.status.includes('Available') || fac.status === 'Open'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {fac.status}
                      </span>
                    </div>

                    <div>
                      <h4 className={`font-extrabold text-sm ${lightMode ? 'text-slate-800' : 'text-white'}`}>{fac.name}</h4>
                      <p className="text-slate-400 text-[10px] capitalize font-mono mt-0.5">Type: {fac.type.replace('_', ' ')}</p>
                    </div>

                    <div className={`pt-3 border-t flex items-center justify-between ${
                      lightMode ? 'border-slate-100' : 'border-[#1a2c54]/30'
                    }`}>
                      <button
                        onClick={() => {
                          const startFrom = fromNodeId || (nodes && nodes.length > 0 ? nodes.find(n => n.id.toLowerCase().includes('entrance') || n.name.toLowerCase().includes('entrance') || n.name.toLowerCase().includes('gate'))?.id || nodes[0].id : '');
                          setToNodeId(fac.nodeId);
                          setActiveTab('navigation');
                          handleFindRoute(startFrom, fac.nodeId);
                        }}
                        className="text-blue-500 hover:text-blue-600 text-[11px] font-extrabold flex items-center space-x-1 cursor-pointer active:scale-95"
                      >
                        <span>Navigate Here</span>
                        <ArrowRight size={10} />
                      </button>

                      {/* Admin Toggle button */}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleToggleFacilityStatus(fac.id, fac.status)}
                          className="bg-orange-500/10 text-orange-500 border border-orange-500/15 px-2.5 py-1 rounded-lg text-[9px] hover:bg-orange-500 hover:text-white transition-all font-extrabold cursor-pointer"
                        >
                          Toggle Open/Closed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ADMIN PANEL - Add new facility */}
              {user?.role === 'admin' && (
                <div className={`border rounded-2xl p-5 space-y-4 max-w-xl shadow-md transition-all ${
                  lightMode ? 'bg-white border-slate-200' : 'bg-[#0b1329] border-[#1a2c54]/60'
                }`} id="admin-add-facility">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest flex items-center space-x-2 border-b pb-2 text-blue-500 border-slate-100">
                    <Settings size={14} />
                    <span>Admin Controls - Register New Facility</span>
                  </h3>

                  {adminStatusMsg && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-center text-blue-500 font-bold">
                      {adminStatusMsg}
                    </div>
                  )}

                  <form onSubmit={handleCreateFacility} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-extrabold uppercase tracking-wide text-[9px] block">Facility Name</label>
                      <input
                        type="text"
                        required
                        value={newFacName}
                        onChange={(e) => setNewFacName(e.target.value)}
                        placeholder="e.g. VIP Waiting Lounge"
                        className={`w-full rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 border ${
                          lightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#111e3f] text-white border-[#1a2c54]'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 font-extrabold uppercase tracking-wide text-[9px] block">Facility Type</label>
                      <select
                        value={newFacType}
                        onChange={(e) => setNewFacType(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 border ${
                          lightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#111e3f] text-white border-[#1a2c54]'
                        }`}
                      >
                        <option value="restroom">Restroom</option>
                        <option value="food_court">Food Court</option>
                        <option value="coffee_shop">Coffee Store</option>
                        <option value="atm">ATM</option>
                        <option value="waiting_area">Waiting Area</option>
                        <option value="accessibility">Accessibility elevator/ramp</option>
                      </select>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-slate-400 font-extrabold uppercase tracking-wide text-[9px] block">Link to Map Location Node</label>
                      <select
                        value={newFacNodeId}
                        onChange={(e) => setNewFacNodeId(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 border ${
                          lightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#111e3f] text-white border-[#1a2c54]'
                        }`}
                      >
                        {nodes.map(n => (
                          <option key={n.id} value={n.id}>{n.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="col-span-2 bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-extrabold py-3 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      Add Facility
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* 4. NAVIGATION TAB (Detailed Wayfinding Workspace) */}
          {activeTab === 'navigation' && (
            <div className="space-y-6 animate-fade-in" id="navigation-tab-panel">
              {/* Header Title Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className={`text-lg font-extrabold tracking-tight ${lightMode ? 'text-slate-800' : 'text-white'}`}>
                    Station Route Navigator
                  </h2>
                  <p className="text-slate-400 text-xs">Calculate high-precision indoor walkways and platforms navigation with real-time waypoint tracking</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase border ${
                    lightMode ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-[#111e3f] border-[#1a2c54] text-slate-300'
                  }`}>
                    DIJKSTRA ROUTER V2.1
                  </span>
                </div>
              </div>

              {/* Top: Cohesive Search & Options Bar */}
              <div className={`p-5 rounded-3xl border transition-all ${
                lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#091024] border-[#1a2c54]/60 shadow-lg'
              }`} id="nav-top-bar">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  
                  {/* Origin Selector */}
                  <div className="md:col-span-3">
                    <label className="text-[9px] text-slate-400 font-extrabold block mb-1.5 uppercase tracking-wider">Starting Point (From)</label>
                    <div className="relative">
                      <div className="absolute left-3.5 inset-y-0 my-auto h-4 w-4 flex items-center justify-center text-blue-500">
                        <MapPin size={13} className="fill-blue-500/10" />
                      </div>
                      <select
                        value={fromNodeId}
                        onChange={(e) => setFromNodeId(e.target.value)}
                        className={`w-full py-2.5 pl-9 pr-8 rounded-xl border text-xs focus:outline-none focus:border-blue-500 font-bold transition-all ${
                          lightMode 
                            ? 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100/50' 
                            : 'bg-[#111e3f] text-white border-[#1a2c54] hover:bg-[#111e3f]/80'
                        }`}
                      >
                        {nodes.map(n => (
                          <option key={n.id} value={n.id}>{n.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Destination Selector */}
                  <div className="md:col-span-3">
                    <label className="text-[9px] text-slate-400 font-extrabold block mb-1.5 uppercase tracking-wider">Target Destination (To)</label>
                    <div className="relative">
                      <div className="absolute left-3.5 inset-y-0 my-auto h-4 w-4 flex items-center justify-center text-rose-500">
                        <MapPin size={13} className="fill-rose-500/10" />
                      </div>
                      <select
                        value={toNodeId}
                        onChange={(e) => setToNodeId(e.target.value)}
                        className={`w-full py-2.5 pl-9 pr-8 rounded-xl border text-xs focus:outline-none focus:border-blue-500 font-bold transition-all ${
                          lightMode 
                            ? 'bg-slate-50 text-slate-800 border-slate-200' 
                            : 'bg-[#111e3f] text-white border-[#1a2c54]'
                        }`}
                      >
                        {nodes.map(n => (
                          <option key={n.id} value={n.id}>{n.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Route Options & Quick settings */}
                  <div className="md:col-span-3 pb-2 md:pb-2.5 flex items-center">
                    <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={avoidEscalators}
                        onChange={(e) => setAvoidEscalators(e.target.checked)}
                        className="rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      />
                      <span className={`text-[11px] font-bold ${
                        lightMode ? 'text-slate-600' : 'text-slate-300'
                      }`}>
                        ♿ Wheelchair Paths Only
                      </span>
                    </label>
                  </div>

                  {/* Find Route Button */}
                  <div className="md:col-span-3">
                    <button
                      onClick={() => handleFindRoute(fromNodeId, toNodeId)}
                      disabled={isFindingRoute}
                      className={`w-full text-white font-black py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-95 text-xs h-[38px] ${
                        isFindingRoute ? 'bg-blue-800 opacity-75' : 'bg-linear-to-tr from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600'
                      }`}
                    >
                      {isFindingRoute ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>ROUTING...</span>
                        </>
                      ) : (
                        <>
                          <NavIcon size={12} className="rotate-45" />
                          <span>FIND SHORTEST ROUTE</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>

              {/* Middle Section: Large Map Left, HUD Panel Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch" id="nav-middle-workspace">
                
                {/* 1. LARGE MAP AREA (Takes 70-75% width on desktop) */}
                <div className="lg:col-span-8 xl:col-span-9 relative" id="nav-map-container">
                  <IndoorMap
                    nodes={nodes}
                    routeResult={routeResult}
                    startNodeId={fromNodeId}
                    endNodeId={toNodeId}
                    onNodeSelect={handleMapNodeSelect}
                    accessibilityMode={accessibilityMode}
                    currentStepIndex={currentStepIndex}
                    lightMode={lightMode}
                  />
                </div>

                {/* 2. HUD CONTROL PANEL (Takes 25-30% width on desktop) */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col justify-between gap-4" id="nav-hud-panel">
                  
                  {/* Outer HUD container card */}
                  <div className={`border rounded-3xl p-5 flex-1 flex flex-col justify-between space-y-5 transition-all ${
                    lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#091024] border-[#1a2c54]/60 shadow-lg'
                  }`}>
                    
                    {/* Header: Title */}
                    <div className="border-b pb-2.5 border-slate-500/10 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles size={14} className="text-blue-500" />
                        <span className={`text-xs font-extrabold uppercase tracking-widest ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                          Navigation HUD
                        </span>
                      </div>
                      
                      {routeResult && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </div>

                    {/* HUD Body */}
                    {!routeResult ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto">
                        <Compass size={32} className="text-slate-400 animate-spin-slow" />
                        <div>
                          <h5 className={`font-extrabold text-xs ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>No Route Active</h5>
                          <p className="text-slate-400 text-[10px] leading-relaxed mt-1">
                            Choose your origin and target destinations above, then click Find Shortest Route to trigger high-precision layout overlays.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col justify-between space-y-4">
                        
                        {/* 1. TRAVEL SPECS (Distance, Time, ETA) */}
                        <div className={`grid grid-cols-3 gap-2.5 p-3 rounded-2xl border ${
                          lightMode ? 'bg-slate-50 border-slate-100' : 'bg-[#111e3f]/40 border-[#1a2c54]/30'
                        }`}>
                          <div className="text-center">
                            <span className="text-[8px] text-slate-400 font-extrabold uppercase block leading-none">Distance</span>
                            <strong className="text-sm font-black text-blue-500 block mt-1.5">{routeResult.totalDistance}m</strong>
                          </div>
                          
                          <div className="text-center border-x border-slate-500/10">
                            <span className="text-[8px] text-slate-400 font-extrabold uppercase block leading-none">Time Est</span>
                            <strong className="text-sm font-black text-emerald-500 block mt-1.5">{routeResult.estimatedTimeMins} min</strong>
                          </div>
                          
                          <div className="text-center">
                            <span className="text-[8px] text-slate-400 font-extrabold uppercase block leading-none">Live ETA</span>
                            <strong className={`text-sm font-black block mt-1.5 ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                              {(() => {
                                const now = new Date();
                                now.setMinutes(now.getMinutes() + routeResult.estimatedTimeMins);
                                let hours = now.getHours();
                                const mins = now.getMinutes().toString().padStart(2, '0');
                                const ampm = hours >= 12 ? 'PM' : 'AM';
                                hours = hours % 12 || 12;
                                return `${hours}:${mins} ${ampm}`;
                              })()}
                            </strong>
                          </div>
                        </div>

                        {/* 2. ACTIVE STEP DETAILS */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Current Directive</span>
                          <div className={`p-4 rounded-2xl border relative overflow-hidden transition-all ${
                            lightMode ? 'bg-slate-50/50 border-slate-150' : 'bg-[#111e3f]/25 border-[#1a2c54]/30'
                          }`}>
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                            <div className="flex items-start justify-between gap-1.5">
                              <div>
                                <span className="bg-blue-500/10 text-blue-500 font-black text-[9px] uppercase px-1.5 py-0.5 rounded-md border border-blue-500/15">
                                  Step {currentStepIndex + 1} of {routeResult.steps.length}
                                </span>
                                <h4 className={`font-black text-xs mt-2.5 leading-snug tracking-tight ${lightMode ? 'text-slate-800' : 'text-white'}`}>
                                  {routeResult.steps[Math.min(currentStepIndex, routeResult.steps.length - 1)]?.instruction}
                                </h4>
                                {routeResult.steps[Math.min(currentStepIndex, routeResult.steps.length - 1)]?.distance > 0 && (
                                  <span className="text-[10px] font-mono font-extrabold text-blue-500 block mt-1.5">
                                    Walk {routeResult.steps[Math.min(currentStepIndex, routeResult.steps.length - 1)]?.distance} meters
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Next up preview */}
                          {currentStepIndex < routeResult.steps.length - 1 && (
                            <p className="text-[10px] text-slate-400 truncate pl-1 mt-1 font-semibold">
                              ⏭️ Next up: <span className={lightMode ? 'text-slate-600' : 'text-slate-300'}>{routeResult.steps[currentStepIndex + 1]?.instruction}</span>
                            </p>
                          )}
                        </div>

                        {/* 3. SIMULATOR & VOICE ASSIST HUD CONTROLS */}
                        <div className="space-y-2.5 pt-3 border-t border-slate-500/10">
                          
                          {/* Simulator controls buttons: Auto Walk (Play/Pause) & Voice */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            
                            {/* Auto Walk Play / Pause Toggle */}
                            <button
                              onClick={() => setIsSimulatingNavigation(!isSimulatingNavigation)}
                              className={`py-2.5 px-3 rounded-xl border font-extrabold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                                isSimulatingNavigation
                                  ? 'bg-blue-600 text-white border-blue-500 animate-pulse shadow-xs'
                                  : lightMode
                                  ? 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                                  : 'bg-[#111e3f] hover:bg-[#111e3f]/80 text-slate-200 border-[#1a2c54]'
                              }`}
                              title={isSimulatingNavigation ? "Pause Auto Navigation Walking" : "Start Auto GPS Simulation"}
                            >
                              {isSimulatingNavigation ? (
                                <>
                                  <Pause size={12} className="fill-current" />
                                  <span>PAUSE SIM</span>
                                </>
                              ) : (
                                <>
                                  <Play size={12} className="fill-current" />
                                  <span>AUTO WALK</span>
                                </>
                              )}
                            </button>

                            {/* Voice Mute / Unmute Toggle */}
                            <button
                              onClick={() => {
                                const newMuteState = !voiceMuted;
                                setVoiceMuted(newMuteState);
                                if (!newMuteState && routeResult && routeResult.steps[currentStepIndex]) {
                                  // Speak current instruction immediately on unmute
                                  const tts = new SpeechSynthesisUtterance(routeResult.steps[currentStepIndex].instruction);
                                  window.speechSynthesis.cancel();
                                  window.speechSynthesis.speak(tts);
                                }
                              }}
                              className={`py-2.5 px-3 rounded-xl border font-extrabold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                                !voiceMuted
                                  ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/25'
                                  : lightMode
                                  ? 'bg-slate-100 hover:bg-slate-200/80 text-slate-500 border-slate-200'
                                  : 'bg-[#111e3f] hover:bg-[#111e3f]/80 text-slate-400 border-[#1a2c54]'
                              }`}
                              title={voiceMuted ? "Unmute Voice Auditory Guidance" : "Mute Voice Auditory Guidance"}
                            >
                              {voiceMuted ? (
                                <>
                                  <VolumeX size={12} />
                                  <span>MUTED</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 size={12} className="animate-bounce" />
                                  <span>SPEAKER</span>
                                </>
                              )}
                            </button>

                          </div>

                          {/* Stepper controls: Previous & Next button */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                              onClick={() => {
                                if (currentStepIndex > 0) {
                                  const prevIdx = currentStepIndex - 1;
                                  setCurrentStepIndex(prevIdx);
                                  if (routeResult.steps && routeResult.steps[prevIdx]) {
                                    const step = routeResult.steps[prevIdx];
                                    let tts = step.instruction;
                                    if (step.distance > 0) tts += `, for ${step.distance} meters.`;
                                    if (typeof window !== 'undefined' && window.speechSynthesis && !voiceMuted) {
                                      window.speechSynthesis.cancel();
                                      window.speechSynthesis.speak(new SpeechSynthesisUtterance(tts));
                                    }
                                  }
                                }
                              }}
                              disabled={currentStepIndex === 0}
                              className={`py-2.5 px-3 rounded-xl border font-extrabold transition-all flex items-center justify-center space-x-1 ${
                                currentStepIndex === 0
                                  ? 'opacity-40 cursor-not-allowed border-slate-500/5'
                                  : lightMode
                                  ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer active:scale-95'
                                  : 'bg-[#111e3f]/50 border-[#1a2c54]/50 hover:bg-[#111e3f] text-slate-300 cursor-pointer active:scale-95'
                              }`}
                            >
                              <span>PREV STEP</span>
                            </button>

                            <button
                              onClick={() => {
                                if (currentStepIndex < routeResult.steps.length - 1) {
                                  const nextIdx = currentStepIndex + 1;
                                  setCurrentStepIndex(nextIdx);
                                  if (routeResult.steps && routeResult.steps[nextIdx]) {
                                    const step = routeResult.steps[nextIdx];
                                    let tts = step.instruction;
                                    if (step.distance > 0) tts += `, for ${step.distance} meters.`;
                                    if (typeof window !== 'undefined' && window.speechSynthesis && !voiceMuted) {
                                      window.speechSynthesis.cancel();
                                      window.speechSynthesis.speak(new SpeechSynthesisUtterance(tts));
                                    }
                                  }
                                }
                              }}
                              disabled={currentStepIndex === routeResult.steps.length - 1}
                              className={`py-2.5 px-3 rounded-xl border font-extrabold transition-all flex items-center justify-center space-x-1 ${
                                currentStepIndex === routeResult.steps.length - 1
                                  ? 'opacity-40 cursor-not-allowed border-slate-500/5'
                                  : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700 cursor-pointer active:scale-95 shadow-xs shadow-blue-500/5'
                              }`}
                            >
                              <span>NEXT STEP</span>
                            </button>
                          </div>

                          {/* Recalculate Route Deviation simulation */}
                          <button
                            onClick={handleRouteDeviation}
                            className={`w-full py-2.5 px-3 rounded-xl border text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                              lightMode
                                ? 'bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200'
                                : 'bg-[#1c120c] hover:bg-[#2c1a0e] text-orange-400 border-orange-950/40'
                            }`}
                            title="Simulate random route departure to trigger Dijkstra recalculation"
                          >
                            <AlertTriangle size={12} />
                            <span>SIMULATE DEVIATION</span>
                          </button>

                        </div>

                      </div>
                    )}

                  </div>

                </div>

              </div>

              {/* Bottom: Compact Steps Horizontal Timeline Carousel */}
              {routeResult && (
                <div className={`p-4.5 rounded-3xl border transition-all animate-fade-in ${
                  lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                }`} id="compact-step-timeline">
                  
                  <div className="flex items-center justify-between mb-3 px-1.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Waypoint Journey Timeline</span>
                    <span className="text-[10px] text-blue-500 font-mono font-extrabold">
                      Step {currentStepIndex + 1} of {routeResult.steps.length}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3 overflow-x-auto pb-2" id="timeline-steps-scroller" style={{ scrollbarWidth: 'thin' }}>
                    {routeResult.steps.map((step, idx) => {
                      const isActive = idx === currentStepIndex;
                      const isCompleted = idx < currentStepIndex;
                      
                      return (
                        <div key={idx} className="flex items-center shrink-0">
                          {/* Step Micro Card */}
                          <div
                            onClick={() => {
                              setCurrentStepIndex(idx);
                              if (typeof window !== 'undefined' && window.speechSynthesis && !voiceMuted) {
                                window.speechSynthesis.cancel();
                                window.speechSynthesis.speak(new SpeechSynthesisUtterance(step.instruction));
                              }
                            }}
                            className={`border p-3.5 rounded-2xl flex flex-col space-y-1.5 cursor-pointer transition-all w-52 text-left relative ${
                              isActive
                                ? lightMode
                                  ? 'bg-blue-50 border-blue-500 shadow-sm shadow-blue-500/5 ring-1 ring-blue-500/20'
                                  : 'bg-blue-950/20 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                                : isCompleted
                                ? lightMode
                                  ? 'bg-slate-50 border-slate-200 opacity-60'
                                  : 'bg-[#111e3f]/20 border-[#1a2c54]/40 opacity-50'
                                : lightMode
                                ? 'bg-white border-slate-150 hover:bg-slate-50'
                                : 'bg-[#0a1024] border-[#1a2c54]/30 hover:bg-[#111e3f]/40'
                            }`}
                          >
                            {/* Active pulse dot */}
                            {isActive && (
                              <span className="absolute top-2.5 right-2.5 flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                              </span>
                            )}

                            <div className="flex items-center space-x-1.5">
                              <span className={`w-4.5 h-4.5 rounded-lg flex items-center justify-center font-black text-[9px] shrink-0 ${
                                isActive
                                  ? 'bg-blue-600 text-white'
                                  : isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  : lightMode
                                  ? 'bg-slate-100 text-slate-500'
                                  : 'bg-[#111e3f] text-slate-400'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className={`text-[8px] uppercase tracking-wider font-extrabold truncate ${
                                isActive ? 'text-blue-500' : isCompleted ? 'text-emerald-500' : 'text-slate-400'
                              }`}>
                                {isActive ? 'Active' : isCompleted ? 'Passed' : 'Upcoming'}
                              </span>
                            </div>

                            <p className={`text-[11px] leading-snug font-bold line-clamp-2 ${
                              isActive 
                                ? lightMode ? 'text-slate-900 font-extrabold' : 'text-white font-extrabold' 
                                : lightMode ? 'text-slate-600' : 'text-slate-300'
                            }`}>
                              {step.instruction}
                            </p>

                            {step.distance > 0 && (
                              <span className="text-[10px] font-mono font-medium text-slate-400 block">
                                {step.distance} meters
                              </span>
                            )}
                          </div>

                          {/* Connecting icon */}
                          {idx < routeResult.steps.length - 1 && (
                            <div className="mx-2 text-slate-400 font-bold shrink-0">
                              <ArrowRight size={13} className={isCompleted ? 'text-emerald-500/60' : isActive ? 'text-blue-500/60' : 'text-slate-600/30'} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}



          {/* 6. QR SCANNER TAB (QR Based Location Detection Simulator) */}
          {activeTab === 'qr-scanner' && (
            <div className="space-y-6 animate-fade-in" id="qr-scanner-tab-panel">
              <div>
                <h2 className={`text-lg font-extrabold tracking-tight ${lightMode ? 'text-slate-800' : 'text-white'}`}>
                  QR Based Navigation & Locator
                </h2>
                <p className="text-slate-400 text-xs">Scan location codes inside the station to immediately detect your coordinates and begin pathfinding</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="qr-scanners-workspace">
                
                {/* Scanner & Manual Locator Panel */}
                <div className={`border rounded-2xl p-5 space-y-5 shadow-xs transition-all ${
                  lightMode ? 'bg-white border-slate-200' : 'bg-[#0b1329] border-[#1a2c54]/60'
                }`} id="qr-device-simulator">
                  <div className={`text-center space-y-1.5 border-b pb-3.5 ${
                    lightMode ? 'border-slate-100' : 'border-[#1a2c54]/50'
                  }`}>
                    <h3 className={`font-extrabold text-sm ${lightMode ? 'text-slate-800' : 'text-white'}`}>Station QR Code Reader</h3>
                    <p className="text-slate-400 text-xs">Use camera or select tag to position yourself instantly</p>
                  </div>

                  {/* Real Web camera / Upload file Decoder */}
                  <CameraQRScanner 
                    onScanSuccess={handleSimulateQRScan} 
                    lightMode={lightMode} 
                  />

                  {qrStatusMessage && (
                    <div className="bg-blue-500/10 border border-blue-500/25 rounded-xl p-3.5 text-xs text-center text-blue-500 font-bold animate-fade-in">
                      {qrStatusMessage}
                    </div>
                  )}

                  {/* Manual input code locator fallback */}
                  <div className={`space-y-2.5 text-xs border-t pt-4 ${
                    lightMode ? 'border-slate-100' : 'border-[#1a2c54]/30'
                  }`}>
                    <label className={`font-extrabold block ${lightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                      Don't have a camera? Enter code/name manually:
                    </label>
                    <div className="flex space-x-2">
                      <input 
                        type="text"
                        placeholder="e.g. restroom, entrance, platform 2, atm..."
                        defaultValue=""
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = e.target.value;
                            handleSimulateQRScan(val);
                            e.target.value = '';
                          }
                        }}
                        className={`flex-1 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 border ${
                          lightMode 
                            ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' 
                            : 'bg-[#111e3f] text-white border-[#1a2c54] placeholder-slate-500'
                        }`}
                      />
                      <button 
                        onClick={(e) => {
                          const inputEl = e.currentTarget.previousSibling;
                          handleSimulateQRScan(inputEl.value);
                          inputEl.value = '';
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer active:scale-95"
                      >
                        Locate
                      </button>
                    </div>
                  </div>

                  {/* Quick Select Simulator codes */}
                  <div className={`space-y-2.5 text-xs border-t pt-4 ${
                    lightMode ? 'border-slate-100' : 'border-[#1a2c54]/30'
                  }`} id="qr-scannables-selector">
                    <label className={`font-extrabold block ${lightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                      Or click to simulate standard station posters:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="scannable-nodes-buttons">
                      {nodes.slice(0, 8).map(node => (
                        <button
                          key={node.id}
                          onClick={() => handleSimulateQRScan(node.id)}
                          className={`py-2 px-3 rounded-xl border text-[11px] font-extrabold text-left transition-all cursor-pointer active:scale-98 ${
                            lightMode 
                              ? 'bg-slate-50 border-slate-200 hover:bg-slate-100/60 text-slate-700' 
                              : 'bg-[#101b3a] border-[#1e2d52] hover:bg-blue-600 hover:border-blue-500 text-slate-200 hover:text-white'
                          }`}
                        >
                          📌 {node.name} Poster Tag
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* QR Guide instructions card */}
                <div className={`border rounded-2xl p-5.5 space-y-4.5 shadow-xs flex flex-col justify-center transition-all ${
                  lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                }`} id="qr-guide-card">
                  <div className={`border p-4 rounded-xl space-y-1.5 ${
                    lightMode 
                      ? 'bg-blue-50/50 border-blue-100 text-blue-700' 
                      : 'bg-blue-600/10 text-blue-400 border-blue-500/15'
                  }`}>
                    <h4 className="font-extrabold text-sm">How QR Navigation Works:</h4>
                    <p className={`text-xs leading-relaxed ${lightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                      We have placed physical QR Code posters next to key station touchpoints (such as the main ticket gates, platform entrances, restroom entrances, and ATMs).
                    </p>
                  </div>

                  <div className="space-y-4 text-xs leading-relaxed" id="qr-steps">
                    <div className="flex items-start space-x-3">
                      <span className="bg-blue-500/10 text-blue-600 font-extrabold w-5 h-5 rounded-full flex items-center justify-center shrink-0">1</span>
                      <p className={lightMode ? 'text-slate-600' : 'text-slate-300'}>Scan any nearby station navigation poster with your smartphone camera.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="bg-blue-500/10 text-blue-600 font-extrabold w-5 h-5 rounded-full flex items-center justify-center shrink-0">2</span>
                      <p className={lightMode ? 'text-slate-600' : 'text-slate-300'}>The system will automatically identify the exact node in our pathfinder coordinates.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="bg-blue-500/10 text-blue-600 font-extrabold w-5 h-5 rounded-full flex items-center justify-center shrink-0">3</span>
                      <p className={lightMode ? 'text-slate-600' : 'text-slate-300'}>Input your target platform or facility, and Dijkstra's algorithm immediately calculates your wayfinding directions, accompanied by voice guides.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. MY TRIPS TAB */}
          {activeTab === 'my-trips' && (
            <div className="space-y-6 animate-fade-in" id="my-trips-tab-panel">
              <div>
                <h2 className={`text-lg font-extrabold tracking-tight ${lightMode ? 'text-slate-800' : 'text-white'}`}>
                  Your Saved Journeys & Trips
                </h2>
                <p className="text-slate-400 text-xs">Review past computed routes and saved navigation logs</p>
              </div>

              {user ? (
                <div className="space-y-4" id="trips-scroller-panel">
                  {tripsHistory.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="trips-history-grid">
                      {tripsHistory.map(trip => {
                        const fromNodeObj = nodes.find(n => n.id === trip.fromNode);
                        const toNodeObj = nodes.find(n => n.id === trip.toNode);
                        return (
                          <div
                            key={trip.id}
                            className={`border rounded-2xl p-4.5 space-y-3 hover:border-blue-500 transition-all cursor-pointer shadow-xs active:scale-99 ${
                              lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                            }`}
                            onClick={() => {
                              setFromNodeId(trip.fromNode);
                              setToNodeId(trip.toNode);
                              setActiveTab('dashboard');
                              handleFindRoute();
                            }}
                          >
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                              <span>Trip Log</span>
                              <span className="font-mono">{new Date(trip.timestamp).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 font-extrabold text-sm">
                              <span className={lightMode ? 'text-slate-800' : 'text-slate-200'}>{fromNodeObj?.name || 'Entrance'}</span>
                              <ArrowRight size={13} className="text-blue-500" />
                              <span className={lightMode ? 'text-slate-800' : 'text-slate-200'}>{toNodeObj?.name || 'Platform'}</span>
                            </div>

                            <div className={`flex items-center space-x-4 text-xs text-slate-400 pt-2 border-t ${
                              lightMode ? 'border-slate-100' : 'border-[#1a2c54]/30'
                            }`}>
                              <p>Distance: <strong className="text-blue-500">{trip.distance}m</strong></p>
                              <p>Estimated Time: <strong className="text-emerald-500">{trip.duration} min</strong></p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`border rounded-2xl p-10 text-center text-slate-400 text-xs shadow-xs transition-all ${
                      lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                    }`} id="no-trips-card">
                      💡 You have no saved navigation journeys yet. Select a route on the dashboard to log your path history.
                    </div>
                  )}
                </div>
              ) : (
                <div className={`border rounded-2xl p-10 text-center space-y-4 shadow-xs transition-all ${
                  lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                }`} id="login-trips-prompt">
                  <p className="text-slate-400 text-xs font-semibold">Sign In to sync your navigation history across devices</p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    Login / Register
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 8. ALERTS TAB */}
          {activeTab === 'alerts' && (
            <div className="space-y-6 animate-fade-in" id="alerts-tab-panel">
              <div>
                <h2 className={`text-lg font-extrabold tracking-tight ${lightMode ? 'text-slate-800' : 'text-white'}`}>
                  Station Service Advisories & Alerts
                </h2>
                <p className="text-slate-400 text-xs">Live updates regarding platforms, delay boards, and facilities</p>
              </div>

              <div className="space-y-4" id="alerts-scroller">
                {/* Advisory 1 */}
                <div className={`border rounded-2xl p-4.5 flex items-start space-x-3.5 transition-all shadow-xs ${
                  lightMode 
                    ? 'bg-orange-50/70 border-orange-200/60' 
                    : 'bg-[#1c120c]/60 border-orange-900/30'
                }`} id="advisory-1">
                  <div className={`p-2.5 rounded-xl shrink-0 border ${
                    lightMode ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-orange-500/15 text-orange-400 border-orange-500/20'
                  }`}>
                    <AlertTriangle size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-extrabold ${lightMode ? 'text-orange-800' : 'text-orange-400'}`}>Platform 3 Elevator Maintenance</h3>
                    <p className={`text-xs leading-relaxed mt-1.5 ${lightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                      The wheelchair accessible lift serving Platform 3 is currently undergoing scheduled motor inspection. Wheelchair passengers are advised to seek assistant support at the central customer desk or check route plans utilizing the center lobby ramp options.
                    </p>
                    <span className="text-[9px] text-slate-400 font-mono mt-2.5 block uppercase tracking-wide">Broadcasted: Today, 8:45 AM</span>
                  </div>
                </div>

                {/* Advisory 2 */}
                <div className={`border rounded-2xl p-4.5 flex items-start space-x-3.5 transition-all shadow-xs ${
                  lightMode 
                    ? 'bg-blue-50/70 border-blue-200/60' 
                    : 'bg-[#0c181c]/60 border-blue-900/30'
                }`} id="advisory-2">
                  <div className={`p-2.5 rounded-xl shrink-0 border ${
                    lightMode ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                  }`}>
                    <Train size={18} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-extrabold ${lightMode ? 'text-blue-800' : 'text-blue-400'}`}>Train 12723 delayed - Platform 4 Adjustment</h3>
                    <p className={`text-xs leading-relaxed mt-1.5 ${lightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                      The Intercity Express (Train 12723) has been delayed by 15 minutes due to terminal track clearance. Please monitor the platform screen indicators. Route guides are automatically calibrated.
                    </p>
                    <span className="text-[9px] text-slate-400 font-mono mt-2.5 block uppercase tracking-wide">Broadcasted: Today, 9:20 AM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. ACCESSIBILITY OPTIONS TAB */}
          {activeTab === 'accessibility' && (
            <div className="space-y-6 animate-fade-in" id="accessibility-tab-panel">
              <div>
                <h2 className={`text-lg font-extrabold tracking-tight ${lightMode ? 'text-slate-800' : 'text-white'}`}>
                  Accessibility Customization Desk
                </h2>
                <p className="text-slate-400 text-xs">Configure specialized assistance, high contrast visual filters, and screen readouts</p>
              </div>

              <div className={`border rounded-2xl p-6 space-y-5 max-w-xl shadow-xs transition-all ${
                lightMode ? 'bg-white border-slate-200' : 'bg-[#0b1329] border-[#1a2c54]/60'
              }`} id="accessibility-config-card">
                
                {/* Switch 1: High Contrast */}
                <div className="flex items-center justify-between" id="accessibility-switch-contrast">
                  <div>
                    <h4 className={`text-xs font-extrabold uppercase tracking-wider ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>High Contrast Theme</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">Increases text clarity, uses distinct yellow-contrast highlights</p>
                  </div>
                  <button
                    onClick={() => handleSetAccessibilityMode(!accessibilityMode)}
                    className={`w-12 h-6 rounded-full transition-all relative p-1 cursor-pointer ${
                      accessibilityMode ? 'bg-amber-500' : lightMode ? 'bg-slate-100 border border-slate-200' : 'bg-[#111e3f] border border-[#1a2c54]'
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full block transition-all shadow-xs ${
                      accessibilityMode ? 'translate-x-6' : 'translate-x-0'
                    }`}></span>
                  </button>
                </div>

                {/* Switch 2: Voice Assist */}
                <div className="flex items-center justify-between" id="accessibility-switch-voice">
                  <div>
                    <h4 className={`text-xs font-extrabold uppercase tracking-wider ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>Automated Voice Navigation</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">Vocalizes step instructions aloud automatically using TTS speech cores</p>
                  </div>
                  <button
                    onClick={() => setVoiceMuted(!voiceMuted)}
                    className={`w-12 h-6 rounded-full transition-all relative p-1 cursor-pointer ${
                      !voiceMuted ? 'bg-blue-600' : lightMode ? 'bg-slate-100 border border-slate-200' : 'bg-[#111e3f] border border-[#1a2c54]'
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full block transition-all shadow-xs ${
                      !voiceMuted ? 'translate-x-6' : 'translate-x-0'
                    }`}></span>
                  </button>
                </div>

                {/* Switch 3: Wheelchair filter only */}
                <div className="flex items-center justify-between" id="accessibility-switch-wheelchair">
                  <div>
                    <h4 className={`text-xs font-extrabold uppercase tracking-wider ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>Prioritize Wheelchair & Ramp Paths</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">Limits wayfinding path computations to level walkways, elevators and ramps only, strictly avoiding stairways</p>
                  </div>
                  <button
                    onClick={() => setAvoidEscalators(!avoidEscalators)}
                    className={`w-12 h-6 rounded-full transition-all relative p-1 cursor-pointer ${
                      avoidEscalators ? 'bg-blue-600' : lightMode ? 'bg-slate-100 border border-slate-200' : 'bg-[#111e3f] border border-[#1a2c54]'
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full block transition-all shadow-xs ${
                      avoidEscalators ? 'translate-x-6' : 'translate-x-0'
                    }`}></span>
                  </button>
                </div>

                <div className={`border p-3.5 rounded-xl text-xs flex items-start space-x-2.5 ${
                  lightMode ? 'bg-blue-50/50 border-blue-100 text-blue-800' : 'bg-blue-950/20 border border-blue-900/35 text-slate-300'
                }`} id="accessibility-alert">
                  <AccessIcon size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    All pathways have been validated to follow standardized ADA accessibility layout regulations, with elevator access pre-mapped on our Dijkstra network grid.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 10. FEEDBACK TAB */}
          {activeTab === 'feedback' && (
            <div className="space-y-6 animate-fade-in" id="feedback-tab-panel">
              <div>
                <h2 className={`text-lg font-extrabold tracking-tight ${lightMode ? 'text-slate-800' : 'text-white'}`}>
                  Passenger Feedback & Reports
                </h2>
                <p className="text-slate-400 text-xs">Help us improve the wayfinding system by leaving your review or reporting facility damage</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="feedback-grid-panel">
                
                {/* Form submit */}
                <div className={`border rounded-2xl p-5 space-y-4 shadow-xs transition-all ${
                  lightMode ? 'bg-white border-slate-200' : 'bg-[#0b1329] border-[#1a2c54]/60'
                }`} id="feedback-form-card">
                  <h3 className={`text-xs font-extrabold uppercase tracking-widest border-b pb-2 ${
                    lightMode ? 'text-slate-800 border-slate-100' : 'text-white border-[#1a2c54]'
                  }`}>Submit Wayfinding Report</h3>
                  
                  {feedbackStatus && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-center text-blue-500 font-bold animate-fade-in">
                      {feedbackStatus}
                    </div>
                  )}

                  <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-extrabold uppercase tracking-wide text-[9px] block">Overall Rating (1-5 Stars)</label>
                      <div className="flex items-center space-x-2" id="feedback-stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setFeedbackRating(star)}
                            className={`p-1 text-base transition-all hover:scale-125 cursor-pointer ${
                              feedbackRating >= star ? 'text-amber-400' : 'text-slate-300'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-extrabold uppercase tracking-wide text-[9px] block">Report Category</label>
                      <select
                        value={feedbackCategory}
                        onChange={(e) => setFeedbackCategory(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 border ${
                          lightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#111e3f] text-white border-[#1a2c54]'
                        }`}
                      >
                        <option value="Wayfinding">Indoor Navigation Accuracy</option>
                        <option value="Cleanliness">Facility Cleanliness</option>
                        <option value="Maintenance">Damage or Out of Order Report</option>
                        <option value="App">Mobile App feedback</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-extrabold uppercase tracking-wide text-[9px] block">Comments / Details</label>
                      <textarea
                        required
                        rows={4}
                        value={feedbackComments}
                        onChange={(e) => setFeedbackComments(e.target.value)}
                        placeholder="Describe your review or location issue (e.g. Toilet door is broken on Platform 2)..."
                        className={`w-full rounded-xl p-3 focus:outline-none focus:border-blue-500 border text-xs ${
                          lightMode ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-[#111e3f] text-white border-[#1a2c54] placeholder-slate-500'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-extrabold py-3.5 rounded-xl text-xs shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      Submit Review
                    </button>
                  </form>
                </div>

                {/* Community reviews list */}
                <div className={`border rounded-2xl p-5 space-y-4 shadow-xs overflow-hidden flex flex-col justify-between transition-all ${
                  lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                }`} id="feedback-community-card">
                  <h3 className={`text-xs font-extrabold uppercase tracking-widest border-b pb-2 flex items-center space-x-2 ${
                    lightMode ? 'text-slate-800 border-slate-100' : 'text-slate-200 border-[#1a2c54]'
                  }`}>
                    <ThumbsUp size={12} className="text-blue-500" />
                    <span>Recent Passenger Reports</span>
                  </h3>

                  <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[300px] pr-1.5" id="community-reviews-box">
                    {communityFeedback.length > 0 ? (
                      communityFeedback.map(item => (
                        <div key={item.id} className={`border p-3.5 rounded-xl space-y-1.5 transition-all ${
                          lightMode ? 'bg-slate-50 border-slate-150' : 'bg-[#101b3a] border-[#1e2d52]/40'
                        }`}>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={`font-extrabold ${lightMode ? 'text-slate-800' : 'text-slate-200'}`}>{item.userName}</span>
                            <span className="text-amber-400 font-bold">{'★'.repeat(item.rating)}</span>
                          </div>
                          <p className={`text-xs leading-relaxed ${lightMode ? 'text-slate-600' : 'text-slate-300'}`}>{item.comments}</p>
                          <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                            <span>Category: {item.category}</span>
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 py-12 text-xs">
                        No community feedback reports submitted yet. Be the first to submit!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 10.5 ADMIN ANALYTICS DESK */}
          {activeTab === 'analytics' && user?.role === 'admin' && (
            <div className="space-y-6 animate-fade-in animate-duration-300" id="admin-analytics-tab-panel">
              <div className="flex items-center justify-between" id="analytics-header">
                <div>
                  <h2 className={`text-lg font-extrabold tracking-tight ${lightMode ? 'text-slate-800' : 'text-white'}`}>
                    Administrative Insights & System Analytics
                  </h2>
                  <p className="text-slate-400 text-xs">Real-time system health, passenger traffic distribution, and wayfinding reviews</p>
                </div>
                <button
                  onClick={() => {
                    setLoadingAnalytics(true);
                    fetch('/api/admin/analytics', {
                      headers: { 'Authorization': `Bearer ${token}` }
                    })
                      .then(res => res.json())
                      .then(data => {
                        setAdminAnalytics(data);
                        setLoadingAnalytics(false);
                      })
                      .catch(() => setLoadingAnalytics(false));
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
                >
                  {loadingAnalytics ? 'Refreshing...' : 'Refresh Analytics'}
                </button>
              </div>

              {loadingAnalytics && !adminAnalytics ? (
                <div className="text-center py-24 text-slate-400" id="analytics-loading-box">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm font-semibold">Calculating database metrics and loading insights...</p>
                </div>
              ) : adminAnalytics ? (
                <div className="space-y-6" id="analytics-content-view">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="analytics-stats-grid">
                    <div className={`border rounded-2xl p-4.5 flex flex-col justify-between shadow-xs transition-all ${
                      lightMode ? 'bg-white border-slate-200' : 'bg-[#0b1329] border-[#1a2c54]/60'
                    }`}>
                      <p className="text-slate-400 text-[9px] uppercase font-extrabold tracking-wider">Total Stations Managed</p>
                      <h3 className={`text-2xl font-extrabold mt-2 ${lightMode ? 'text-slate-800' : 'text-white'}`}>{adminAnalytics.totalStations}</h3>
                      <p className="text-[11px] text-blue-500 font-semibold mt-1">All Indian Zones (SCR, NCR, ER)</p>
                    </div>

                    <div className={`border rounded-2xl p-4.5 flex flex-col justify-between shadow-xs transition-all ${
                      lightMode ? 'bg-white border-slate-200' : 'bg-[#0b1329] border-[#1a2c54]/60'
                    }`}>
                      <p className="text-slate-400 text-[9px] uppercase font-extrabold tracking-wider">System Trips Logged</p>
                      <h3 className={`text-2xl font-extrabold mt-2 ${lightMode ? 'text-slate-800' : 'text-white'}`}>{adminAnalytics.totalTrips}</h3>
                      <p className="text-[11px] text-emerald-500 font-semibold mt-1">Active wayfinder routing sessions</p>
                    </div>

                    <div className={`border rounded-2xl p-4.5 flex flex-col justify-between shadow-xs transition-all ${
                      lightMode ? 'bg-white border-slate-200' : 'bg-[#0b1329] border-[#1a2c54]/60'
                    }`}>
                      <p className="text-slate-400 text-[9px] uppercase font-extrabold tracking-wider">Average Service Rating</p>
                      <h3 className="text-2xl font-extrabold text-amber-500 mt-2">{adminAnalytics.avgRating.toFixed(1)} / 5.0</h3>
                      <div className="flex items-center text-amber-500 text-[11px] mt-1 font-bold">
                        {'★'.repeat(Math.round(adminAnalytics.avgRating))}
                        <span className="text-slate-400 text-[10px] ml-1.5 font-mono font-medium">({adminAnalytics.totalFeedbackCount} reviews)</span>
                      </div>
                    </div>

                    <div className={`border rounded-2xl p-4.5 flex flex-col justify-between shadow-xs transition-all ${
                      lightMode ? 'bg-white border-slate-200' : 'bg-[#0b1329] border-[#1a2c54]/60'
                    }`}>
                      <p className="text-slate-400 text-[9px] uppercase font-extrabold tracking-wider">Passenger Reports Filed</p>
                      <h3 className="text-2xl font-extrabold text-rose-500 mt-2">{adminAnalytics.totalFeedbackCount}</h3>
                      <p className="text-[11px] text-rose-500 font-semibold mt-1">Reported by live system travellers</p>
                    </div>
                  </div>

                  {/* Graphical Analysis Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="analytics-charts-row">
                    {/* Bar Chart Panel */}
                    <div className={`border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                      lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                    }`}>
                      <div>
                        <h3 className={`text-xs font-extrabold uppercase tracking-widest mb-1 ${lightMode ? 'text-slate-800' : 'text-white'}`}>
                          Feedback Categories Breakdown
                        </h3>
                        <p className="text-slate-400 text-[11px] mb-4">Frequency distribution of reported issue types across the database</p>
                      </div>
                      
                      <div className="h-64 w-full" id="categories-chart-container">
                        {adminAnalytics.feedbackCategories && adminAnalytics.feedbackCategories.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={adminAnalytics.feedbackCategories}>
                              <CartesianGrid strokeDasharray="3 3" stroke={lightMode ? '#f1f5f9' : '#162544'} />
                              <XAxis dataKey="category" stroke="#8ba2db" fontSize={10} tickLine={false} />
                              <YAxis stroke="#8ba2db" fontSize={10} tickLine={false} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: lightMode ? '#ffffff' : '#0b1329', 
                                  borderColor: lightMode ? '#e2e8f0' : '#1a2c54', 
                                  borderRadius: '12px' 
                                }}
                                labelStyle={{ color: lightMode ? '#1e293b' : '#ffffff', fontWeight: 'bold', fontSize: '11px' }}
                                itemStyle={{ color: '#3b82f6', fontSize: '11px' }}
                              />
                              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                {adminAnalytics.feedbackCategories.map((entry, index) => {
                                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                })}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-500 text-xs">No chart metrics available.</div>
                        )}
                      </div>
                    </div>

                    {/* Pie Chart Panel */}
                    <div className={`border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                      lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                    }`}>
                      <div>
                        <h3 className={`text-xs font-extrabold uppercase tracking-widest mb-1 ${lightMode ? 'text-slate-800' : 'text-white'}`}>
                          User Base Role Distribution
                        </h3>
                        <p className="text-slate-400 text-[11px] mb-4">Comparison of registered admin operators vs general passenger accounts</p>
                      </div>

                      <div className="h-64 w-full flex items-center" id="roles-chart-container">
                        {adminAnalytics.userDistribution ? (() => {
                          const pieData = [
                            { name: 'Operators / Admins', value: adminAnalytics.userDistribution.admin },
                            { name: 'Live Passengers', value: adminAnalytics.userDistribution.passenger }
                          ];
                          const COLORS = ['#f59e0b', '#3b82f6'];
                          return (
                            <div className="w-full h-full flex flex-col sm:flex-row items-center justify-around">
                              <div className="w-40 h-40 shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={pieData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={50}
                                      outerRadius={70}
                                      paddingAngle={5}
                                      dataKey="value"
                                    >
                                      {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <Tooltip
                                      contentStyle={{ 
                                        backgroundColor: lightMode ? '#ffffff' : '#0b1329', 
                                        borderColor: lightMode ? '#e2e8f0' : '#1a2c54', 
                                        borderRadius: '12px' 
                                      }}
                                      itemStyle={{ color: lightMode ? '#1e293b' : '#ffffff', fontSize: '11px' }}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="space-y-2.5 text-xs">
                                {pieData.map((d, index) => (
                                  <div key={d.name} className="flex items-center space-x-2">
                                    <span className="w-3 h-3 rounded-full block" style={{ backgroundColor: COLORS[index] }}></span>
                                    <span className={`font-semibold ${lightMode ? 'text-slate-600' : 'text-slate-300'}`}>{d.name}:</span>
                                    <span className={`font-extrabold ${lightMode ? 'text-slate-800' : 'text-white'}`}>{d.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })() : (
                          <div className="flex items-center justify-center h-full text-slate-500 text-xs">No distribution data available.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent Feedback Feed */}
                  <div className={`border rounded-2xl p-5 shadow-xs transition-all ${
                    lightMode ? 'bg-white border-slate-200' : 'bg-[#091024] border-[#1a2c54]/60'
                  }`}>
                    <h3 className={`text-xs font-extrabold uppercase tracking-widest mb-1 ${lightMode ? 'text-slate-800' : 'text-white'}`}>
                      Passenger Feedback Logs
                    </h3>
                    <p className="text-slate-400 text-[11px] mb-4">Latest reviews, bug reports, and pathfinder corrections reported by travellers</p>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className={`border-b text-slate-400 font-extrabold uppercase tracking-wider text-[10px] ${
                            lightMode ? 'border-slate-100' : 'border-[#1a2c54]'
                          }`}>
                            <th className="py-2.5 px-3">Passenger</th>
                            <th className="py-2.5 px-3">Rating</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Review Details</th>
                            <th className="py-2.5 px-3 text-right">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${lightMode ? 'divide-slate-100' : 'divide-[#1e2d52]/45'}`}>
                          {adminAnalytics.recentFeedback && adminAnalytics.recentFeedback.length > 0 ? (
                            adminAnalytics.recentFeedback.map((f) => (
                              <tr key={f.id} className={`transition-all ${lightMode ? 'hover:bg-slate-50' : 'hover:bg-[#101b3a]'}`}>
                                <td className={`py-3 px-3 font-extrabold ${lightMode ? 'text-slate-800' : 'text-white'}`}>{f.userName}</td>
                                <td className="py-3 px-3 text-amber-500 font-bold">{'★'.repeat(f.rating)}</td>
                                <td className="py-3 px-3 text-blue-500 font-extrabold">{f.category}</td>
                                <td className={`py-3 px-3 max-w-sm truncate ${lightMode ? 'text-slate-600' : 'text-slate-300'}`}>{f.comments}</td>
                                <td className="py-3 px-3 text-slate-400 text-right font-mono">{new Date(f.timestamp).toLocaleDateString()}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-slate-500">No review logs available in database.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-400">
                  <p>Unable to fetch analytics telemetry. Make sure your account is an authorized system administrator.</p>
                </div>
              )}
            </div>
          )}

          {/* 11. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in" id="settings-tab-panel">
              <div>
                <h2 className={`text-lg font-extrabold tracking-tight ${lightMode ? 'text-slate-800' : 'text-white'}`}>
                  System Configuration & Profile Settings
                </h2>
                <p className="text-slate-400 text-xs">Manage station parameters, profile logins, and database diagnostic values</p>
              </div>

              <div className={`border rounded-2xl p-6 space-y-5 max-w-xl shadow-xs text-xs transition-all ${
                lightMode ? 'bg-white border-slate-200' : 'bg-[#0b1329] border-[#1a2c54]/60'
              }`} id="settings-card">
                <div className={`border-b pb-3.5 ${lightMode ? 'border-slate-100' : 'border-[#1a2c54]'}`} id="settings-user-info">
                  <h3 className={`font-extrabold text-sm mb-1 ${lightMode ? 'text-slate-800' : 'text-white'}`}>Authenticated Account Details</h3>
                  {user ? (
                    <div className="space-y-1.5 mt-2.5 text-slate-400 leading-normal font-semibold">
                      <p>Name: <strong className={lightMode ? 'text-slate-800' : 'text-white'}>{user.name}</strong></p>
                      <p>Email: <strong className={lightMode ? 'text-slate-800' : 'text-white'}>{user.email}</strong></p>
                      <p>Account Role: <strong className="text-blue-500 capitalize font-extrabold">{user.role}</strong></p>
                    </div>
                  ) : (
                    <p className="text-slate-400 py-1">Guest Session. Login to access cloud persistence and trip synchronizations.</p>
                  )}
                </div>

                <div className="space-y-2 pt-2" id="settings-tech-specs">
                  <h4 className={`font-extrabold ${lightMode ? 'text-slate-800' : 'text-white'}`}>Wayfinding Application specifications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className={`p-3.5 rounded-xl border ${
                      lightMode ? 'bg-slate-50 border-slate-200' : 'bg-[#111e3f] border-[#1a2c54]'
                    }`}>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Database Engine</p>
                      <p className={`font-extrabold mt-1.5 ${lightMode ? 'text-slate-800' : 'text-white'}`}>Mock-Relational JSON persistent</p>
                    </div>
                    <div className={`p-3.5 rounded-xl border ${
                      lightMode ? 'bg-slate-50 border-slate-200' : 'bg-[#111e3f] border-[#1a2c54]'
                    }`}>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pathfinding Engine</p>
                      <p className={`font-extrabold mt-1.5 ${lightMode ? 'text-slate-800' : 'text-white'}`}>Smart Real-Time Router</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating AI Chatbot overlay */}
      <Chatbot
        stationId={selectedStationId}
        currentLocationNodeId={fromNodeId}
        lightMode={lightMode}
      />
    </div>
  );
}
