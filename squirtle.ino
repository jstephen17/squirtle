#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>

#define SENSOR_PIN 25
#define RELAY_PIN 14

#define TEST_LED 4

const char* SSID = "HUAWEI-2.4G-a9Ub";
const char* PASS = "CRGPY73b";

AsyncWebServer server(80);

unsigned long timeBefore = 0;
unsigned long interval = 150;

int DRY_THRESHOLD = 60;
int moist = 0;

int WATERDURATION = 15000;
int WATERCOOLDOWN = 30000;

bool OVERRIDE = false;

int waterTime = 0;
int cd = WATERCOOLDOWN;

bool pumpWater = false;

int readMoisture(){
  int value = analogRead(SENSOR_PIN);

  return map(value, 0, 4095, 255, 0);
}

void pumpOn(){
  if(!pumpWater || OVERRIDE) return;

  if(waterTime == 0) digitalWrite(RELAY_PIN, HIGH);
  
  waterTime++;

  if(waterTime >= WATERDURATION){
    pumpWater = false;
    digitalWrite(RELAY_PIN, LOW);
  }
}


void setup() {
  Serial.begin(115200);

  WiFi.begin(SSID, PASS);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  if (!LittleFS.begin()) {
    Serial.println("LittleFS mount failed!");
    return;
  }
  Serial.println("LittleFS mounted.");

  // Serve all files in LittleFS root as static
  server.serveStatic("/", LittleFS, "/")
        .setDefaultFile("index.html");

  // Example API endpoint
   server.on("/pump/on", HTTP_GET, [](AsyncWebServerRequest *req){
        digitalWrite(TEST_LED, HIGH);
        digitalWrite(RELAY_PIN, HIGH);
        OVERRIDE = true;
        req->send(200, "text/plain", "PUMP ON");
    });

    server.on("/pump/off", HTTP_GET, [](AsyncWebServerRequest *req){
        digitalWrite(TEST_LED, LOW);
        digitalWrite(RELAY_PIN, LOW);
        OVERRIDE = false;
        req->send(200, "text/plain", "PUMP OFF");
    });

  server.begin();
  Serial.println("Server started.");

  pinMode(TEST_LED, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
  moist = readMoisture();
}

void loop() {
  unsigned long current = millis();

  if(current - timeBefore >= 1){
      timeBefore = current;
      moist = readMoisture();

      if(moist < DRY_THRESHOLD && cd == WATERCOOLDOWN && !OVERRIDE) {
        cd = 0; waterTime = 0; pumpWater = true;
      }

      Serial.println(moist);

      if(!pumpWater){
        cd++;
        if(cd >= WATERCOOLDOWN){
          cd = WATERCOOLDOWN;
        }
      }

      if(!OVERRIDE)pumpOn();

    }
} 
