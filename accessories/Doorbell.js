module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_Doorbell (settings) {
        var sw = newAccessory(settings);

        sw.addService(Service.Doorbell, settings.name);

        mqttSub(settings.topic.statusEvent, function () {
            log.debug('> hap set', settings.name, 'ProgrammableSwitchEvent', 1);
            sw.getService(Service.Doorbell)
                .setCharacteristic(Characteristic.ProgrammableSwitchEvent, 1)
        });


        return sw;
    }

};