/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttSub, Characteristic, log} = iface;

    /* istanbul ignore else */
    if (settings.topic.statusActive) {
        acc.getService(subtype)
            .getCharacteristic(Characteristic.StatusActive)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'StatusActive');
                const act = mqttStatus[settings.topic.statusActive] === settings.payload.onActive;
                log.debug('> hap re_get', settings.name, 'StatusActive', act);
                callback(null, act);
            });

        mqttSub(settings.topic.statusActive, val => {
            const act = val === settings.payload.onActive;
            log.debug('> hap update', settings.name, 'StatusActive', act);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.StatusActive, act);
        });
    }
};
