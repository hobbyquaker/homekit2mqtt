/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_Fan(acc, settings, subtype) {
        /* istanbul ignore else */
        if (typeof settings.payload.onTrue === 'undefined') {
            settings.payload.onTrue = true;
        }

        /* istanbul ignore else */
        if (typeof settings.payload.onFalse === 'undefined') {
            settings.payload.onFalse = false;
        }

        acc.addService(Service.Fan, settings.name, subtype);

        require('../characteristics/On')({acc, settings, subtype}, iface);
        require('../characteristics/RotationDirection')({acc, settings, subtype}, iface);
        require('../characteristics/RotationSpeed')({acc, settings, subtype}, iface);
    };
};
