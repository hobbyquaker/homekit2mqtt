/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    settings.topic.setLock = settings.topic.setLock || settings.topic.setLockTargetState;

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

    acc.getService(subtype)
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
};
