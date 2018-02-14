/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_StatelessProgrammableSwitch(acc, settings) {
        acc.addService(Service.StatelessProgrammableSwitch);

        mqttSub(settings.topic.statusEvent, val => {
            log.debug('> hap set', settings.name, 'ProgrammableSwitchEvent', val);
            acc.getService(Service.StatelessProgrammableSwitch)
                .setCharacteristic(Characteristic.ProgrammableSwitchEvent, val); // TODO clarify if updateCharacteristic should be used here
        });
    };
};
