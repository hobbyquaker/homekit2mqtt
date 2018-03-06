/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_MotionSensor(acc, settings, subtype) {
        acc.addService(Service.MotionSensor, settings.name, subtype)
            .getCharacteristic(Characteristic.MotionDetected)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'MotionDetected');
                const motion = mqttStatus[settings.topic.statusMotionDetected] === settings.payload.onMotionDetected;

                log.debug('> hap re_get', settings.name, 'MotionDetected', motion);
                callback(null, motion);
            });

        mqttSub(settings.topic.statusMotionDetected, val => {
            const motion = val === settings.payload.onMotionDetected;
            log.debug('> hap update', settings.name, 'MotionDetected', motion);
            acc.getService(Service.MotionSensor)
                .updateCharacteristic(Characteristic.MotionDetected, motion);
        });

        /* istanbul ignore else */
        if (settings.topic.statusLowBattery) {
            acc.getService(Service.MotionSensor)
                .getCharacteristic(Characteristic.StatusLowBattery)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'StatusLowBattery');
                    const bat = mqttStatus[settings.topic.statusLowBattery] !== settings.payload.onLowBattery ?
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL :
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;

                    log.debug('> hap re_get', settings.name, 'StatusLowBattery', bat);
                    callback(null, bat);
                });

            mqttSub(settings.topic.statusLowBattery, val => {
                const bat = val !== settings.payload.onLowBattery ?
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL :
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
                log.debug('> hap update', settings.name, 'StatusLowBattery', bat);
                acc.getService(Service.MotionSensor)
                    .updateCharacteristic(Characteristic.StatusLowBattery, bat);
            });
        }
    };
};
