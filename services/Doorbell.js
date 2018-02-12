/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_Doorbell(acc, settings) {
        acc.addService(Service.Doorbell);

        mqttSub(settings.topic.statusEvent, () => {
            log.debug('> hap set', settings.name || acc.name, 'ProgrammableSwitchEvent', 1);
            acc.getService(Service.Doorbell)
                .setCharacteristic(Characteristic.ProgrammableSwitchEvent, 1);
        });
    };
};
