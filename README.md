# homekit2mqtt

HomeKit to MQTT bridge

> Depends on [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS) by [KhaosT](https://github.com/KhaosT), all credits belong to him.

This project follows the [mqtt-smarthome architecture](https://github.com/mqtt-smarthome).
I'm using this to control a multitude of MQTT-connected "Things" in my home automation through Siri and with HomeKit apps.

## Getting Started

**Note:** If you're running on Linux, you'll need to make sure you have the `libavahi-compat-libdnssd-dev` package installed.

```
sudo npm install -g homekit2mqtt
homekit2mqtt --help
```  

 
## Command Line Options

<pre>
Usage: homekit2mqtt [options]

Options:
  -v, --verbosity   possible values: "error", "warn", "info", "debug"
                                                               [default: "info"]
  -m, --mapfile     JSON file containing HomeKit Services to MQTT mapping
                    definitions. See Readme.
                              [default: "/opt/mqtt-smarthome/homekit2mqtt.json"]
  -n, --name        instance name. used as mqtt client id and as prefix for
                    connected topic                         [default: "homekit"]
  -u, --url         mqtt broker url. See https://github.com/mqttjs/MQTT.js#
                    connect-using-a-url            [default: "mqtt://127.0.0.1"]
  -c, --pincode                                          [default: "031-45-154"]
  -a, --username                                  [default: "CC:22:3D:E3:CE:F6"]
  -b, --bridgename                                      [default: "MQTT Bridge"]
  -p, --port                                                    [default: 51826]
  --version         Show version number                                
  -h, --help        Show help                                 
                                            
</pre>

## Configuration

You have to create a JSON file that defines devices and mappings from MQTT-topics and payloads to HomeKit-characteristics.

See [example-homekit2mqtt.json](example-homekit2mqtt.json)

### Supported Service Types

#### WindowCovering

#### LockMechanism

#### TemperatureSensor

#### Lightbulb

#### Switch

#### ContactSensor

#### MotionSensor

#### Thermostat

## License

MIT © [Sebastian Raff](https://github.com/hobbyquaker)


