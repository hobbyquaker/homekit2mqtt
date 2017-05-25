module.exports = function (iface) {
    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_MotionSensor(settings) {
        var sensor = newAccessory(settings);

        sensor.addService(Service.MotionSensor, settings.name)
            .getCharacteristic(Characteristic.MotionDetected)
            .on('get', function (callback) {
                log.debug('< hap get', settings.name, 'MotionDetected');
                var motion = mqttStatus[settings.topic.statusMotionDetected] === settings.payload.onMotionDetected;

                log.debug('> hap re_get', settings.name, 'MotionDetected', motion);
                callback(null, motion);
            });

        mqttSub(settings.topic.statusMotionDetected, function (val) {
            var motion = val === settings.payload.onMotionDetected;
            log.debug('> hap set', settings.name, 'MotionDetected', motion);
            sensor.getService(Service.MotionSensor)
                .setCharacteristic(Characteristic.MotionDetected, motion);
        });

        if (settings.topic.statusLowBattery) {
            sensor.addService(Service.ContactSensor, settings.name)
                .getCharacteristic(Characteristic.StatusLowBattery)
                .on('get', function (callback) {
                    log.debug('< hap get', settings.name, 'StatusLowBattery');
                    var bat = mqttStatus[settings.topic.statusLowBattery] === settings.payload.onLowBattery ?
                        Characteristic.StatusLowBattery.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW :
                        Characteristic.StatusLowBattery.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;

                    log.debug('> hap re_get', settings.name, 'StatusLowBattery', bat);
                    callback(null, bat);
                });

            mqttSub(settings.topic.statusLowBattery, function (val) {
                var bat = val === settings.payload.onLowBattery ?
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW :
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
                log.debug('> hap set', settings.name, 'statusLowBattery', bat);
                sensor.getService(Service.ContactSensor)
                    .setCharacteristic(Characteristic.StatusLowBattery, bat);
            });
        }

        return sensor;
    };
};
