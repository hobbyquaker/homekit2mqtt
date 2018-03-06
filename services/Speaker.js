/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_Speaker(acc, settings, subtype) {
        acc.addService(Service.Speaker, settings.name, subtype)
            .getCharacteristic(Characteristic.Mute)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'Mute', value);
                const mute = value ? settings.payload.muteTrue : settings.payload.muteFalse;
                mqttPub(settings.topic.setMute, mute);
                callback();
            });

        /* istanbul ignore else */
        if (settings.topic.statusMute) {
            // Update status in homekit if exernal status gets updated
            mqttSub(settings.topic.statusMute, val => {
                const mute = val === settings.payload.muteTrue;
                log.debug('> hap update', settings.name, 'Mute', mute);
                acc.getService(Service.Speaker)
                    .updateCharacteristic(Characteristic.Mute, mute);
            });
        }

        acc.getService(Service.Speaker)
            .getCharacteristic(Characteristic.Mute)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'Mute');
                const mute = mqttStatus[settings.topic.statusMute] === settings.payload.muteTrue;
                log.debug('> hap re_get', settings.name, 'Mute', mute);
                callback(null, mute);
            });

        /* istanbul ignore else */
        if (settings.topic.setVolume) {
            acc.getService(Service.Speaker)
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
                    acc.getService(Service.Speaker)
                        .updateCharacteristic(Characteristic.Volume, volume);
                });

                acc.getService(Service.Speaker)
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
};
