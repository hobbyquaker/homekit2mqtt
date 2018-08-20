/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_Fanv2(acc, settings, subtype) {
        /* istanbul ignore if */
        if (typeof settings.payload.rotationDirectionCounterClockwise === 'undefined') {
            settings.payload.rotationDirectionCounterClockwise = Characteristic.RotationDirection.COUNTER_CLOCKWISE;
        }

        /* istanbul ignore if */
        if (typeof settings.payload.rotationDirectionClockwise === 'undefined') {
            settings.payload.rotationDirectionClockwise = Characteristic.RotationDirection.CLOCKWISE;
        }

        acc.addService(Service.Fanv2);

        /* istanbul ignore else */
        if (settings.topic.setRotationDirection) {
            acc.getService(subtype)
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
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.RotationDirection, dir);
            });
            acc.getService(subtype)
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

        mqttSub(settings.topic.statusCurrentFanState, val => {
            log.debug('> hap update', settings.name, 'CurrentFanState', val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.CurrentFanState, val);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.CurrentFanState)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CurrentFanState');
                const state = mqttStatus[settings.topic.statusCurrentFanState];
                log.debug('> hap re_get', settings.name, 'CurrentFanState', state);
                callback(null, state);
            });

        acc.getService(subtype)
            .getCharacteristic(Characteristic.TargetFanState)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'TargetFanState', value);
                mqttPub(settings.topic.setTargetFanState, value);
                callback();
            });

        mqttSub(settings.topic.statusTargetFanState, val => {
            log.debug('> hap update', settings.name, 'TargetFanState', val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.TargetFanState, val);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.TargetFanState)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'TargetFanState');
                const state = mqttStatus[settings.topic.statusTargetFanState];
                log.debug('> hap re_get', settings.name, 'TargetFanState', state);
                callback(null, state);
            });

        require('../characteristics/Active')({acc, settings, subtype}, iface);
        require('../characteristics/LockPhysicalControls')({acc, settings, subtype}, iface);
        require('../characteristics/SwingMode')({acc, settings, subtype}, iface);
    };
};
