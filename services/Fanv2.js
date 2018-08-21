/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_Fanv2(acc, settings, subtype) {
        acc.addService(Service.Fanv2);

        const obj = {acc, settings, subtype};

        require('../characteristics')('CurrentFanState', obj, iface);
        require('../characteristics')('TargetFanState', obj, iface);

        require('../characteristics/Active')(obj, iface);
        require('../characteristics/RotationSpeed')(obj, iface);
        require('../characteristics/RotationDirection')(obj, iface);
        require('../characteristics/LockPhysicalControls')(obj, iface);
        require('../characteristics/SwingMode')(obj, iface);
    };
};
