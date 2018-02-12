/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_Thermostat(settings) {
        const thermo = newAccessory(settings);

        thermo.addService(Service.Thermostat)
            .getCharacteristic(Characteristic.TargetTemperature)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'TargetTemperature', value);
                log.debug('> mqtt', settings.topic.setTargetTemperature, value);
                mqttPub(settings.topic.setTargetTemperature, value, settings.mqttPublishOptions);
                callback();
            });

        thermo.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.TemperatureDisplayUnits)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'TemperatureDisplayUnits', value);
                log.debug('> config', settings.name, 'TemperatureDisplayUnits', value);
                settings.config.TemperatureDisplayUnits = value;
                callback();
            });

        thermo.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.TemperatureDisplayUnits)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'TemperatureDisplayUnits');
                log.debug('> hap re_get', settings.name, 'TemperatureDisplayUnits', settings.config.TemperatureDisplayUnits || 0);
                callback(null, settings.config.TemperatureDisplayUnits || 0);
            });

        mqttSub(settings.topic.statusCurrentTemperature, val => {
            log.debug('> hap update', settings.name, 'CurrentTemperature', mqttStatus[settings.topic.statusCurrentTemperature]);
            thermo.getService(Service.Thermostat)
                .updateCharacteristic(Characteristic.CurrentTemperature, val);
        });
        thermo.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .setProps((settings.props || {}).CurrentTemperature || {})
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CurrentTemperature');
                log.debug('> hap re_get', settings.name, 'CurrentTemperature', mqttStatus[settings.topic.statusCurrentTemperature]);
                callback(null, mqttStatus[settings.topic.statusCurrentTemperature]);
            });

        if (settings.topic.statusCurrentHeatingCoolingState) {
            mqttSub(settings.topic.statusCurrentHeatingCoolingState, val => {
                log.debug('> hap update', settings.name, 'CurrentHeatingCoolingState', val);
                thermo.getService(Service.Thermostat)
                    .updateCharacteristic(Characteristic.CurrentHeatingCoolingState, val);
            });
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CurrentHeatingCoolingState');
                    log.debug('> hap re_get', settings.name, 'CurrentHeatingCoolingState', mqttStatus[settings.topic.statusCurrentHeatingCoolingState]);
                    callback(null, mqttStatus[settings.topic.statusCurrentHeatingCoolingState]);
                });
        } else {
            const state = 1; // HEATING as default
            thermo.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CurrentHeatingCoolingState');
                log.debug('> hap re_get', settings.name, 'CurrentHeatingCoolingState', state);
                callback(null, state);
            });
            log.debug('> hap set', settings.name, 'CurrentHeatingCoolingState', state);
            thermo.getService(Service.Thermostat)
                .setCharacteristic(Characteristic.CurrentHeatingCoolingState, state);
        }

        if (settings.topic.statusTargetHeatingCoolingState) {
            mqttSub(settings.topic.statusTargetHeatingCoolingState, val => {
                log.debug('> hap update', settings.name, 'TargetHeatingCoolingState', val);
                thermo.getService(Service.Thermostat)
                    .updateCharacteristic(Characteristic.TargetHeatingCoolingState, val);
            });
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.TargetHeatingCoolingState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'TargetHeatingCoolingState');
                    log.debug('> hap re_get', settings.name, 'TargetHeatingCoolingState', mqttStatus[settings.topic.statusTargetHeatingCoolingState]);
                    callback(null, mqttStatus[settings.topic.statusTargetHeatingCoolingState]);
                });
        } else {
            const state = 1; // HEATING as default
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.TargetHeatingCoolingState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'TargetHeatingCoolingState');
                    log.debug('> hap re_get', settings.name, 'TargetHeatingCoolingState', state);
                    callback(null, state);
                });
            log.debug('> hap set', settings.name, 'TargetHeatingCoolingState', state);
            thermo.getService(Service.Thermostat)
                .setCharacteristic(Characteristic.TargetHeatingCoolingState, state);
        }

        /* istanbul ignore else */
        if (settings.topic.setTargetHeatingCoolingState) {
            thermo.getService(Service.Thermostat)
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
            thermo.getService(Service.Thermostat)
                .updateCharacteristic(Characteristic.TargetTemperature, val);
        });

        thermo.getService(Service.Thermostat)
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
                thermo.getService(Service.Thermostat)
                    .updateCharacteristic(Characteristic.CurrentRelativeHumidity, val);
            });
            thermo.getService(Service.Thermostat)
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
                thermo.getService(Service.Thermostat)
                    .updateCharacteristic(Characteristic.TargetRelativeHumidity, val);
            });
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.TargetRelativeHumidity)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'TargetRelativeHumidity');
                    log.debug('> hap re_get', settings.name, 'TargetRelativeHumidity', mqttStatus[settings.topic.statusTargetRelativeHumidity]);
                    callback(null, mqttStatus[settings.topic.statusTargetRelativeHumidity]);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.setTargetRelativeHumidity) {
            thermo.getService(Service.Thermostat)
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
            thermo.getService(Service.Thermostat)
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
                thermo.getService(Service.Thermostat)
                    .updateCharacteristic(Characteristic.CoolingThresholdTemperature, val);
            });
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.CoolingThresholdTemperature)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CoolingThresholdTemperature');
                    log.debug('> hap re_get', settings.name, 'CoolingThresholdTemperature', mqttStatus[settings.topic.statusCoolingThresholdTemperature]);
                    callback(null, mqttStatus[settings.topic.statusCoolingThresholdTemperature]);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.setHeatingThresholdTemperature) {
            thermo.getService(Service.Thermostat)
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
                thermo.getService(Service.Thermostat)
                    .updateCharacteristic(Characteristic.HeatingThresholdTemperature, val);
            });
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.HeatingThresholdTemperature)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'HeatingThresholdTemperature');
                    log.debug('> hap re_get', settings.name, 'HeatingThresholdTemperature', mqttStatus[settings.topic.statusHeatingThresholdTemperature]);
                    callback(null, mqttStatus[settings.topic.statusHeatingThresholdTemperature]);
                });
        }

        return thermo;
    };
};
