/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_LockManagement(acc, settings, subtype) {
        acc.addService(Service.LockManagement, settings.name, subtype);

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

        /* istanbul ignore else */
        if (settings.topic.statusCurrentDoorState) {
            mqttSub(settings.topic.statusCurrentDoorState, settings.json.statusCurrentDoorState, val => {
                if (val === settings.payload.doorClosed) {
                    log.debug('> hap update', settings.name, 'CurrentDoorState.CLOSED');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
                } else if (val === settings.payload.doorOpening) {
                    log.debug('> hap update', settings.name, 'CurrentDoorState.OPENING');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPENING);
                } else if (val === settings.payload.doorClosing) {
                    log.debug('> hap update', settings.name, 'CurrentDoorState.CLOSING');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSING);
                } else if (val === settings.payload.doorStopped) {
                    log.debug('> hap update', settings.name, 'CurrentDoorState.STOPPED');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.STOPPED);
                } else {
                    log.debug('> hap update', settings.name, 'CurrentDoorState.OPEN');
                    acc.getService(subtype)
                        .updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
                }
            });

            acc.getService(subtype)
                .getCharacteristic(Characteristic.CurrentDoorState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CurrentDoorState');

                    const val = mqttStatus(settings.topic.statusCurrentDoorState, settings.json.statusCurrentDoorState);
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

        require('../characteristics')('LockControlPoint', obj, iface);
        require('../characteristics')('Version', obj, iface);
        require('../characteristics')('Logs', obj, iface);
        require('../characteristics')('AudioFeedback', obj, iface);
        require('../characteristics')('LockManagementAutoSecurityTimeout', obj, iface);
        require('../characteristics')('AdministratorOnlyAccess', obj, iface);
        require('../characteristics')('LockLastKnownAction', obj, iface);

        require('../characteristics/MotionDetected')(obj, iface);
    };
};
