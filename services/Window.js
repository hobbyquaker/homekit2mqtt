/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    /*
     // Required Characteristics
     this.addCharacteristic(Characteristic.CurrentPosition);
     this.addCharacteristic(Characteristic.TargetPosition);
     this.addCharacteristic(Characteristic.PositionState);

     // Optional Characteristics
     TODO this.addOptionalCharacteristic(Characteristic.HoldPosition);
     this.addOptionalCharacteristic(Characteristic.ObstructionDetected);
     this.addOptionalCharacteristic(Characteristic.Name);
     */

    return function createService_Window(acc, settings, subtype) {
        acc.addService(Service.Window, settings.name, subtype)
            .getCharacteristic(Characteristic.TargetPosition)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'TargetPosition', value);
                value *= (settings.payload.targetPositionFactor || 1);
                /* istanbul ignore next */
                if (settings.payload.roundTarget) {
                    value = Math.round(value);
                }
                mqttPub(settings.topic.setTargetPosition, value);
                callback();
            });

        /* istanbul ignore else */
        if (settings.topic.statusTargetPosition) {
            mqttSub(settings.topic.statusTargetPosition, val => {
                const position = val / (settings.payload.targetPositionFactor || 1);
                log.debug('> hap update', settings.name, 'TargetPosition', position);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.TargetPosition, position);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.TargetPosition)
                .on('get', callback => {
                    const position = Math.round(mqttStatus[settings.topic.statusTargetPosition] / (settings.payload.targetPositionFactor || 1));
                    log.debug('> hap re_get', settings.name, 'TargetPosition', position);
                    callback(null, position);
                });
        }

        const obj = {acc, settings, subtype};

        require('../characteristics/CurrentPosition')(obj, iface);
        require('../characteristics/PositionState')(obj, iface);
        require('../characteristics/ObstructionDetected')(obj, iface);
    };
};
