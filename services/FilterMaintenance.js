/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_FilterMaintenance(acc, settings, subtype) {
        acc.addService(Service.FilterMaintenance, settings.name, subtype);

        const obj = {acc, settings, subtype};

        require('../characteristics')('FilterChangeIndication', obj, iface);
        require('../characteristics')('FilterLifeLevel', obj, iface);
        require('../characteristics')('ResetFilterIndication', obj, iface);
    };
};
