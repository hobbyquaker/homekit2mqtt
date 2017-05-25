module.exports = function (iface) {
    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_TemperatureSensor(settings) {
        var sensor = newAccessory(settings);

        mqttSub(settings.topic.statusTemperature, function (val) {
            log.debug('> hap set', settings.name, 'CurrentTemperature', mqttStatus[settings.topic.statusTemperature]);
            sensor.getService(Service.TemperatureSensor)
                .setCharacteristic(Characteristic.CurrentTemperature, val);
        });

        sensor.addService(Service.TemperatureSensor)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .setProps({minValue: -100})
            .on('get', function (callback) {
                log.debug('< hap get', settings.name, 'TemperatureSensor', 'CurrentTemperature');
                log.debug('> hap re_get', settings.name, mqttStatus[settings.topic.statusTemperature]);
                callback(null, mqttStatus[settings.topic.statusTemperature]);
            });

        return sensor;
    };
};
