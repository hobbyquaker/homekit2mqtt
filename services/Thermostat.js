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

        mqttSub(settings.topic.statusTargetTemperature, settings.json.statusTargetTemperature, val => {
            log.debug('> hap update', settings.name, 'TargetTemperature', val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.TargetTemperature, val);
        });

        acc.getService(subtype)
            .getCharacteristic(Characteristic.TargetTemperature)
            .setProps((settings.props || {}).TargetTemperature || {minValue: 4})
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'TargetTemperature');
                log.debug('> hap re_get', settings.name, 'TargetTemperature', mqttStatus(settings.topic.statusTargetTemperature, settings.json.statusTargetTemperature));
                callback(null, mqttStatus[settings.topic.statusTargetTemperature]);
            });

        if (settings.topic.statusCurrentHeatingCoolingState) {
            mqttSub(settings.topic.statusCurrentHeatingCoolingState, settings.json.statusCurrentHeatingCoolingState, val => {
                log.debug('> hap update', settings.name, 'CurrentHeatingCoolingState', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.CurrentHeatingCoolingState, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CurrentHeatingCoolingState');
                    const val = mqttStatus(settings.topic.statusCurrentHeatingCoolingState, settings.json.statusCurrentHeatingCoolingState);
                    log.debug('> hap re_get', settings.name, 'CurrentHeatingCoolingState', val);
                    callback(null, val);
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
            mqttSub(settings.topic.statusTargetHeatingCoolingState, settings.json.statusTargetHeatingCoolingState, val => {
                log.debug('> hap update', settings.name, 'TargetHeatingCoolingState', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.TargetHeatingCoolingState, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.TargetHeatingCoolingState)
                .setProps((settings.props || {}).TargetHeatingCoolingState || {})
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'TargetHeatingCoolingState');
                    const val = mqttStatus(settings.topic.statusTargetHeatingCoolingState, settings.json.statusTargetHeatingCoolingState);
                    log.debug('> hap re_get', settings.name, 'TargetHeatingCoolingState', val);
                    callback(null, val);
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

        const obj = {acc, settings, subtype};

        require('../characteristics')('TargetRelativeHumidity', obj, iface);
        require('../characteristics')('HeatingThresholdTemperature', obj, iface);
        require('../characteristics')('CoolingThresholdTemperature', obj, iface);

        require('../characteristics/CurrentTemperature')(obj, iface);
        require('../characteristics/TemperatureDisplayUnits')(obj, iface);
        require('../characteristics/CurrentRelativeHumidity')(obj, iface);
    };
};
