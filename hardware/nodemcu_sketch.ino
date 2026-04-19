/*
 * NodeMCU (ESP8266) Sensor Data Transmitter
 * 
 * Reads sensor data from Arduino via Serial and sends it as JSON
 * via HTTP POST to the monitoring backend server.
 *
 * Hardware Setup:
 *   Arduino Uno → NodeMCU ESP8266
 *   - Arduino TX → NodeMCU RX (through voltage divider 5V→3.3V)
 *   - Arduino GND → NodeMCU GND
 *
 * Arduino sends CSV format: temperature,humidity,mq2,mq7,mq135,flame
 * Example: "30.5,60.2,200,150,300,0"
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

// ──── WiFi Credentials ──────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ──── Server Configuration ──────────────────────────────────
const char* SERVER_URL = "http://YOUR_SERVER_IP:5000/api/sensor-data";

// ──── Timing ────────────────────────────────────────────────
const unsigned long SEND_INTERVAL = 5000; // Send data every 5 seconds
unsigned long lastSendTime = 0;

// ──── Sensor Data Variables ─────────────────────────────────
float temperature = 0;
float humidity    = 0;
int   mq2        = 0;
int   mq7        = 0;
int   mq135      = 0;
bool  flame      = false;

WiFiClient wifiClient;

void setup() {
  Serial.begin(9600); // Communication with Arduino
  delay(100);
  
  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    // Successfully connected
    // WiFi.localIP() contains the assigned IP
  }
}

void loop() {
  // Read data from Arduino via Serial
  if (Serial.available()) {
    String data = Serial.readStringUntil('\n');
    data.trim();
    parseSerialData(data);
  }
  
  // Send data at regular intervals
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    if (WiFi.status() == WL_CONNECTED) {
      sendSensorData();
    } else {
      // Attempt reconnection
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
      delay(3000);
    }
    lastSendTime = millis();
  }
}

/**
 * Parse CSV data received from Arduino.
 * Expected format: "temperature,humidity,mq2,mq7,mq135,flame"
 * Example: "30.5,60.2,200,150,300,0"
 */
void parseSerialData(String data) {
  int idx = 0;
  int lastComma = -1;
  int field = 0;
  
  for (int i = 0; i <= data.length(); i++) {
    if (i == data.length() || data.charAt(i) == ',') {
      String value = data.substring(lastComma + 1, i);
      value.trim();
      
      switch (field) {
        case 0: temperature = value.toFloat(); break;
        case 1: humidity    = value.toFloat(); break;
        case 2: mq2        = value.toInt();    break;
        case 3: mq7        = value.toInt();    break;
        case 4: mq135      = value.toInt();    break;
        case 5: flame      = (value.toInt() == 1); break;
      }
      
      lastComma = i;
      field++;
    }
  }
}

/**
 * Send sensor data as JSON via HTTP POST to the backend server.
 */
void sendSensorData() {
  HTTPClient http;
  
  http.begin(wifiClient, SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  
  // Build JSON payload
  StaticJsonDocument<256> doc;
  doc["temperature"] = temperature;
  doc["humidity"]    = humidity;
  doc["mq2"]        = mq2;
  doc["mq7"]        = mq7;
  doc["mq135"]      = mq135;
  doc["flame"]      = flame;
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  // Send POST request
  int httpResponseCode = http.POST(jsonPayload);
  
  if (httpResponseCode > 0) {
    // Success - response code is in httpResponseCode
    String response = http.getString();
  } else {
    // Error sending request
  }
  
  http.end();
}
