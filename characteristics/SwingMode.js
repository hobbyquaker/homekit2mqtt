/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

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
};
