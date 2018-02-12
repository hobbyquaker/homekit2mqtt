/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_Fan(settings) {
        const acc = newAccessory(settings);

        /* istanbul ignore else */
        if (typeof settings.payload.onTrue === 'undefined') {
            settings.payload.onTrue = true;
        }

        /* istanbul ignore else */
        if (typeof settings.payload.onFalse === 'undefined') {
            settings.payload.onFalse = false;
        }

        /* istanbul ignore if */
        if (typeof settings.payload.rotationDirectionCounterClockwise === 'undefined') {
            settings.payload.rotationDirectionCounterClockwise = Characteristic.RotationDirection.COUNTER_CLOCKWISE;
        }

        /* istanbul ignore if */
        if (typeof settings.payload.rotationDirectionClockwise === 'undefined') {
            settings.payload.rotationDirectionClockwise = Characteristic.RotationDirection.CLOCKWISE;
        }

        acc.addService(Service.Fan)
            .getCharacteristic(Characteristic.On)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'On', value);
                const on = value ? settings.payload.onTrue : settings.payload.onFalse;
                mqttPub(settings.topic.setOn, on);
                callback();
            });

        /* istanbul ignore else */
        if (settings.topic.statusOn) {
            mqttSub(settings.topic.statusOn, val => {
                const on = val === settings.payload.onTrue;
                log.debug('> hap update', settings.name, 'On', on);
                acc.getService(Service.Fan)
                    .updateCharacteristic(Characteristic.On, on);
            });
            acc.getService(Service.Fan)
                .getCharacteristic(Characteristic.On)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'On');
                    const on = mqttStatus[settings.topic.statusOn] === settings.payload.onTrue;
                    log.debug('> hap re_get', settings.name, 'On', on);
                    callback(null, on);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.setRotationDirection) {
            acc.getService(Service.Fan)
                .getCharacteristic(Characteristic.RotationDirection)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'RotationDirection', value);
                    /* istanbul ignore next */
                    const dir = value === Characteristic.RotationDirection.COUNTER_CLOCKWISE ?
                        settings.payload.rotationDirectionCounterClockwise :
                        settings.payload.rotationDirectionClockwise;

                    mqttPub(settings.topic.setRotationDirection, dir);
                    callback();
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusRotationDirection) {
            mqttSub(settings.topic.statusRotationDirection, val => {
                /* istanbul ignore next */
                const dir = mqttStatus[settings.topic.statusRotationDirection] === settings.payload.rotationDirectionCounterClockwise ?
                    Characteristic.RotationDirection.COUNTER_CLOCKWISE :
                    Characteristic.RotationDirection.CLOCKWISE;
                log.debug('> hap update', settings.name, 'RotationDirection', dir);
                acc.getService(Service.Fan)
                    .updateCharacteristic(Characteristic.RotationDirection, dir);
            });
            acc.getService(Service.Fan)
                .getCharacteristic(Characteristic.RotationDirection)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'RotationDirection');
                    /* istanbul ignore next */
                    const dir = mqttStatus[settings.topic.statusRotationDirection] === settings.payload.rotationDirectionCounterClockwise ?
                        Characteristic.RotationDirection.COUNTER_CLOCKWISE :
                        Characteristic.RotationDirection.CLOCKWISE;
                    log.debug('> hap re_get', settings.name, 'RotationDirection', dir);
                    callback(null, dir);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.setRotationSpeed) {
            acc.getService(Service.Fan)
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
                acc.getService(Service.Fan)
                    .updateCharacteristic(Characteristic.RotationSpeed, speed);
            });
            acc.getService(Service.Fan)
                .getCharacteristic(Characteristic.RotationSpeed)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'RotationSpeed');
                    /* istanbul ignore next */
                    const speed = (mqttStatus[settings.topic.statusRotationSpeed] / (settings.payload.rotationSpeedFactor || 1)) || 0;
                    log.debug('> hap re_get', settings.name, 'RotationSpeed', speed);
                    callback(null, speed);
                });
        }

        return acc;
    };
};
