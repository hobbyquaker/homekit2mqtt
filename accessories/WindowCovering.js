/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_WindowCovering(settings) {
        const shutter = newAccessory(settings);

        shutter.addService(Service.WindowCovering, settings.name)
            .getCharacteristic(Characteristic.TargetPosition)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'TargetPosition', value);
                /* istanbul ignore next */
                value *= (settings.payload.targetPositionFactor || 1);
                /* istanbul ignore if */
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
                /* istanbul ignore next */
                const position = Math.round(mqttStatus[settings.topic.statusTargetPosition] / (settings.payload.targetPositionFactor || 1));
                log.debug('> hap update', settings.name, 'TargetPosition', position);
                shutter.getService(Service.WindowCovering)
                    .updateCharacteristic(Characteristic.TargetPosition, position);
            });
            shutter.getService(Service.WindowCovering)
                .getCharacteristic(Characteristic.TargetPosition)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'TargetPosition');
                    /* istanbul ignore next */
                    const position = Math.round(mqttStatus[settings.topic.statusTargetPosition] / (settings.payload.targetPositionFactor || 1));
                    log.debug('> hap re_get', settings.name, 'TargetPosition', position);
                    callback(null, position);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusCurrentPosition) {
            mqttSub(settings.topic.statusCurrentPosition, val => {
                /* istanbul ignore next */
                const pos = Math.round(val / (settings.payload.currentPositionFactor || 1));
                log.debug('> hap update', settings.name, 'CurrentPosition', pos);
                shutter.getService(Service.WindowCovering)
                    .updateCharacteristic(Characteristic.CurrentPosition, pos);
            });
            shutter.getService(Service.WindowCovering)
                .getCharacteristic(Characteristic.CurrentPosition)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CurrentPosition');
                    /* istanbul ignore next */
                    const position = Math.round(mqttStatus[settings.topic.statusCurrentPosition] / (settings.payload.currentPositionFactor || 1));
                    log.debug('> hap re_get', settings.name, 'CurrentPosition', position);
                    callback(null, position);
                });
        }

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
                shutter.getService(Service.WindowCovering)
                    .updateCharacteristic(Characteristic.PositionState, state);
            });
            shutter.getService(Service.WindowCovering)
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

        return shutter;
    };
};
