module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_SmokeSensor(settings) {

        var sensor = newAccessory(settings);

        sensor.addService(Service.SmokeSensor, settings.name)
            .getCharacteristic(Characteristic.SmokeDetected)
            .on('get', function (callback) {
                log.debug('< hap get', settings.name, 'SmokeDetected');
                var smoke = mqttStatus[settings.topic.statusSmokeDetected] === settings.payload.onSmokeDetected
                    ? Characteristic.SmokeDetected.SMOKE_DETECTED
                    : Characteristic.SmokeDetected.SMOKE_NOT_DETECTED;

                log.debug('> hap re_get', settings.name, 'SmokeDetected', smoke);
                callback(null, smoke);
            });

        mqttSub(settings.topic.statusSmokeDetected, function (val) {
            var smoke = val === settings.payload.onSmokeDetected
                ? Characteristic.SmokeDetected.SMOKE_DETECTED
                : Characteristic.SmokeDetected.SMOKE_NOT_DETECTED;
            log.debug('> hap set', settings.name, 'SmokeDetected', smoke);
            sensor.getService(Service.SmokeSensor)
                .setCharacteristic(Characteristic.SmokeDetected, smoke)
        });

        if (settings.topic.statusLowBattery) {
            sensor.getService(Service.SmokeSensor, settings.name)
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
                sensor.getService(Service.SmokeSensor)
                    .setCharacteristic(Characteristic.StatusLowBattery, bat)
            });
        }

        return sensor;

    }

};