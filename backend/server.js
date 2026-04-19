require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const sensorRoutes = require('./routes/sensorRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// ──────────────────────────────────────────────
// Socket.IO Setup
// ──────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────
app.use(cors());  // Allow all origins (needed for NodeMCU HTTP requests)
app.use(express.json());

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/sensor-data', sensorRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// ──────────────────────────────────────────────
// MongoDB Connection & Server Start
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fire_gas_monitor';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('[MongoDB] Connected successfully');
    // Bind to 0.0.0.0 so NodeMCU can reach this server over WiFi
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log(`[Server] Also accessible on your LAN — use your PC's IP address`);
      console.log(`[Socket.IO] WebSocket server ready`);
      // Print local IP for NodeMCU configuration
      const os = require('os');
      const nets = os.networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            console.log(`[LAN IP] http://${net.address}:${PORT}/api/sensor-data`);
          }
        }
      }
    });
  })
  .catch((err) => {
    console.error('[MongoDB] Connection failed:', err.message);
    process.exit(1);
  });

module.exports = { app, server, io };
