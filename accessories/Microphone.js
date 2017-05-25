module.exports = function (iface) {
    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    /*
     // Required Characteristics
     this.addCharacteristic(Characteristic.Mute);

     // Optional Characteristics
     this.addOptionalCharacteristic(Characteristic.Volume);
     this.addOptionalCharacteristic(Characteristic.Name);
     */

    return function createAccessory_Microphone(settings) {
        var acc = newAccessory(settings);

        acc.addService(Service.Speaker, settings.name)
            .getCharacteristic(Characteristic.Mute)
            .on('set', function (value, callback) {
                log.debug('< hap set', settings.name, 'Mute', value);
                var mute = value ? settings.payload.muteTrue : settings.payload.muteFalse;
                log.debug('> mqtt', settings.topic.setOn, mute);
                mqttPub(settings.topic.setMute, mute);
                callback();
            });

        // Update status in homekit if exernal status gets updated
        mqttSub(settings.topic.statusMute, function (val) {
            var mute = val !== settings.topic.muteFalse;
            log.debug('> hap update', settings.name, 'Mute', mute);
            acc.getService(Service.Speaker)
                .updateCharacteristic(Characteristic.Mute, mute);
        });

        acc.getService(Service.Speaker)
            .getCharacteristic(Characteristic.Mute)
            .on('get', function (callback) {
                log.debug('< hap get', settings.name, 'Mute');
                var mute = mqttStatus[settings.topic.statusMute] !== settings.payload.muteFalse;
                log.debug('> hap re_get', settings.name, 'Mute', mute);
                callback(null, mute);
            });

        if (settings.topic.setVolume) {
            acc.getService(Service.Speaker)
                .addCharacteristic(Characteristic.Volume)
                .on('set', function (value, callback) {
                    log.debug('< hap set', settings.name, 'Volume', value);
                    var volume = (value * (settings.payload.volumeFactor || 1)) || 0;
                    log.debug('> mqtt', settings.topic.setVolume, volume);
                    mqttPub(settings.topic.setVolume, volume);
                    callback();
                });

            if (settings.topic.statusVolume) {
                // Update status in homekit if exernal status gets updated
                mqttSub(settings.topic.statusVolume, function (val) {
                    log.debug('> hap set', settings.name, 'Volume', mqttStatus[settings.topic.statusVolume]);
                    acc.getService(Service.Speaker)
                        .getCharacteristic(Characteristic.Volume)
                        .getValue();
                });

                acc.getService(Service.Speaker)
                    .getCharacteristic(Characteristic.Volume)
                    .on('get', function (callback) {
                        log.debug('< hap get', settings.name, 'Volume');
                        var volume = (mqttStatus[settings.topic.statusVolume] / (settings.payload.volumeFactor || 1)) || 0;

                        log.debug('> hap re_get', settings.name, 'Volume', volume);
                        callback(null, volume);
                    });
            }
        }

        return acc;
    };
};
