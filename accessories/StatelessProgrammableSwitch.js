/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_StatelessProgrammableSwitch(settings) {
        const sw = newAccessory(settings);

        sw.addService(Service.StatelessProgrammableSwitch, settings.name);

        mqttSub(settings.topic.statusEvent, val => {
            log.debug('> hap set', settings.name, 'ProgrammableSwitchEvent', val);
            sw.getService(Service.StatelessProgrammableSwitch)
                .setCharacteristic(Characteristic.ProgrammableSwitchEvent, val);
        });

        return sw;
    };
};
