module.exports = function (iface) {
    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_LockMechanism(settings) {
        var acc = newAccessory(settings);

        acc.addService(Service.LockMechanism, settings.name)
            .getCharacteristic(Characteristic.LockTargetState)
            .on('set', function (value, callback) {
                log.debug('< hap set', settings.name, 'LockTargetState', value);

                if (value == Characteristic.LockTargetState.UNSECURED) {
                    log.debug('> mqtt publish', settings.topic.setLock, settings.payload.lockUnsecured);
                    mqttPub(settings.topic.setLock, settings.payload.lockUnsecured);

                    callback();
                } else if (value == Characteristic.LockTargetState.SECURED) {
                    log.debug('> mqtt publish', settings.topic.setLock, settings.payload.lockSecured);
                    mqttPub(settings.topic.setLock, settings.payload.lockSecured);

                    callback();
                }
            });

        if (settings.topic.statusLock) {
            mqttSub(settings.topic.statusLock, function (val) {
                if (val === settings.payload.lockSecured) {
                    log.debug('> hap set', settings.name, 'LockCurrentState.SECURED');
                    acc.getService(Service.LockMechanism)
                        .setCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED);
                    log.debug('> hap update', settings.name, 'LockTargetState.SECURED');
                    acc.getService(Service.LockMechanism)
                        .updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockCurrentState.SECURED);
                } else {
                    log.debug('> hap set', settings.name, 'LockCurrentState.UNSECURED');
                    acc.getService(Service.LockMechanism)
                        .setCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.UNSECURED);
                    log.debug('> hap update', settings.name, 'LockTargetState.UNSECURED');
                    acc.getService(Service.LockMechanism)
                        .updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockCurrentState.UNSECURED);
                }
            });

            acc.getService(Service.LockMechanism)
                .getCharacteristic(Characteristic.LockCurrentState)
                .on('get', function (callback) {
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
