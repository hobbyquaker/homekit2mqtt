/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_GarageDoorOpener(settings) {
        /* Required Characteristics
         this.addCharacteristic(Characteristic.CurrentDoorState);
         this.addCharacteristic(Characteristic.TargetDoorState);
         this.addCharacteristic(Characteristic.ObstructionDetected);

         // Optional Characteristics
         this.addOptionalCharacteristic(Characteristic.LockCurrentState);
         this.addOptionalCharacteristic(Characteristic.LockTargetState);
         this.addOptionalCharacteristic(Characteristic.Name); */

        const garage = newAccessory(settings);
        garage.addService(Service.GarageDoorOpener, settings.name)
            .getCharacteristic(Characteristic.TargetDoorState)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'TargetDoorState', value);
                if (value === Characteristic.TargetDoorState.OPEN) {
                    log.debug('> mqtt publish', settings.topic.setDoor, settings.payload.doorOpen);
                    mqttPub(settings.topic.setDoor, settings.payload.doorOpen);

                    callback();
                } else if (value === Characteristic.TargetDoorState.CLOSED) {
                    log.debug('> mqtt publish', settings.topic.setDoor, settings.payload.doorClosed);
                    mqttPub(settings.topic.setDoor, settings.payload.doorClosed);

                    callback();
                }
            });

        if (settings.topic.statusDoor) {
            /* TODO opening/closing/stopped
             Characteristic.CurrentDoorState.OPEN = 0;
             Characteristic.CurrentDoorState.CLOSED = 1;
             Characteristic.CurrentDoorState.OPENING = 2;
             Characteristic.CurrentDoorState.CLOSING = 3;
             Characteristic.CurrentDoorState.STOPPED = 4;
             */

            mqttSub(settings.topic.statusDoor, val => {
                if (val === settings.payload.doorClosed) {
                    log.debug('> hap set', settings.name, 'CurrentDoorState.CLOSED');
                    garage.getService(Service.GarageDoorOpener)
                        .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
                    log.debug('> hap update', settings.name, 'TargetDoorState.CLOSED');
                    garage.getService(Service.GarageDoorOpener)
                        .updateCharacteristic(Characteristic.TargetDoorState, Characteristic.CurrentDoorState.CLOSED);
                } else {
                    log.debug('> hap set', settings.name, 'CurrentDoorState.OPEN');
                    garage.getService(Service.GarageDoorOpener)
                        .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
                    log.debug('> hap update', settings.name, 'TargetDoorState.OPEN');
                    garage.getService(Service.GarageDoorOpener)
                        .updateCharacteristic(Characteristic.TargetDoorState, Characteristic.CurrentDoorState.OPEN);
                }
            });

            garage.getService(Service.GarageDoorOpener)
                .getCharacteristic(Characteristic.CurrentDoorState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CurrentDoorState');

                    if (mqttStatus[settings.topic.statusDoor] === settings.payload.doorClosed) {
                        log.debug('> hap re_get', settings.name, 'CurrentDoorState.CLOSED');
                        callback(null, Characteristic.CurrentDoorState.CLOSED);
                    } else {
                        log.debug('> hap re_get', settings.name, 'CurrentDoorState.OPEN');
                        callback(null, Characteristic.CurrentDoorState.OPEN);
                    }
                });
        }

        if (settings.topic.statusObstruction) {
            garage.getService(Service.GarageDoorOpener, settings.name)
                .getCharacteristic(Characteristic.ObstructionDetected)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'ObstructionDetected');
                    const obstruction = mqttStatus[settings.topic.statusObstruction] === settings.payload.onObstructionDetected;
                    log.debug('> hap re_get', settings.name, 'ObstructionDetected', obstruction);
                    callback(null, obstruction);
                });

            mqttSub(settings.topic.statusObstruction, val => {
                const obstruction = val === settings.payload.onObstructionDetected;
                log.debug('> hap set', settings.name, 'ObstructionDetected', obstruction);
                garage.getService(Service.GarageDoorOpener)
                    .setCharacteristic(Characteristic.ObstructionDetected, obstruction);
            });
        }

        if (settings.topic.setLock) {
            garage.getService(Service.GarageDoorOpener, settings.name)
                .getCharacteristic(Characteristic.LockTargetState)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'LockTargetState', value);
                    if (value === Characteristic.LockTargetState.UNSECURED) {
                        log.debug('> mqtt publish', settings.topic.setLock, settings.payload.lockUnsecured);
                        mqttPub(settings.topic.setLock, settings.payload.lockUnsecured);
                        callback();
                    } else if (value === Characteristic.LockTargetState.SECURED) {
                        log.debug('> mqtt publish', settings.topic.setLock, settings.payload.lockSecured);
                        mqttPub(settings.topic.setLock, settings.payload.lockSecured);
                        callback();
                    }
                });
        }

        if (settings.topic.statusLock) {
            mqttSub(settings.topic.statusLock, val => {
                if (val === settings.payload.lockSecured) {
                    log.debug('> hap set', settings.name, 'LockCurrentState.SECURED');
                    garage.getService(Service.LockMechanism)
                        .setCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED);
                    log.debug('> hap update', settings.name, 'LockCurrentState.SECURED');
                    garage.getService(Service.LockMechanism)
                        .updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockCurrentState.SECURED);
                } else {
                    log.debug('> hap set', settings.name, 'LockCurrentState.UNSECURED');
                    garage.getService(Service.LockMechanism)
                        .setCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.UNSECURED);
                    log.debug('> hap update', settings.name, 'LockCurrentState.UNSECURED');
                    garage.getService(Service.LockMechanism)
                        .updateCharacteristic(Characteristic.LockTargetState, Characteristic.LockCurrentState.UNSECURED);
                }
            });

            garage.getService(Service.GarageDoorOpener)
                .getCharacteristic(Characteristic.LockCurrentState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'LockCurrentState');

                    if (mqttStatus[settings.topic.statusLock] === settings.payload.lockSecured) {
                        log.debug('> hap re_get', settings.name, 'LockCurrentState.SECURED');
                        callback(null, Characteristic.LockCurrentState.SECURED);
                    } else {
                        log.debug('> hap re_get', settings.name, 'LockCurrentState.UNSECURED');
                        callback(null, Characteristic.LockCurrentState.UNSECURED);
                    }
                });
        }

        return garage;
    };
};
