module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_Outlet(settings) {

        var acc = newAccessory(settings);

        acc.addService(Service.Outlet, settings.name)
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
            acc.getService(Service.Outlet)
                .getCharacteristic(Characteristic.On)
                .on('get', function (callback) {
                    log.debug('< hap get', settings.name, 'On');
                    var on = mqttStatus[settings.topic.statusOn] === settings.payload.onTrue;
                    log.debug('> hap re_get', settings.name, 'On', on);
                    callback(null, on);
                });
        }

        acc.addService(Service.Outlet, settings.name)
            .getCharacteristic(Characteristic.OutletInUse)
            .on('get', function (callback) {
                log.debug('< hap get', settings.name, 'OutletInUse');
                var inUse = mqttStatus[settings.topic.statusOutletInUse] === settings.payload.onOutletInUse;
                log.debug('> hap re_get', settings.name, 'OutletInUse', inUse);
                callback(null, inUse);
            });

        mqttSub(settings.topic.statusOutletInUse, function (val) {
            var inUse = val === settings.payload.onOutletInUse;
            log.debug('> hap set', settings.name, 'OutletInUse', inUse);
            acc.getService(Service.Outlet)
                .setCharacteristic(Characteristic.OutletInUse, inUse)
        });

        return acc;

    }

};