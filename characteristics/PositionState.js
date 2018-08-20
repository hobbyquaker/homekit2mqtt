/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    /* istanbul ignore else */
    if (settings.topic.statusPositionState) {
        mqttSub(settings.topic.statusPositionState, val => {
            let state;
            if (val === settings.payload.positionStatusDecreasing) {
                state = Characteristic.PositionState.DECREASING;
                log.debug('> hap update', settings.name, 'PositionState.DECREASING');
            } else if (val === settings.payload.positionStatusIncreasing) {
                state = Characteristic.PositionState.INCREASING;
                log.debug('> hap update', settings.name, 'PositionState.INCREASING');
            } else {
                state = Characteristic.PositionState.STOPPED;
                log.debug('> hap update', settings.name, 'PositionState.STOPPED');
            }
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.PositionState, state);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.PositionState)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'PositionState');

                if (mqttStatus[settings.topic.statusPositionState] === settings.payload.positionStatusDecreasing) {
                    log.debug('> hap re_get', settings.name, 'PositionState.DECREASING');
                    callback(null, Characteristic.PositionState.DECREASING);
                } else if (mqttStatus[settings.topic.statusPositionState] === settings.payload.positionStatusIncreasing) {
                    log.debug('> hap re_get', settings.name, 'PositionState.INCREASING');
                    callback(null, Characteristic.PositionState.INCREASING);
                } else {
                    log.debug('> hap re_get', settings.name, 'PositionState.STOPPED');
                    callback(null, Characteristic.PositionState.STOPPED);
                }
            });
    }
};
