/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_Thermostat(acc, settings, subtype) {
        acc.addService(Service.Thermostat, settings.name, subtype)
            .getCharacteristic(Characteristic.TargetTemperature)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'TargetTemperature', value);
                log.debug('> mqtt', settings.topic.setTargetTemperature, value);
                mqttPub(settings.topic.setTargetTemperature, value, settings.mqttPublishOptions);
                callback();
            });

        if (settings.topic.statusCurrentHeatingCoolingState) {
            mqttSub(settings.topic.statusCurrentHeatingCoolingState, val => {
                log.debug('> hap update', settings.name, 'CurrentHeatingCoolingState', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.CurrentHeatingCoolingState, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CurrentHeatingCoolingState');
                    log.debug('> hap re_get', settings.name, 'CurrentHeatingCoolingState', mqttStatus[settings.topic.statusCurrentHeatingCoolingState]);
                    callback(null, mqttStatus[settings.topic.statusCurrentHeatingCoolingState]);
                });
        } else {
            const state = 1; // HEATING as default
            acc.getService(subtype)
                .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CurrentHeatingCoolingState');
                    log.debug('> hap re_get', settings.name, 'CurrentHeatingCoolingState', state);
                    callback(null, state);
                });
            log.debug('> hap set', settings.name, 'CurrentHeatingCoolingState', state);
            acc.getService(subtype)
                .setCharacteristic(Characteristic.CurrentHeatingCoolingState, state);
        }

        if (settings.topic.statusTargetHeatingCoolingState) {
            mqttSub(settings.topic.statusTargetHeatingCoolingState, val => {
                log.debug('> hap update', settings.name, 'TargetHeatingCoolingState', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.TargetHeatingCoolingState, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.TargetHeatingCoolingState)
                .setProps((settings.props || {}).TargetHeatingCoolingState || {})
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'TargetHeatingCoolingState');
                    log.debug('> hap re_get', settings.name, 'TargetHeatingCoolingState', mqttStatus[settings.topic.statusTargetHeatingCoolingState]);
                    callback(null, mqttStatus[settings.topic.statusTargetHeatingCoolingState]);
                });
        } else {
            const state = 1; // HEATING as default
            acc.getService(subtype)
                .getCharacteristic(Characteristic.TargetHeatingCoolingState)
                .setProps((settings.props || {}).TargetHeatingCoolingState || {})
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'TargetHeatingCoolingState');
                    log.debug('> hap re_get', settings.name, 'TargetHeatingCoolingState', state);
                    callback(null, state);
                });
            log.debug('> hap set', settings.name, 'TargetHeatingCoolingState', state);
            acc.getService(subtype)
                .setCharacteristic(Characteristic.TargetHeatingCoolingState, state);
        }

        /* istanbul ignore else */
        if (settings.topic.setTargetHeatingCoolingState) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.TargetHeatingCoolingState)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'TargetHeatingCoolingState', value);
                    if (settings.topic.setTargetHeatingCoolingState) {
                        if (settings.payload && settings.payload.TargetHeatingCoolingState &&
                            settings.payload.TargetHeatingCoolingState[String(value)] !== 'undefined') {
                            value = settings.payload.TargetHeatingCoolingState[value];
                        }
                        log.debug('> mqtt', settings.topic.setTargetHeatingCoolingState, value);
                        mqttPub(settings.topic.setTargetHeatingCoolingState, value, settings.mqttPublishOptions);
                    }
                    callback();
                });
        }

        mqttSub(settings.topic.statusTargetTemperature, val => {
            log.debug('> hap update', settings.name, 'TargetTemperature', val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.TargetTemperature, val);
        });

        acc.getService(subtype)
            .getCharacteristic(Characteristic.TargetTemperature)
            .setProps((settings.props || {}).TargetTemperature || {minValue: 4})
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'TargetTemperature');
                log.debug('> hap re_get', settings.name, 'TargetTemperature', mqttStatus[settings.topic.statusTargetTemperature]);
                callback(null, mqttStatus[settings.topic.statusTargetTemperature]);
            });

        /* istanbul ignore else */
        if (settings.topic.statusCurrentRelativeHumidity) {
            mqttSub(settings.topic.statusCurrentRelativeHumidity, val => {
                log.debug('> hap update', settings.name, 'CurrentRelativeHumidity', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.CurrentRelativeHumidity, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CurrentRelativeHumidity');
                    log.debug('> hap re_get', settings.name, 'CurrentRelativeHumidity', mqttStatus[settings.topic.statusCurrentRelativeHumidity]);
                    callback(null, mqttStatus[settings.topic.statusCurrentRelativeHumidity]);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusTargetRelativeHumidity) {
            mqttSub(settings.topic.statusTargetRelativeHumidity, val => {
                log.debug('> hap update', settings.name, 'TargetRelativeHumidity', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.TargetRelativeHumidity, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.TargetRelativeHumidity)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'TargetRelativeHumidity');
                    log.debug('> hap re_get', settings.name, 'TargetRelativeHumidity', mqttStatus[settings.topic.statusTargetRelativeHumidity]);
                    callback(null, mqttStatus[settings.topic.statusTargetRelativeHumidity]);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.setTargetRelativeHumidity) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.TargetRelativeHumidity)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'TargetRelativeHumidity', value);
                    log.debug('> mqtt', settings.topic.setTargetRelativeHumidity, value);
                    mqttPub(settings.topic.setTargetRelativeHumidity, value);
                    callback();
                });
        }

        /* istanbul ignore else */
        if (settings.topic.setCoolingThresholdTemperature) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.CoolingThresholdTemperature)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'CoolingThresholdTemperature', value);
                    mqttPub(settings.topic.setCoolingThresholdTemperature, value);
                    callback();
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusCoolingThresholdTemperature) {
            mqttSub(settings.topic.statusCoolingThresholdTemperature, val => {
                log.debug('> hap update', settings.name, 'CoolingThresholdTemperature', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.CoolingThresholdTemperature, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.CoolingThresholdTemperature)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CoolingThresholdTemperature');
                    log.debug('> hap re_get', settings.name, 'CoolingThresholdTemperature', mqttStatus[settings.topic.statusCoolingThresholdTemperature]);
                    callback(null, mqttStatus[settings.topic.statusCoolingThresholdTemperature]);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.setHeatingThresholdTemperature) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.HeatingThresholdTemperature)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'HeatingThresholdTemperature', value);
                    mqttPub(settings.topic.setHeatingThresholdTemperature, value);
                    callback();
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusHeatingThresholdTemperature) {
            mqttSub(settings.topic.statusHeatingThresholdTemperature, val => {
                log.debug('> hap update', settings.name, 'HeatingThresholdTemperature', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.HeatingThresholdTemperature, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.HeatingThresholdTemperature)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'HeatingThresholdTemperature');
                    log.debug('> hap re_get', settings.name, 'HeatingThresholdTemperature', mqttStatus[settings.topic.statusHeatingThresholdTemperature]);
                    callback(null, mqttStatus[settings.topic.statusHeatingThresholdTemperature]);
                });
        }

        require('../characteristics/CurrentTemperature')({acc, settings, subtype}, iface);
        require('../characteristics/TemperatureDisplayUnits')({acc, settings, subtype}, iface);
    };
};
