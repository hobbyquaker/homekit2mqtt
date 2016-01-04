#!/usr/bin/env node

var pkg = require('./package.json');
var config = require('./config.js');
var log = require('yalm');
log.setLevel(config.verbosity);

log(pkg.name + ' ' + pkg.version + ' starting');
var Mqtt = require('mqtt');

log.info('loading HomeKit to MQTT mapping file');
var mapping = require(config.mapfile);


var mqttStatus = {};
var mqttCallbacks = {};

var mqttConnected;

log.info('mqtt trying to connect', config.url);
var mqtt = Mqtt.connect(config.url, {will: {topic: config.name + '/connected', payload: '0', retain: true}});

mqtt.on('connect', function () {
    mqttConnected = true;
    log.info('mqtt connected ' + config.url);
    mqtt.publish(config.name + '/connected', '2', {retain: true});
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
    log.debug('< mqtt', topic, state);
    mqttStatus[topic] = state;
    if (mqttCallbacks[topic]) {
        mqttCallbacks[topic].forEach(function (cb) {
            cb(state);
        });
    }
});

// MQTT subscribe function that provides a callback on incoming messages.
// Not meant to be used with wildcards!
function mqttSub(topic, callback) {
    if (!mqttCallbacks[topic]) {
        mqttCallbacks[topic] = [callback];
    } else {
        mqttCallbacks[topic].push(callback);
    }
}

var pkgHap =            require('./node_modules/hap-nodejs/package.json');
log.info('Starting HAP-NodeJS', pkgHap.version);

// Initialize node-persist as HAP-NodeJS storage
var persistDir =  process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.homekit2mqtt/'; // TODO config option
var storage =   require('hap-nodejs/node_modules/node-persist');
storage.initSync({
    //logging: function (msg) { log.debug('node-persist', msg); },
    //dir: persistDir // FIXME seems like node-persist doesnt accept absolute paths :(
});

var HAP =               require('hap-nodejs');
var uuid =              HAP.uuid;
var Bridge =            HAP.Bridge;
var Accessory =         HAP.Accessory;
var Service =           HAP.Service;
var Characteristic =    HAP.Characteristic;

// Create Bridge which will host all Accessories
var bridge = new Bridge(config.bridgename, uuid.generate(config.bridgename));

// Listen for Bridge identification event
bridge.on('identify', function (paired, callback) {
    log('< hap bridge identify', paired ? '(paired)' : '(unpaired)');
    callback();
});

// Handler for Accessory identification events
function identify(settings, paired, callback) {
    log.debug('< hap', settings.name, 'identify', paired ? '(paired)' : '(unpaired)');
    if (settings.topic.identify) {
        log.debug('> mqtt', settings.topic.identify, settings.payload.identify);
        mqtt.publish(settings.topic.identify, settings.payload.identify);
    }
    callback();
}

// Set Accessory infos
function setInfos(acc, settings) {
    if (settings.manufacturer || settings.model || settings.serial) {
        acc.getService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.Manufacturer, settings.manufacturer || "-")
            .setCharacteristic(Characteristic.Model, settings.model || "-" )
            .setCharacteristic(Characteristic.SerialNumber, settings.serial || "-");
    }
}

var createAccessory = {
    WindowCovering: function createAccessory_WindowCovering(settings) {
        var shutterUUID = uuid.generate('hap-nodejs:accessories:windowCovering:' + settings.topic.setTargetPosition);
        var shutter = new Accessory(settings.name, shutterUUID);
        setInfos(shutter, settings);

        shutter.addService(Service.WindowCovering, settings.name)
            .getCharacteristic(Characteristic.TargetPosition)
            .on('set', function (value, callback) {
                log.debug('< hap', settings.name, 'set', 'TargetPosition', value);
                value = (value * (settings.payload.targetPositionFactor || 1));
                log.debug('> mqtt', settings.topic.setTargetPosition, value);
                mqtt.publish(settings.topic.setTargetPosition, '' + value);
                callback();
            });

        if (settings.topic.statusTargetPosition) {
            log.debug('mqtt subscribe', settings.topic.statusTargetPosition);
            mqtt.subscribe(settings.topic.statusTargetPosition);
            shutter.getService(Service.WindowCovering)
                .getCharacteristic(Characteristic.TargetPosition)
                .on('get', function (callback) {
                    log.debug('< hap', settings.name, 'get', 'TargetPosition');
                    var position = mqttStatus[settings.topic.statusTargetPosition] / (settings.payload.targetPositionFactor || 1);

                    log.debug('> hap', settings.name, position);
                    callback(null, position);
                });
        }

        if (settings.topic.statusCurrentPosition) {
            log.debug('mqtt subscribe', settings.topic.statusCurrentPosition);
            mqtt.subscribe(settings.topic.statusCurrentPosition);
            shutter.getService(Service.WindowCovering)
                .getCharacteristic(Characteristic.CurrentPosition)
                .on('get', function (callback) {
                    log.debug('< hap', settings.name, 'get', 'CurrentPosition');
                    var position = mqttStatus[settings.topic.statusCurrentPosition] / (settings.payload.currentPositionFactor || 1);

                    log.debug('> hap', settings.name, position);
                    callback(null, position);
                });
        }

        shutter.getService(Service.WindowCovering)
            .getCharacteristic(Characteristic.CurrentPosition)
            .on('set', function (value, callback) {
                log.debug('< hap', settings.name, 'set', 'CurrentPosition', value);
                value = (value * (settings.payload.currentPositionFactor || 1));
                log.debug('> mqtt', settings.topic.setCurrentPosition, value);
                mqtt.publish(settings.topic.setCurrentPosition, '' + value);
                callback();
            });

        if (settings.topic.statusPositionStatus) {
            log.debug('mqtt subscribe', settings.topic.statusPositionStatus);
            mqtt.subscribe(settings.topic.statusPositionStatus);
            shutter.getService(Service.WindowCovering)
                .getCharacteristic(Characteristic.PositionState)
                .on('get', function (callback) {
                    log.debug('< hap', settings.name, 'get', 'PositionState');

                    if (mqttStatus[settings.topic.statusPositionState] === settings.payload.positionStatusDecreasing) {
                        log.debug('> hap', settings.name, 'PositionState.DECREASING');
                        callback(null, Characteristic.PositionState.DECREASING);
                    } else if (mqttStatus[settings.topic.statusPositionState] === settings.payload.positionStatusIncreasing) {
                        log.debug('> hap', settings.name, 'PositionState.INCREASING');
                        callback(null,  Characteristic.PositionState.INCREASING);
                    } else {
                        log.debug('> hap', settings.name, 'PositionState.STOPPED');
                        callback(null, Characteristic.PositionState.STOPPED);
                    }

                });
        }

        return shutter;

    },
    LockMechanism: function createAccessory_LockMechanism(settings) {

        var lockUUID = uuid.generate('hap-nodejs:accessories:lock:' + settings.topic.setLock);

        var lock = new Accessory(settings.name, lockUUID);

        setInfos(lock, settings);

        lock.on('identify', function (paired, callback) {
            identify(settings, paired, callback);
        });

        lock.addService(Service.LockMechanism, settings.name)
            .getCharacteristic(Characteristic.LockTargetState)
            .on('set', function(value, callback) {
                log.debug('< hap', settings.name, 'set', 'LockTargetState', value);

                if (value == Characteristic.LockTargetState.UNSECURED) {
                    log.debug('> mqtt publish', settings.topic.setLock, settings.payload.lockUnsecured);
                    mqtt.publish(settings.topic.setLock, settings.payload.lockUnsecured);

                    callback();

                } else if (value == Characteristic.LockTargetState.SECURED) {

                    log.debug('> mqtt publish', settings.topic.setLock, settings.payload.lockSecured);
                    mqtt.publish(settings.topic.setLock, settings.payload.lockSecured);

                    callback();

                }
            });

        if (settings.topic.statusLock) {

            log.debug('mqtt subscribe', settings.topic.statusLock);
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

            lock.getService(Service.LockMechanism)
                .getCharacteristic(Characteristic.LockCurrentState)
                .on('get', function(callback) {
                    log.debug('< hap', settings.name, 'get', 'LockCurrentState');

                    if (mqttStatus[settings.topic.statusLock] === settings.payload.lockSecured) {
                        log.debug('> hap', settings.name, 'LockCurrentState.SECURED');
                        callback(null, Characteristic.LockCurrentState.SECURED);
                    } else {
                        log.debug('> hap', settings.name, 'LockCurrentState.UNSECURED');
                        callback(null, Characteristic.LockCurrentState.UNSECURED);
                    }
                });

        }


        return lock;

    },
    TemperatureSensor: function createAccessory_TemperatureSensor(settings) {

        var sensorUUID = uuid.generate('hap-nodejs:accessories:temperature-sensor:' + settings.topic.statusTemperature);
        var sensor = new Accessory(settings.name, sensorUUID);
        setInfos(sensor, settings);

        log.debug('mqtt subscribe', settings.topic.statusTemperature);
        mqtt.subscribe(settings.topic.statusTemperature);

        sensor.addService(Service.TemperatureSensor)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', function(callback) {
                log.debug('< hap', settings.name, 'get', 'TemperatureSensor', 'CurrentTemperature');
                log.debug('> hap', settings.name, mqttStatus[settings.topic.statusTemperature]);
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
                log.debug('< hap', settings.name, 'set', 'On', value);
                var on = value ? settings.payload.onTrue : settings.payload.onFalse;
                log.debug('> mqtt', settings.topic.setOn, on);
                mqtt.publish(settings.topic.setOn, '' + on);
                callback();
            });

        light.getService(Service.Lightbulb)
            .getCharacteristic(Characteristic.On)
            .on('get', function (callback) {
                log.debug('< hap', settings.name, 'get', 'On');
                var on = mqttStatus[settings.topic.statusOn] === settings.payload.onTrue;

                log.debug('> hap', settings.name, on);
                callback(null, on);
            });



        if (settings.topic.setBrightness) {
            light.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.Brightness)
                .on('set', function (value, callback) {
                    log.debug('< hap', settings.name, 'set', 'Brightness', value);
                    var bri = (value * (settings.payload.brightnessFactor || 1));
                    log.debug('> mqtt', settings.topic.setBrightness, bri);
                    mqtt.publish(settings.topic.setBrightness, '' + bri);
                    callback();
                });

            if (settings.topic.statusBrightness) {
                log.debug('mqtt subscribe', settings.topic.statusBrightness);
                mqtt.subscribe(settings.topic.statusBrightness);
                light.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.Brightness)
                    .on('get', function (callback) {
                        log.debug('< hap', settings.name, 'get', 'Brightness');
                        var brightness = mqttStatus[settings.topic.statusBrightness] / settings.payload.brightnessFactor;

                        log.debug('> hap', settings.name, brightness);
                        callback(null, brightness);
                    });

            }

        }

        if (settings.topic.setHue) {
            light.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.Hue)
                .on('set', function (value, callback) {
                    log.debug('< hap', settings.name, 'set', 'Hue', value);
                    log.debug('> mqtt', settings.topic.setHue, '' + (value * (settings.payload.hueFactor || 1)));
                    mqtt.publish(settings.topic.setHue, '' + (value * (settings.payload.hueFactor || 1)));
                    callback();
                });
            if (settings.topic.statusHue) {
                log.debug('mqtt subscribe', settings.topic.statusHue);
                mqtt.subscribe(settings.topic.statusHue);
                light.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.Hue)
                    .on('get', function (callback) {
                        log.debug('< hap', settings.name, 'get', 'Hue');
                        var hue = mqttStatus[settings.topic.statusHue] / settings.payload.hueFactor;

                        log.debug('> hap', settings.name, hue);
                        callback(null, hue);
                    });

            }
        }

        if (settings.topic.setSaturation) {
            light.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.Saturation)
                 .on('set', function (value, callback) {
                    log.debug('< hap', settings.name, 'set', 'Saturation', value);
                    var sat = (value * (settings.payload.saturationFactor || 1));
                    log.debug('> mqtt', settings.topic.setSaturation, sat);
                    mqtt.publish(settings.topic.setSaturation, '' + sat);
                    callback();
                });
            if (settings.topic.statusSaturation) {
                log.debug('mqtt subscribe', settings.topic.statusSaturation);
                mqtt.subscribe(settings.topic.statusSaturation);
                light.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.Saturation)
                    .on('get', function (callback) {
                        log.debug('< hap', settings.name, 'get', 'Saturation');
                        var saturation = mqttStatus[settings.topic.statusSaturation] / settings.payload.saturationFactor;

                        log.debug('> hap', settings.name, saturation);
                        callback(null, saturation);
                    });

            }
        }


        return light;

    },
    Switch: function createAccessory_Switch(settings) {

        var switchUUID = uuid.generate('hap-nodejs:accessories:switch:' + settings.topic.setOn);
        var sw = new Accessory(settings.name, switchUUID);
        setInfos(sw, settings);

        sw.addService(Service.Switch, settings.name)
            .getCharacteristic(Characteristic.On)
            .on('set', function(value, callback) {
                log.debug('< hap', settings.name, 'set', 'On', value);
                var on = value ? settings.payload.onTrue : settings.payload.onFalse;
                log.debug('> mqtt', settings.topic.setOn, on);
                mqtt.publish(settings.topic.setOn, '' + on);
                powerOn = value;
                callback();
            });

        if (settings.topic.statusOn) {
            log.debug('mqtt subscribe', settings.topic.statusOn);
            mqtt.subscribe(settings.topic.statusOn);
            sw.getService(Service.Switch)
                .getCharacteristic(Characteristic.On)
                .on('get', function (callback) {
                    log.debug('< hap', settings.name, 'get', 'On');
                    var on = mqttStatus[settings.topic.statusOn] === settings.payload.onTrue;
                    log.debug('> hap', settings.name, on);
                    callback(null, on);
                });

        }

        return sw;

    },
    ContactSensor: function createAccessory_Switch(settings) {

        var switchUUID = uuid.generate('hap-nodejs:accessories:contactSensor:' + settings.topic.statusContactSensorState);
        var sensor = new Accessory(settings.name, switchUUID);
        setInfos(sensor, settings);

        mqtt.subscribe(settings.topic.statusContactSensorState);
        sensor.addService(Service.ContactSensor, settings.name)
            .getCharacteristic(Characteristic.ContactSensorState)
            .on('get', function (callback) {
                log.debug('< hap', settings.name, 'get', 'ContactSensorState');
                var contact =
                    mqttStatus[settings.topic.statusContactSensorState] === settings.payload.onContactDetected ?
                        Characteristic.ContactSensorState.CONTACT_DETECTED :
                        Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
                log.debug('> hap', settings.name, contact);
                callback(null, contact);
            });

        return sensor;

    },
    Thermostat: function createAccessory_Thermostat(settings) {

        var thermoUUID = uuid.generate('hap-nodejs:accessories:thermostat:' + settings.topic.setTargetTemperature);
        var thermo = new Accessory(settings.name, thermoUUID);
        setInfos(thermo, settings);

        thermo.on('identify', function (paired, callback) {
            identify(settings, paired, callback);
        });

        thermo.addService(Service.Thermostat, settings.name)
            .getCharacteristic(Characteristic.TargetHeatingCoolingState)
            .on('set', function(value, callback) {
                log.debug('< hap', settings.name, 'set', 'TargetHeatingCoolingState', value);
                if (settings.topic.setTargetHeatingCoolingState) {
                    log.debug('> mqtt', settings.topic.setTargetHeatingCoolingState, value);
                    mqtt.publish(settings.topic.setTargetHeatingCoolingState, '' + value);
                }
                callback();
            });

        thermo.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.TargetTemperature)
            .on('set', function(value, callback) {
                log.debug('< hap', settings.name, 'set', 'TargetTemperature', value);
                log.debug('> mqtt', settings.topic.setTargetTemperature, value);
                mqtt.publish(settings.topic.setTargetTemperature, '' + value);
                callback();
            });

        thermo.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.TemperatureDisplayUnits)
            .on('set', function(value, callback) {
                log.debug('< hap', settings.name, 'set', 'TemperatureDisplayUnits', value);
                log.debug('> config', settings.name, 'TemperatureDisplayUnits', value);
                settings.config.TemperatureDisplayUnits = value;
                callback();
            });

        thermo.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.TemperatureDisplayUnits)
            .on('get', function (callback) {
                log.debug('< hap', settings.name, 'get', 'TemperatureDisplayUnits');
                log.debug('> hap', settings.name, settings.config.TemperatureDisplayUnits);
                callback(null, settings.config.TemperatureDisplayUnits);
            });

        mqtt.subscribe(settings.topic.statusCurrentTemperature);
        thermo.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', function (callback) {
                log.debug('< hap', settings.name, 'get', 'CurrentTemperature');
                log.debug('> hap', settings.name, mqttStatus[settings.topic.statusCurrentTemperature]);
                callback(null, mqttStatus[settings.topic.statusCurrentTemperature]);
            });

        thermo.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
            .on('get', function (callback) {
                log.debug('< hap', settings.name, 'get', 'CurrentHeatingCoolingState');
                var state = 3;
                log.debug('> hap', settings.name, state);
                callback(null, state);
            });

        //thermo.getService(Service.Thermostat).setCharacteristic(Characteristic.CurrentHeatingCoolingState, 3);

        mqtt.subscribe(settings.topic.statusTargetTemperature);

        thermo.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.TargetTemperature)
            .on('get', function (callback) {
                log.debug('< hap', settings.name, 'get', 'TargetTemperature');
                log.debug('> hap', settings.name, mqttStatus[settings.topic.statusTargetTemperature]);
                callback(null, mqttStatus[settings.topic.statusTargetTemperature]);
            });

        if (settings.topic.statusCurrentRelativeHumidity) {
            mqtt.subscribe(settings.topic.statusCurrentRelativeHumidity);
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                .on('get', function (callback) {
                    log.debug('< hap', settings.name, 'get', 'CurrentRelativeHumidity');
                    log.debug('> hap', settings.name, mqttStatus[settings.topic.statusCurrentRelativeHumidity]);
                    callback(null, mqttStatus[settings.topic.statusCurrentRelativeHumidity]);
                });
        }

        if (settings.topic.setTargetRelativeHumidity) {
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.TargetRelativeHumidity)
                .on('set', function(value, callback) {
                    log.debug('< hap', settings.name, 'set', 'TargetRelativeHumidity', value);
                    log.debug('> mqtt', settings.topic.setTargetRelativeHumidity, value);
                    mqtt.publish(settings.topic.setTargetRelativeHumidity, '' + value);
                    callback();
                });
        }

        if (settings.topic.setCoolingThresholdTemperature) {
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.CoolingThresholdTemperature)
                .on('set', function(value, callback) {
                    log.debug('< hap', settings.name, 'set', 'CoolingThresholdTemperature', value);
                    log.debug('> mqtt', settings.topic.setCoolingThresholdTemperature, value);
                    mqtt.publish(settings.topic.setCoolingThresholdTemperature, '' + value);
                    callback();
                });
        }

        if (settings.topic.statusCoolingThresholdTemperature) {
            mqtt.subscribe(settings.topic.statusCoolingThresholdTemperature);
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.CoolingThresholdTemperature)
                .on('get', function (callback) {
                    log.debug('< hap', settings.name, 'get', 'CoolingThresholdTemperature');
                    log.debug('> hap', settings.name, mqttStatus[settings.topic.statusCoolingThresholdTemperature]);
                    callback(null, mqttStatus[settings.topic.statusCoolingThresholdTemperature]);
                });
        }

        if (settings.topic.setHeatingThresholdTemperature) {
            mqtt.subscribe(settings.topic.setHeatingThresholdTemperature);
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.HeatingThresholdTemperature)
                .on('set', function(value, callback) {
                    log.debug('< hap', settings.name, 'set', 'HeatingThresholdTemperature', value);
                    log.debug('> mqtt', settings.topic.setHeatingThresholdTemperature, value);
                    mqtt.publish(settings.topic.setHeatingThresholdTemperature, '' + value);
                    callback();
                });
        }

        if (settings.topic.statusHeatingThresholdTemperature) {
            mqtt.subscribe(settings.topic.statusHeatingThresholdTemperature);
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.HeatingThresholdTemperature)
                .on('get', function (callback) {
                    log.debug('< hap', settings.name, 'get', 'HeatingThresholdTemperature');
                    log.debug('> hap', settings.name, mqttStatus[settings.topic.statusHeatingThresholdTemperature]);
                    callback(null, mqttStatus[settings.topic.statusHeatingThresholdTemperature]);
                });
        }

        return thermo;

    }
};

var accCount = 0;
Object.keys(mapping).forEach(function (id) {
    var a = mapping[id];
    if (createAccessory[a.service]) {
        bridge.addBridgedAccessory(createAccessory[a.service](a));
        accCount++;
    } else {
        log.err('unknown service', a.service, id);
    }
});
log.info('hap Created', accCount, 'Accessories');

log('hap Publishing Bridge "' + config.bridgename + '" username=' + config.username, 'port=' + config.port, 'pincode=' + config.c);
bridge.publish({
    username: config.username,
    port: config.port,
    pincode: config.c,
    category: Accessory.Categories.OTHER
});

// Listen for bridge identification event
bridge._server.on('listening', function () {
    log('hap Bridge listening on port', config.port);
});

// Listen for bridge pair event
bridge._server.on('pair', function (username, publickey) {
    log('hap paired', username);
});

// Listen for bridge unpair event
bridge._server.on('unpair', function (username) {
    log('hap unpaired', username);
});

// Listen for bridge verify event
bridge._server.on('verify', function () {
    log('hap verify');
});