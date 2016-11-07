module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_Switch(settings) {

        var sw = newAccessory(settings);

        sw.addService(Service.Switch, settings.name)
            .getCharacteristic(Characteristic.On)
            .on('set', function(value, callback) {
                log.debug('< hap set', settings.name, 'On', value);
                var on = value ? settings.payload.onTrue : settings.payload.onFalse;
                log.debug('> mqtt', settings.topic.setOn, on);
                mqttPub(settings.topic.setOn, on);
                callback();
            });

        if (settings.topic.statusOn) {
            mqttSub(settings.topic.statusOn);
            sw.getService(Service.Switch)
                .getCharacteristic(Characteristic.On)
                .on('get', function (callback) {
                    log.debug('< hap get', settings.name, 'On');
                    var on = mqttStatus[settings.topic.statusOn] === settings.payload.onTrue;
                    log.debug('> hap re_get', settings.name, 'On', on);
                    callback(null, on);
                });

        }

        return sw;

    }

};