/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    /* istanbul ignore else */
    if (settings.topic.setVolume) {
        acc.getService(subtype)
            .addCharacteristic(Characteristic.Volume)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'Volume', value);
                /* istanbul ignore next */
                const volume = (value * (settings.payload.volumeFactor || 1)) || 0;
                mqttPub(settings.topic.setVolume, volume);
                callback();
            });

        /* istanbul ignore else */
        if (settings.topic.statusVolume) {
            mqttSub(settings.topic.statusVolume, value => {
                /* istanbul ignore next */
                const volume = (value / (settings.payload.volumeFactor || 1)) || 0;
                log.debug('> hap update', settings.name, 'Volume', volume);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.Volume, volume);
            });

            acc.getService(subtype)
                .getCharacteristic(Characteristic.Volume)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'Volume');
                    /* istanbul ignore next */
                    const volume = (mqttStatus[settings.topic.statusVolume] / (settings.payload.volumeFactor || 1)) || 0;
                    log.debug('> hap re_get', settings.name, 'Volume', volume);
                    callback(null, volume);
                });
        }
    }
};
