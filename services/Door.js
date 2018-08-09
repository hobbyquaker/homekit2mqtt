/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    /* TODO

    // Optional Characteristics
    this.addOptionalCharacteristic(Characteristic.HoldPosition);
    */

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

        /* istanbul ignore else */
        if (settings.topic.statusCurrentPosition) {
            mqttSub(settings.topic.statusCurrentPosition, val => {
                const pos = Math.round(val / (settings.payload.currentPositionFactor || 1));
                log.debug('> hap update', settings.name, 'CurrentPosition', pos);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.CurrentPosition, pos);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.CurrentPosition)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CurrentPosition');
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

        /* istanbul ignore else */
        if (settings.topic.statusObstruction) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.ObstructionDetected)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'ObstructionDetected');
                    const obstruction = mqttStatus[settings.topic.statusObstruction] === settings.payload.onObstructionDetected;
                    log.debug('> hap re_get', settings.name, 'ObstructionDetected', obstruction);
                    callback(null, obstruction);
                });

            mqttSub(settings.topic.statusObstruction, val => {
                const obstruction = val === settings.payload.onObstructionDetected;
                log.debug('> hap update', settings.name, 'ObstructionDetected', obstruction);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.ObstructionDetected, obstruction);
            });
        }
    };
};
