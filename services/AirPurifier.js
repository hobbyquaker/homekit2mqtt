/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_AirPurifier(acc, settings, subtype) {
        if (typeof settings.payload.activeTrue === 'undefined') {
            settings.payload.activeTrue = true;
        }

        if (typeof settings.payload.activeFalse === 'undefined') {
            settings.payload.activeFalse = false;
        }

        mqttSub(settings.topic.statusCurrentAirPurifierState, val => {
            log.debug('> hap update', settings.name, 'CurrentAirPurifierState', val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.CurrentAirPurifierState, val);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.CurrentAirPurifierState)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CurrentAirPurifierState');
                const state = mqttStatus[settings.topic.statusCurrentAirPurifierState];
                log.debug('> hap re_get', settings.name, 'CurrentAirPurifierState', state);
                callback(null, state);
            });

        acc.getService(subtype)
            .getCharacteristic(Characteristic.TargetAirPurifierState)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'TargetAirPurifierState', value);
                mqttPub(settings.topic.setTargetAirPurifierState, value);
                callback();
            });

        mqttSub(settings.topic.statusTargetAirPurifierState, val => {
            log.debug('> hap update', settings.name, 'TargetAirPurifierState', val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.TargetAirPurifierState, val);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.TargetAirPurifierState)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'TargetAirPurifierState');
                const state = mqttStatus[settings.topic.statusTargetAirPurifierState];
                log.debug('> hap re_get', settings.name, 'TargetAirPurifierState', state);
                callback(null, state);
            });

        require('../characteristics/Active')({acc, settings, subtype}, iface);
        require('../characteristics/RotationSpeed')({acc, settings, subtype}, iface);
        require('../characteristics/SwingMode')({acc, settings, subtype}, iface);
        require('../characteristics/LockPhysicalControls')({acc, settings, subtype}, iface);
    };
};
