/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_Lightbulb(settings) {
        const light = newAccessory(settings);

        light.addService(Service.Lightbulb, settings.name)
            .getCharacteristic(Characteristic.On)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'On', value);
                const payload = value ? settings.payload.onTrue : settings.payload.onFalse;
                if (mqttStatus[settings.topic.statusOn] !== payload) {
                    // This should prevent flickering while dimming lights that use
                    // the same topic for On and Brightness, e.g. Homematic Dimmers
                    if ((settings.topic.setOn !== settings.topic.setBrightness) || !value) {
                        log.debug('> mqtt', settings.topic.setOn, payload);
                        mqttPub(settings.topic.setOn, payload);
                    } else {
                        setTimeout(() => {
                            if (!mqttStatus[settings.topic.statusBrightness]) {
                                mqttPub(settings.topic.setOn, payload);
                            }
                        }, 300);
                    }
                }
                callback();
            });

        mqttSub(settings.topic.statusOn, val => {
            const on = mqttStatus[settings.topic.statusOn] !== settings.payload.onFalse;
            log.debug('> hap set', settings.name, 'On', on);
            light.getService(Service.Lightbulb)
                .updateCharacteristic(Characteristic.On, on);
        });

        light.getService(Service.Lightbulb)
            .getCharacteristic(Characteristic.On)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'On');
                const on = mqttStatus[settings.topic.statusOn] !== settings.payload.onFalse;
                log.debug('> hap re_get', settings.name, 'On', on);
                callback(null, on);
            });

        if (settings.topic.setBrightness) {
            light.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.Brightness)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'Brightness', value);
                    const bri = (value * (settings.payload.brightnessFactor || 1)) || 0;
                    log.debug('> mqtt', settings.topic.setBrightness, bri);
                    mqttPub(settings.topic.setBrightness, bri);
                    callback();
                });

            if (settings.topic.statusBrightness) {
                mqttSub(settings.topic.statusBrightness, val => {
                    const brightness = Math.round(mqttStatus[settings.topic.statusBrightness] / (settings.payload.brightnessFactor || 1)) || 0;
                    log.debug('> hap update', settings.name, 'Brightness', brightness);
                    light.getService(Service.Lightbulb)
                        .updateCharacteristic(Characteristic.Brightness, brightness);
                });

                light.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.Brightness)
                    .on('get', callback => {
                        log.debug('< hap get', settings.name, 'Brightness');
                        const brightness = Math.round(mqttStatus[settings.topic.statusBrightness] / (settings.payload.brightnessFactor || 1)) || 0;
                        log.debug('> hap re_get', settings.name, 'Brightness', brightness);
                        callback(null, brightness);
                    });
            }
        }

        if (settings.topic.setHue) {
            light.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.Hue)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'Hue', value);
                    log.debug('> mqtt', settings.topic.setHue, (value * (settings.payload.hueFactor || 1)));
                    mqttPub(settings.topic.setHue, (value * (settings.payload.hueFactor || 1)));
                    callback();
                });
            if (settings.topic.statusHue) {
                mqttSub(settings.topic.statusHue, val => {
                    const hue = (val / (settings.payload.hueFactor || 1)) || 0;
                    log.debug('> hap update', settings.name, 'Hue', hue);
                    light.getService(Service.Lightbulb)
                        .updateCharacteristic(Characteristic.Hue, hue);
                });
                light.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.Hue)
                    .on('get', callback => {
                        log.debug('< hap get', settings.name, 'Hue');
                        const hue = (mqttStatus[settings.topic.statusHue] / (settings.payload.hueFactor || 1)) || 0;
                        log.debug('> hap re_get', settings.name, 'Hue', hue);
                        callback(null, hue);
                    });
            }
        }

        if (settings.topic.setSaturation) {
            light.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.Saturation)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'Saturation', value);
                    const sat = (value * (settings.payload.saturationFactor || 1)) || 0;
                    log.debug('> mqtt', settings.topic.setSaturation, sat);
                    mqttPub(settings.topic.setSaturation, sat);
                    callback();
                });
            if (settings.topic.statusSaturation) {
                mqttSub(settings.topic.statusSaturation, val => {
                    const sat = (val / (settings.payload.saturationFactor || 1)) || 0;
                    log.debug('> hap update', settings.name, 'Saturation', sat);
                    light.getService(Service.Lightbulb)
                        .updateCharacteristic(Characteristic.Saturation, sat);
                });
                light.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.Saturation)
                    .on('get', callback => {
                        log.debug('< hap get', settings.name, 'Saturation');
                        const saturation = (mqttStatus[settings.topic.statusSaturation] / (settings.payload.saturationFactor || 1)) || 0;
                        log.debug('> hap re_get', settings.name, 'Saturation', saturation);
                        callback(null, saturation);
                    });
            }
        }

        return light;
    };
};
