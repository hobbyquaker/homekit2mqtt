/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    settings.topic.statusLock = settings.topic.statusLock || settings.topic.statusLockCurrentState;

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

    let initial = true;

    const service = acc.getService(subtype);

    /* istanbul ignore else */
    if (settings.topic.statusLock) {
        mqttSub(settings.topic.statusLock, val => {
            if (val === settings.payload.lockSecured) {
                log.debug('> hap update', settings.name, 'LockCurrentState.SECURED');
                service.updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED);
                if (initial) {
                    service.updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.SECURED);
                    initial = false;
                }
            } else if (val === settings.payload.lockJammed) {
                log.debug('> hap update', settings.name, 'LockCurrentState.JAMMED');
                service.updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.JAMMED);
                if (initial) {
                    service.updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.JAMMED);
                    initial = false;
                }
            } else if (val === settings.payload.lockUnknown) {
                log.debug('> hap update', settings.name, 'LockCurrentState.UNKNOWN');
                service.updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.UNKNOWN);
                if (initial) {
                    service.updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.UNKNOWN);
                    initial = false;
                }
            } else /* if (val === settings.payload.lockUnsecured) */ {
                log.debug('> hap update', settings.name, 'LockCurrentState.UNSECURED');
                service.updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.UNSECURED);
                if (initial) {
                    service.updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.UNSECURED);
                    initial = false;
                }
            }
        });

        service.getCharacteristic(Characteristic.LockCurrentState)
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
