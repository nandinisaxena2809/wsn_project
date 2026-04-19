/*
 * Fire & Gas Monitoring — ESP8266 (NodeMCU) Integrated Sketch
 *
 * Reads sensors directly on the NodeMCU, controls alert LEDs,
 * and sends JSON data to the backend via WiFi HTTP POST.
 *
 * Sensors used:
 *   - MQ2  (Smoke/LPG)    → A0 (Analog)
 *   - MQ7  (CO)            → D5 (Digital: HIGH = gas detected)
 *   - DHT11 (Temperature)  → D1
 *
 * Alert LEDs:
 *   - TEMP_LED → D6 (turns ON when temp > threshold)
 *   - GAS_LED  → D7 (turns ON when gas detected)
 *
 * Libraries Required (install via Arduino IDE Library Manager):
 *   - DHT sensor library (by Adafruit)
 *   - ArduinoJson (by Benoit Blanchon)
 *   - ESP8266WiFi (built-in with ESP8266 board package)
 *   - ESP8266HTTPClient (built-in with ESP8266 board package)
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ──── WiFi & Backend Settings ──────────────────────────────
const char* WIFI_SSID     = "your-wifi-name";        // ← Your WiFi name
const char* WIFI_PASSWORD = "your-wifi-password";     // ← Your WiFi password
const char* SERVER_URL    = "http://192.168.x.x:5000/api/sensor-data";  // ← Your PC's LAN IP

WiFiClient wifiClient;

// ──── Pins ─────────────────────────────────────────────────
#define MQ2_PIN   A0    // Analog
#define MQ7_PIN   D5    // Digital

#define TEMP_LED  D6
#define GAS_LED   D7

#define DHTPIN    D1
#define DHTTYPE   DHT11

DHT dht(DHTPIN, DHTTYPE);

// ──── Thresholds ───────────────────────────────────────────
int   gasThreshold  = 300;
float tempThreshold = 35.0;

void setup() {
  Serial.begin(115200);

  pinMode(MQ7_PIN,  INPUT);
  pinMode(TEMP_LED, OUTPUT);
  pinMode(GAS_LED,  OUTPUT);

  dht.begin();

  // Connect to WiFi
  Serial.println("\n=== Fire & Gas Monitor ===");
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(" Failed! Will retry in loop...");
  }

  Serial.println("System Started...");
}

void loop() {

  // ──── Read Sensors ─────────────────────────────────────────
  int   mq2  = analogRead(MQ2_PIN);       // 0-1024
  int   mq7  = digitalRead(MQ7_PIN);      // HIGH = gas detected
  float temp  = dht.readTemperature();     // Celsius

  if (isnan(temp)) temp = 0;

  // ──── LED Logic ────────────────────────────────────────────

  // Temperature LED
  if (temp > tempThreshold)
    digitalWrite(TEMP_LED, HIGH);
  else
    digitalWrite(TEMP_LED, LOW);

  // Gas LED
  if (mq2 > gasThreshold || mq7 == HIGH)
    digitalWrite(GAS_LED, HIGH);
  else
    digitalWrite(GAS_LED, LOW);

  // ──── Serial Output ────────────────────────────────────────
  Serial.print("MQ2: ");
  Serial.print(mq2);

  Serial.print(" | MQ7: ");
  Serial.print(mq7 == HIGH ? "Gas Detected" : "Safe");

  Serial.print(" | Temp: ");
  Serial.print(temp);
  Serial.println(" °C");

  // ──── Send Data to Backend ─────────────────────────────────
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(wifiClient, SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    // Build JSON — only the 3 sensors we actually have
    StaticJsonDocument<128> doc;
    doc["temperature"] = temp;
    doc["mq2"]         = mq2;
    doc["mq7"]         = (mq7 == HIGH) ? 1 : 0;  // Send 1/0 for digital

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    int httpCode = http.POST(jsonPayload);

    if (httpCode > 0) {
      Serial.print("[OK] Server responded: ");
      Serial.println(httpCode);
    } else {
      Serial.print("[ERR] HTTP error: ");
      Serial.println(httpCode);
    }

    http.end();
  } else {
    Serial.println("[WIFI] Disconnected, reconnecting...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }

  delay(2000);
}
