/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_Microphone(acc, settings, subtype) {
        acc.addService(Service.Microphone, settings.name, subtype);

        require('../characteristics/Mute')({acc, settings, subtype}, iface);
        require('../characteristics/Volume')({acc, settings, subtype}, iface);
    };
};
