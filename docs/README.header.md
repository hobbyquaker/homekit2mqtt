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
         "/Users/basti/WebstormProjects/homekit2mqtt/example-homekit2mqtt.json"]
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
