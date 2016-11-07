module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_Lightbulb(settings) {

        var light = newAccessory(settings);

        light.addService(Service.Lightbulb, settings.name)
            .getCharacteristic(Characteristic.On)
            .on('set', function (value, callback) {
                log.debug('< hap set', settings.name, 'On', value);
                var payload = value ? settings.payload.onTrue : settings.payload.onFalse;
                if (mqttStatus[settings.topic.statusOn] !== payload) {
                    // this should prevent flickering while dimming lights that use
                    // the same topic for On and Brightness, e.g. Homematic Dimmers
                    if ((settings.topic.setOn !== settings.topic.setBrightness) || !value) {
                        log.debug('> mqtt', settings.topic.setOn, payload);
                        mqttPub(settings.topic.setOn, payload);
                    } else {
                        setTimeout(function () {
                            if (!mqttStatus[settings.topic.statusBrightness]) {
                                mqttPub(settings.topic.setOn, payload);
                            }
                        }, 300)
                    }
                }
                callback();
            });

        //update status in homekit if exernal status gets updated
        mqttSub(settings.topic.statusOn, function (val) {
            log.debug('> hap set', settings.name, 'On', mqttStatus[settings.topic.statusOn]);
            light.getService(Service.Lightbulb)
                .getCharacteristic(Characteristic.On)
                .getValue();
        });

        light.getService(Service.Lightbulb)
            .getCharacteristic(Characteristic.On)
            .on('get', function (callback) {
                log.debug('< hap get', settings.name, 'On');
                var on = mqttStatus[settings.topic.statusOn] !== settings.payload.onFalse;
                log.debug('> hap re_get', settings.name, 'On', on);
                callback(null, on);
            });

        if (settings.topic.setBrightness) {
            light.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.Brightness)
                .on('set', function (value, callback) {
                    log.debug('< hap set', settings.name, 'Brightness', value);
                    var bri = (value * (settings.payload.brightnessFactor || 1)) || 0;
                    log.debug('> mqtt', settings.topic.setBrightness, bri);
                    mqttPub(settings.topic.setBrightness, bri);
                    callback();
                });

            if (settings.topic.statusBrightness) {

                //update status in homekit if exernal status gets updated
                mqttSub(settings.topic.statusBrightness, function(val) {
                    log.debug('> hap set', settings.name, 'Brightness', mqttStatus[settings.topic.statusBrightness]);
                    light.getService(Service.Lightbulb)
                        .getCharacteristic(Characteristic.Brightness)
                        .getValue();
                });

                light.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.Brightness)
                    .on('get', function (callback) {
                        log.debug('< hap get', settings.name, 'Brightness');
                        var brightness = (mqttStatus[settings.topic.statusBrightness] / (settings.payload.brightnessFactor || 1)) || 0;

                        log.debug('> hap re_get', settings.name, 'Brightness', brightness);
                        callback(null, brightness);
                    });

            }

        }

        if (settings.topic.setHue) {
            light.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.Hue)
                .on('set', function (value, callback) {
                    log.debug('< hap set', settings.name, 'Hue', value);
                    log.debug('> mqtt', settings.topic.setHue, (value * (settings.payload.hueFactor || 1)));
                    mqttPub(settings.topic.setHue, (value * (settings.payload.hueFactor || 1)));
                    callback();
                });
            if (settings.topic.statusHue) {
                mqttSub(settings.topic.statusHue);
                light.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.Hue)
                    .on('get', function (callback) {
                        log.debug('< hap get', settings.name, 'Hue');
                        var hue = (mqttStatus[settings.topic.statusHue] / (settings.payload.hueFactor || 1)) || 0;

                        log.debug('> hap re_get', settings.name, 'Hue', hue);
                        callback(null, hue);
                    });

            }
        }

        if (settings.topic.setSaturation) {
            light.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.Saturation)
                .on('set', function (value, callback) {
                    log.debug('< hap set', settings.name, 'Saturation', value);
                    var sat = (value * (settings.payload.saturationFactor || 1)) || 0;
                    log.debug('> mqtt', settings.topic.setSaturation, sat);
                    mqttPub(settings.topic.setSaturation, sat);
                    callback();
                });
            if (settings.topic.statusSaturation) {
                mqttSub(settings.topic.statusSaturation);
                light.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.Saturation)
                    .on('get', function (callback) {
                        log.debug('< hap get', settings.name, 'Saturation');
                        var saturation = (mqttStatus[settings.topic.statusSaturation] / (settings.payload.saturationFactor || 1)) || 0;

                        log.debug('> hap re_get', settings.name, 'Saturation', saturation);
                        callback(null, saturation);
                    });

            }
        }


        return light;

    }

};