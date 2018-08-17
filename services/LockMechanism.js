/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_LockMechanism(acc, settings, subtype) {
        /* istanbul ignore else */
        if (typeof settings.payload.lockUnknown === 'undefined') {
            settings.payload.lockUnknown = 3;
        }
        /* istanbul ignore else */
        if (typeof settings.payload.lockJammed === 'undefined') {
            settings.payload.lockJammed = 2;
        }
        /* istanbul ignore else */
        if (typeof settings.payload.lockSecured === 'undefined') {
            settings.payload.lockSecured = 1;
        }
        /* istanbul ignore else */
        if (typeof settings.payload.lockUnsecured === 'undefined') {
            settings.payload.lockUnsecured = 0;
        }

        acc.addService(Service.LockMechanism, settings.name, subtype)
            .getCharacteristic(Characteristic.LockTargetState)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'LockTargetState', value);

                /* istanbul ignore else */
                if (value === Characteristic.LockTargetState.UNSECURED) {
                    mqttPub(settings.topic.setLock, settings.payload.lockUnsecured);
                    callback();
                } else if (value === Characteristic.LockTargetState.SECURED) {
                    mqttPub(settings.topic.setLock, settings.payload.lockSecured);
                    callback();
                }
            });

        let initial = true;
        /* istanbul ignore else */
        if (settings.topic.statusLock) {
            mqttSub(settings.topic.statusLock, val => {
                if (val === settings.payload.lockSecured) {
                    log.debug('> hap update', settings.name, 'LockCurrentState.SECURED');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED);
                    if (initial) {
                        acc.getService(subtype)
                            .updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.SECURED);
                        initial = false;
                    }
                } else if (val === settings.payload.lockJammed) {
                    log.debug('> hap update', settings.name, 'LockCurrentState.JAMMED');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.JAMMED);
                    if (initial) {
                        acc.getService(subtype)
                            .updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.JAMMED);
                        initial = false;
                    }
                } else if (val === settings.payload.lockUnknown) {
                    log.debug('> hap update', settings.name, 'LockCurrentState.UNKNOWN');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.UNKNOWN);
                    if (initial) {
                        acc.getService(subtype)
                            .updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.UNKNOWN);
                        initial = false;
                    }
                } else /* if (val === settings.payload.lockUnsecured) */ {
                    log.debug('> hap update', settings.name, 'LockCurrentState.UNSECURED');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.UNSECURED);
                    if (initial) {
                        acc.getService(subtype)
                            .updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.UNSECURED);
                        initial = false;
                    }
                }
            });

            acc.getService(subtype)
                .getCharacteristic(Characteristic.LockCurrentState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'LockCurrentState');

                    if (mqttStatus[settings.topic.statusLock] === settings.payload.lockSecured) {
                        log.debug('> hap re_get', settings.name, 'LockCurrentState.SECURED');
                        callback(null, Characteristic.LockCurrentState.SECURED);
                    } else if (mqttStatus[settings.topic.statusLock] === settings.payload.lockJammed) {
                        log.debug('> hap re_get', settings.name, 'LockCurrentState.JAMMED');
                        callback(null, Characteristic.LockCurrentState.JAMMED);
                    } else if (mqttStatus[settings.topic.statusLock] === settings.payload.lockUnknwon) {
                        log.debug('> hap re_get', settings.name, 'LockCurrentState.UNKNOWN');
                        callback(null, Characteristic.LockCurrentState.UNKNOWN);
                    } else if (mqttStatus[settings.topic.statusLock] === settings.payload.lockUnsecured) {
                        log.debug('> hap re_get', settings.name, 'LockCurrentState.UNSECURED');
                        callback(null, Characteristic.LockCurrentState.UNSECURED);
                    }
                });
        }
    };
};
