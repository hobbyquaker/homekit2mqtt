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
        
        const obj = {acc, settings, subtype};

        require('../characteristics')('CoolingThresholdTemperature', obj, iface);
        require('../characteristics')('HeatingThresholdTemperature', obj, iface);

        require('../characteristics/Active')(obj, iface);
        require('../characteristics/CurrentTemperature')(obj, iface);
        require('../characteristics/RotationSpeed')(obj, iface);
        require('../characteristics/TemperatureDisplayUnits')(obj, iface);
        require('../characteristics/SwingMode')(obj, iface);
    };
};
