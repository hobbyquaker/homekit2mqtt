/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_WindowCovering(acc, settings, subtype) {
        acc.addService(Service.WindowCovering, settings.name, subtype)
            .getCharacteristic(Characteristic.TargetPosition)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'TargetPosition', value);
                /* istanbul ignore next */
                value *= (settings.payload.targetPositionFactor || 1);
                /* istanbul ignore if */
                if (settings.payload.roundTarget) {
                    value = Math.round(value);
                }
                mqttPub(settings.topic.setTargetPosition, value);
                callback();
            });

        /* istanbul ignore else */
        if (settings.topic.statusTargetPosition) {
            mqttSub(settings.topic.statusTargetPosition, val => {
                /* istanbul ignore next */
                const position = Math.round(mqttStatus[settings.topic.statusTargetPosition] / (settings.payload.targetPositionFactor || 1));
                log.debug('> hap update', settings.name, 'TargetPosition', position);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.TargetPosition, position);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.TargetPosition)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'TargetPosition');
                    /* istanbul ignore next */
                    const position = Math.round(mqttStatus[settings.topic.statusTargetPosition] / (settings.payload.targetPositionFactor || 1));
                    log.debug('> hap re_get', settings.name, 'TargetPosition', position);
                    callback(null, position);
                });
        }

        const obj = {acc, settings, subtype};

        require('../characteristics/CurrentPosition')(obj, iface);
        require('../characteristics/HoldPosition')(obj, iface);
        require('../characteristics/PositionState')(obj, iface);
    };
};
