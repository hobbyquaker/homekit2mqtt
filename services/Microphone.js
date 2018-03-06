/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    /*
     // Required Characteristics
     this.addCharacteristic(Characteristic.Mute);

     // Optional Characteristics
     this.addOptionalCharacteristic(Characteristic.Volume);
     this.addOptionalCharacteristic(Characteristic.Name);
     */

    return function createService_Microphone(acc, settings, subtype) {
        acc.addService(Service.Microphone, settings.name, subtype)
            .getCharacteristic(Characteristic.Mute)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'Mute', value);
                const mute = value ? settings.payload.muteTrue : settings.payload.muteFalse;
                mqttPub(settings.topic.setMute, mute);
                callback();
            });

        // Update status in homekit if exernal status gets updated
        mqttSub(settings.topic.statusMute, val => {
            const mute = val !== settings.topic.muteFalse;
            log.debug('> hap update', settings.name, 'Mute', mute);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.Mute, mute);
        });

        acc.getService(subtype)
            .getCharacteristic(Characteristic.Mute)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'Mute');
                const mute = mqttStatus[settings.topic.statusMute] !== settings.payload.muteFalse;
                log.debug('> hap re_get', settings.name, 'Mute', mute);
                callback(null, mute);
            });

        if (settings.topic.setVolume) {
            acc.getService(subtype)
                .addCharacteristic(Characteristic.Volume)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'Volume', value);
                    const volume = (value * (settings.payload.volumeFactor || 1)) || 0;
                    mqttPub(settings.topic.setVolume, volume);
                    callback();
                });

            if (settings.topic.statusVolume) {
                // Update status in homekit if exernal status gets updated
                mqttSub(settings.topic.statusVolume, val => {
                    log.debug('> hap set', settings.name, 'Volume', mqttStatus[settings.topic.statusVolume]);
                    acc.getService(subtype)
                        .getCharacteristic(Characteristic.Volume)
                        .getValue();
                });

                acc.getService(subtype)
                    .getCharacteristic(Characteristic.Volume)
                    .on('get', callback => {
                        log.debug('< hap get', settings.name, 'Volume');
                        const volume = (mqttStatus[settings.topic.statusVolume] / (settings.payload.volumeFactor || 1)) || 0;

                        log.debug('> hap re_get', settings.name, 'Volume', volume);
                        callback(null, volume);
                    });
            }
        }
    };
};
