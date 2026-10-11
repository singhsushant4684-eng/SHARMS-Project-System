const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to local MongoDB instance
mongoose.connect('mongodb://127.0.0.1:27017/sharms_db')
  .then(() => {
    console.log('📦 Connected to MongoDB successfully!');
    seedDefaultDevices();
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// 1. Define what a Device looks like in MongoDB
const deviceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  room: { type: String },
  status: { type: String, default: 'ONLINE' },
  isPoweredOn: { type: Boolean, default: false },
  targetTemp: { type: Number },
  isLocked: { type: Boolean }
});

// 2. Create the Model
const Device = mongoose.model('Device', deviceSchema);

// Seed default devices if the database is empty
async function seedDefaultDevices() {
  try {
    const count = await Device.countDocuments();
    if (count === 0) {
      const defaultDevices = [
        { id: 'dev-1', name: 'Main Ceiling Light', type: 'LIGHT', room: 'Living Room', status: 'ONLINE', isPoweredOn: true },
        { id: 'dev-2', name: 'Climate Thermostat', type: 'THERMOSTAT', room: 'Living Room', status: 'ONLINE', targetTemp: 22 },
        { id: 'dev-3', name: 'Front Smart Lock', type: 'LOCK', room: 'Entrance', status: 'ONLINE', isLocked: true },
        { id: 'dev-4', name: 'Bedroom Mood Lamp', type: 'LIGHT', room: 'Bedroom', status: 'ONLINE', isPoweredOn: false },
        { id: 'dev-5', name: 'Kitchen Leak Sensor', type: 'LIGHT', room: 'Kitchen', status: 'OFFLINE', isPoweredOn: false }
      ];
      await Device.insertMany(defaultDevices);
      console.log('🌱 Seeded default devices into MongoDB!');
    }
  } catch (err) {
    console.error('Error seeding devices:', err);
  }
}

// In-Memory Data Store (Audit Logs)
let auditLogs = [
  { id: 1, title: 'System Boot', type: 'INFO', message: 'SHARMS Core initialized successfully.', timestamp: new Date().toLocaleTimeString() }
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

  if (username === 'admin' && password === 'admin123') {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDIwMDAwMDB9.mock_sharms_jwt_signature';
    return res.status(200).json({ success: true, token: mockToken, message: 'Authentication successful!' });
  }

  return res.status(401).json({ success: false, message: 'Invalid username or password.' });
});

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
  auditLogs.unshift(newLog);
  res.status(201).json({ success: true, log: newLog });
});

// ==========================================
// MONGODB-POWERED DEVICE ROUTES
// ==========================================

// Get Devices Route (GET /api/devices)
app.get('/api/devices', async (req, res) => {
  try {
    const devices = await Device.find();
    res.json({ success: true, devices: devices }); // ✅ Wrap it so app.js can read it!
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch devices' });
  }
});

// Update Device State Route (PATCH /api/devices/:id)
app.put('/api/devices/:id', async (req, res) => {
  try {
    const updatedDevice = await Device.findOneAndUpdate(
      { id: req.params.id }, 
      req.body, 
      { new: true }
    );
    
    if (!updatedDevice) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    res.json({ success: true, device: updatedDevice });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update device' });
  }
});

// ==========================================

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

  if (electricityKW !== undefined) resourceData.electricityKW = electricityKW;
  if (waterLitres !== undefined) resourceData.waterLitres = waterLitres;
  if (gasM3 !== undefined) resourceData.gasM3 = gasM3;
  
  resourceData.lastUpdated = new Date().toLocaleTimeString();

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

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 SHARMS Backend running on http://localhost:${PORT}`);
});