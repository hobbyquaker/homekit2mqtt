module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_LeakSensor(settings) {

        var sensor = newAccessory(settings);

        sensor.addService(Service.LeakSensor, settings.name)
            .getCharacteristic(Characteristic.LeakDetected)
            .on('get', function (callback) {
                log.debug('< hap get', settings.name, 'LeakDetected');
                var contact = mqttStatus[settings.topic.statusLeakDetected] === settings.payload.onLeakDetected
                    ? Characteristic.LeakDetected.LEAK_DETECTED
                    : Characteristic.LeakDetected.LEAK_NOT_DETECTED;

                log.debug('> hap re_get', settings.name, 'LeakDetected', contact);
                callback(null, contact);
            });

        mqttSub(settings.topic.statusLeakDetected, function (val) {
            var contact = val === settings.payload.onLeakDetected
                ? Characteristic.LeakDetected.LEAK_DETECTED
                : Characteristic.LeakDetected.LEAK_NOT_DETECTED;
            log.debug('> hap set', settings.name, 'LeakDetected', contact);
            sensor.getService(Service.LeakSensor)
                .setCharacteristic(Characteristic.LeakDetected, contact)
        });

        if (settings.topic.statusLowBattery) {
            sensor.getService(Service.LeakSensor, settings.name)
                .getCharacteristic(Characteristic.StatusLowBattery)
                .on('get', function (callback) {
                    log.debug('< hap get', settings.name, 'StatusLowBattery');
                    var bat = mqttStatus[settings.topic.statusLowBattery] === settings.payload.onLowBattery
                        ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
                        : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
                    log.debug('> hap re_get', settings.name, 'StatusLowBattery', bat);
                    callback(null, bat);
                });

            mqttSub(settings.topic.statusLowBattery, function (val) {
                var bat = val === settings.payload.onLowBattery
                    ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
                    : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
                log.debug('> hap set', settings.name, 'StatusLowBattery', bat);
                sensor.getService(Service.LeakSensor)
                    .setCharacteristic(Characteristic.StatusLowBattery, bat)
            });
        }

        return sensor;

    }

};