var config = {
    url: 'mqtt://172.16.23.100',
    name: 'homekit'
};

var log = {
    info: console.log,
    warn: console.log,
    err: console.error
};

var Mqtt =      require('mqtt');

var mqttStatus = {};
var mqttCallbacks = {};



var mqttConnected;

log.info('mqtt trying to connect', config.url);
var mqtt = Mqtt.connect(config.url, {will: {topic: config.name + '/connected', payload: '0'}});

mqtt.on('connect', function () {
    mqttConnected = true;
    log.info('mqtt connected ' + config.url);
    mqtt.publish(config.name + '/connected', '2');
    log.info('mqtt subscribe', config.name + '/set/#');
    mqtt.subscribe(config.name + '/set/#');
});

mqtt.on('close', function () {
    if (mqttConnected) {
        mqttConnected = false;
        log.info('mqtt closed ' + config.url);
    }
});

mqtt.on('error', function () {
    log.error('mqtt error ' + config.url);
});

mqtt.on('message', function (topic, payload) {
    payload = payload.toString();
    var state;
    try {
        state = JSON.parse(payload).val;
    } catch (e) {
        if (payload === 'true') {
            state = true;
        } else if (payload === 'false') {
            state = false;
        } else if (!isNaN(payload)) {
            state = parseFloat(payload);
        } else {
            state = payload;
        }
    }
    console.log('< mqtt', topic, state);
    mqttStatus[topic] = state;
    if (mqttCallbacks[topic]) {
        mqttCallbacks[topic].forEach(function (cb) {
            cb(state);
        });
    }
});

function mqttSub(topic, callback) {
    if (!mqttCallbacks[topic]) {
        mqttCallbacks[topic] = [callback];
    } else {
        mqttCallbacks[topic].push(callback);
    }
}

console.log("HAP-NodeJS starting...");
var HAP =               require('HAP-NodeJS');
var uuid =              HAP.uuid;
var Bridge =            HAP.Bridge;
var Accessory =         HAP.Accessory;
var Service =           HAP.Service;
var Characteristic =    HAP.Characteristic;

var storage =   require('HAP-NodeJS/node_modules/node-persist');
var types =     require('HAP-NodeJS/accessories/types');


// Initialize our storage system
storage.initSync();

// Start by creating our Bridge which will host all loaded Accessories
var bridge = new Bridge('MQTT Bridge', uuid.generate("MQTT Bridge"));

// Listen for bridge identification event
bridge.on('identify', function (paired, callback) {
    console.log("Node Bridge identify", paired);
    callback(); // success
});



var accs = {
    garten: {
        service: 'Lightbulb',
        name: 'Licht Garten',
        topic: {
            setOn: 'hm/set/Licht Garten/STATE',
            statusOn: 'hm/status/Licht Garten/STATE'
        },
        payload: {
            onTrue: 1,
            onFalse: 0
        }
    },
    hobbyraum: {
        service: 'Lightbulb',
        name: 'Licht Hobbyraum',
        topic: {
            setOn: 'hue/set/lights/Hobbyraum',
            setBrightness: 'hue/set/lights/Hobbyraum',
            statusOn: 'hue/status/lights/Hobbyraum',
            statusBrightness: 'hue/status/lights/Hobbyraum',
            identify: 'hue/set/lights/Hobbyraum/alarm'
        },
        payload: {
            onTrue: 254,
            onFalse: 0,
            brightnessFactor: 2.54,
            identify: 'select'
        }

    },
    esstisch: {
        service: 'Lightbulb',
        name: 'Licht Esstisch',
        topic: {
            setOn: 'hm/set/Licht Esstisch/LEVEL',
            setBrightness: 'hm/set/Licht Esstisch/LEVEL',
            statusOn: 'hm/status/Licht Esstisch/LEVEL',
            statusBrightness: 'hm/status/Licht Esstisch/LEVEL'
        },
        payload: {
            brightnessFactor: 0.01,
            onTrue: 1.0,
            onFalse: 0.0
        }

    },
    arbeitsflaeche: {
        service: 'Lightbulb',
        name: 'Licht Arbeitsfläche',
        topic: {
            setOn: 'hm/set/Licht Arbeitsfläche/STATE',
            statusOn: 'hm/status/Licht Arbeitsfläche/STATE'
        },
        payload: {
            onTrue: 1,
            onFalse: 0
        }
    },
    keller: {
        service: 'Lightbulb',
        name: 'Licht Keller',
        topic: {
            setOn: 'hm/set/Licht Keller/STATE',
            statusOn: 'hm/status/Licht Keller/STATE'
        },
        payload: {
            onTrue: 1,
            onFalse: 0
        }
    },
    terrasse: {
        service: 'Lightbulb',
        name: 'Licht Terrasse',
        topic: {
            setOn: 'hm/set/Aussenbeleuchtung/STATE',
            statusOn: 'hm/status/Aussenbeleuchtung/STATE'
        },
        payload: {
            onTrue: 1,
            onFalse: 0
        }
    },
    kueche: {
        service: 'Lightbulb',
        name: 'Licht Küche',
        topic: {
            setOn: 'hm/set/Licht Küche/LEVEL',
            setBrightness: 'hm/set/Licht Küche/LEVEL',
            statusOn: 'hm/status/Licht Küche/LEVEL',
            statusBrightness: 'hm/status/Licht Küche/LEVEL'
        },
        payload: {
            brightnessFactor: 0.01,
            onTrue: 1.0,
            onFalse: 0.0
        }

    },
    wohnzimmer: {
        service: 'Lightbulb',
        name: 'Licht Wohnzimmer',
        topic: {
            setOn: 'hm/set/Licht Wohnzimmer/LEVEL',
            setBrightness: 'hm/set/Licht Wohnzimmer/LEVEL',
            statusOn: 'hm/status/Licht Wohnzimmer/LEVEL',
            statusBrightness: 'hm/status/Licht Wohnzimmer/LEVEL'
        },
        payload: {
            brightnessFactor: 0.01,
            onTrue: 1.0,
            onFalse: 0.0
        }

    },
    schlafzimmer: {
        service: 'Lightbulb',
        name: 'Licht Schlafzimmer',
        topic: {
            setOn: 'hm/set/Licht Schlafzimmer/LEVEL',
            setBrightness: 'hm/set/Licht Schlafzimmer/LEVEL',
            statusOn: 'hm/status/Licht Schlafzimmer/LEVEL',
            statusBrightness: 'hm/status/Licht Schlafzimmer/LEVEL'
        },
        payload: {
            brightnessFactor: 0.01,
            onTrue: 1.0,
            onFalse: 0.0
        }

    },
    kinderzimmer: {
        service: 'Lightbulb',
        name: 'Licht Kinderzimmer',
        topic: {
            setOn: 'hm/set/Licht Kinderzimmer/LEVEL',
            setBrightness: 'hm/set/Licht Kinderzimmer/LEVEL',
            statusOn: 'hm/status/Licht Kinderzimmer/LEVEL',
            statusBrightness: 'hm/status/Licht Kinderzimmer/LEVEL'
        },
        payload: {
            brightnessFactor: 0.01,
            onTrue: 1.0,
            onFalse: 0.0
        }

    },
    arbeitszimmer: {
        service: 'Lightbulb',
        name: 'Licht Arbeitszimmer',
        topic: {
            setOn: 'hm/set/Licht Arbeitszimmer/LEVEL',
            setBrightness: 'hm/set/Licht Arbeitszimmer/LEVEL',
            statusOn: 'hm/status/Licht Arbeitszimmer/LEVEL',
            statusBrightness: 'hm/status/Licht Arbeitszimmer/LEVEL'
        },
        payload: {
            brightnessFactor: 0.01,
            onTrue: 1.0,
            onFalse: 0.0
        }

    },
    bad: {
        service: 'Lightbulb',
        name: 'Licht Bad',
        topic: {
            setOn: 'hm/set/Licht Bad/LEVEL',
            setBrightness: 'hm/set/Licht Bad/LEVEL',
            statusOn: 'hm/status/Licht Bad/LEVEL',
            statusBrightness: 'hm/status/Licht Bad/LEVEL'
        },
        payload: {
            brightnessFactor: 0.01,
            onTrue: 1.0,
            onFalse: 0.0
        }

    },
    bad_spiegel: {
        service: 'Lightbulb',
        name: 'Licht Bad Spiegel',
        topic: {
            setOn: 'hm/set/Licht Bad Spiegel/LEVEL',
            setBrightness: 'hm/set/Licht Bad Spiegel/LEVEL',
            statusOn: 'hm/status/Licht Bad Spiegel/LEVEL'
        },
        payload: {
            brightnessFactor: 0.01,
            onTrue: 1.0,
            onFalse: 0.0
        }
    },
    temp_terrasse: {
        service: 'TemperatureSensor',
        name: 'Temperatur Terrasse',
        topic: {
            statusTemperature: 'hm/status/Wetterstation/TEMPERATURE'
        }
    },
    temp_aquarium: {
        service: 'TemperatureSensor',
        name: 'Temperatur Aquarium',
        topic: {
            statusTemperature: 'cul/status/Temperatur Aquarium'
        }
    },
    keymatic: {
        service: 'LockMechanism',
        name: 'Keymatic',
        topic: {
            setLock: 'hm/set/Keymatic Waschküche:1/STATE',
            statusLock: 'hm/status/Keymatic Waschküche:1/STATE'
        },
        payload: {
            lockUnsecured: '1',
            lockSecured: '0'
        },
        manufacturer: 'eQ-3',
        model: 'Keymatic'
    }

};

function identify(settings, paired, callback) {
    console.log('< hap', settings.name, 'identify', paired);
    if (settings.topic.identify) {
        console.log('> mqtt', topic, settings.payload.identify);
        mqtt.publish(topic, settings.payload.identify);
    }
    callback();
}

function setInfos(acc, settings) {
    if (settings.manufacturer || settings.model || settings.serial) {
        acc.getService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.Manufacturer, settings.manufacturer || "-")
            .setCharacteristic(Characteristic.Model, settings.model || "-" )
            .setCharacteristic(Characteristic.SerialNumber, settings.serial || "-");
    }
}

var createAccessory = {
    LockMechanism: function createAccessory_LockMechanism(settings) {


        log.info('> mqtt subscribe', settings.topic.statusLock);
        mqttSub(settings.topic.statusLock, function (val) {

            if (val === settings.payload.lockSecured) {
                lock.getService(Service.LockMechanism)
                    .setCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED);
            }
            if (val === settings.payload.lockUnsecured) {
                lock.getService(Service.LockMechanism)
                    .setCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.UNSECURED);
            }

        });


        var lockUUID = uuid.generate('hap-nodejs:accessories:lock:' + settings.topic.setLock);

        var lock = new Accessory(settings.name, lockUUID);

        setInfos(lock, settings)

        lock.on('identify', function (paired, callback) {
            identify(settings, paired, callback);
        });

        lock.addService(Service.LockMechanism, settings.name)
            .getCharacteristic(Characteristic.LockTargetState)
            .on('set', function(value, callback) {
                console.log('< hap', settings.name, 'set', 'LockTargetState', value);

                if (value == Characteristic.LockTargetState.UNSECURED) {
                    console.log('> mqtt publish', settings.topic.setLock, settings.payload.lockUnsecured);
                    mqtt.publish(settings.topic.setLock, settings.payload.lockUnsecured);

                    callback();

                } else if (value == Characteristic.LockTargetState.SECURED) {

                    console.log('> mqtt publish', settings.topic.setLock, settings.payload.lockSecured);
                    mqtt.publish(settings.topic.setLock, settings.payload.lockSecured);

                    callback();

                }
            });

        lock.getService(Service.LockMechanism)
            .getCharacteristic(Characteristic.LockCurrentState)
            .on('get', function(callback) {
                console.log('< hap', settings.name, 'get', 'LockCurrentState', value);

                if (mqttStatus[settings.topic.statusLock] === settings.payload.lockSecured) {
                    console.log('> hap', settings.name, 'LockCurrentState.SECURED');
                    callback(err, Characteristic.LockCurrentState.SECURED);
                } else {
                    console.log('> hap', settings.name, 'LockCurrentState.UNSECURED');
                    callback(err, Characteristic.LockCurrentState.UNSECURED);
                }
            });

        return lock;

    },
    TemperatureSensor: function createAccessory_TemperatureSensor(settings) {

        var sensorUUID = uuid.generate('hap-nodejs:accessories:temperature-sensor:' + settings.topic.statusTemperature);
        var sensor = new Accessory(settings.name, sensorUUID);
        setInfos(sensor, settings);

        log.info('> mqtt subscribe', settings.topic.statusTemperature);
        mqtt.subscribe(settings.topic.statusTemperature);

        sensor.addService(Service.TemperatureSensor)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', function(callback) {
                console.log('< hap', settings.name, 'get', 'TemperatureSensor', 'CurrentTemperature');
                console.log('> hap', settings.name, mqttStatus[settings.topic.statusTemperature]);
                callback(null, mqttStatus[settings.topic.statusTemperature]);
            });

        return sensor;
    },
    Lightbulb: function createAccessory_Lightbulb(settings) {

        var lightUUID = uuid.generate('hap-nodejs:accessories:light:' + settings.topic.setOn);
        var light = new Accessory(settings.name, lightUUID);
        setInfos(light, settings);

        light.on('identify', function (paired, callback) {
            identify(settings, paired, callback);
        });

        light.addService(Service.Lightbulb, settings.name)
            .getCharacteristic(Characteristic.On)
            .on('set', function(value, callback) {
                console.log('< hap', settings.name, 'set', 'On', value);
                var on = value ? settings.payload.onTrue : settings.payload.onFalse;
                console.log('> mqtt', settings.topic.setOn, on);
                mqtt.publish(settings.topic.setOn, '' + on);
                callback();
            });

        light.getService(Service.Lightbulb)
            .getCharacteristic(Characteristic.On)
            .on('get', function (callback) {
                console.log('< hap', settings.name, 'get', 'On');
                var on = mqttStatus[settings.topic.statusOn] === settings.payload.onTrue;

                console.log('> hap', settings.name, on);
                callback(null, on);
            });

        if (settings.topic.setBrightness) {
            light.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.Brightness)
                .on('get', function (callback) {
                    console.log('< hap', settings.name, 'get', 'Brightness');
                    var bri = mqttStatus[settings.topic.statusBrightness] / (settings.payload.brightnessFactor || 1);
                    console.log('> hap', settings.name, bri);
                    callback(null, bri);
                })
                .on('set', function (value, callback) {
                    console.log('< hap', settings.name, 'set', 'Brightness', value);
                    var bri = (value * (settings.payload.brightnessFactor || 1));
                    console.log('> mqtt', settings.topic.setBrightness, bri);
                    mqtt.publish(settings.topic.setBrightness, '' + bri);
                    callback();
                })
        }

        if (settings.topic.setHue) {
            light.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.Hue)
                .on('get', function (callback) {
                    console.log('< hap', settings.name, 'get', 'Hue');
                    var hue = mqttStatus[settings.topic.statusHue] / (settings.payload.hueFactor || 1);
                    console.log('> hap', settings.name, hue);
                    callback(null, hue);
                })
                .on('set', function (value, callback) {
                    console.log('< hap', settings.name, 'set', 'Hue', value);
                    console.log('> mqtt', settings.topic.setHue, '' + (value * (settings.payload.hueFactor || 1)));
                    mqtt.publish(settings.topic.setHue, '' + (value * (settings.payload.hueFactor || 1)));
                    callback();
                })
        }

        if (settings.topic.setSaturation) {
            light.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.Saturation)
                .on('get', function (callback) {
                    console.log('< hap', settings.name, 'get', 'Saturation');
                    var sat = mqttStatus[settings.topic.statusSaturation] / (settings.payload.saturationFactor || 1);
                    console.log('> hap', settings.name, sat);
                    callback(null, sat);
                })
                .on('set', function (value, callback) {
                    console.log('< hap', settings.name, 'set', 'Saturation', value);
                    var sat = (value * (settings.payload.saturationFactor || 1));
                    console.log('> mqtt', settings.topic.setSaturation, sat);
                    mqtt.publish(settings.topic.setSaturation, '' + sat);
                    callback();
                })
        }


        return light;

    },
    Switch: function createAccessory_Switch(settings) {
        
        var switchUUID = uuid.generate('hap-nodejs:accessories:switch:' + settings.topic.setOn);
        var sw = new Accessory(settings.name, switchUUID);
        setInfos(sw, settings);

        sw.on('identify', function (paired, callback) {
            identify(settings, paired, callback);
        });

        sw.addService(Service.Switch, settings.name)
            .getCharacteristic(Characteristic.On)
            .on('set', function(value, callback) {
                console.log('< hap', settings.name, 'set', 'On', value);
                var on = value ? settings.payload.onTrue : settings.payload.onFalse;
                console.log('> mqtt', settings.topic.setOn, on);
                mqtt.publish(settings.topic.setOn, '' + on);
                powerOn = value;
                callback(); 
            });

        sw.getService(Service.Switch)
            .getCharacteristic(Characteristic.On)
            .on('get', function (callback) {
                console.log('< hap', settings.name, 'get', 'On');
                var on = mqttStatus[settings.topic.statusOn] === settings.payload.onTrue;
                console.log('> hap', settings.name, on);
                callback(null, on);
            });
        
        return sw;

    }
};

for (var id in accs) {
    var a = accs[id];

    if (createAccessory[a.service]) {
        bridge.addBridgedAccessory(createAccessory[a.service](a));
    } else {
        log.err('unknown service', a.service, id);
    }
}


// Publish the Bridge on the local network.
bridge.publish({
    username: "CC:22:3D:E3:CE:F6",
    port: 51826,
    pincode: "031-45-154",
    category: Accessory.Categories.OTHER
});






