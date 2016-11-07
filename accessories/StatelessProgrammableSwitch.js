module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_StatelessProgrammableSwitch (settings) {
        var sw = newAccessory(settings);

        sw.addService(Service.StatelessProgrammableSwitch, settings.name);

        mqttSub(settings.topic.statusEvent, function () {
            log.debug('> hap set', settings.name, 'ProgrammableSwitchEvent', 1);
            sw.getService(Service.StatelessProgrammableSwitch)
                .setCharacteristic(Characteristic.ProgrammableSwitchEvent, 1)
        });


        return sw;
    }

};