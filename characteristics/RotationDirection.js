/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    /* istanbul ignore if */
    if (typeof settings.payload.rotationDirectionCounterClockwise === 'undefined') {
        settings.payload.rotationDirectionCounterClockwise = Characteristic.RotationDirection.COUNTER_CLOCKWISE;
    }

    /* istanbul ignore if */
    if (typeof settings.payload.rotationDirectionClockwise === 'undefined') {
        settings.payload.rotationDirectionClockwise = Characteristic.RotationDirection.CLOCKWISE;
    }

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
        mqttSub(settings.topic.statusRotationDirection, settings.json.statusRotationDirection, val => {
            /* istanbul ignore next */
            const dir = val === settings.payload.rotationDirectionCounterClockwise ?
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
                const dir = mqttStatus(settings.topic.statusRotationDirection, settings.json.statusRotationDirection) === settings.payload.rotationDirectionCounterClockwise ?
                    Characteristic.RotationDirection.COUNTER_CLOCKWISE :
                    Characteristic.RotationDirection.CLOCKWISE;
                log.debug('> hap re_get', settings.name, 'RotationDirection', dir);
                callback(null, dir);
            });
    }
};
