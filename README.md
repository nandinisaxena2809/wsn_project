# 🛡️ FireGuard — IoT Fire & Gas Monitoring System

Real-time IoT sensor dashboard for fire and gas detection, built with Node.js, Express, MongoDB, Socket.IO, and React.

```
Sensors → Arduino Uno → NodeMCU (ESP8266) → WiFi → Express Backend → MongoDB → React Dashboard
```

---

## 📁 Project Structure

```
WSN_PROJEC/
├── backend/
│   ├── controllers/sensorController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/SensorData.js
│   ├── routes/sensorRoutes.js
│   ├── services/sensorService.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlertBanner.jsx
│   │   │   ├── AlertsTab.jsx
│   │   │   ├── AnalyticsTab.jsx
│   │   │   ├── DashboardTab.jsx
│   │   │   ├── GaugeChart.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── LiveDataCard.jsx
│   │   │   ├── SensorChart.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatusIndicator.jsx
│   │   │   └── SystemTab.jsx
│   │   ├── hooks/useSensorData.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── thresholds.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
└── hardware/
    ├── arduino_sensor_reader.ino   ← Upload to Arduino Uno
    └── nodemcu_sketch.ino          ← Upload to NodeMCU ESP8266
```

---

## 🚀 How to Test Locally (Step by Step)

### Prerequisites

| Tool | Why? | Install |
|------|------|---------|
| **Node.js v18+** | Run backend + frontend | https://nodejs.org |
| **MongoDB** | Store sensor data | Already configured (MongoDB Atlas) |

Your backend `.env` is already pointing to your **MongoDB Atlas cluster** — no local MongoDB needed.

---

### Step 1: Start the Backend

```bash
cd backend
npm install
npm run dev
```

You should see output like:
```
[MongoDB] Connected successfully
[Server] Running on http://localhost:5000
[Server] Also accessible on your LAN — use your PC's IP address
[Socket.IO] WebSocket server ready
[LAN IP] http://192.168.x.x:5000/api/sensor-data    ← Note this for NodeMCU!
```

**⚡ The `[LAN IP]` line shows the URL you need for NodeMCU. Copy it.**

---

### Step 2: Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

You'll see the FireGuard dashboard with 4 tabs: Dashboard, Analytics, Alerts, System.

---

### Step 3: Test with Simulated Data (No Hardware Needed)

Open a **new terminal** and send fake sensor data to verify everything works:

#### Single reading:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/sensor-data" -Method Post -ContentType "application/json" -Body '{"temperature":32.5,"humidity":55,"mq2":180,"mq7":90,"mq135":250,"flame":false}'
```

#### Simulate 20 continuous readings (like NodeMCU would):

```powershell
for ($i = 1; $i -le 20; $i++) {
    $body = @{
        temperature = [math]::Round(25 + (Get-Random -Maximum 200) / 10, 1)
        humidity    = [math]::Round(40 + (Get-Random -Maximum 400) / 10, 1)
        mq2         = 100 + (Get-Random -Maximum 400)
        mq7         = 50 + (Get-Random -Maximum 200)
        mq135       = 100 + (Get-Random -Maximum 350)
        flame       = ($i % 15 -eq 0)  # flame every 15th reading
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost:5000/api/sensor-data" -Method Post -ContentType "application/json" -Body $body
    Write-Host "Sent reading $i / 20"
    Start-Sleep -Seconds 2
}
```

**Watch the dashboard update in real-time as each reading arrives!**

#### Test danger alerts:

```powershell
# This will trigger DANGER alerts on the dashboard
Invoke-RestMethod -Uri "http://localhost:5000/api/sensor-data" -Method Post -ContentType "application/json" -Body '{"temperature":65,"humidity":95,"mq2":600,"mq7":250,"mq135":500,"flame":true}'
```

#### Check what's stored:

```powershell
# Latest reading
Invoke-RestMethod -Uri "http://localhost:5000/api/sensor-data/latest"

# Last 50 readings
Invoke-RestMethod -Uri "http://localhost:5000/api/sensor-data/history?limit=50"
```

---

## 🔌 NodeMCU Hardware Connection (Full Guide)

### Is it ready for NodeMCU? **YES!** Here's exactly how to connect:

### Overview

```
┌─────────────────┐      Serial (9600 baud)      ┌───────────────────┐      WiFi (HTTP POST)      ┌──────────────────┐
│   Arduino Uno   │ ──────────────────────────── │  NodeMCU ESP8266  │ ──────────────────────── │  Your PC/Server  │
│                 │  TX → RX (voltage divider)   │                   │  POST JSON every 5s     │  Express :5000   │
│  Reads sensors  │  GND → GND                  │  Parses CSV       │                          │  MongoDB Atlas   │
│  Sends CSV      │                              │  Sends JSON       │                          │  React :5173     │
└─────────────────┘                              └───────────────────┘                          └──────────────────┘
```

---

### Hardware You Need

| Component | Quantity | Purpose |
|-----------|----------|---------|
| Arduino Uno | 1 | Reads all sensors |
| NodeMCU ESP8266 | 1 | WiFi gateway — sends data to server |
| DHT11 | 1 | Temperature & humidity |
| MQ2 Gas Sensor | 1 | Smoke / LPG / methane |
| MQ7 Gas Sensor | 1 | Carbon monoxide (CO) |
| MQ135 Gas Sensor | 1 | Air quality (NH3, NOx, CO2) |
| Flame Sensor (IR) | 1 | Fire / flame detection |
| 10kΩ + 20kΩ Resistors | 1 each | Voltage divider (5V→3.3V on Serial) |
| Breadboard + Jumper Wires | Several | Connections |

---

### Wiring Diagram

#### Arduino Uno Sensor Connections:

```
Sensor          Arduino Pin     Notes
──────────────  ──────────────  ──────────────────────────
DHT11 DATA   →  Digital Pin 2   + 10kΩ pull-up to 5V
DHT11 VCC    →  5V
DHT11 GND    →  GND

MQ2   AOUT   →  Analog A0       Analog output
MQ2   VCC    →  5V
MQ2   GND    →  GND

MQ7   AOUT   →  Analog A1       Analog output
MQ7   VCC    →  5V
MQ7   GND    →  GND

MQ135 AOUT   →  Analog A2       Analog output
MQ135 VCC    →  5V
MQ135 GND    →  GND

Flame DO     →  Digital Pin 3   LOW = fire detected
Flame VCC    →  5V
Flame GND    →  GND
```

#### Arduino → NodeMCU Serial Connection:

```
⚠️ IMPORTANT: NodeMCU is 3.3V! You MUST use a voltage divider on the Serial line.

                    10kΩ
Arduino TX ────────┤
                    ├──────── NodeMCU RX (D7 or hardware RX)
                   20kΩ
                    ├──────── GND
                    
Arduino GND ──────────────── NodeMCU GND

DO NOT connect Arduino TX directly to NodeMCU RX — it will damage the NodeMCU!
```

**Voltage divider formula:** Vout = 5V × (20kΩ / (10kΩ + 20kΩ)) = 3.3V ✓

---

### Step 1: Upload Arduino Code

1. Open **Arduino IDE**
2. Install the **DHT sensor library** by Adafruit:
   - Go to: `Sketch → Include Library → Manage Libraries`
   - Search: `DHT sensor library`
   - Install it (by Adafruit)
3. Open file: `hardware/arduino_sensor_reader.ino`
4. Select: `Tools → Board → Arduino Uno`
5. Select the correct COM port
6. Click **Upload** ✓

The Arduino will now read all sensors every 2 seconds and send CSV data via Serial.

---

### Step 2: Upload NodeMCU Code

1. **Install ESP8266 board support** in Arduino IDE:
   - Go to: `File → Preferences`
   - Add this Board Manager URL:
     ```
     http://arduino.esp8266.com/stable/package_esp8266com_index.json
     ```
   - Go to: `Tools → Board → Boards Manager`
   - Search: `esp8266` → Install
2. **Install ArduinoJson library**:
   - Go to: `Sketch → Include Library → Manage Libraries`
   - Search: `ArduinoJson` (by Benoît Blanchon) → Install
3. Open file: `hardware/nodemcu_sketch.ino`
4. **⚡ EDIT THESE 3 LINES:**

   ```cpp
   const char* WIFI_SSID     = "your-wifi-name";        // ← Your WiFi name
   const char* WIFI_PASSWORD  = "your-wifi-password";    // ← Your WiFi password
   const char* SERVER_URL     = "http://192.168.x.x:5000/api/sensor-data";  // ← Your PC's LAN IP
   ```

   **How to find your PC's LAN IP:**
   - Start the backend (`npm run dev` in the backend folder)
   - Look for the `[LAN IP]` line in the terminal output
   - Or run: `ipconfig` in PowerShell and find your IPv4 address under your WiFi adapter

5. Select: `Tools → Board → NodeMCU 1.0 (ESP-12E Module)`
6. Set Upload Speed: `115200`
7. Select the correct COM port
8. Click **Upload** ✓

---

### Step 3: Connect & Run

1. Wire everything as shown above
2. Start your backend: `cd backend && npm run dev`
3. Start your frontend: `cd frontend && npm run dev`
4. Power on the Arduino + NodeMCU
5. **Both devices must be on the same WiFi network as your PC**
6. Open `http://localhost:5173` and watch real sensor data appear!

---

### Troubleshooting NodeMCU Connection

| Problem | Solution |
|---------|----------|
| NodeMCU won't connect to WiFi | Double-check SSID and password. Make sure it's 2.4GHz (ESP8266 doesn't support 5GHz) |
| Data not showing on dashboard | Check `SERVER_URL` — it must be your PC's LAN IP, not `localhost` |
| "Connection refused" | Make sure backend is running and Windows Firewall allows port 5000 |
| Garbled Serial data | Ensure both Arduino and NodeMCU use 9600 baud rate |
| NodeMCU gets damaged | You forgot the voltage divider! Always use 10kΩ/20kΩ on TX→RX |

**To allow port 5000 through Windows Firewall:**
```powershell
# Run PowerShell as Administrator
New-NetFirewallRule -DisplayName "Allow NodeMCU" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sensor-data` | Submit new sensor reading |
| `GET`  | `/api/sensor-data/latest` | Get latest reading |
| `GET`  | `/api/sensor-data/history?limit=100` | Get historical data |
| `GET`  | `/api/sensor-data/export/csv` | Download data as CSV |
| `GET`  | `/api/health` | Server health check |

### POST Body Format (what NodeMCU sends):

```json
{
  "temperature": 30.5,
  "humidity": 60.2,
  "mq2": 200,
  "mq7": 150,
  "mq135": 300,
  "flame": false
}
```

---

## ⚠️ Alert Thresholds

| Sensor | Warning | Danger |
|--------|---------|--------|
| Temperature | > 45°C | > 60°C |
| Humidity | > 80% | > 95% |
| MQ2 (Smoke) | > 300 ppm | > 500 ppm |
| MQ7 (CO) | > 100 ppm | > 200 ppm |
| MQ135 (Air) | > 200 ppm | > 400 ppm |
| Flame | — | Detected |

---

## 🌟 Features

- ✅ **4-Tab Dashboard** — Dashboard, Analytics, Alerts, System
- ✅ **Real-time WebSocket** updates via Socket.IO
- ✅ **Auto-refresh fallback** (10s polling if WebSocket disconnects)
- ✅ **Custom SVG gauges** with color-coded zones
- ✅ **Historical charts** with gradient fills (Recharts)
- ✅ **Alert timeline** with danger/warning filtering
- ✅ **Raw data table** with status badges
- ✅ **CSV data export**
- ✅ **Time-range filtering** (5m, 15m, 1h, 6h, 24h)
- ✅ **Sensor selector** in Analytics tab
- ✅ **System info page** with hardware config + API docs
- ✅ **Joi input validation** on all incoming data
- ✅ **Responsive design** — works on mobile (sidebar collapses)
- ✅ **Premium dark theme** with glassmorphism + orb animations
- ✅ **NodeMCU ready** — just set WiFi credentials and server IP!
