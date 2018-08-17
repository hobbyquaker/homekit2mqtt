/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_Switch(acc, settings, subtype) {
        acc.addService(Service.Switch, settings.name, subtype);

        require('../characteristics/On')({acc, settings, subtype}, iface);
    };
};
