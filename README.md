# homekit2mqtt

HomeKit to MQTT bridge

This project follows the [mqtt-smarthome](https://github.com/mqtt-smarthome) [architecture]()

Depends on [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS) by [KhaosT](https://github.com/KhaosT), all credits belong to him.

I'm using this to control a multitude of different devices in my home automation through Siri.

This is a work in progress, right now only a few different Services are supported (LockMechanism, Lightbulb, Switch, TemperatureSensor).

## Getting started

#### Configuration

You have to create a JSON file that defines devices and mappings from MQTT-topics and payloads to HomeKit-characteristics.

See [example-homekit2mqtt.json](example-homekit2mqtt.json)


#### Installation

This is tested only on Node.js 0.10.40. Hint: Use [n](https://github.com/tj/n) to handle different Node.js versions on one system.
 

```sudo npm install -g homekit2mqtt```

 
#### Start

```homekit2mqtt --help```

## License

MIT © [Sebastian Raff](https://github.com/hobbyquaker)


