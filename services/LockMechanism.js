/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_LockMechanism(acc, settings, subtype) {
        acc.addService(Service.LockMechanism, settings.name, subtype);

        const obj = {acc, settings, subtype};

        require('../characteristics/LockTargetState')(obj, iface);
        require('../characteristics/LockCurrentState')(obj, iface);
    };
};
