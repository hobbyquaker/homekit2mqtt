/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_Thermostat(settings) {
        const thermo = newAccessory(settings);

        thermo.addService(Service.Thermostat, settings.name)
            .getCharacteristic(Characteristic.TargetHeatingCoolingState)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'TargetHeatingCoolingState', value);
                if (settings.topic.setTargetHeatingCoolingState) {
                    log.debug('> mqtt', settings.topic.setTargetHeatingCoolingState, value);
                    mqttPub(settings.topic.setTargetHeatingCoolingState, value);
                }
                callback();
            });

        thermo.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.TargetTemperature)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'TargetTemperature', value);
                log.debug('> mqtt', settings.topic.setTargetTemperature, value);
                mqttPub(settings.topic.setTargetTemperature, value);
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
                log.debug('> hap re_get', settings.name, 'TemperatureDisplayUnits', settings.config.TemperatureDisplayUnits);
                callback(null, settings.config.TemperatureDisplayUnits);
            });

        mqttSub(settings.topic.statusCurrentTemperature, function (val) {
            log.debug('> hap set', settings.name, 'CurrentTemperature', mqttStatus[settings.topic.statusCurrentTemperature]);
            thermo.getService(Service.Thermostat)
                .setCharacteristic(Characteristic.CurrentTemperature, val);
        });
        thermo.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CurrentTemperature');
                log.debug('> hap re_get', settings.name, 'CurrentTemperature', mqttStatus[settings.topic.statusCurrentTemperature]);
                callback(null, mqttStatus[settings.topic.statusCurrentTemperature]);
            });

        thermo.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CurrentHeatingCoolingState');
                const state = 1; // HEATING
                log.debug('> hap re_get', settings.name, 'CurrentHeatingCoolingState', state);
                callback(null, state);
            });

        mqttSub(settings.topic.statusTargetTemperature, val => {
            log.debug('> hap set', settings.name, 'TargetTemperature', val);
            thermo.getService(Service.Thermostat)
                .updateCharacteristic(Characteristic.TargetTemperature, val);
        });

        thermo.getService(Service.Thermostat)
            .getCharacteristic(Characteristic.TargetTemperature)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'TargetTemperature');
                log.debug('> hap re_get', settings.name, 'TargetTemperature', mqttStatus[settings.topic.statusTargetTemperature]);
                callback(null, mqttStatus[settings.topic.statusTargetTemperature]);
            });

        if (settings.topic.statusCurrentRelativeHumidity) {
            mqttSub(settings.topic.statusCurrentRelativeHumidity, val => {
                thermo.getService(Service.Thermostat)
                    .setCharacteristic(Characteristic.CurrentRelativeHumidity, val);
            });
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CurrentRelativeHumidity');
                    log.debug('> hap re_get', settings.name, 'CurrentRelativeHumidity', mqttStatus[settings.topic.statusCurrentRelativeHumidity]);
                    callback(null, mqttStatus[settings.topic.statusCurrentRelativeHumidity]);
                });
        }

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

        if (settings.topic.setCoolingThresholdTemperature) {
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.CoolingThresholdTemperature)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'CoolingThresholdTemperature', value);
                    log.debug('> mqtt', settings.topic.setCoolingThresholdTemperature, value);
                    mqttPub(settings.topic.setCoolingThresholdTemperature, value);
                    callback();
                });
        }

        if (settings.topic.statusCoolingThresholdTemperature) {
            mqttSub(settings.topic.statusCoolingThresholdTemperature);
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.CoolingThresholdTemperature)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CoolingThresholdTemperature');
                    log.debug('> hap re_get', settings.name, 'CoolingThresholdTemperature', mqttStatus[settings.topic.statusCoolingThresholdTemperature]);
                    callback(null, mqttStatus[settings.topic.statusCoolingThresholdTemperature]);
                });
        }

        if (settings.topic.setHeatingThresholdTemperature) {
            mqttSub(settings.topic.setHeatingThresholdTemperature);
            thermo.getService(Service.Thermostat)
                .getCharacteristic(Characteristic.HeatingThresholdTemperature)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'HeatingThresholdTemperature', value);
                    log.debug('> mqtt', settings.topic.setHeatingThresholdTemperature, value);
                    mqttPub(settings.topic.setHeatingThresholdTemperature, value);
                    callback();
                });
        }

        if (settings.topic.statusHeatingThresholdTemperature) {
            mqttSub(settings.topic.statusHeatingThresholdTemperature);
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
