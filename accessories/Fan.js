module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_Fan(settings) {

        var acc = newAccessory(settings);

        if (typeof settings.payload.onTrue === 'undefined') {
            settings.payload.onTrue = true;
        }

        if (typeof settings.payload.onFalse === 'undefined') {
            settings.payload.onFalse = false;
        }

        if (typeof settings.payload.rotationDirectionCounterClockwise === 'undefined') {
            settings.payload.rotationDirectionCounterClockwise = Characteristic.RotationDirection.COUNTER_CLOCKWISE;
        }

        if (typeof settings.payload.rotationDirectionClockwise === 'undefined') {
            settings.payload.rotationDirectionClockwise = Characteristic.RotationDirection.CLOCKWISE;
        }

        acc.addService(Service.Fan, settings.name)
            .getCharacteristic(Characteristic.On)
            .on('set', function(value, callback) {
                log.debug('< hap set', settings.name, 'On', value);
                var on = value ? settings.payload.onTrue : settings.payload.onFalse;
                log.debug('> mqtt', settings.topic.setOn, on);
                mqttPub(settings.topic.setOn, on);
                callback();
            });

        if (settings.topic.statusOn) {
            mqttSub(settings.topic.statusOn, function (val) {
                var on = val === settings.payload.onTrue;
                log.debug('> hap update', settings.name, 'On', on);
                acc.getService(Service.Fan)
                    .updateCharacteristic(Characteristic.On, on)
            });
            acc.getService(Service.Fan)
                .getCharacteristic(Characteristic.On)
                .on('get', function (callback) {
                    log.debug('< hap get', settings.name, 'On');
                    var on = mqttStatus[settings.topic.statusOn] === settings.payload.onTrue;
                    log.debug('> hap re_get', settings.name, 'On', on);
                    callback(null, on);
                });

        }

        if (settings.topic.setRotationDirection) {
            acc.getService(Service.Fan, settings.name)
                .getCharacteristic(Characteristic.RotationDirection)
                .on('set', function (value, callback) {
                    log.debug('< hap set', settings.name, 'RotationDirection', value);
                    var dir = value === Characteristic.RotationDirection.COUNTER_CLOCKWISE ?
                        settings.payload.rotationDirectionCounterClockwise :
                        settings.payload.rotationDirectionClockwise;

                    log.debug('> mqtt', settings.topic.setRotationDirection, dir);
                    mqttPub(settings.topic.setRotationDirection, dir);
                    callback();
                });
        }

        if (settings.topic.statusRotationDirection) {
            mqttSub(settings.topic.statusRotationDirection, function (val) {
                var dir = mqttStatus[settings.topic.statusRotationDirection] === settings.payload.rotationDirectionCounterClockwise ?
                    Characteristic.RotationDirection.COUNTER_CLOCKWISE :
                    Characteristic.RotationDirection.CLOCKWISE;
                log.debug('> hap update', settings.name, 'RotationDirection', dir);
                acc.getService(Service.Fan)
                    .updateCharacteristic(Characteristic.RotationDirection, dir)
            });
            acc.getService(Service.Fan)
                .getCharacteristic(Characteristic.RotationDirection)
                .on('get', function (callback) {
                    log.debug('< hap get', settings.name, 'RotationDirection');
                    var dir = mqttStatus[settings.topic.statusRotationDirection] === settings.payload.rotationDirectionCounterClockwise ?
                        Characteristic.RotationDirection.COUNTER_CLOCKWISE :
                        Characteristic.RotationDirection.CLOCKWISE;
                    log.debug('> hap re_get', settings.name, 'RotationDirection', dir);
                    callback(null, dir);
                });

        }

        if (settings.topic.setRotationSpeed) {
            acc.getService(Service.Fan, settings.name)
                .getCharacteristic(Characteristic.RotationSpeed)
                .on('set', function (value, callback) {
                    log.debug('< hap set', settings.name, 'RotationSpeed', value);
                    var speed = (value * (settings.payload.rotationSpeedFactor || 1)) || 0;
                    log.debug('> mqtt', settings.topic.setRotationSpeed, speed);
                    mqttPub(settings.topic.setRotationSpeed, speed);
                    callback();
                });
        }

        if (settings.topic.statusRotationSpeed) {
            mqttSub(settings.topic.statusRotationSpeed, function (val) {
                var speed = (val / (settings.payload.rotationSpeedFactor || 1)) || 0;
                log.debug('> hap update', settings.name, 'RotationSpeed', speed);
                acc.getService(Service.Fan)
                    .updateCharacteristic(Characteristic.RotationSpeed, speed)
            });
            acc.getService(Service.Fan)
                .getCharacteristic(Characteristic.RotationSpeed)
                .on('get', function (callback) {
                    log.debug('< hap get', settings.name, 'RotationSpeed');
                    var speed = (mqttStatus[settings.topic.statusRotationSpeed] / (settings.payload.rotationSpeedFactor || 1)) || 0;
                    log.debug('> hap re_get', settings.name, 'RotationSpeed', speed);
                    callback(null, speed);
                });

        }

        return acc;

    }

};