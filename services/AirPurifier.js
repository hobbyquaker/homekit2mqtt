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

        /* istanbul ignore else */
        if (settings.topic.setLockPhysicalControls) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.LockPhysicalControls)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'LockPhysicalControls', value);
                    mqttPub(settings.topic.setLockPhysicalControls, value);
                    callback();
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusLockPhysicalControls) {
            mqttSub(settings.topic.statusLockPhysicalControls, val => {
                log.debug('> hap update', settings.name, 'LockPhysicalControls', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.LockPhysicalControls, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.LockPhysicalControls)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'LockPhysicalControls');
                    const state = mqttStatus[settings.topic.statusLockPhysicalControls];
                    log.debug('> hap re_get', settings.name, 'LockPhysicalControls', state);
                    callback(null, state);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.setSwingMode) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.SwingMode)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'SwingMode', value);
                    mqttPub(settings.topic.setSwingMode, value);
                    callback();
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusSwingMode) {
            mqttSub(settings.topic.statusSwingMode, val => {
                log.debug('> hap update', settings.name, 'SwingMode', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.SwingMode, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.SwingMode)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'SwingMode');
                    const state = mqttStatus[settings.topic.statusSwingMode];
                    log.debug('> hap re_get', settings.name, 'SwingMode', state);
                    callback(null, state);
                });
        }

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

        require('../characteristics/Active')({acc, settings, subtype}, iface);
    };
};
