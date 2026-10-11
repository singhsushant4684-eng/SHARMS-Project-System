const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory Data Store (Audit Logs)
let auditLogs = [
  { id: 1, title: 'System Boot', type: 'INFO', message: 'SHARMS Core initialized successfully.', timestamp: new Date().toLocaleTimeString() }
];

// In-Memory Device Store
let devices = [
  { id: 'dev-1', name: 'Main Ceiling Light', type: 'LIGHT', room: 'Living Room', status: 'ONLINE', isPoweredOn: true },
  { id: 'dev-2', name: 'Climate Thermostat', type: 'THERMOSTAT', room: 'Living Room', status: 'ONLINE', targetTemp: 22 },
  { id: 'dev-3', name: 'Front Smart Lock', type: 'LOCK', room: 'Entrance', status: 'ONLINE', isLocked: true },
  { id: 'dev-4', name: 'Bedroom Mood Lamp', type: 'LIGHT', room: 'Bedroom', status: 'ONLINE', isPoweredOn: false },
  { id: 'dev-5', name: 'Kitchen Leak Sensor', type: 'LIGHT', room: 'Kitchen', status: 'OFFLINE', isPoweredOn: false }
];

// In-Memory Resource Store
let resourceData = {
  electricityKW: 1.42,
  waterLitres: 125.5,
  gasM3: 0.85,
  lastUpdated: new Date().toLocaleTimeString()
};

let resourceHistory = [
  { id: 1, metric: 'ELECTRICITY', value: 1.42, unit: 'kW', timestamp: '10:00 AM' },
  { id: 2, metric: 'WATER', value: 125.5, unit: 'Litres', timestamp: '10:00 AM' }
];

// 1. Authentication Route (POST /api/auth/login)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  // Hardcoded admin check
  if (username === 'admin' && password === 'admin123') {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDIwMDAwMDB9.mock_sharms_jwt_signature';
    
    return res.status(200).json({
      success: true,
      token: mockToken,
      message: 'Authentication successful!'
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid username or password.'
  });
});

// 2. Get Audit Logs Route (GET /api/logs)
// 2. Get Audit Logs Route (GET /api/logs)
app.get('/api/logs', (req, res) => {
  res.status(200).json({ success: true, logs: auditLogs });
});

// 3. Add Audit Log Route (POST /api/logs)
app.post('/api/logs', (req, res) => {
  const { title, type, message } = req.body;
  const newLog = {
    id: auditLogs.length + 1,
    title: title || 'System Event',
    type: type || 'INFO',
    message: message || 'Action performed.',
    timestamp: new Date().toLocaleTimeString()
  };
  auditLogs.unshift(newLog); // Adds to the top of the array
  res.status(201).json({ success: true, log: newLog });
});

// Get Devices Route (GET /api/devices)
app.get('/api/devices', (req, res) => {
  res.status(200).json({ success: true, devices });
});

// Update Device State Route (PUT /api/devices/:id)
app.put('/api/devices/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const device = devices.find(d => d.id === id);
  if (!device) {
    return res.status(404).json({ success: false, message: 'Device not found.' });
  }

  Object.assign(device, updates);
  res.status(200).json({ success: true, device });
});

// Get Resource Metrics Route (GET /api/resources)
app.get('/api/resources', (req, res) => {
  res.status(200).json({ 
    success: true, 
    resources: resourceData,
    history: resourceHistory 
  });
});

// Update or Record Resource Metrics Route (POST /api/resources)
app.post('/api/resources', (req, res) => {
  const { electricityKW, waterLitres, gasM3 } = req.body;

  // Update current metrics if provided
  if (electricityKW !== undefined) resourceData.electricityKW = electricityKW;
  if (waterLitres !== undefined) resourceData.waterLitres = waterLitres;
  if (gasM3 !== undefined) resourceData.gasM3 = gasM3;
  
  resourceData.lastUpdated = new Date().toLocaleTimeString();

  // Optionally push to history log
  const newEntry = {
    id: resourceHistory.length + 1,
    metric: 'UPDATE',
    value: electricityKW || waterLitres || gasM3,
    timestamp: resourceData.lastUpdated
  };
  resourceHistory.unshift(newEntry);

  res.status(200).json({ 
    success: true, 
    message: 'Resource metrics updated successfully.', 
    resources: resourceData 
  });
});

let ecoModeActive = false;

app.get('/api/ecomode', (req, res) => {
  res.json({ success: true, ecoModeActive });
});

app.post('/api/ecomode', (req, res) => {
  const { active } = req.body;
  ecoModeActive = active;

  if (ecoModeActive) {
    devices.forEach(dev => {
      if (dev.type === 'LIGHT' && dev.status === 'ONLINE') {
        dev.isPoweredOn = false;
      }
      if (dev.type === 'THERMOSTAT' && dev.status === 'ONLINE') {
        dev.targetTemp = 20;
      }
    });
  }

  res.json({ 
    success: true, 
    ecoModeActive, 
    message: ecoModeActive ? 'EcoMode activated. Systems optimized for low power.' : 'EcoMode deactivated.',
    devices 
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 SHARMS Backend running on http://localhost:${PORT}`);
});