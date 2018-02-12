/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_Lightbulb(acc, settings) {
        acc.addService(Service.Lightbulb)
            .getCharacteristic(Characteristic.On)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'On', value);
                const payload = value ? settings.payload.onTrue : settings.payload.onFalse;
                if (mqttStatus[settings.topic.statusOn] !== payload) {
                    // TODO test!
                    if ((settings.topic.setOn !== settings.topic.setBrightness) || !value) {
                        mqttPub(settings.topic.setOn, payload);
                    } else {
                        // This should prevent flickering while dimming lights that use
                        // the same topic for On and Brightness, e.g. Homematic Dimmers
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
            log.debug('> hap update', settings.name, 'On', on);
            acc.getService(Service.Lightbulb)
                .updateCharacteristic(Characteristic.On, on);
        });

        acc.getService(Service.Lightbulb)
            .getCharacteristic(Characteristic.On)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'On');
                const on = mqttStatus[settings.topic.statusOn] !== settings.payload.onFalse;
                log.debug('> hap re_get', settings.name, 'On', on);
                callback(null, on);
            });

        /* istanbul ignore else */
        if (settings.topic.setBrightness) {
            acc.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.Brightness)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'Brightness', value);
                    /* istanbul ignore next */
                    const bri = (value * (settings.payload.brightnessFactor || 1)) || 0;
                    mqttPub(settings.topic.setBrightness, bri);
                    callback();
                });

            /* istanbul ignore else */
            if (settings.topic.statusBrightness) {
                mqttSub(settings.topic.statusBrightness, val => {
                    /* istanbul ignore next */
                    const brightness = Math.round(mqttStatus[settings.topic.statusBrightness] / (settings.payload.brightnessFactor || 1)) || 0;
                    log.debug('> hap update', settings.name, 'Brightness', brightness);
                    acc.getService(Service.Lightbulb)
                        .updateCharacteristic(Characteristic.Brightness, brightness);
                });

                acc.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.Brightness)
                    .on('get', callback => {
                        log.debug('< hap get', settings.name, 'Brightness');
                        /* istanbul ignore next */
                        const brightness = Math.round(mqttStatus[settings.topic.statusBrightness] / (settings.payload.brightnessFactor || 1)) || 0;
                        log.debug('> hap re_get', settings.name, 'Brightness', brightness);
                        callback(null, brightness);
                    });
            }
        }

        /* istanbul ignore else */
        if (settings.topic.setHue) {
            acc.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.Hue)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'Hue', value);
                    /* istanbul ignore next */
                    const hue = (value * (settings.payload.hueFactor || 1));
                    mqttPub(settings.topic.setHue, hue);
                    callback();
                });
            /* istanbul ignore else */
            if (settings.topic.statusHue) {
                mqttSub(settings.topic.statusHue, val => {
                    /* istanbul ignore next */
                    const hue = (val / (settings.payload.hueFactor || 1)) || 0;
                    log.debug('> hap update', settings.name, 'Hue', hue);
                    acc.getService(Service.Lightbulb)
                        .updateCharacteristic(Characteristic.Hue, hue);
                });
                acc.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.Hue)
                    .on('get', callback => {
                        log.debug('< hap get', settings.name, 'Hue');
                        /* istanbul ignore next */
                        const hue = (mqttStatus[settings.topic.statusHue] / (settings.payload.hueFactor || 1)) || 0;
                        log.debug('> hap re_get', settings.name, 'Hue', hue);
                        callback(null, hue);
                    });
            }
        }

        /* istanbul ignore else */
        if (settings.topic.setSaturation) {
            acc.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.Saturation)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'Saturation', value);
                    /* istanbul ignore next */
                    const sat = (value * (settings.payload.saturationFactor || 1)) || 0;
                    mqttPub(settings.topic.setSaturation, sat);
                    callback();
                });
            /* istanbul ignore else */
            if (settings.topic.statusSaturation) {
                mqttSub(settings.topic.statusSaturation, val => {
                    /* istanbul ignore next */
                    const sat = (val / (settings.payload.saturationFactor || 1)) || 0;
                    log.debug('> hap update', settings.name, 'Saturation', sat);
                    acc.getService(Service.Lightbulb)
                        .updateCharacteristic(Characteristic.Saturation, sat);
                });
                acc.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.Saturation)
                    .on('get', callback => {
                        log.debug('< hap get', settings.name, 'Saturation');
                        /* istanbul ignore next */
                        const saturation = (mqttStatus[settings.topic.statusSaturation] / (settings.payload.saturationFactor || 1)) || 0;
                        log.debug('> hap re_get', settings.name, 'Saturation', saturation);
                        callback(null, saturation);
                    });
            }
        }

        /* istanbul ignore else */
        if (settings.topic.setColorTemperature) {
            acc.getService(Service.Lightbulb)
                .addCharacteristic(Characteristic.ColorTemperature)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'ColorTemperature', value);
                    const sat = value;
                    mqttPub(settings.topic.setColorTemperature, sat);
                    callback();
                });
            /* istanbul ignore else */
            if (settings.topic.statusColorTemperature) {
                mqttSub(settings.topic.statusColorTemperature, val => {
                    const sat = val;
                    log.debug('> hap update', settings.name, 'ColorTemperature', sat);
                    acc.getService(Service.Lightbulb)
                        .updateCharacteristic(Characteristic.ColorTemperature, sat);
                });
                acc.getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.ColorTemperature)
                    .on('get', callback => {
                        log.debug('< hap get', settings.name, 'ColorTemperature');
                        /* istanbul ignore next */
                        const saturation = mqttStatus[settings.topic.statusColorTemperature];
                        log.debug('> hap re_get', settings.name, 'ColorTemperature', saturation);
                        callback(null, saturation);
                    });
            }
        }
    };
};
