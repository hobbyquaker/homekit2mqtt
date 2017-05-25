module.exports = function (iface) {
    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    /*
    // Required Characteristics
    this.addCharacteristic(Characteristic.CurrentPosition);
    this.addCharacteristic(Characteristic.PositionState);
    this.addCharacteristic(Characteristic.TargetPosition);

    // Optional Characteristics
    TODO this.addOptionalCharacteristic(Characteristic.HoldPosition);
    this.addOptionalCharacteristic(Characteristic.ObstructionDetected);
    this.addOptionalCharacteristic(Characteristic.Name);
    */

    return function createAccessory_Door(settings) {
        var acc = newAccessory(settings);

        acc.addService(Service.Door, settings.name)
            .getCharacteristic(Characteristic.TargetPosition)
            .on('set', function (value, callback) {
                log.debug('< hap set', settings.name, 'TargetPosition', value);
                value *= (settings.payload.targetPositionFactor || 1);
                if (settings.payload.roundTarget) {
                    value = Math.round(value);
                }
                log.debug('> mqtt', settings.topic.setTargetPosition, value);
                mqttPub(settings.topic.setTargetPosition, value);
                callback();
            });

        if (settings.topic.statusTargetPosition) {
            mqttSub(settings.topic.statusTargetPosition, function (val) {
                var position = Math.round(mqttStatus[settings.topic.statusTargetPosition] / (settings.payload.targetPositionFactor || 1));
                log.debug('> hap update', settings.name, 'TargetPosition', position);
                acc.getService(Service.Door)
                    .updateCharacteristic(Characteristic.TargetPosition, position);
            });
            acc.getService(Service.Door)
                .getCharacteristic(Characteristic.TargetPosition)
                .on('get', function (callback) {
                    log.debug('< hap get', settings.name, 'TargetPosition');
                    var position = Math.round(mqttStatus[settings.topic.statusTargetPosition] / (settings.payload.targetPositionFactor || 1));
                    log.debug('> hap re_get', settings.name, 'TargetPosition', position);
                    callback(null, position);
                });
        }

        if (settings.topic.statusCurrentPosition) {
            mqttSub(settings.topic.statusCurrentPosition, function (val) {
                var pos = Math.round(val / (settings.payload.currentPositionFactor || 1));
                log.debug('> hap set', settings.name, 'CurrentPosition', pos);
                acc.getService(Service.Door)
                    .setCharacteristic(Characteristic.CurrentPosition, pos);
            });
            acc.getService(Service.Door)
                .getCharacteristic(Characteristic.CurrentPosition)
                .on('get', function (callback) {
                    log.debug('< hap get', settings.name, 'CurrentPosition');
                    var position = Math.round(mqttStatus[settings.topic.statusCurrentPosition] / (settings.payload.currentPositionFactor || 1));
                    log.debug('> hap re_get', settings.name, 'CurrentPosition', position);
                    callback(null, position);
                });
        }

        if (settings.topic.statusPositionStatus) {
            mqttSub(settings.topic.statusPositionStatus, function (val) {
                var state;
                if (val === settings.payload.positionStatusDecreasing) {
                    state = Characteristic.PositionState.DECREASING;
                    log.debug('> hap set', settings.name, 'PositionState.DECREASING');
                } else if (val === settings.payload.positionStatusIncreasing) {
                    state = Characteristic.PositionState.INCREASING;
                    log.debug('> hap set', settings.name, 'PositionState.INCREASING');
                } else {
                    state = Characteristic.PositionState.STOPPED;
                    log.debug('> hap set', settings.name, 'PositionState.STOPPED');
                }
                acc.getService(Service.Door)
                    .setCharacteristic(Characteristic.PositionState, state);
            });
            acc.getService(Service.Door)
                .getCharacteristic(Characteristic.PositionState)
                .on('get', function (callback) {
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

        if (settings.topic.statusObstruction) {
            acc.getService(Service.GarageDoorOpener, settings.name)
                .getCharacteristic(Characteristic.ObstructionDetected)
                .on('get', function (callback) {
                    log.debug('< hap get', settings.name, 'ObstructionDetected');
                    var obstruction = mqttStatus[settings.topic.statusObstruction] === settings.payload.onObstructionDetected;
                    log.debug('> hap re_get', settings.name, 'ObstructionDetected', obstruction);
                    callback(null, obstruction);
                });

            mqttSub(settings.topic.statusObstruction, function (val) {
                var obstruction = val === settings.payload.onObstructionDetected;
                log.debug('> hap set', settings.name, 'ObstructionDetected', obstruction);
                acc.getService(Service.GarageDoorOpener)
                    .setCharacteristic(Characteristic.ObstructionDetected, obstruction);
            });
        }

        return acc;
    };
};
