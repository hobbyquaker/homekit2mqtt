/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    settings.payload.targetPositionFactor = settings.payload.targetPositionFactor || 1;

    acc.getService(subtype)
        .getCharacteristic(Characteristic.TargetPosition)
        .on('set', (value, callback) => {
            log.debug('< hap set', settings.name, 'TargetPosition', value);
            /* istanbul ignore next */
            value *= settings.payload.targetPositionFactor;
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
            const position = Math.round(mqttStatus[settings.topic.statusTargetPosition] / settings.payload.targetPositionFactor);
            log.debug('> hap update', settings.name, 'TargetPosition', position);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.TargetPosition, position);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.TargetPosition)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'TargetPosition');
                /* istanbul ignore next */
                const position = Math.round(mqttStatus[settings.topic.statusTargetPosition] / settings.payload.targetPositionFactor);
                log.debug('> hap re_get', settings.name, 'TargetPosition', position);
                callback(null, position);
            });
    }
};
