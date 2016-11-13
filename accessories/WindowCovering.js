module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_WindowCovering(settings) {
        var shutter = newAccessory(settings);

        shutter.addService(Service.WindowCovering, settings.name)
            .getCharacteristic(Characteristic.TargetPosition)
            .on('set', function (value, callback) {
                log.debug('< hap set', settings.name, 'TargetPosition', value);
                value = (value * (settings.payload.targetPositionFactor || 1));
                if (settings.payload.roundTarget === true) {
                    value = Math.round(value);
                }
                log.debug('> mqtt', settings.topic.setTargetPosition, value);
                mqttPub(settings.topic.setTargetPosition, value);
                callback();
            });

        if (settings.topic.statusTargetPosition) {
            mqttSub(settings.topic.statusTargetPosition, function (val) {
                var position = mqttStatus[settings.topic.statusTargetPosition] / (settings.payload.targetPositionFactor || 1);
                log.debug('> hap update', settings.name, 'TargetPosition', position);
                shutter.getService(Service.WindowCovering)
                    .updateCharacteristic(Characteristic.TargetPosition)
            });
            shutter.getService(Service.WindowCovering)
                .getCharacteristic(Characteristic.TargetPosition)
                .on('get', function (callback) {
                    log.debug('< hap get', settings.name, 'TargetPosition');
                    var position = mqttStatus[settings.topic.statusTargetPosition] / (settings.payload.targetPositionFactor || 1);
                    log.debug('> hap re_get', settings.name, 'TargetPosition', position);
                    callback(null, position);
                });
        }

        if (settings.topic.statusCurrentPosition) {
            mqttSub(settings.topic.statusCurrentPosition, function (val) {
                var pos = val / (settings.payload.currentPositionFactor || 1);
                log.debug('> hap set', settings.name, 'CurrentPosition', pos);
                shutter.getService(Service.WindowCovering)
                    .setCharacteristic(Characteristic.CurrentPosition, pos)

            });
            shutter.getService(Service.WindowCovering)
                .getCharacteristic(Characteristic.CurrentPosition)
                .on('get', function (callback) {
                    log.debug('< hap get', settings.name, 'CurrentPosition');
                    var position = mqttStatus[settings.topic.statusCurrentPosition] / (settings.payload.currentPositionFactor || 1);

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
                    var position = mqttStatus[settings.topic.statusTargetPosition] / (settings.payload.targetPositionFactor || 1);
                    log.debug('> hap update', settings.name, 'TargetPosition', position);
                    shutter.getService(Service.WindowCovering)
                        .updateCharacteristic(Characteristic.TargetPosition, position);
                    state = Characteristic.PositionState.STOPPED;
                    log.debug('> hap set', settings.name, 'PositionState.STOPPED');
                }
                shutter.getService(Service.WindowCovering)
                    .setCharacteristic(Characteristic.PositionState, state);
            });
            shutter.getService(Service.WindowCovering)
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

        return shutter;

    }

};