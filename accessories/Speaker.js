/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_Speaker(settings) {
        const speaker = newAccessory(settings);

        speaker.addService(Service.Speaker, settings.name)
            .getCharacteristic(Characteristic.Mute)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'Mute', value);
                const mute = value ? settings.payload.muteTrue : settings.payload.muteFalse;
                log.debug('> mqtt', settings.topic.setMute, mute);
                mqttPub(settings.topic.setMute, mute);
                callback();
            });

        if (settings.topic.statusMute) {
            // Update status in homekit if exernal status gets updated
            mqttSub(settings.topic.statusMute, val => {
                const mute = val === settings.payload.muteTrue;
                log.debug('> hap update', settings.name, 'Mute', mute);
                speaker.getService(Service.Speaker)
                    .updateCharacteristic(Characteristic.Mute, mute);
            });
        }

        speaker.getService(Service.Speaker)
            .getCharacteristic(Characteristic.Mute)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'Mute');
                const mute = mqttStatus[settings.topic.statusMute] === settings.payload.muteTrue;
                log.debug('> hap re_get', settings.name, 'Mute', mute);
                callback(null, mute);
            });

        if (settings.topic.setVolume) {
            speaker.getService(Service.Speaker)
                .addCharacteristic(Characteristic.Volume)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'Volume', value);
                    const volume = (value * (settings.payload.volumeFactor || 1)) || 0;
                    log.debug('> mqtt', settings.topic.setVolume, volume);
                    mqttPub(settings.topic.setVolume, volume);
                    callback();
                });

            if (settings.topic.statusVolume) {
                mqttSub(settings.topic.statusVolume, value => {
                    const volume = (value / (settings.payload.volumeFactor || 1)) || 0;
                    log.debug('> hap update', settings.name, 'Volume', volume);
                    speaker.getService(Service.Speaker)
                        .updateCharacteristic(Characteristic.Volume, volume);
                });

                speaker.getService(Service.Speaker)
                    .getCharacteristic(Characteristic.Volume)
                    .on('get', callback => {
                        log.debug('< hap get', settings.name, 'Volume');
                        const volume = (mqttStatus[settings.topic.statusVolume] / (settings.payload.volumeFactor || 1)) || 0;

                        log.debug('> hap re_get', settings.name, 'Volume', volume);
                        callback(null, volume);
                    });
            }
        }

        return speaker;
    };
};
