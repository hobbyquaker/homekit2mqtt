/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_MotionSensor(settings) {
        const sensor = newAccessory(settings);

        sensor.addService(Service.MotionSensor, settings.name)
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
            sensor.getService(Service.MotionSensor)
                .updateCharacteristic(Characteristic.MotionDetected, motion);
        });

        if (settings.topic.statusLowBattery) {
            sensor.addService(Service.ContactSensor, settings.name)
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
                sensor.getService(Service.ContactSensor)
                    .updateCharacteristic(Characteristic.StatusLowBattery, bat);
            });
        }

        return sensor;
    };
};
