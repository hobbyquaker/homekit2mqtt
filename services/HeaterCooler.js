/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_HeaterCooler(acc, settings, subtype) {
        if (typeof settings.payload.activeTrue === 'undefined') {
            settings.payload.activeTrue = true;
        }

        if (typeof settings.payload.activeFalse === 'undefined') {
            settings.payload.activeFalse = false;
        }

        acc.addService(Service.HeaterCooler, settings.name, subtype);

        mqttSub(settings.topic.statusCurrentHeaterCoolerState, val => {
            log.debug('> hap update', settings.name, 'CurrentHeaterCoolerState', val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.CurrentHeaterCoolerState, val);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.CurrentHeaterCoolerState)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CurrentHeaterCoolerState');
                const state = mqttStatus[settings.topic.statusCurrentHeaterCoolerState];
                log.debug('> hap re_get', settings.name, 'CurrentHeaterCoolerState', state);
                callback(null, state);
            });

        acc.getService(subtype)
            .getCharacteristic(Characteristic.TargetHeaterCoolerState)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'TargetHeaterCoolerState', value);
                mqttPub(settings.topic.setTargetHeaterCoolerState, value);
                callback();
            });

        mqttSub(settings.topic.statusTargetHeaterCoolerState, val => {
            log.debug('> hap update', settings.name, 'TargetHeaterCoolerState', val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.TargetHeaterCoolerState, val);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.TargetHeaterCoolerState)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'TargetHeaterCoolerState');
                const state = mqttStatus[settings.topic.statusTargetHeaterCoolerState];
                log.debug('> hap re_get', settings.name, 'TargetHeaterCoolerState', state);
                callback(null, state);
            });

        /* istanbul ignore else */
        if (settings.topic.setRotationSpeed) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.RotationSpeed)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'RotationSpeed', value * (settings.payload.rotationSpeedFactor || 1));
                    mqttPub(settings.topic.setRotationSpeed, value);
                    callback();
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusRotationSpeed) {
            mqttSub(settings.topic.statusRotationSpeed, val => {
                val = Math.round(val / (settings.payload.rotationSpeedFactor || 1));
                log.debug('> hap update', settings.name, 'RotationSpeed', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.RotationSpeed, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.RotationSpeed)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'RotationSpeed');
                    const speed = Math.round(mqttStatus[settings.topic.statusRotationSpeed] / (settings.payload.rotationSpeedFactor || 1));
                    log.debug('> hap re_get', settings.name, 'RotationSpeed', speed);
                    callback(null, speed);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.setCoolingThresholdTemperature) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.CoolingThresholdTemperature)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'CoolingThresholdTemperature', value);
                    mqttPub(settings.topic.setCoolingThresholdTemperature, value, settings.mqttPublishOptions);
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
                .setProps((settings.props || {}).CoolingThresholdTemperature || {minValue: 4})
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
                    mqttPub(settings.topic.setHeatingThresholdTemperature, value, settings.mqttPublishOptions);
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
                .setProps((settings.props || {}).HeatingThresholdTemperature)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'HeatingThresholdTemperature');
                    log.debug('> hap re_get', settings.name, 'HeatingThresholdTemperature', mqttStatus[settings.topic.statusHeatingThresholdTemperature]);
                    callback(null, mqttStatus[settings.topic.statusHeatingThresholdTemperature]);
                });
        }

        require('../characteristics/Active')({acc, settings, subtype}, iface);
        require('../characteristics/CurrentTemperature')({acc, settings, subtype}, iface);
        require('../characteristics/TemperatureDisplayUnits')({acc, settings, subtype}, iface);
        require('../characteristics/SwingMode')({acc, settings, subtype}, iface);
    };
};
