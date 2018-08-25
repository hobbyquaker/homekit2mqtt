# homekit2mqtt 

[![mqtt-smarthome](https://img.shields.io/badge/mqtt-smarthome-blue.svg)](https://github.com/mqtt-smarthome/mqtt-smarthome)
[![NPM version](https://badge.fury.io/js/homekit2mqtt.svg)](http://badge.fury.io/js/homekit2mqtt)
[![dependencies Status](https://david-dm.org/hobbyquaker/homekit2mqtt/status.svg)](https://david-dm.org/hobbyquaker/homekit2mqtt)
[![Build Status](https://travis-ci.org/hobbyquaker/homekit2mqtt.svg?branch=master)](https://travis-ci.org/hobbyquaker/homekit2mqtt)
[![Coverage Status](https://coveralls.io/repos/github/hobbyquaker/homekit2mqtt/badge.svg?branch=master)](https://coveralls.io/github/hobbyquaker/homekit2mqtt?branch=master)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![License][mit-badge]][mit-url]

HomeKit to MQTT bridge 🏡📱

> Depends on [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS) by [KhaosT](https://github.com/KhaosT), all credits belong to him.

This project follows the [mqtt-smarthome architecture](https://github.com/mqtt-smarthome).
I'm using this to control a multitude of MQTT-connected "Things" in my home automation through Siri and with HomeKit apps.

***Warning***: Version 0.9.4 possibly introduces a breaking change. Due to the issue #89 service subtypes where 
added, please give your Home app a few minutes to get updates, if the accessories don't work at all anymore after an 
update from <=0.9.3 to >=0.9.4 you have to delete the persistence files and delete and re-add the bridge in iOS...:-(

## Installation

**Requirements** 

 * Debian, Ubuntu, Raspbian or macOS
 * [Node.js](https://nodejs.org) 6 or higher
 * If you want to use the Camera Service [FFmpeg](https://www.ffmpeg.org/) has to be installed (on Linux: `sudo apt install ffmpeg`)

`sudo npm install -g homekit2mqtt --unsafe-perm`   

I suggest to use [pm2](http://pm2.keymetrics.io/) to manage the homekit2mqtt process (start on system boot, manage log 
files, ...)


## Command Line Options

<pre>
Usage: homekit2mqtt [options]

Options:
  -v, --verbosity       possible values: "error", "warn", "info", "debug"
                                                               [default: "info"]
  -m, --mapfile         JSON file containing HomeKit Services to MQTT mapping
                        definitions. See Readme.                       [default:
                                                  "./example-homekit2mqtt.json"]
  -n, --name            instance name. used as prefix for connected topic
                                                            [default: "homekit"]
  -u, --url             mqtt broker url.           [default: "mqtt://127.0.0.1"]
  -s, --storagedir      directory to store homekit data
  -p, --port            port homekit2mqtt is listening on       [default: 51826]
  -w, --web-port        port webserver is listening on          [default: 51888]
  -x, --disable-web     disable webserver
  --disable-json-parse  disable json parsing of received mqtt payloads [boolean]
  --insecure            allow tls connections with invalid certificates[boolean]
  --retain              if set, ALL MQTT messages sent will have the retain flag
                        set                                            [boolean]
  -h, --help            Show help                                      [boolean]
  --version             Show version number                            [boolean]
  -c, --pincode                                          [default: "031-45-154"]
  -a, --username                                  [default: "CC:22:3D:E3:CE:F6"]
  -b, --bridgename                                      [default: "MQTT Bridge"]

                                                             
</pre>

#### Persisted Data

I strongly advice you to set the `--storagedir` and `--mapfile` option to a directory outside of the homekit2mqtt 
folder, otherwise an update of homekit2mqtt could overwrite your config.

#### MQTT Authentication and TLS

You can put credentials for authentication in the url supplied to the `--url` option: `mqtt://user:password@broker`. If
you want to use TLS for the connection to the broker use `mqtts://` as URL scheme, e.g. `mqtts://broker:8883`.

#### MQTT Payload parsing

By default homekit2mqtt parses incoming JSON payloads and tries to use the attribute `val` (following 
[mqtt-smarthome payload convention](https://github.com/mqtt-smarthome/mqtt-smarthome/blob/master/Architecture.md)). For
a future release it is planned that this attribute will be configurable 
(see https://github.com/hobbyquaker/homekit2mqtt/issues/67).

If you set the `--disable-json-parse` option there will be no JSON parsing at all and homekit2mqtt just hands the 
incoming JSON through as string.

Plain (non-JSON) payloads containing the strings `true` or `false` are casted to boolean. Strings containing numbers
are casted to numbers with parseFloat().


## Configuration

homekit2mqtt needs a JSON file that defines devices and mappings from MQTT-topics and payloads to 
HomeKit-characteristics. You can either create this manually or use the Web UI to configure homekit2mqtt. The Webserver
listens on Port 51888 by default, authentication username is `homekit` and the password is the pincode (`031-45-154` by
default).

![Web UI](docs/screen1.png)
![Web UI](docs/screen2.png)

See [example-homekit2mqtt.json](example-homekit2mqtt.json) for an example configuration. Every Accessory is represented 
like this in the JSON file:

```javascript
  "TemperatureSensor": {                                    // Unique name - used to generate the accessory UUID
    "name": "TemperatureSensor LivingRoom",                 // Accessory name
    "services": [
        {
            "service": "TemperatureSensor",                 // HomeKit service type (see available service types below)
            "name": "Temperature LivingRoom",               // Service name
            "topic": {                                              
                // ... MQTT topic configuration ...
            },
            "payload": {
                // ... MQTT payload configuration ...
            },
            "props": {
                // ... Optional Characteristic properties
            },
            "config": {
                // ... Optional Service configuration
            }       
        },
        // ... more services
    ],
    "manufacturer": "DIY Home Brew",                        // Additional accessory infos (optional)
    "model": "TemperatureSensor"                            // Additional accessory infos (optional)
  }
```
## Available Service Types

#### AirPurifier

topic

* statusActive
* setActive
* statusCurrentAirPurifierState    
  0 = INACTIVE, 1 = IDLE, 2 = PURIFYING_AIR
* statusTargetAirPurifierState    
  0 = MANUAL, 1 = AUTO
* setTargetAirPurifierState    
  0 = MANUAL, 1 = AUTO
* statusLockPhysicalControls (optional)    
  0 = CONTROL_LOCK_DISABLED, 1 = CONTROL_LOCK_ENABLED
* setLockPhysicalControls (optional)    
  0 = CONTROL_LOCK_DISABLED, 1 = CONTROL_LOCK_ENABLED
* statusSwingMode (optional)    
  0 = SWING_DISABLED, 1 = SWING_ENABLED
* setLockSwingMode (optional)    
  0 = SWING_DISABLED, 1 = SWING_ENABLED
* statusRotationSpeed (optional)    
  Percentage 0-100
* setRotationSpeed (optional)    
  Percentage 0-100

payload

* activeTrue (optional, default: `true`)
* invertActive (optional, default: `false`)
* rotationSpeedFactor (optional, default: `1`)


#### AirQualitySensor

topic

* statusAirQuality    
  0 = UNKNOWN, 1 = EXCELLENT, 2 = GOOD, 3 = FAIR, 4 = INFERIOR, 5 = POOR
* statusOzoneDensity (optional)
* statusNitrogenDioxideDensity (optional)
* statusSulphurDioxideDensity (optional)
* statusPM2_5Density (optional)
* statusPM10Density (optional)
* statusVOCDensity (optional)
* statusCarbonMonoxideLevel (optional)
* statusCarbonDioxideLevel (optional)
* onLowBattery (optional)
* onTampered (optional)
* onActive (optional)
* onFault (optional)

payload

* onLowBattery (optional)
* invertLowBattery (optional, default: `false`)
* onTampered (optional)
* invertTampered (optional, default: `false`)
* onActive (optional)
* invertActive (optional, default: `false`)
* onFault (optional)
* invertFault (optional, default: `false`)


#### BatteryService

topic

* statusBatteryLevel    
  Percentage 0-100
* statusChargingState    
  0 = NOT_CHARGING, 1 = CHARGING, 2 = NOT_CHARGEABLE
* statusLowBattery    
  0 = BATTERY_LEVEL_NORMAL, 1 = BATTERY_LEVEL_LOW

payload

* onLowBattery
* invertLowBattery (optional, default: `false`)
* minBatteryLevel (optional, default: `0`)
* maxBatteryLevel (optional, default: `100`)


#### CameraRTSPStreamManagement

topic


payload


config

* source  (default: `-re -i rtsp://myfancy_rtsp_stream`)
* stillImageSource  (default: `-i http://faster_still_image_grab_url/this_is_optional.jpg`)
* maxStreams  (default: `2`)    
  the maximum number of streams that will be generated for this camera
* maxWidth  (default: `1280`)
* maxHeight  (default: `720`)
* maxFPS  (default: `10`)    
  the maximum frame rate of the stream
* maxBitrate  (default: `300`)    
  the maximum bit rate of the stream in kbit/s
* vcodec  (default: `libx264`)    
  If you're running on a RPi with the omx version of ffmpeg installed, you can change to "h264_omx" for hardware accelerated video codec
* audio     
  can be set to true to enable audio streaming from camera. To use audio ffmpeg must be compiled with --enable-libfdk-aac, see https://github.com/KhaosT/homebridge-camera-ffmpeg/wiki
* packetSize  (default: `1316`)    
  If audio or video is choppy try a smaller value, set to a multiple of 188
* debug     
  Show the output of ffmpeg in the log
* videoProcessor  (default: `ffmpeg`)


#### CarbonDioxideSensor

topic

* statusCarbonDioxideDetected
* statusCarbonDioxideLevel (optional)
* statusCarbonDioxidePeakLevel (optional)
* statusTampered (optional)
* statusActive (optional)
* statusFault (optional)

payload

* onCarbonDioxideDetected
* onLowBattery (optional)
* invertLowBattery (optional, default: `false`)
* onTampered (optional)
* invertTampered (optional, default: `false`)
* onActive (optional)
* invertActive (optional, default: `false`)
* onFault (optional)
* invertFault (optional, default: `false`)


#### CarbonMonoxideSensor

topic

* statusCarbonMonoxideDetected
* statusCarbonMonoxideLevel (optional)
* statusCarbonMonoxidePeakLevel (optional)
* statusLowBattery (optional)
* statusTampered (optional)
* statusActive (optional)
* statusFault (optional)

payload

* onCarbonMonoxideDetected
* onLowBattery (optional)
* invertLowBattery (optional, default: `false`)
* onTampered (optional)
* invertTampered (optional, default: `false`)
* onActive (optional)
* invertActive (optional, default: `false`)
* onFault (optional)
* invertFault (optional, default: `false`)


#### ContactSensor

topic

* statusContactSensorState
* statusLowBattery (optional)
* statusTampered (optional)
* statusActive (optional)
* statusFault (optional)

payload

* onContactDetected
* onLowBattery (optional)
* invertLowBattery (optional, default: `false`)
* onTampered (optional)
* invertTampered (optional, default: `false`)
* onActive (optional)
* invertActive (optional, default: `false`)
* onFault (optional)
* invertFault (optional, default: `false`)


#### Door

topic

* setTargetPosition
* statusTargetPosition (optional)
* statusCurrentPosition (optional)
* statusPositionState (optional)
* statusObstruction (optional)
* setHoldPosition (optional)

payload

* targetPositionFactor (optional)
* currentPositionFactor (optional)
* positionStatusDecreasing (optional)
* positionStatusIncreasing (optional)
* onObstructionDetected (optional)
* holdPositionTrue (optional, default: `true`)
* holdPositionFalse (optional, default: `false`)


#### Doorbell

topic

* statusEvent

payload



#### Fan

topic

* setOn
* statusOn (optional)
* setRotationDirection (optional)
* statusRotationDirection (optional)
* setRotationSpeed (optional)
* statusRotationSpeed (optional)

payload

* onTrue (optional, default: `true`)
* onFalse (optional, default: `false`)
* rotationDirectionCounterClockwise (optional, default: `1`)
* rotationDirectionClockwise (optional, default: `0`)
* rotationSpeedFactor (optional, default: `1`)


#### Fanv2

topic

* statusActive
* setActive
* statusCurrentFanState    
  0 = INACTIVE, 1 = IDLE, 2 = PURIFYING_AIR
* statusTargetFanState    
  0 = MANUAL, 1 = AUTO
* setTargetFanState    
  0 = MANUAL, 1 = AUTO
* statusLockPhysicalControls (optional)    
  0 = CONTROL_LOCK_DISABLED, 1 = CONTROL_LOCK_ENABLED
* setLockPhysicalControls (optional)    
  0 = CONTROL_LOCK_DISABLED, 1 = CONTROL_LOCK_ENABLED
* statusSwingMode (optional)    
  0 = SWING_DISABLED, 1 = SWING_ENABLED
* setLockSwingMode (optional)    
  0 = SWING_DISABLED, 1 = SWING_ENABLED
* statusRotationSpeed (optional)    
  Percentage 0-100
* setRotationSpeed (optional)    
  Percentage 0-100
* statusRotationDirection (optional)    
  0 = CLOCKWISE, 1 = COUNTER_CLOCKWISE
* setRotationDirection (optional)    
  0 = CLOCKWISE, 1 = COUNTER_CLOCKWISE

payload

* activeTrue (optional, default: `true`)
* invertActive (optional, default: `false`)
* rotationSpeedFactor (optional, default: `1`)


#### Faucet

topic

* setActive
* statusActive (optional)
* statusFault (optional)

payload

* activeTrue (optional, default: `true`)
* invertActive (optional, default: `false`)
* faultTrue (optional, default: `true`)
* invertFault (optional, default: `false`)


#### FilterMaintenance

topic

* statusFilterChangeIndication
* statusFilterLifeLevel (optional)    
  Percentage 0-100
* setResetFilterIndication (optional)

payload



#### GarageDoorOpener

topic

* setDoor
* statusDoor (optional)    
  0 = OPEN, 1 = CLOSED; 2 = OPENING, 3 = CLOSING, 4 = STOPPED
* statusObstruction (optional)
* setLock (optional)
* statusLock (optional)

payload

* doorClosed (optional)
* doorOpening (optional)
* doorClosing (optional)
* doorStopped (optional)
* onObstructionDetected (optional)
* lockUnsecured (optional)
* lockSecured (optional)


#### HeaterCooler

topic

* statusActive
* setActive
* statusCurrentTemperature
* statusCurrentHeaterCoolerState    
  0 = INACTIVE, 1 = IDLE, 2 = HEATING, 3 = COOLING
* statusTargetHeaterCoolerState    
  0 = AUTO, 1 = HEAT, 2 = COOL
* setTargetHeaterCoolerState    
  0 = AUTO, 1 = HEAT, 2 = COOL
* statusLockPhysicalControls (optional)    
  0 = CONTROL_LOCK_DISABLED, 1 = CONTROL_LOCK_ENABLED
* setLockPhysicalControls (optional)    
  0 = CONTROL_LOCK_DISABLED, 1 = CONTROL_LOCK_ENABLED
* statusSwingMode (optional)    
  0 = SWING_DISABLED, 1 = SWING_ENABLED
* setLockSwingMode (optional)    
  0 = SWING_DISABLED, 1 = SWING_ENABLED
* statusRotationSpeed (optional)    
  Percentage 0-100
* setRotationSpeed (optional)    
  Percentage 0-100
* statusCoolingThresholdTemperature (optional)
* setCoolingThresholdTemperature (optional)
* statusHeatingThresholdTemperature (optional)
* setHeatingThresholdTemperature (optional)

payload

* activeTrue (optional, default: `true`)
* invertActive (optional, default: `false`)
* rotationSpeedFactor (optional, default: `1`)

config

* TemperatureDisplayUnits     
  0 = CELSIUS, 1 = FAHRENHEIT


#### HumidifierDehumidifier

topic

* statusActive
* setActive
* statusCurrentTemperature
* statusWaterLevel    
  Percentage 0-100
* statusCurrentHumidifierDehumidifierState    
  0 = INACTIVE, 1 = IDLE, 2 = HUMIDIFYING, 3 = DEHUMIDIFYING
* statusTargetHumidifierDehumidifierState    
  0 = HUMIDIFIER_OR_DEHUMIDIFIER, 1 = HUMIDIFIER, 2 = DEHUMIDIFIER
* setTargetHumidifierDehumidifierState    
  0 = HUMIDIFIER_OR_DEHUMIDIFIER, 1 = HUMIDIFIER, 2 = DEHUMIDIFIER
* statusLockPhysicalControls (optional)    
  0 = CONTROL_LOCK_DISABLED, 1 = CONTROL_LOCK_ENABLED
* setLockPhysicalControls (optional)    
  0 = CONTROL_LOCK_DISABLED, 1 = CONTROL_LOCK_ENABLED
* statusSwingMode (optional)    
  0 = SWING_DISABLED, 1 = SWING_ENABLED
* setLockSwingMode (optional)    
  0 = SWING_DISABLED, 1 = SWING_ENABLED
* statusRotationSpeed (optional)    
  Percentage 0-100
* setRotationSpeed (optional)    
  Percentage 0-100
* statusRelativeHumidityDehumidifierThreshold (optional)
* setRelativeHumidityDehumidifierThreshold (optional)
* statusRelativeHumidityHumidifierThreshold (optional)
* setRelativeHumidityHumidifierThreshold (optional)

payload

* activeTrue (optional, default: `true`)
* invertActive (optional, default: `false`)
* rotationSpeedFactor (optional, default: `1`)
* waterLevelFactor (optional, default: `1`)


#### HumiditySensor

topic

* statusHumidity
* statusLowBattery (optional)
* statusTampered (optional)
* statusActive (optional)
* statusFault (optional)

payload

* onLowBattery (optional)
* invertLowBattery (optional, default: `false`)
* onTampered (optional)
* invertTampered (optional, default: `false`)
* onActive (optional)
* invertActive (optional, default: `false`)
* onFault (optional)
* invertFault (optional, default: `false`)


#### IrrigationSystem

topic

* setActive
* statusActive
* statusFault (optional)
* statusInUse
* statusRemainingDuration
* statusProgramMode

payload

* activeTrue (optional, default: `true`)
* invertActive (optional, default: `false`)
* faultTrue (optional, default: `true`)
* invertFault (optional, default: `false`)
* inUseTrue (optional, default: `true`)


#### LeakSensor

topic

* statusLeakDetected
* statusLowBattery (optional)
* statusTampered (optional)
* statusActive (optional)
* statusFault (optional)

payload

* onLeakDetected
* onLowBattery (optional)
* invertLowBattery (optional, default: `false`)
* onTampered (optional)
* invertTampered (optional, default: `false`)
* onActive (optional)
* invertActive (optional, default: `false`)
* onFault (optional)
* invertFault (optional, default: `false`)


#### Lightbulb

topic

* setOn
* statusOn (optional)
* setBrightness (optional)
* statusBrightness (optional)
* setHue (optional)
* statusHue (optional)
* setSaturation (optional)
* statusSaturation (optional)
* setColorTemperature (optional)
* statusColorTemperature (optional)
* statusRGB (optional)
* setRGB (optional)

payload

* onTrue
* onFalse
* brightnessFactor (optional, default: `1`)
* hueFactor (optional, default: `1`)
* saturationFactor (optional, default: `1`)


#### LightSensor

topic

* statusAmbientLightLevel    
  0.0001 - 100000
* statusLowBattery (optional)
* statusTampered (optional)
* statusActive (optional)
* statusFault (optional)

payload

* ambientLightLevelFactor (optional, default: `1`)
* onLowBattery (optional)
* invertLowBattery (optional, default: `false`)
* onTampered (optional)
* invertTampered (optional, default: `false`)
* onActive (optional)
* invertActive (optional, default: `false`)
* onFault (optional)
* invertFault (optional, default: `false`)


#### LockManagement

topic

* setLockControlPoint
* statusVersion
* statusVersion (optional)
* statusLogs (optional)
* setAudioFeedback (optional)
* statusAudioFeedback (optional)
* setLockManagementAutoSecurityTimeout (optional)    
  Seconds
* statusLockManagementAutoSecurityTimeout (optional)    
  Seconds
* setAdministratorOnlyAccess (optional)
* statusAdministratorOnlyAccess (optional)
* statusLockLastKnownAction (optional)    
  0 = SECURED_PHYSICALLY_INTERIOR, 1 = UNSECURED_PHYSICALLY_INTERIOR, 2 = SECURED_PHYSICALLY_EXTERIOR, 3 = UNSECURED_PHYSICALLY_EXTERIOR, 4 = SECURED_BY_KEYPAD, 5 = UNSECURED_BY_KEYPAD, 6 = SECURED_REMOTELY, 7 = UNSECURED_REMOTELY, 8 = SECURED_BY_AUTO_SECURE_TIMEOUT
* statusCurrentDoorState (optional)    
  0 = OPEN, 1 = CLOSED; 2 = OPENING, 3 = CLOSING, 4 = STOPPED
* statusMotionDetected (optional)

payload

* doorClosed (optional)
* doorOpening (optional)
* doorClosing (optional)
* doorStopped (optional)


#### LockMechanism

topic

* setLock
* statusLock (optional)

payload

* lockSecured
* lockUnsecured
* lockJammed (optional)
* lockUnknown (optional)


#### Microphone

topic

* setMute
* statusMute (optional)
* setVolume (optional)
* statusVolume (optional)

payload

* muteTrue
* muteFalse
* volumeFactor (optional, default: `1`)


#### MotionSensor

topic

* statusMotionDetected
* statusLowBattery (optional)
* statusTampered (optional)
* statusActive (optional)
* statusFault (optional)

payload

* onMotionDetected
* onLowBattery (optional)
* onTampered (optional)
* invertTampered (optional, default: `false`)
* onActive (optional)
* invertActive (optional, default: `false`)
* onFault (optional)
* invertFault (optional, default: `false`)


#### OccupancySensor

topic

* statusOccupancyDetected
* statusLowBattery (optional)

payload

* onOccupancyDetected
* onLowBattery (optional)
* invertLowBattery (optional, default: `false`)


#### Outlet

topic

* setOn
* statusOn (optional)
* statusOutletInUse

payload

* onFalse
* onTrue
* onOutletInUse


#### SecuritySystem

topic

* setSecuritySystemTargetState    
  0 = STAY_ARM, 1 = AWAY_ARM, 2 = NIGHT_ARM, 3 = DISARM
* statusSecuritySystemCurrentState (optional)    
  0 = STAY_ARM, 1 = AWAY_ARM, 2 = NIGHT_ARM, 3 = DISARMED, 4 = ALARM_TRIGGERED
* statusSecuritySystemAlarmType (optional)
* statusTampered (optional)
* statusActive (optional)
* statusFault (optional)

payload

* onTampered (optional)
* invertTampered (optional, default: `false`)
* onActive (optional)
* invertActive (optional, default: `false`)
* onFault (optional)
* invertFault (optional, default: `false`)


#### Slat

topic

* statusCurrentSlatState    
  0 = FIXED, 1 = JAMMED, 2 = SWINGING
* statusCurrentTiltAngle (optional)
* statusTargetTiltAngle (optional)
* setTargetTiltAngle (optional)
* statusSwingMode (optional)    
  0 = SWING_DISABLED, 1 = SWING_ENABLED
* setSwingMode (optional)    
  0 = SWING_DISABLED, 1 = SWING_ENABLED

payload


config

* SlatType     
  0 = HORIZONTAL, 1 = VERTICAL


#### SmokeSensor

topic

* statusSmokeDetected
* statusLowBattery (optional)
* statusTampered (optional)
* statusActive (optional)
* statusFault (optional)

payload

* onSmokeDetected
* onLowBattery (optional)
* invertLowBattery (optional, default: `false`)
* onTampered (optional)
* invertTampered (optional, default: `false`)
* onActive (optional)
* onFault (optional)
* invertFault (optional, default: `false`)


#### Speaker

topic

* setMute
* statusMute (optional)
* setVolume (optional)
* statusVolume (optional)

payload

* muteTrue
* muteFalse
* volumeFactor (default: `1`)


#### StatelessProgrammableSwitch

topic

* statusEvent    
  0 = SINGLE_PRESS, 1 = DOUBLE_PRESS, 2 = LONG_PRESS

payload



#### Switch

topic

* setOn
* statusOn (optional)

payload

* onFalse
* onTrue


#### TemperatureSensor

topic

* statusTemperature
* statusLowBattery (optional)
* statusTampered (optional)
* statusActive (optional)
* statusFault (optional)

payload

* fahrenheit (default: `false`)    
  Set to true if your sensor publishes values in degree fahrenheit
* onLowBattery (optional)
* invertLowBattery (optional, default: `false`)
* onTampered (optional)
* invertTampered (optional, default: `false`)
* onActive (optional)
* invertActive (optional, default: `false`)
* onFault (optional)
* invertFault (optional, default: `false`)


#### Thermostat

topic

* setTargetTemperature
* statusTargetTemperature (optional)
* statusCurrentTemperature
* setTargetHeatingCoolingState (optional)    
  0 = off, 1 = heat, 2 = cool
* statusTargetHeatingCoolingState (optional)    
  0 = off, 1 = heat, 2 = cool
* statusCurrentHeatingCoolingState (optional)    
  0 = off, 1 = heat, 2 = cool
* setTargetRelativeHumidity (optional)
* statusTargetRelativeHumidity (optional)
* statusCurrentRelativeHumidity (optional)
* setCoolingThresholdTemperature (optional)
* statusCoolingThresholdTemperature (optional)
* setHeatingThresholdTemperature (optional)
* statusHeatingThresholdTemperature (optional)

payload


config

* TemperatureDisplayUnits     
  0 = CELSIUS, 1 = FAHRENHEIT


#### Valve

topic

* setActive
* statusActive
* statusFault (optional)
* statusInUse
* statusRemainingDuration (optional)
* setDuration (optional)

payload

* activeTrue (optional, default: `true`)
* invertActive (optional, default: `false`)
* faultTrue (optional, default: `true`)
* invertFault (optional, default: `false`)
* inUseTrue (optional, default: `true`)

config

* ValveType  (optional, default: `0`)    
  0 = GENERIC_VALVE, 1 = IRRIGATION, 2 = SHOWER_HEAD, 3 = WATER_FAUCET


#### Window

topic

* setTargetPosition
* statusTargetPosition (optional)
* statusCurrentPosition (optional)
* statusPositionState (optional)
* statusObstruction (optional)

payload

* targetPositionFactor (optional, default: `1`)
* currentPositionFactor (optional, default: `1`)
* positionStatusDecreasing (optional)
* positionStatusIncreasing (optional)
* onObstructionDetected (optional)


#### WindowCovering

topic

* setTargetPosition
* statusTargetPosition (optional)
* statusCurrentPosition (optional)
* statusPositionState (optional)
* statusTargetHorizontalTiltAngle (optional)
* setTargetHorizontalTiltAngle (optional)
* statusTargetVerticalTiltAngle (optional)
* setTargetVerticalTiltAngle (optional)
* statusCurrentHorizontalTiltAngle (optional)
* statusCurrentVerticalTiltAngle (optional)

payload

* targetPositionFactor (optional, default: `1`)
* currentPositionFactor (optional, default: `1`)
* positionStatusDecreasing (optional)
* positionStatusIncreasing (optional)



## License

MIT © [Sebastian Raff](https://github.com/hobbyquaker) and homekit2mqtt contributors


[mit-badge]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat
[mit-url]: LICENSE
