/*
 * Arduino Uno — Sensor Reader for Fire & Gas Monitoring
 * 
 * Reads all sensors and sends CSV data to NodeMCU via Serial.
 * 
 * Sensors:
 *   - DHT11 (Temperature & Humidity) → Digital Pin 2
 *   - MQ2   (Smoke/Gas)              → Analog Pin A0
 *   - MQ7   (Carbon Monoxide)        → Analog Pin A1
 *   - MQ135  (Air Quality)           → Analog Pin A2
 *   - Flame Sensor (IR)              → Digital Pin 3
 * 
 * Output Format (Serial @ 9600 baud):
 *   temperature,humidity,mq2,mq7,mq135,flame
 *   Example: "30.5,60.2,200,150,300,0"
 * 
 * Libraries Required:
 *   - DHT sensor library by Adafruit
 *     Install via: Arduino IDE → Sketch → Include Library → Manage Libraries → search "DHT sensor library"
 */

#include <DHT.h>

// ──── Pin Definitions ───────────────────────────────────────
#define DHT_PIN      2      // DHT11 data pin
#define DHT_TYPE     DHT11  // DHT sensor type
#define MQ2_PIN      A0     // MQ2 analog pin
#define MQ7_PIN      A1     // MQ7 analog pin
#define MQ135_PIN    A2     // MQ135 analog pin
#define FLAME_PIN    3      // Flame sensor digital pin (LOW = fire detected)

// ──── Timing ────────────────────────────────────────────────
const unsigned long READ_INTERVAL = 2000; // Read sensors every 2 seconds
unsigned long lastReadTime = 0;

// ──── DHT Sensor ────────────────────────────────────────────
DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(9600);  // Serial communication with NodeMCU
  
  // Initialize DHT sensor
  dht.begin();
  
  // Configure flame sensor pin
  pinMode(FLAME_PIN, INPUT);
  
  // Wait for sensor warm-up (MQ sensors need ~20s, DHT needs ~2s)
  delay(3000);
}

void loop() {
  if (millis() - lastReadTime >= READ_INTERVAL) {
    lastReadTime = millis();
    
    // ── Read DHT11 ────────────────────────────────────────
    float temperature = dht.readTemperature();  // Celsius
    float humidity    = dht.readHumidity();      // Percentage
    
    // Check if DHT read failed
    if (isnan(temperature) || isnan(humidity)) {
      temperature = 0.0;
      humidity    = 0.0;
    }
    
    // ── Read MQ Sensors (analog values) ───────────────────
    int mq2   = analogRead(MQ2_PIN);    // 0-1023
    int mq7   = analogRead(MQ7_PIN);    // 0-1023
    int mq135 = analogRead(MQ135_PIN);  // 0-1023
    
    // ── Read Flame Sensor ─────────────────────────────────
    // Most flame sensors output LOW when fire is detected
    int flameRaw = digitalRead(FLAME_PIN);
    int flame = (flameRaw == LOW) ? 1 : 0;  // 1 = fire detected
    
    // ── Send CSV via Serial to NodeMCU ────────────────────
    // Format: temperature,humidity,mq2,mq7,mq135,flame
    Serial.print(temperature, 1);
    Serial.print(",");
    Serial.print(humidity, 1);
    Serial.print(",");
    Serial.print(mq2);
    Serial.print(",");
    Serial.print(mq7);
    Serial.print(",");
    Serial.print(mq135);
    Serial.print(",");
    Serial.println(flame);
  }
}
