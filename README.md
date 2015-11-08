# homekit2mqtt

HomeKit to MQTT bridge

Depends on [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS) by [KhaosT](https://github.com/KhaosT), all credits belong to him.

This project follows the [mqtt-smarthome architecture](https://github.com/mqtt-smarthome).
I'm using this to control a multitude of different devices in my home automation through Siri and with HomeKit apps.


## Getting started

#### Installation

**Note:** If you're running on Linux, you'll need to make sure you have the `libavahi-compat-libdnssd-dev` package installed.

```sudo npm install -g homekit2mqtt```

 
#### Start

```homekit2mqtt --help```

#### Configuration

You have to create a JSON file that defines devices and mappings from MQTT-topics and payloads to HomeKit-characteristics.

See [example-homekit2mqtt.json](example-homekit2mqtt.json)


## License

MIT © [Sebastian Raff](https://github.com/hobbyquaker)


