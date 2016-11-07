module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_OccupancySensor(settings) {

        var sensor = newAccessory(settings);

        sensor.addService(Service.OccupancySensor, settings.name)
            .getCharacteristic(Characteristic.OccupancyDetected)
            .on('get', function (callback) {
                log.debug('< hap get', settings.name, 'OccupancyDetected');
                var motion = mqttStatus[settings.topic.statusOccupancyDetected] === settings.payload.onOccupancyDetected;

                log.debug('> hap re_get', settings.name, 'OccupancyDetected', motion ?
                    Characteristic.OccupancyDetected.OCCUPANCY_DETECTED :
                    Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED);
                callback(null, motion);
            });

        mqttSub(settings.topic.statusOccupancyDetected, function (val) {
            var motion = val === settings.payload.onOccupancyDetected;
            log.debug('> hap set', settings.name, 'OccupancyDetected', motion);
            sensor.getService(Service.OccupancySensor)
                .setCharacteristic(Characteristic.OccupancyDetected, motion ?
                    Characteristic.OccupancyDetected.OCCUPANCY_DETECTED :
                    Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED)
        });

        if (settings.topic.statusLowBattery) {
            sensor.addService(Service.ContactSensor, settings.name)
                .getCharacteristic(Characteristic.StatusLowBattery)
                .on('get', function (callback) {
                    log.debug('< hap get', settings.name, 'StatusLowBattery');
                    var bat = mqttStatus[settings.topic.statusLowBattery] === settings.payload.onLowBattery
                        ? Characteristic.StatusLowBattery.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
                        : Characteristic.StatusLowBattery.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;

                    log.debug('> hap re_get', settings.name, 'StatusLowBattery', bat);
                    callback(null, bat);
                });

            mqttSub(settings.topic.statusLowBattery, function (val) {
                var bat = val === settings.payload.onLowBattery
                    ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
                    : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
                log.debug('> hap set', settings.name, 'statusLowBattery', bat);
                sensor.getService(Service.ContactSensor)
                    .setCharacteristic(Characteristic.StatusLowBattery, bat)
            });
        }

        return sensor;

    }

};