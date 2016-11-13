# homekit2mqtt 

[![License][mit-badge]][mit-url]
[![NPM version](https://badge.fury.io/js/homekit2mqtt.svg)](http://badge.fury.io/js/homekit2mqtt)
[![Dependency Status](https://img.shields.io/gemnasium/hobbyquaker/homekit2mqtt.svg?maxAge=2592000)](https://gemnasium.com/github.com/hobbyquaker/homekit2mqtt)


HomeKit to MQTT bridge 🏡📱

> Depends on [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS) by [KhaosT](https://github.com/KhaosT), all credits belong to him.

This project follows the [mqtt-smarthome architecture](https://github.com/mqtt-smarthome).
I'm using this to control a multitude of MQTT-connected "Things" in my home automation through Siri and with HomeKit apps.

## Installation

**Prerequisites:** 

 * Debian, Ubuntu, Raspbian or macOS
 * [Node.js](https://nodejs.org) 5.10 or higher
 * If you're running on Linux, you'll need to make sure you have the libavahi-compat-libdnssd-dev package installed:
   `sudo apt-get install libavahi-compat-libdnssd-dev`


`sudo npm install -g homekit2mqtt --unsafe-perm`   
`homekit2mqtt -v debug`  

## Command Line Options

<pre>
Usage: homekit2mqtt [options]

Options:
  -v, --verbosity   possible values: "error", "warn", "info", "debug"
                                                               [default: "info"]
  -m, --mapfile     JSON file containing HomeKit Services to MQTT mapping
                    definitions. See Readme.                           [default:
           "/usr/local/lib/node_modules/homekit2mqtt/example-homekit2mqtt.json"]
  -n, --name        instance name. used as mqtt client id and as prefix for
                    connected topic                         [default: "homekit"]
  -u, --url         mqtt broker url. See
                    https://github.com/mqttjs/MQTT.js#connect-using-a-url
                                                   [default: "mqtt://127.0.0.1"]
  -s, --storagedir  directory to store homekit data
  -h, --help        Show help                                          [boolean]
  --version         Show version number                                [boolean]
  -c, --pincode                                          [default: "031-45-154"]
  -a, --username                                  [default: "CC:22:3D:E3:CE:F6"]
  -b, --bridgename                                      [default: "MQTT Bridge"]
  -p, --port                                                    [default: 51826]
                                            
                                                                 
</pre>

## Configuration

You have to create a JSON file that defines devices and mappings from MQTT-topics and payloads to HomeKit-characteristics.

See [example-homekit2mqtt.json](example-homekit2mqtt.json).


Every Accessory is represented like this in the JSON file:

```javascript
  "TemperatureSensor": {                                    // Unique Name - used to generate the accessory UUID
    "service": "TemperatureSensor",                         // HomeKit Service Type (see below)
    "name": "TemperatureSensor",                            // Display Name
    "topic": {                                              
        // ... MQTT Topic Configuration ...
    },
    "payload": {
        // ... MQTT Payload Configuration ...
    },
    "manufacturer": "Generic",                              // Additional Accessory Infos (optional)
    "model": "TemperatureSensor"                            // Additional Accessory Infos (optional)
  }
```


### Supported Service Types

#### CarbonDioxideSensor

topic

* statusCarbonDioxideDetected
* statusLowBattery (optional)
* identify (optional)

payload

* onCarbonDioxideDetected
* onLowBattery (optional)
* identify (optional)


#### CarbonMonoxideSensor

topic

* statusCarbonMonoxideDetected
* statusLowBattery (optional)
* identify (optional)

payload

* onCarbonMonoxideDetected
* onLowBattery (optional)
* identify (optional)


#### ContactSensor

topic

* statusContactSensorState
* statusLowBattery (optional)
* identify (optional)

payload

* onContactDetected
* onLowBattery (optional)
* identify (optional)


#### Door

topic

* setTargetPosition
* statusTargetPosition (optional)
* statusCurrentPosition (optional)
* statusPositionState (optional)
* statusObstruction (optional)
* identify (optional)

payload

* positionStatusIncreasing (optional)
* positionStatusDecreasing (optional)
* onObstructionDetected (optional)
* identify (optional)


#### Doorbell

topic

* statusEvent
* identify (optional)

payload

* identify (optional)


#### Fan

topic

* setOn
* statusOn (optional)
* setRotationSpeed (optional)
* statusRotationSpeed (optional)
* setRotationDirection (optional)
* statusRotationDirection (optional)
* identify (optional)

payload

* onTrue (optional, default true)
* onFalse (optional, default false)
* rotationSpeedFactor (optional, default 1)
* rotationDirectionClockwise (optional, default 0)
* rotationDirectionCounterClockwise (optional, default 1)
* identify (optional)

#### GarageDoorOpener

topic

* setDoor
* setLock (optional)
* statusDoor (optional)
* statusLock (optional)
* statusObstruction (optional)
* identify (optional)

payload

* doorOpen
* doorClosed
* lockUnsecured (optional)
* lockSecured (optional)
* onObstructionDetected (optional)
* identify (optional)


#### HumiditySensor

topic

* statusHumidity
* identify (optional)

payload

* identify (optional)


#### LeakSensor

topic

* statusLeakDetected
* statusLowBattery (optional)
* identify (optional)

payload

* onLeakDetected
* onLowBattery (optional)
* identify (optional)


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
* identify (optional)

payload

* onTrue
* onFalse
* brightnessFactor (default: 1)
* hueFactor (default: 1)
* saturationFactor (default: 1)
* identify (optional)


#### LightSensor

topic

* statusAmbientLightLevel
* identify (optional)

payload

* identify (optional)


#### LockMechanism

topic

* setLock
* statusLock (optional)
* identify (optional)

payload

* lockUnsecured
* lockSecured
* identify (optional)


#### Microphone

topic 

* setMute
* setVolume (optional)
* statusMute (optional)
* statusVolume (optional)
* identify (optional)

payload

* muteTrue 
* muteFalse
* volumeFactor (optional)
* identify (optional)


#### MotionSensor

topic

* statusMotionDetected
* statusLowBattery (optional)
* identify (optional)

payload

* onMotionDetected
* onLowBattery (optional)
* identify (optional)


#### OccupancySensor

topic

* statusOccupancyDetected
* statusLowBattery (optional)
* identify (optional)

payload

* onOccupancyDetected
* onLowBattery (optional)
* identify (optional)


#### Outlet

topic

* setOn
* statusOutletInUse 
* statusOn (optional)
* identify (optional)

payload

* onTrue
* onFalse
* onOutletInUse
* identify (optional)


#### SecuritySystem

topic 

* setSecuritySystemTargetState
* statusSecuritySystemCurrentState

payload

*can't be configured, uses following numbers*

* 0 STAY_ARM
* 1 AWAY_ARM
* 2 NIGHT_ARM
* 3 DISARM(ED)
* 4 ALARM_TRIGGERED


#### StatelessProgrammableSwitch

topic

* statusEvent
* identify (optional)

payload

* identify (optional)


#### SmokeSensor

topic

* statusSmokeSensorState
* statusLowBattery (optional)
* identify (optional)

payload

* onSmokeDetected
* onLowBattery (optional)
* identify (optional)

#### Speaker

topic 

* setMute
* setVolume (optional)
* statusMute (optional)
* statusVolume (optional)
* identify (optional)

payload

* muteTrue 
* muteFalse
* volumeFactor (optional)
* identify (optional)


#### Switch

topic

* setOn
* statusOn (optional)
* identify (optional)

payload

* onTrue
* onFalse
* identify (optional)


#### TemperatureSensor

topic

* statusTemperature
* identify (optional)

payload

* identify (optional)


#### Thermostat

topic

* setTargetTemperature
* setTargetHeatingCoolingState (optional)
* statusCurrentTemperature
* statusTargetTemperature
* statusCurrentRelativeHumidity (optional)
* setCoolingThresholdTemperature (optional)
* statusCoolingThresholdTemperature (optional)
* setHeatingThresholdTemperature (optional)
* statusHeatingThresholdTemperature (optional)
* identify (optional)

payload

* identify (optional)

config

* TemperatureDisplayUnits (`0` = Celsius, `1` = Fahrenheit)


#### Window

topic

* setTargetPosition
* statusTargetPosition (optional)
* statusCurrentPosition (optional)
* statusPositionState (optional)
* statusObstruction (optional)
* identify (optional)

payload

* positionStatusIncreasing (optional)
* positionStatusDecreasing (optional)
* onObstructionDetected (optional)
* identify (optional)


#### WindowCovering

topic

* setTargetPosition
* statusTargetPosition (optional)
* statusCurrentPosition (optional)
* statusPositionState (optional)
* identify (optional)

payload

* targetPositionFactor (default: `1`)
* currentPositionFactor (default: `1`) 
* roundTarget (boolean, optional)
* positionStatusIncreasing (optional)
* positionStatusDecreasing (optional)
* identify (optional)



## License

MIT © [Sebastian Raff](https://github.com/hobbyquaker)


[mit-badge]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat
[mit-url]: LICENSE
