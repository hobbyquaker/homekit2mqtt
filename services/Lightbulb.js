/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

const convert = require('color-convert');

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_Lightbulb(acc, settings, subtype) {
        const current = {
            on: false,
            hue: 0,
            sat: 0,
            bri: 0
        };

        function publishRGB() {
            if (settings.topic.setRGB) {
                if (current.on) {
                    const rgb = '#' + convert.rgb.hex(convert.hsv.rgb([current.hue, current.sat, current.bri]));
                    mqttPub(settings.topic.setRGB, rgb);
                } else {
                    mqttPub(settings.topic.setRGB, '#000000');
                }
            }
        }

        if (settings.topic.statusRGB) {
            mqttSub(settings.topic.statusRGB, val => {
                const r = parseInt(val.substr(1, 2), 16);
                const g = parseInt(val.substr(3, 2), 16);
                const b = parseInt(val.substr(5, 2), 16);
                const [hue, sat, bri] = convert.rgb.hsv([r, g, b]);
                current.hue = hue;
                current.sat = sat;
                current.bri = bri;
                current.on = bri > 0;
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.On, bri > 0)
                    .updateCharacteristic(Characteristic.Hue, hue)
                    .updateCharacteristic(Characteristic.Saturation, sat)
                    .updateCharacteristic(Characteristic.Brightness, bri);
            });
        }

        acc.addService(Service.Lightbulb, settings.name, subtype)
            .getCharacteristic(Characteristic.On)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'On', value);
                current.on = value;
                publishRGB();
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
            current.on = on;
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.On, on);
        });

        acc.getService(subtype)
            .getCharacteristic(Characteristic.On)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'On');
                const on = mqttStatus[settings.topic.statusOn] !== settings.payload.onFalse;
                log.debug('> hap re_get', settings.name, 'On', on);
                callback(null, on);
            });

        /* istanbul ignore else */
        if (settings.topic.setBrightness) {
            acc.getService(subtype)
                .addCharacteristic(Characteristic.Brightness)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'Brightness', value);
                    current.bri = value;
                    publishRGB();
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
                    current.bri = brightness;
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.Brightness, brightness);
                });

                acc.getService(subtype)
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
            acc.getService(subtype)
                .addCharacteristic(Characteristic.Hue)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'Hue', value);
                    current.hue = value;
                    publishRGB();
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
                    current.hue = hue;
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.Hue, hue);
                });
                acc.getService(subtype)
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
            acc.getService(subtype)
                .addCharacteristic(Characteristic.Saturation)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'Saturation', value);
                    current.sat = value;
                    publishRGB();
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
                    current.sat = sat;
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.Saturation, sat);
                });
                acc.getService(subtype)
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
            acc.getService(subtype)
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
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.ColorTemperature, sat);
                });
                acc.getService(subtype)
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
