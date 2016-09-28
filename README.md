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

 * Linux or Mac OS X
 * [Node.js](https://nodejs.org)
 * If you're running on Linux, you'll need to make sure you have the `libavahi-compat-libdnssd-dev` package installed.



```
sudo npm install -g homekit2mqtt
homekit2mqtt -v debug
```  

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
* positionStatusIncreasing
* positionStatusDecreasing
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


#### TemperatureSensor

topic

* statusTemperature
* identify (optional)

payload

* identify (optional)


#### HumiditySensor

topic

* statusHumidity
* identify (optional)

payload

* identify (optional)


#### Lightbulb

topic

* setOn
* statusTemperature
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


#### Switch

topic

* setOn
* statusOn (optional)
* identify (optional)

payload

* onTrue
* onFalse
* identify (optional)


#### ContactSensor

topic

* statusContactSensorState
* statusLowBattery (optional)
* identify (optional)

payload

* onContactDetected
* onLowBattery
* identify (optional)


#### MotionSensor

topic

* statusMotionDetected
* statusLowBattery (optional)
* identify (optional)

payload

* onMotionDetected
* onLowBattery
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

* TemperatureDisplayUnits


#### LightSensor

topic

* statusAmbientLightLevel


#### Speaker

topic 

* setMute
* setVolume (optional)
* statusMute (optional)
* statusVolume (optional)

payload

* muteTrue 
* muteFalse
* volumeFactor (optional)

## License

MIT © [Sebastian Raff](https://github.com/hobbyquaker)



[mit-badge]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat
[mit-url]: LICENSE

