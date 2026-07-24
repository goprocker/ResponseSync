import {
  ZoneRisk,
  IoTSensorNode,
  EmergencyResource,
  EmergencyShelter,
  CitizenReport,
  AgentActivityLog,
  ExplainableAIRecommendation,
  AutomatedAlert,
  EvacuationRoute,
  EmergencyHospital
} from './types';

export const CHENNAI_CENTER: [number, number] = [12.988, 80.230];

export const INITIAL_ZONES: ZoneRisk[] = [
  {
    id: 'zone-velachery-south',
    name: 'Velachery South & Lake View Colony',
    coords: [
      [12.982, 80.212],
      [12.985, 80.228],
      [12.971, 80.232],
      [12.968, 80.215]
    ],
    center: [12.976, 80.222],
    riskScore: 88,
    confidenceScore: 94,
    priorityLevel: 'CRITICAL',
    currentWaterLevelMeters: 1.4,
    predictedWaterLevel30m: 1.8,
    predictedWaterLevel1h: 2.3,
    predictedWaterLevel2h: 2.9,
    rainfallRateMmHr: 85,
    drainageCongestionPct: 92,
    populationAtRisk: 34200,
    estimatedTimeToInundationMin: 25,
    status: 'evacuating'
  },
  {
    id: 'zone-adyar-riverbank',
    name: 'Adyar River Bank - Kotturpuram',
    coords: [
      [13.018, 80.230],
      [13.015, 80.250],
      [13.002, 80.248],
      [13.006, 80.228]
    ],
    center: [13.010, 80.239],
    riskScore: 78,
    confidenceScore: 91,
    priorityLevel: 'HIGH',
    currentWaterLevelMeters: 1.1,
    predictedWaterLevel30m: 1.4,
    predictedWaterLevel1h: 1.9,
    predictedWaterLevel2h: 2.4,
    rainfallRateMmHr: 72,
    drainageCongestionPct: 84,
    populationAtRisk: 21500,
    estimatedTimeToInundationMin: 40,
    status: 'warning'
  },
  {
    id: 'zone-taramani-omr',
    name: 'Taramani Canal & OMR IT Junction',
    coords: [
      [12.992, 80.240],
      [12.995, 80.258],
      [12.980, 80.255],
      [12.978, 80.238]
    ],
    center: [12.986, 80.248],
    riskScore: 62,
    confidenceScore: 89,
    priorityLevel: 'MEDIUM',
    currentWaterLevelMeters: 0.6,
    predictedWaterLevel30m: 0.8,
    predictedWaterLevel1h: 1.2,
    predictedWaterLevel2h: 1.6,
    rainfallRateMmHr: 65,
    drainageCongestionPct: 68,
    populationAtRisk: 18400,
    estimatedTimeToInundationMin: 75,
    status: 'monitoring'
  },
  {
    id: 'zone-guindy-underpass',
    name: 'Guindy Industrial & Railway Underpass',
    coords: [
      [13.004, 80.202],
      [13.008, 80.218],
      [12.992, 80.218],
      [12.990, 80.205]
    ],
    center: [12.998, 80.211],
    riskScore: 82,
    confidenceScore: 96,
    priorityLevel: 'CRITICAL',
    currentWaterLevelMeters: 1.2,
    predictedWaterLevel30m: 1.6,
    predictedWaterLevel1h: 2.1,
    predictedWaterLevel2h: 2.6,
    rainfallRateMmHr: 78,
    drainageCongestionPct: 88,
    populationAtRisk: 12800,
    estimatedTimeToInundationMin: 30,
    status: 'warning'
  },
  {
    id: 'zone-perungudi-marsh',
    name: 'Perungudi Marshland Outfall Corridor',
    coords: [
      [12.970, 80.232],
      [12.972, 80.250],
      [12.955, 80.248],
      [12.954, 80.230]
    ],
    center: [12.963, 80.240],
    riskScore: 45,
    confidenceScore: 85,
    priorityLevel: 'LOW',
    currentWaterLevelMeters: 0.4,
    predictedWaterLevel30m: 0.5,
    predictedWaterLevel1h: 0.8,
    predictedWaterLevel2h: 1.1,
    rainfallRateMmHr: 50,
    drainageCongestionPct: 40,
    populationAtRisk: 8200,
    estimatedTimeToInundationMin: 120,
    status: 'safe'
  }
];

export const INITIAL_IOT_SENSORS: IoTSensorNode[] = [
  {
    id: 'sensor-velachery-lake-sluice',
    name: 'Velachery Lake Sluice Gate 02',
    type: 'water_level',
    lat: 12.972,
    lng: 80.220,
    currentValue: 2.85,
    unit: 'm (Depth)',
    thresholdWarning: 2.0,
    thresholdCritical: 2.6,
    batteryPct: 94,
    signalPct: 98,
    status: 'critical',
    lastUpdated: 'Just now'
  },
  {
    id: 'sensor-kotturpuram-bridge',
    name: 'Adyar River Kotturpuram Gauge',
    type: 'water_level',
    lat: 13.011,
    lng: 80.237,
    currentValue: 3.42,
    unit: 'm (Stage)',
    thresholdWarning: 2.8,
    thresholdCritical: 3.2,
    batteryPct: 88,
    signalPct: 92,
    status: 'critical',
    lastUpdated: 'Just now'
  },
  {
    id: 'sensor-100ft-rd-canal',
    name: '100 Feet Road Canal Ultrasonic Sensor',
    type: 'water_level',
    lat: 12.981,
    lng: 80.223,
    currentValue: 1.55,
    unit: 'm (Depth)',
    thresholdWarning: 1.2,
    thresholdCritical: 1.5,
    batteryPct: 91,
    signalPct: 95,
    status: 'warning',
    lastUpdated: '2 mins ago'
  },
  {
    id: 'sensor-taramani-pluviometer',
    name: 'Taramani Automatic Rain Gauge',
    type: 'rain_gauge',
    lat: 12.987,
    lng: 80.246,
    currentValue: 88.0,
    unit: 'mm/hr',
    thresholdWarning: 50.0,
    thresholdCritical: 75.0,
    batteryPct: 99,
    signalPct: 100,
    status: 'critical',
    lastUpdated: 'Just now'
  },
  {
    id: 'sensor-buckingham-flow',
    name: 'Buckingham Canal Velocity Radar',
    type: 'flow_rate',
    lat: 12.998,
    lng: 80.252,
    currentValue: 4.8,
    unit: 'm³/s',
    thresholdWarning: 3.5,
    thresholdCritical: 5.0,
    batteryPct: 82,
    signalPct: 90,
    status: 'warning',
    lastUpdated: '1 min ago'
  }
];

export const INITIAL_RESOURCES: EmergencyResource[] = [
  {
    id: 'res-ndrf-01',
    name: 'NDRF Battalion 04 - Rescue Boats Unit',
    type: 'rescue_boat',
    lat: 12.989,
    lng: 80.218,
    assignedZoneId: 'zone-velachery-south',
    status: 'deployed',
    crewCount: 16,
    fuelOrSuppliesPct: 85,
    equipment: ['4x Inflatable Motor Boats', 'Life Jackets x60', 'Satellite Comm', 'Thermal Scanners'],
    contactNumber: '+91 94440 12345'
  },
  {
    id: 'res-amb-02',
    name: '108 Emergency Ambulance Unit 12',
    type: 'ambulance',
    lat: 13.008,
    lng: 80.242,
    assignedZoneId: 'zone-adyar-riverbank',
    status: 'en_route',
    crewCount: 3,
    fuelOrSuppliesPct: 92,
    equipment: ['Advanced Life Support', 'Portable Ventilator', 'Trauma Kit'],
    contactNumber: '+91 94440 67890'
  },
  {
    id: 'res-fire-03',
    name: 'Tamil Nadu Fire & Rescue Station - Velachery',
    type: 'fire_truck',
    lat: 12.980,
    lng: 80.225,
    assignedZoneId: 'zone-velachery-south',
    status: 'deployed',
    crewCount: 10,
    fuelOrSuppliesPct: 78,
    equipment: ['Heavy High-Capacity Water Pumps (500 HP)', 'Hydraulic Cutters', 'Search Lights'],
    contactNumber: '+91 44 2243 0101'
  },
  {
    id: 'res-police-04',
    name: 'Greater Chennai Police Patrol - Adyar Division',
    type: 'police_patrol',
    lat: 13.003,
    lng: 80.235,
    assignedZoneId: 'zone-guindy-underpass',
    status: 'deployed',
    crewCount: 8,
    fuelOrSuppliesPct: 90,
    equipment: ['Road Block Barricades', 'Public Address System', 'Drones'],
    contactNumber: '+91 44 2345 2000'
  },
  {
    id: 'res-relief-05',
    name: 'Municipal Food & Water Distribution Truck A',
    type: 'relief_truck',
    lat: 12.990,
    lng: 80.238,
    assignedZoneId: undefined,
    status: 'available',
    crewCount: 5,
    fuelOrSuppliesPct: 100,
    equipment: ['2500 Packaged Meals', '5000L Drinking Water Bottles', 'Dry Ration Kits'],
    contactNumber: '+91 98400 99881'
  }
];

export const INITIAL_SHELTERS: EmergencyShelter[] = [
  {
    id: 'shelter-velachery-comm',
    name: 'Velachery Community Center Relief Camp',
    address: 'Near MRTS Station, Velachery Main Road',
    lat: 12.983,
    lng: 80.218,
    totalCapacity: 1200,
    currentOccupancy: 840,
    foodSuppliesDays: 4,
    medicalStaffPresent: true,
    powerBackup: true,
    status: 'open',
    contactPerson: 'Officer S. Ramesh',
    phone: '+91 94451 90100'
  },
  {
    id: 'shelter-adyar-govt-school',
    name: 'Adyar Govt Higher Secondary School Relief Hub',
    address: 'Lattice Bridge Road, Adyar',
    lat: 13.005,
    lng: 80.252,
    totalCapacity: 2000,
    currentOccupancy: 1150,
    foodSuppliesDays: 6,
    medicalStaffPresent: true,
    powerBackup: true,
    status: 'open',
    contactPerson: 'Dr. M. Deepa',
    phone: '+91 94451 90200'
  },
  {
    id: 'shelter-guindy-sports-complex',
    name: 'Guindy Indoor Stadium Emergency Center',
    address: 'GST Road, Guindy',
    lat: 13.009,
    lng: 80.212,
    totalCapacity: 3500,
    currentOccupancy: 1200,
    foodSuppliesDays: 7,
    medicalStaffPresent: true,
    powerBackup: true,
    status: 'open',
    contactPerson: 'Captain V. Kumar',
    phone: '+91 94451 90300'
  }
];

export const INITIAL_CITIZEN_REPORTS: CitizenReport[] = [
  {
    id: 'report-101',
    reporterName: 'Karthik Subramanian',
    phone: '+91 98840 11223',
    timestamp: '10 mins ago',
    lat: 12.977,
    lng: 80.221,
    locationName: 'Velachery 100ft Road near Vijaya Nagar Junction',
    category: 'waterlogging',
    severity: 'critical',
    description: 'Water level reached 4 feet. Ground floor apartments submerged. 12 elderly residents stranded inside house.',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    aiValidationScore: 96,
    aiValidatedCategory: 'Severe Flood - Trapped Citizens',
    aiSummary: 'High credibility report verified with IoT Sluice gauge data (+2.8m water). Immediate rescue boat needed.',
    status: 'verified',
    assignedResourceId: 'res-ndrf-01'
  },
  {
    id: 'report-102',
    reporterName: 'Anitha Rajan',
    phone: '+91 97900 44556',
    timestamp: '22 mins ago',
    lat: 13.012,
    lng: 80.239,
    locationName: 'Kotturpuram Housing Board Block B',
    category: 'trapped_citizens',
    severity: 'high',
    description: 'Adyar river water leaking into compound wall. Power cut in area. Transformer sparked.',
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80',
    aiValidationScore: 91,
    aiValidatedCategory: 'Riverbank Breach Risk',
    aiSummary: 'Cross-validated with Adyar Stage Gauge (3.42m). Substation isolation alert sent to TNEB.',
    status: 'dispatched',
    assignedResourceId: 'res-amb-02'
  },
  {
    id: 'report-103',
    reporterName: 'Senthil Kumar',
    phone: '+91 94430 88776',
    timestamp: '35 mins ago',
    lat: 12.997,
    lng: 80.210,
    locationName: 'Guindy Railway Subway',
    category: 'road_block',
    severity: 'critical',
    description: 'Subway completely submerged up to 5 feet. Two cars stalled inside. Traffic diverted.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    aiValidationScore: 98,
    aiValidatedCategory: 'Critical Transportation Route Block',
    aiSummary: 'Automated road barrier triggered via Traffic Agent. Route recalculation active on map.',
    status: 'dispatched',
    assignedResourceId: 'res-police-04'
  }
];

export const INITIAL_AGENT_LOGS: AgentActivityLog[] = [
  {
    id: 'log-1',
    agentName: 'Weather Agent',
    timestamp: '10:24:12 AM',
    action: 'Radar Echo Scan',
    details: 'Heavy convective cloud cell over South Chennai. Rainfall intensity 85 mm/hr recorded in Velachery cluster.',
    severity: 'alert'
  },
  {
    id: 'log-2',
    agentName: 'Satellite Agent',
    timestamp: '10:24:30 AM',
    action: 'Sentinel SAR Flood Inundation Analysis',
    details: 'Detected 3.2 sq km expanding water surface area along Velachery Lake & Adyar spillway corridors.',
    severity: 'warning'
  },
  {
    id: 'log-3',
    agentName: 'Flood Prediction Agent',
    timestamp: '10:24:55 AM',
    action: 'Hydrodynamic Simulation Model',
    details: 'Predicted +0.9m surge in next 45 minutes for Velachery South. Evacuation priority escalated to CRITICAL.',
    severity: 'alert'
  },
  {
    id: 'log-4',
    agentName: 'Evacuation Agent',
    timestamp: '10:25:10 AM',
    action: 'Dynamic Route Optimization',
    details: 'Closed Guindy Railway Underpass corridor. Rerouted 1,200 vehicles towards GST Flyover & Lattice Bridge Rd.',
    severity: 'info'
  },
  {
    id: 'log-5',
    agentName: 'Explainability Agent',
    timestamp: '10:25:20 AM',
    action: 'Recommendation Rationale Generated',
    details: 'Provided 5-part evidence tree for NDRF Motor Boat deployment to Vijaya Nagar Junction.',
    severity: 'success'
  }
];

export const INITIAL_RECOMMENDATIONS: ExplainableAIRecommendation[] = [
  {
    id: 'rec-001',
    title: 'Deploy Heavy High-Capacity Pumps & 2 NDRF Rescue Boats to Velachery Lake View',
    targetZoneId: 'zone-velachery-south',
    targetZoneName: 'Velachery South & Lake View Colony',
    actionType: 'deploy_boats',
    recommendedResources: [
      { resourceType: 'Rescue Boat Unit', quantity: 2 },
      { resourceType: '500 HP Water Pump', quantity: 3 }
    ],
    priority: 'CRITICAL',
    timestamp: '10:22 AM',
    reasoning: {
      coreReason: 'Rapid lake sluice overflow (+2.85m) combining with 85mm/hr rain intensity threatens 34,200 residents within 25 minutes.',
      evidenceData: [
        'IoT Sensor "Velachery Lake Sluice" crossed critical threshold (2.85m vs 2.6m limit)',
        '3 Verified Citizen Reports confirm 4ft water level on 100ft road',
        'Satellite SAR imagery shows 18% increase in inundated perimeter over last 20 mins'
      ],
      confidencePct: 96,
      supportingMetrics: [
        { metric: 'Rainfall Rate', value: '85 mm/hr' },
        { metric: 'Drainage Congestion', value: '92%' },
        { metric: 'Inundation Lead Time', value: '25 Minutes' }
      ],
      riskExplanation: 'Delaying deployment by 20 minutes will trap an estimated 1,400 ground-floor inhabitants and cause high-risk medical transport failures.',
      alternativeRisk: 'If resources are diverted to Kotturpuram instead, Velachery inundation speed will outpace rescue capabilities.'
    },
    status: 'pending'
  },
  {
    id: 'rec-002',
    title: 'Order Controlled Sluice Release & Pre-Evacuate Kotturpuram Low-Lying Tenements',
    targetZoneId: 'zone-adyar-riverbank',
    targetZoneName: 'Adyar River Bank - Kotturpuram',
    actionType: 'evacuate',
    recommendedResources: [
      { resourceType: 'Evacuation Buses', quantity: 8 },
      { resourceType: 'Police Escort Squads', quantity: 4 }
    ],
    priority: 'HIGH',
    timestamp: '10:20 AM',
    reasoning: {
      coreReason: 'Upstream Chembarambakkam discharge + high tide at 11:15 AM will elevate Adyar river stage above 3.8m embankment height.',
      evidenceData: [
        'Adyar River Kotturpuram Gauge reading 3.42m (Critical threshold 3.2m)',
        'Tomorrow.io high-tide forecast predicts +0.4m estuarine backwater effect',
        'Traffic congestion index along Kotturpuram bridge is rising to 84%'
      ],
      confidencePct: 92,
      supportingMetrics: [
        { metric: 'Adyar Stage', value: '3.42 m' },
        { metric: 'Estuarine Backwater', value: '+0.4 m expected' },
        { metric: 'Est. Evacuation Time', value: '35 Minutes' }
      ],
      riskExplanation: 'Pre-evacuation prevents panic crowding during peak river surge expected at 11:15 AM.',
      alternativeRisk: 'Uncoordinated evacuation during high tide will cause gridlock on Lattice Bridge Road.'
    },
    status: 'pending'
  }
];

export const INITIAL_ALERTS: AutomatedAlert[] = [
  {
    id: 'alert-01',
    timestamp: '10:25 AM',
    headline: 'FLASH FLOOD ALERT: Velachery 100ft Road & Lake Colony Inundation',
    zone: 'Velachery South',
    severity: 'critical',
    agenciesNotified: ['Disaster Management Authority', 'Tamil Nadu Fire & Rescue', 'Greater Chennai Police', '108 Ambulance'],
    instructions: 'Evacuate ground floor apartments immediately towards Velachery Community Center Relief Camp. Avoid Guindy Railway Subway.',
    acknowledged: false
  },
  {
    id: 'alert-02',
    timestamp: '10:15 AM',
    headline: 'ROAD CLOSURE: Guindy Subway Completely Submerged',
    zone: 'Guindy Railway Underpass',
    severity: 'danger',
    agenciesNotified: ['Traffic Police Control Room', 'Corporation Officers'],
    instructions: 'Subway blocked. Use GST Road Flyover or Kathipara Junction route.',
    acknowledged: true
  }
];

export const MOCK_EVACUATION_ROUTE: EvacuationRoute = {
  id: 'route-velachery-to-shelter',
  originName: 'Velachery 100ft Road (Flooded Zone)',
  destinationShelterName: 'Velachery Community Center Relief Camp',
  distanceKm: 2.1,
  estimatedTimeMinutes: 8,
  safetyScorePct: 98,
  waypoints: [
    [12.977, 80.221],
    [12.979, 80.220],
    [12.981, 80.218],
    [12.983, 80.218]
  ],
  hazardsAvoided: ['Guindy Railway Subway (Submerged)', 'Lake Sluice Breach Zone', 'High Voltage Substation Flooding'],
  turnByTurnInstructions: [
    'Head NORTH on 100 Feet Road away from lake sluice (Water level < 0.2m)',
    'Turn LEFT onto Inner Ring Road elevate ramp',
    'Follow elevated corridor past Vijaya Nagar Junction',
    'Arrive safely at Velachery Community Center Relief Camp (Gate 02)'
  ]
};

export const INITIAL_HOSPITALS: EmergencyHospital[] = [
  {
    id: 'hosp-01',
    name: 'Chennai General Trauma Hospital & Medical Center',
    address: 'Velachery 100ft Road, near Vijaya Nagar',
    lat: 12.980,
    lng: 80.220,
    totalCapacity: 120,
    occupiedCapacity: 104,
    icuBedsTotal: 15,
    icuBedsAvailable: 2,
    status: 'near_capacity',
    contactPerson: 'Dr. A. Vinodh',
    phone: '+91 94441 55660',
    hasTraumaCenter: true
  },
  {
    id: 'hosp-02',
    name: 'Fortis Emergency Specialty Clinic - Adyar',
    address: 'LB Road, Adyar, Chennai',
    lat: 13.003,
    lng: 80.245,
    totalCapacity: 80,
    occupiedCapacity: 45,
    icuBedsTotal: 10,
    icuBedsAvailable: 6,
    status: 'normal',
    contactPerson: 'Dr. S. K. Roy',
    phone: '+91 94441 77880',
    hasTraumaCenter: true
  },
  {
    id: 'hosp-03',
    name: 'Apollo Hospital & Emergency Response Unit',
    address: 'Guindy Main Road, Chennai',
    lat: 13.012,
    lng: 80.215,
    totalCapacity: 200,
    occupiedCapacity: 195,
    icuBedsTotal: 25,
    icuBedsAvailable: 0,
    status: 'full',
    contactPerson: 'Director R. K. Nair',
    phone: '+91 44 2235 1234',
    hasTraumaCenter: true
  },
  {
    id: 'hosp-04',
    name: 'KMC Disaster Support Clinic - Taramani',
    address: 'Taramani Link Road, Chennai',
    lat: 12.989,
    lng: 80.246,
    totalCapacity: 60,
    occupiedCapacity: 30,
    icuBedsTotal: 5,
    icuBedsAvailable: 3,
    status: 'normal',
    contactPerson: 'Dr. Rita Sen',
    phone: '+91 94441 99000',
    hasTraumaCenter: false
  }
];
