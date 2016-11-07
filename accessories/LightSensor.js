module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_LightSensor(settings) {

        var sensor = newAccessory(settings);

        mqttSub(settings.topic.statusAmbientLightLevel, function(val) {
            log.debug('> hap set', settings.name, 'CurrentAmbientLightLevel', mqttStatus[settings.topic.statusAmbientLightLevel]);
            sensor.getService(Service.LightSensor)
                .setCharacteristic(Characteristic.CurrentAmbientLightLevel,val);
        });

        sensor.addService(Service.LightSensor)
            .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
            .on('get', function(callback) {
                log.debug('< hap get', settings.name, 'LightSensor', 'CurrentAmbientLightLevel');
                log.debug('> hap re_get', settings.name, mqttStatus[settings.topic.statusAmbientLightLevel]);
                callback(null, mqttStatus[settings.topic.statusAmbientLightLevel]);
            });

        return sensor;
    }

};