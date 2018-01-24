# homekit2mqtt 

[![mqtt-smarthome](https://img.shields.io/badge/mqtt-smarthome-blue.svg)](https://github.com/mqtt-smarthome/mqtt-smarthome)
[![NPM version](https://badge.fury.io/js/homekit2mqtt.svg)](http://badge.fury.io/js/homekit2mqtt)
[![Dependency Status](https://img.shields.io/gemnasium/hobbyquaker/homekit2mqtt.svg?maxAge=2592000)](https://gemnasium.com/github.com/hobbyquaker/homekit2mqtt)
[![Build Status](https://travis-ci.org/hobbyquaker/homekit2mqtt.svg?branch=master)](https://travis-ci.org/hobbyquaker/homekit2mqtt)
[![Coverage Status](https://coveralls.io/repos/github/hobbyquaker/homekit2mqtt/badge.svg?branch=master)](https://coveralls.io/github/hobbyquaker/homekit2mqtt?branch=master)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![License][mit-badge]][mit-url]

HomeKit to MQTT bridge 🏡📱

> Depends on [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS) by [KhaosT](https://github.com/KhaosT), all credits belong to him.

This project follows the [mqtt-smarthome architecture](https://github.com/mqtt-smarthome).
I'm using this to control a multitude of MQTT-connected "Things" in my home automation through Siri and with HomeKit apps.

## Installation

**Prerequisites:** 

 * Debian, Ubuntu, Raspbian or macOS
 * [Node.js](https://nodejs.org) 6 or higher
 * If you're running on Linux, you'll need to make sure you have the libavahi-compat-libdnssd-dev package installed:
   `sudo apt-get install libavahi-compat-libdnssd-dev`


`sudo npm install -g homekit2mqtt --unsafe-perm`   

## Command Line Options

<pre>
Usage: homekit2mqtt [options]

Options:
  -v, --verbosity    possible values: "error", "warn", "info", "debug"
                                                               [default: "info"]
  -m, --mapfile      JSON file containing HomeKit Services to MQTT mapping
                     definitions. See Readme.                          [default:
         "/Users/basti/WebstormProjects/homekit2mqtt/example-homekit2mqtt.json"]
  -n, --name         instance name. used as mqtt client id and as prefix for
                     connected topic                        [default: "homekit"]
  -u, --url          mqtt broker url. See
                     https://github.com/mqttjs/MQTT.js/wiki/mqtt
                                                   [default: "mqtt://127.0.0.1"]
  -s, --storagedir   directory to store homekit data
  -p, --port         port homekit2mqtt is listening on          [default: 51826]
  -w, --web-port     port webserver is listening on             [default: 51888]
  -x, --disable-web  disable webserver
  -h, --help         Show help                                         [boolean]
  --version          Show version number                               [boolean]
  -c, --pincode                                          [default: "031-45-154"]
  -a, --username                                  [default: "CC:22:3D:E3:CE:F6"]
  -b, --bridgename                                      [default: "MQTT Bridge"]
                                                                 
</pre>

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
## Available Service Types

#### CarbonDioxideSensor

topic

* statusCarbonDioxideDetected
* statusLowBattery (optional)
* identify (optional)
* statusTampered (optional)
* statusActive (optional)
* statusFault (optional)

payload

* onCarbonDioxideDetected
* onLowBattery (optional)
* identify (optional)
* onTampered (optional)
* onActive (optional)
* onFault (optional)

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
* statusTampered (optional)
* statusActive (optional)
* statusFault (optional)

payload

* onContactDetected
* onLowBattery (optional)
* identify (optional)
* onTampered (optional)
* onActive (optional)
* onFault (optional)

#### Door

topic

* setTargetPosition
* statusTargetPosition (optional)
* statusCurrentPosition (optional)
* statusPositionState (optional)
* statusObstruction (optional)
* identify (optional)

payload

* targetPositionFactor (optional)
* currentPositionFactor (optional)
* positionStatusDecreasing (optional)
* positionStatusIncreasing (optional)
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
* setRotationDirection (optional)
* statusRotationDirection (optional)
* setRotationSpeed (optional)
* statusRotationSpeed (optional)
* identify (optional)

payload

* onTrue (optional, default: `true`)
* onFalse (optional)
* rotationDirectionCounterClockwise (optional, default: `1`)
* rotationDirectionClockwise (optional)
* rotationSpeedFactor (optional, default: `1`)
* identify (optional)

#### GarageDoorOpener

topic

* setDoor
* statusDoor (optional)
* statusObstruction (optional)
* setLock (optional)
* statusLock (optional)
* identify (optional)

payload

* doorOpen
* doorClosed
* doorOpening (optional)
* doorClosing (optional)
* doorStopped (optional)
* onObstructionDetected (optional)
* lockUnsecured (optional)
* lockSecured (optional)
* identify (optional)

#### HumiditySensor

topic

* statusHumidity
* statusLowBattery (optional)
* identify (optional)

payload

* onLowBattery (optional)
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
* setColorTemperature (optional)
* statusColorTemperature (optional)
* identify (optional)

payload

* onTrue
* onFalse
* brightnessFactor (optional, default: `1`)
* hueFactor (optional, default: `1`)
* saturationFactor (optional, default: `1`)
* identify (optional)

#### LightSensor

topic

* statusAmbientLightLevel
* statusLowBattery (optional)
* identify (optional)

payload

* ambientLightLevelFactor (optional, default: `1`)
* onLowBattery (optional)
* identify (optional)

#### LockMechanism

topic

* setLock
* statusLock (optional)
* identify (optional)

payload

* lockSecured
* identify (optional)

#### Microphone

topic

* setMute
* statusMute (optional)
* setVolume (optional)
* statusVolume (optional)
* identify (optional)

payload

* muteTrue
* muteFalse
* volumeFactor (optional, default: `1`)
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
* statusOn (optional)
* statusOutletInUse
* identify (optional)

payload

* onFalse
* onTrue
* onOutletInUse
* identify (optional)

#### SecuritySystem

topic

* setSecuritySystemTargetState
* statusSecuritySystemCurrentState (optional)
* identify (optional)

payload

* identify (optional)

#### SmokeSensor

topic

* statusSmokeDetected
* statusLowBattery (optional)
* identify (optional)

payload

* onSmokeDetected
* onLowBattery (optional)
* identify (optional)

#### Speaker

topic

* setMute
* statusMute (optional)
* setVolume (optional)
* statusVolume (optional)
* identify (optional)

payload

* muteTrue
* muteFalse
* volumeFactor, default: `1`)
* identify (optional)

#### StatelessProgrammableSwitch

topic

* statusEvent
* identify (optional)

payload

* identify (optional)

#### Switch

topic

* setOn
* statusOn (optional)
* identify (optional)

payload

* onFalse
* onTrue
* identify (optional)

#### TemperatureSensor

topic

* statusTemperature
* statusLowBattery (optional)
* identify (optional)

payload

* fahrenheit    
  Set to true if your sensor publishes values in degree fahrenheit
* onLowBattery (optional)
* identify (optional)

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
* identify (optional)

payload

* identify (optional)

#### Window

topic

* setTargetPosition
* statusTargetPosition (optional)
* statusCurrentPosition (optional)
* statusPositionState (optional)
* statusObstruction (optional)
* identify (optional)

payload

* targetPositionFactor (optional, default: `1`)
* currentPositionFactor (optional, default: `1`)
* positionStatusDecreasing (optional)
* positionStatusIncreasing (optional)
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

* targetPositionFactor (optional, default: `1`)
* currentPositionFactor (optional, default: `1`)
* positionStatusDecreasing (optional)
* positionStatusIncreasing (optional)
* identify (optional)


## License

MIT © [Sebastian Raff](https://github.com/hobbyquaker) and homekit2mqtt contributors


[mit-badge]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat
[mit-url]: LICENSE
