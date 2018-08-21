/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_Door(acc, settings, subtype) {
        acc.addService(Service.Door, settings.name, subtype)
            .getCharacteristic(Characteristic.TargetPosition)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'TargetPosition', value);
                value *= (settings.payload.targetPositionFactor || 1);
                /* istanbul ignore next */
                if (settings.payload.roundTarget) {
                    value = Math.round(value);
                }
                log.debug('> mqtt', settings.topic.setTargetPosition, value);
                mqttPub(settings.topic.setTargetPosition, value);
                callback();
            });

        /* istanbul ignore else */
        if (settings.topic.statusTargetPosition) {
            mqttSub(settings.topic.statusTargetPosition, val => {
                const position = Math.round(mqttStatus[settings.topic.statusTargetPosition] / (settings.payload.targetPositionFactor || 1));
                log.debug('> hap update', settings.name, 'TargetPosition', position);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.TargetPosition, position);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.TargetPosition)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'TargetPosition');
                    const position = Math.round(mqttStatus[settings.topic.statusTargetPosition] / (settings.payload.targetPositionFactor || 1));
                    log.debug('> hap re_get', settings.name, 'TargetPosition', position);
                    callback(null, position);
                });
        }

        if (settings.topic.setHoldPosition) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.HoldPosition)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'HoldPosition', value);
                    if (typeof settings.payload.holdPositionTrue !== 'undefined' && value) {
                        value = settings.payload.holdPositionTrue;
                    } else if (typeof settings.payload.holdPositionFalse !== 'undefined' && !value) {
                        value = settings.payload.holdPositionFalse;
                    }
                    log.debug('> mqtt', settings.topic.setHoldPosition, value);
                    mqttPub(settings.topic.setHoldPosition, value);
                    callback();
                });
        }

        const obj = {acc, settings, subtype};

        require('../characteristics/CurrentPosition')(obj, iface);

        require('../characteristics/PositionState')(obj, iface);
        require('../characteristics/ObstructionDetected')(obj, iface);
    };
};
