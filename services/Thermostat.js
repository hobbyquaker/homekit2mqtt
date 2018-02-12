/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_Thermostat(acc, settings) {
        acc.addService(Service.Thermostat)
            .getCharacteristic(Characteristic.TargetTemperature)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name || acc.name, 'TargetTemperature', value);
                log.debug('> mqtt', settings.topic.setTargetTemperature, value);
                mqttPub(settings.topic.setTargetTemperature, value, settings.mqttPublishOptions);
                callback();
            });

        acc.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.TemperatureDisplayUnits)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name || acc.name, 'TemperatureDisplayUnits', value);
                log.debug('> config', settings.name || acc.name, 'TemperatureDisplayUnits', value);
                settings.config.TemperatureDisplayUnits = value;
                callback();
            });

        acc.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.TemperatureDisplayUnits)
            .on('get', callback => {
                log.debug('< hap get', settings.name || acc.name, 'TemperatureDisplayUnits');
                log.debug('> hap re_get', settings.name || acc.name, 'TemperatureDisplayUnits', settings.config.TemperatureDisplayUnits || 0);
                callback(null, settings.config.TemperatureDisplayUnits || 0);
            });

        mqttSub(settings.topic.statusCurrentTemperature, val => {
            log.debug('> hap update', settings.name || acc.name, 'CurrentTemperature', mqttStatus[settings.topic.statusCurrentTemperature]);
            acc.getService(Service.Thermostat)
                .updateCharacteristic(Characteristic.CurrentTemperature, val);
        });
        acc.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .setProps((settings.props || {}).CurrentTemperature || {})
            .on('get', callback => {
                log.debug('< hap get', settings.name || acc.name, 'CurrentTemperature');
                log.debug('> hap re_get', settings.name || acc.name, 'CurrentTemperature', mqttStatus[settings.topic.statusCurrentTemperature]);
                callback(null, mqttStatus[settings.topic.statusCurrentTemperature]);
            });

        if (settings.topic.statusCurrentHeatingCoolingState) {
            mqttSub(settings.topic.statusCurrentHeatingCoolingState, val => {
                log.debug('> hap update', settings.name || acc.name, 'CurrentHeatingCoolingState', val);
                acc.getService(Service.Thermostat)
                    .updateCharacteristic(Characteristic.CurrentHeatingCoolingState, val);
            });
            acc.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name || acc.name, 'CurrentHeatingCoolingState');
                    log.debug('> hap re_get', settings.name || acc.name, 'CurrentHeatingCoolingState', mqttStatus[settings.topic.statusCurrentHeatingCoolingState]);
                    callback(null, mqttStatus[settings.topic.statusCurrentHeatingCoolingState]);
                });
        } else {
            const state = 1; // HEATING as default
            acc.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
            .on('get', callback => {
                log.debug('< hap get', settings.name || acc.name, 'CurrentHeatingCoolingState');
                log.debug('> hap re_get', settings.name || acc.name, 'CurrentHeatingCoolingState', state);
                callback(null, state);
            });
            log.debug('> hap set', settings.name || acc.name, 'CurrentHeatingCoolingState', state);
            acc.getService(Service.Thermostat)
                .setCharacteristic(Characteristic.CurrentHeatingCoolingState, state);
        }

        if (settings.topic.statusTargetHeatingCoolingState) {
            mqttSub(settings.topic.statusTargetHeatingCoolingState, val => {
                log.debug('> hap update', settings.name || acc.name, 'TargetHeatingCoolingState', val);
                acc.getService(Service.Thermostat)
                    .updateCharacteristic(Characteristic.TargetHeatingCoolingState, val);
            });
            acc.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.TargetHeatingCoolingState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name || acc.name, 'TargetHeatingCoolingState');
                    log.debug('> hap re_get', settings.name || acc.name, 'TargetHeatingCoolingState', mqttStatus[settings.topic.statusTargetHeatingCoolingState]);
                    callback(null, mqttStatus[settings.topic.statusTargetHeatingCoolingState]);
                });
        } else {
            const state = 1; // HEATING as default
            acc.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.TargetHeatingCoolingState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name || acc.name, 'TargetHeatingCoolingState');
                    log.debug('> hap re_get', settings.name || acc.name, 'TargetHeatingCoolingState', state);
                    callback(null, state);
                });
            log.debug('> hap set', settings.name || acc.name, 'TargetHeatingCoolingState', state);
            acc.getService(Service.Thermostat)
                .setCharacteristic(Characteristic.TargetHeatingCoolingState, state);
        }

        /* istanbul ignore else */
        if (settings.topic.setTargetHeatingCoolingState) {
            acc.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.TargetHeatingCoolingState)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name || acc.name, 'TargetHeatingCoolingState', value);
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
            log.debug('> hap update', settings.name || acc.name, 'TargetTemperature', val);
            acc.getService(Service.Thermostat)
                .updateCharacteristic(Characteristic.TargetTemperature, val);
        });

        acc.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.TargetTemperature)
            .setProps((settings.props || {}).TargetTemperature || {minValue: 4})
            .on('get', callback => {
                log.debug('< hap get', settings.name || acc.name, 'TargetTemperature');
                log.debug('> hap re_get', settings.name || acc.name, 'TargetTemperature', mqttStatus[settings.topic.statusTargetTemperature]);
                callback(null, mqttStatus[settings.topic.statusTargetTemperature]);
            });

        /* istanbul ignore else */
        if (settings.topic.statusCurrentRelativeHumidity) {
            mqttSub(settings.topic.statusCurrentRelativeHumidity, val => {
                log.debug('> hap update', settings.name || acc.name, 'CurrentRelativeHumidity', val);
                acc.getService(Service.Thermostat)
                    .updateCharacteristic(Characteristic.CurrentRelativeHumidity, val);
            });
            acc.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                .on('get', callback => {
                    log.debug('< hap get', settings.name || acc.name, 'CurrentRelativeHumidity');
                    log.debug('> hap re_get', settings.name || acc.name, 'CurrentRelativeHumidity', mqttStatus[settings.topic.statusCurrentRelativeHumidity]);
                    callback(null, mqttStatus[settings.topic.statusCurrentRelativeHumidity]);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusTargetRelativeHumidity) {
            mqttSub(settings.topic.statusTargetRelativeHumidity, val => {
                log.debug('> hap update', settings.name || acc.name, 'TargetRelativeHumidity', val);
                acc.getService(Service.Thermostat)
                    .updateCharacteristic(Characteristic.TargetRelativeHumidity, val);
            });
            acc.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.TargetRelativeHumidity)
                .on('get', callback => {
                    log.debug('< hap get', settings.name || acc.name, 'TargetRelativeHumidity');
                    log.debug('> hap re_get', settings.name || acc.name, 'TargetRelativeHumidity', mqttStatus[settings.topic.statusTargetRelativeHumidity]);
                    callback(null, mqttStatus[settings.topic.statusTargetRelativeHumidity]);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.setTargetRelativeHumidity) {
            acc.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.TargetRelativeHumidity)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name || acc.name, 'TargetRelativeHumidity', value);
                    log.debug('> mqtt', settings.topic.setTargetRelativeHumidity, value);
                    mqttPub(settings.topic.setTargetRelativeHumidity, value);
                    callback();
                });
        }

        /* istanbul ignore else */
        if (settings.topic.setCoolingThresholdTemperature) {
            acc.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.CoolingThresholdTemperature)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name || acc.name, 'CoolingThresholdTemperature', value);
                    mqttPub(settings.topic.setCoolingThresholdTemperature, value);
                    callback();
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusCoolingThresholdTemperature) {
            mqttSub(settings.topic.statusCoolingThresholdTemperature, val => {
                log.debug('> hap update', settings.name || acc.name, 'CoolingThresholdTemperature', val);
                acc.getService(Service.Thermostat)
                    .updateCharacteristic(Characteristic.CoolingThresholdTemperature, val);
            });
            acc.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.CoolingThresholdTemperature)
                .on('get', callback => {
                    log.debug('< hap get', settings.name || acc.name, 'CoolingThresholdTemperature');
                    log.debug('> hap re_get', settings.name || acc.name, 'CoolingThresholdTemperature', mqttStatus[settings.topic.statusCoolingThresholdTemperature]);
                    callback(null, mqttStatus[settings.topic.statusCoolingThresholdTemperature]);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.setHeatingThresholdTemperature) {
            acc.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.HeatingThresholdTemperature)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name || acc.name, 'HeatingThresholdTemperature', value);
                    mqttPub(settings.topic.setHeatingThresholdTemperature, value);
                    callback();
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusHeatingThresholdTemperature) {
            mqttSub(settings.topic.statusHeatingThresholdTemperature, val => {
                log.debug('> hap update', settings.name || acc.name, 'HeatingThresholdTemperature', val);
                acc.getService(Service.Thermostat)
                    .updateCharacteristic(Characteristic.HeatingThresholdTemperature, val);
            });
            acc.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.HeatingThresholdTemperature)
                .on('get', callback => {
                    log.debug('< hap get', settings.name || acc.name, 'HeatingThresholdTemperature');
                    log.debug('> hap re_get', settings.name || acc.name, 'HeatingThresholdTemperature', mqttStatus[settings.topic.statusHeatingThresholdTemperature]);
                    callback(null, mqttStatus[settings.topic.statusHeatingThresholdTemperature]);
                });
        }
    };
};
