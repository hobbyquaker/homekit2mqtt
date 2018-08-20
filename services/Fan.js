/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_Fan(acc, settings, subtype) {
        /* istanbul ignore else */
        if (typeof settings.payload.onTrue === 'undefined') {
            settings.payload.onTrue = true;
        }

        /* istanbul ignore else */
        if (typeof settings.payload.onFalse === 'undefined') {
            settings.payload.onFalse = false;
        }

        acc.addService(Service.Fan, settings.name, subtype);

        /* istanbul ignore else */
        if (settings.topic.setRotationSpeed) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.RotationSpeed)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'RotationSpeed', value);
                    /* istanbul ignore next */
                    const speed = (value * (settings.payload.rotationSpeedFactor || 1)) || 0;
                    mqttPub(settings.topic.setRotationSpeed, speed);
                    callback();
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusRotationSpeed) {
            mqttSub(settings.topic.statusRotationSpeed, val => {
                /* istanbul ignore next */
                const speed = (val / (settings.payload.rotationSpeedFactor || 1)) || 0;
                log.debug('> hap update', settings.name, 'RotationSpeed', speed);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.RotationSpeed, speed);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.RotationSpeed)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'RotationSpeed');
                    /* istanbul ignore next */
                    const speed = (mqttStatus[settings.topic.statusRotationSpeed] / (settings.payload.rotationSpeedFactor || 1)) || 0;
                    log.debug('> hap re_get', settings.name, 'RotationSpeed', speed);
                    callback(null, speed);
                });
        }

        require('../characteristics/On')({acc, settings, subtype}, iface);
        require('../characteristics/RotationDirection')({acc, settings, subtype}, iface);
    };
};
