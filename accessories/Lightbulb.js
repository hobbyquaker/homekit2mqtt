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
                    // This should prevent flickering while dimming lights that use
                    // the same topic for On and Brightness, e.g. Homematic Dimmers
                    if ((settings.topic.setOn !== settings.topic.setBrightness) || !value) {
                        log.debug('> mqtt', settings.topic.setOn, payload);
                        mqttPub(settings.topic.setOn, payload);
                    } else {
                        setTimeout(function () {
                            if (!mqttStatus[settings.topic.statusBrightness]) {
                                mqttPub(settings.topic.setOn, payload);
                            }
                        }, 300);
                    }
                }
                callback();
            });

        mqttSub(settings.topic.statusOn, function (val) {
            var on = mqttStatus[settings.topic.statusOn] !== settings.payload.onFalse;
            log.debug('> hap set', settings.name, 'On', on);
            light.getService(Service.Lightbulb)
                .updateCharacteristic(Characteristic.On, on);
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
                mqttSub(settings.topic.statusBrightness, function (val) {
                    var brightness = Math.round(mqttStatus[settings.topic.statusBrightness] / (settings.payload.brightnessFactor || 1)) || 0;
                    log.debug('> hap update', settings.name, 'Brightness', brightness);
                    light.getService(Service.Lightbulb)
                        .updateCharacteristic(Characteristic.Brightness, brightness);
                });

                light.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.Brightness)
                    .on('get', function (callback) {
                        log.debug('< hap get', settings.name, 'Brightness');
                        var brightness = Math.round(mqttStatus[settings.topic.statusBrightness] / (settings.payload.brightnessFactor || 1)) || 0;
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
                mqttSub(settings.topic.statusHue, function (val) {
                    var hue = (val / (settings.payload.hueFactor || 1)) || 0;
                    log.debug('> hap update', settings.name, 'Hue', hue);
                    light.getService(Service.Lightbulb)
                        .updateCharacteristic(Characteristic.Hue, hue);
                });
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
                mqttSub(settings.topic.statusSaturation, function (val) {
                    var sat = (val / (settings.payload.saturationFactor || 1)) || 0;
                    log.debug('> hap update', settings.name, 'Saturation', sat);
                    light.getService(Service.Lightbulb)
                        .updateCharacteristic(Characteristic.Saturation, sat);
                });
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
    };
};
