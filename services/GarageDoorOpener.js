/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_GarageDoorOpener(acc, settings, subtype) {
        if (typeof settings.payload.doorClosed === 'undefined') {
            settings.payload.doorClosed = Characteristic.CurrentDoorState.CLOSED;
        }
        if (typeof settings.payload.doorOpening === 'undefined') {
            settings.payload.doorOpening = Characteristic.CurrentDoorState.OPENING;
        }
        if (typeof settings.payload.doorClosing === 'undefined') {
            settings.payload.doorClosing = Characteristic.CurrentDoorState.CLOSING;
        }
        if (typeof settings.payload.doorStopped === 'undefined') {
            settings.payload.doorStopped = Characteristic.CurrentDoorState.STOPPED;
        }

        acc.addService(Service.GarageDoorOpener, settings.name, subtype);

        acc.getService(subtype)
            .getCharacteristic(Characteristic.TargetDoorState)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'TargetDoorState', value);
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
            mqttSub(settings.topic.statusDoor, settings.json.statusDoor, val => {
                if (val === settings.payload.doorClosed) {
                    log.debug('> hap update', settings.name, 'CurrentDoorState.CLOSED');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
                    log.debug('> hap update', settings.name, 'TargetDoorState.CLOSED');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.TargetDoorState, Characteristic.CurrentDoorState.CLOSED);
                } else if (val === settings.payload.doorOpening) {
                    log.debug('> hap update', settings.name, 'CurrentDoorState.OPENING');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPENING);
                    log.debug('> hap update', settings.name, 'TargetDoorState.OPEN');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.TargetDoorState, Characteristic.CurrentDoorState.OPEN);
                } else if (val === settings.payload.doorClosing) {
                    log.debug('> hap update', settings.name, 'CurrentDoorState.CLOSING');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSING);
                    log.debug('> hap update', settings.name, 'TargetDoorState.CLOSED');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.TargetDoorState, Characteristic.CurrentDoorState.CLOSED);
                } else if (val === settings.payload.doorStopped) {
                    log.debug('> hap update', settings.name, 'CurrentDoorState.STOPPED');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.STOPPED);
                    log.debug('> hap update', settings.name, 'TargetDoorState.STOPPED');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.TargetDoorState, Characteristic.CurrentDoorState.STOPPED);
                } else {
                    log.debug('> hap update', settings.name, 'CurrentDoorState.OPEN');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
                    log.debug('> hap update', settings.name, 'TargetDoorState.OPEN');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.TargetDoorState, Characteristic.CurrentDoorState.OPEN);
                }
            });

            acc.getService(subtype)
                .getCharacteristic(Characteristic.CurrentDoorState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CurrentDoorState');

                    const val = mqttStatus(settings.topic.statusDoor, settings.json.statusDoor);

                    if (val === settings.payload.doorClosed) {
                        log.debug('> hap re_get', settings.name, 'CurrentDoorState.CLOSED');
                        callback(null, Characteristic.CurrentDoorState.CLOSED);
                    } else if (val === settings.payload.doorOpening) {
                        log.debug('> hap re_get', settings.name, 'CurrentDoorState.OPENING');
                        callback(null, Characteristic.CurrentDoorState.OPENING);
                    } else if (val === settings.payload.doorClosing) {
                        log.debug('> hap re_get', settings.name, 'CurrentDoorState.CLOSING');
                        callback(null, Characteristic.CurrentDoorState.CLOSING);
                    } else if (val === settings.payload.doorStopped) {
                        log.debug('> hap re_get', settings.name, 'CurrentDoorState.STOPPED');
                        callback(null, Characteristic.CurrentDoorState.STOPPED);
                    } else {
                        log.debug('> hap re_get', settings.name, 'CurrentDoorState.OPEN');
                        callback(null, Characteristic.CurrentDoorState.OPEN);
                    }
                });
        }

        const obj = {acc, settings, subtype};

        require('../characteristics/LockTargetState')(obj, iface);
        require('../characteristics/LockCurrentState')(obj, iface);
        require('../characteristics/ObstructionDetected')(obj, iface);
    };
};
