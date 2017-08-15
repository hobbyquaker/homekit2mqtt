/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_LockMechanism(settings) {
        const acc = newAccessory(settings);

        acc.addService(Service.LockMechanism, settings.name)
            .getCharacteristic(Characteristic.LockTargetState)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'LockTargetState', value);

                /* istanbul ignore else */
                if (value === Characteristic.LockTargetState.UNSECURED) {
                    log.debug('> mqtt publish', settings.topic.setLock, settings.payload.lockUnsecured);
                    mqttPub(settings.topic.setLock, settings.payload.lockUnsecured);

                    callback();
                } else if (value === Characteristic.LockTargetState.SECURED) {
                    log.debug('> mqtt publish', settings.topic.setLock, settings.payload.lockSecured);
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
                    acc.getService(Service.LockMechanism)
                        .updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED);
                    if (initial) {
                        acc.getService(Service.LockMechanism)
                            .updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.SECURED);
                        initial = false;
                    }
                } else {
                    log.debug('> hap update', settings.name, 'LockCurrentState.UNSECURED');
                    acc.getService(Service.LockMechanism)
                        .updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.UNSECURED);
                    if (initial) {
                        acc.getService(Service.LockMechanism)
                            .updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.UNSECURED);
                        initial = false;
                    }
                }
            });

            acc.getService(Service.LockMechanism)
                .getCharacteristic(Characteristic.LockCurrentState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'LockCurrentState');

                    if (mqttStatus[settings.topic.statusLock] === settings.payload.lockSecured) {
                        log.debug('> hap re_get', settings.name, 'LockCurrentState.SECURED');
                        callback(null, Characteristic.LockCurrentState.SECURED);
                    } else {
                        log.debug('> hap re_get', settings.name, 'LockCurrentState.UNSECURED');
                        callback(null, Characteristic.LockCurrentState.UNSECURED);
                    }
                });
        }

        return acc;
    };
};
