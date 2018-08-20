/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

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
};
