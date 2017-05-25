module.exports = function (iface) {
    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_HumiditySensor(settings) {
        var sensor = newAccessory(settings);

        mqttSub(settings.topic.statusHumidity, function (val) {
            log.debug('> hap set', settings.name, 'CurrentRelativeHumidity', mqttStatus[settings.topic.statusHumidity]);
            sensor.getService(Service.HumiditySensor)
                .setCharacteristic(Characteristic.CurrentRelativeHumidity, val);
        });

        sensor.addService(Service.HumiditySensor)
            .getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .on('get', function (callback) {
                log.debug('< hap get', settings.name, 'HumiditySensor', 'CurrentRelativeHumidity');
                log.debug('> hap re_get', settings.name, mqttStatus[settings.topic.statusHumidity]);
                callback(null, mqttStatus[settings.topic.statusHumidity]);
            });

        return sensor;
    };
};
