module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_CarbonMonoxideSensor(settings) {

        var sensor = newAccessory(settings);

        sensor.addService(Service.CarbonMonoxideSensor, settings.name)
            .getCharacteristic(Characteristic.CarbonMonoxideDetected)
            .on('get', function (callback) {
                log.debug('< hap get', settings.name, 'CarbonMonoxideDetected');
                var contact = mqttStatus[settings.topic.statusCarbonMonoxideDetected] === settings.payload.onCarbonMonoxideDetected
                    ? Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL
                    : Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL;

                log.debug('> hap re_get', settings.name, 'CarbonMonoxideDetected', contact);
                callback(null, contact);
            });

        mqttSub(settings.topic.statusCarbonMonoxideDetected, function (val) {
            var contact = val === settings.payload.onCarbonMonoxideDetected
                ? Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL
                : Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL;
            log.debug('> hap set', settings.name, 'CarbonMonoxideDetected', contact);
            sensor.getService(Service.CarbonMonoxideSensor)
                .setCharacteristic(Characteristic.CarbonMonoxideDetected, contact)
        });

        if (settings.topic.statusLowBattery) {
            sensor.getService(Service.CarbonMonoxideSensor, settings.name)
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
                sensor.getService(Service.CarbonMonoxideSensor)
                    .setCharacteristic(Characteristic.StatusLowBattery, bat)
            });
        }

        return sensor;

    }

};