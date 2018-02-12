/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_GarageDoorOpener(acc, settings) {
        /* Required Characteristics
         this.addCharacteristic(Characteristic.CurrentDoorState);
         this.addCharacteristic(Characteristic.TargetDoorState);
         this.addCharacteristic(Characteristic.ObstructionDetected);

         // Optional Characteristics
         this.addOptionalCharacteristic(Characteristic.LockCurrentState);
         this.addOptionalCharacteristic(Characteristic.LockTargetState);
         this.addOptionalCharacteristic(Characteristic.Name); */

        acc.addService(Service.GarageDoorOpener)
            .getCharacteristic(Characteristic.TargetDoorState)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name || acc.name, 'TargetDoorState', value);
                /* istanbul ignore else */
                if (value === Characteristic.TargetDoorState.OPEN) {
                    mqttPub(settings.topic.setDoor, settings.payload.doorOpen);
                    callback();
                } else if (value === Characteristic.TargetDoorState.CLOSED) {
                    mqttPub(settings.topic.setDoor, settings.payload.doorClosed);
                    callback();
                }
            });

        /* istanbul ignore else */
        if (settings.topic.statusDoor) {
            mqttSub(settings.topic.statusDoor, val => {
                if (val === settings.payload.doorClosed) {
                    log.debug('> hap update', settings.name || acc.name, 'CurrentDoorState.CLOSED');
                    acc.getService(Service.GarageDoorOpener)
                        .updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
                    log.debug('> hap update', settings.name || acc.name, 'TargetDoorState.CLOSED');
                    acc.getService(Service.GarageDoorOpener)
                        .updateCharacteristic(Characteristic.TargetDoorState, Characteristic.CurrentDoorState.CLOSED);
                } else if (val === settings.payload.doorOpening) {
                    log.debug('> hap update', settings.name || acc.name, 'CurrentDoorState.OPENING');
                    acc.getService(Service.GarageDoorOpener)
                        .updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPENING);
                    log.debug('> hap update', settings.name || acc.name, 'TargetDoorState.OPEN');
                    acc.getService(Service.GarageDoorOpener)
                        .updateCharacteristic(Characteristic.TargetDoorState, Characteristic.CurrentDoorState.OPEN);
                } else if (val === settings.payload.doorClosing) {
                    log.debug('> hap update', settings.name || acc.name, 'CurrentDoorState.CLOSING');
                    acc.getService(Service.GarageDoorOpener)
                        .updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSING);
                    log.debug('> hap update', settings.name || acc.name, 'TargetDoorState.CLOSED');
                    acc.getService(Service.GarageDoorOpener)
                        .updateCharacteristic(Characteristic.TargetDoorState, Characteristic.CurrentDoorState.CLOSED);
                } else if (val === settings.payload.doorStopped) {
                    log.debug('> hap update', settings.name || acc.name, 'CurrentDoorState.STOPPED');
                    acc.getService(Service.GarageDoorOpener)
                        .updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.STOPPED);
                    log.debug('> hap update', settings.name || acc.name, 'TargetDoorState.STOPPED');
                    acc.getService(Service.GarageDoorOpener)
                        .updateCharacteristic(Characteristic.TargetDoorState, Characteristic.CurrentDoorState.STOPPED);
                } else {
                    log.debug('> hap update', settings.name || acc.name, 'CurrentDoorState.OPEN');
                    acc.getService(Service.GarageDoorOpener)
                        .updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
                    log.debug('> hap update', settings.name || acc.name, 'TargetDoorState.OPEN');
                    acc.getService(Service.GarageDoorOpener)
                        .updateCharacteristic(Characteristic.TargetDoorState, Characteristic.CurrentDoorState.OPEN);
                }
            });

            acc.getService(Service.GarageDoorOpener)
                .getCharacteristic(Characteristic.CurrentDoorState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name || acc.name, 'CurrentDoorState');

                    if (mqttStatus[settings.topic.statusDoor] === settings.payload.doorClosed) {
                        log.debug('> hap re_get', settings.name || acc.name, 'CurrentDoorState.CLOSED');
                        callback(null, Characteristic.CurrentDoorState.CLOSED);
                    } else if (mqttStatus[settings.topic.statusDoor] === settings.payload.doorOpening) {
                        log.debug('> hap re_get', settings.name || acc.name, 'CurrentDoorState.OPENING');
                        callback(null, Characteristic.CurrentDoorState.OPENING);
                    } else if (mqttStatus[settings.topic.statusDoor] === settings.payload.doorClosing) {
                        log.debug('> hap re_get', settings.name || acc.name, 'CurrentDoorState.CLOSING');
                        callback(null, Characteristic.CurrentDoorState.CLOSING);
                    } else if (mqttStatus[settings.topic.statusDoor] === settings.payload.doorStopped) {
                        log.debug('> hap re_get', settings.name || acc.name, 'CurrentDoorState.STOPPED');
                        callback(null, Characteristic.CurrentDoorState.STOPPED);
                    } else {
                        log.debug('> hap re_get', settings.name || acc.name, 'CurrentDoorState.OPEN');
                        callback(null, Characteristic.CurrentDoorState.OPEN);
                    }
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusObstruction) {
            acc.getService(Service.GarageDoorOpener)
                .getCharacteristic(Characteristic.ObstructionDetected)
                .on('get', callback => {
                    log.debug('< hap get', settings.name || acc.name, 'ObstructionDetected');
                    const obstruction = mqttStatus[settings.topic.statusObstruction] === settings.payload.onObstructionDetected;
                    log.debug('> hap re_get', settings.name || acc.name, 'ObstructionDetected', obstruction);
                    callback(null, obstruction);
                });

            mqttSub(settings.topic.statusObstruction, val => {
                const obstruction = val === settings.payload.onObstructionDetected;
                log.debug('> hap update', settings.name || acc.name, 'ObstructionDetected', obstruction);
                acc.getService(Service.GarageDoorOpener)
                    .updateCharacteristic(Characteristic.ObstructionDetected, obstruction);
            });
        }

        /* istanbul ignore else */
        if (settings.topic.setLock) {
            acc.getService(Service.GarageDoorOpener)
                .getCharacteristic(Characteristic.LockTargetState)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name || acc.name, 'LockTargetState', value);
                    /* istanbul ignore else */
                    if (value === Characteristic.LockTargetState.UNSECURED) {
                        mqttPub(settings.topic.setLock, settings.payload.lockUnsecured);
                        callback();
                    } else if (value === Characteristic.LockTargetState.SECURED) {
                        mqttPub(settings.topic.setLock, settings.payload.lockSecured);
                        callback();
                    }
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusLock) {
            mqttSub(settings.topic.statusLock, val => {
                if (val === settings.payload.lockSecured) {
                    log.debug('> hap update', settings.name || acc.name, 'LockCurrentState.SECURED');
                    acc.getService(Service.GarageDoorOpener)
                        .updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED);
                } else {
                    log.debug('> hap set', settings.name || acc.name, 'LockCurrentState.UNSECURED');
                    log.debug('> hap update', settings.name || acc.name, 'LockCurrentState.UNSECURED');
                    acc.getService(Service.GarageDoorOpener)
                        .updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.UNSECURED);
                }
            });

            acc.getService(Service.GarageDoorOpener)
                .getCharacteristic(Characteristic.LockCurrentState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name || acc.name, 'LockCurrentState');

                    if (mqttStatus[settings.topic.statusLock] === settings.payload.lockSecured) {
                        log.debug('> hap re_get', settings.name || acc.name, 'LockCurrentState.SECURED');
                        callback(null, Characteristic.LockCurrentState.SECURED);
                    } else {
                        log.debug('> hap re_get', settings.name || acc.name, 'LockCurrentState.UNSECURED');
                        callback(null, Characteristic.LockCurrentState.UNSECURED);
                    }
                });
        }
    };
};
