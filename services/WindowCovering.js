/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_WindowCovering(acc, settings, subtype) {
        acc.addService(Service.WindowCovering, settings.name, subtype);

        const obj = {acc, settings, subtype};

        require('../characteristics')('TargetHorizontalTiltAngle', obj, iface);
        require('../characteristics')('TargetVerticalTiltAngle', obj, iface);
        require('../characteristics')('CurrentHorizontalTiltAngle', obj, iface);
        require('../characteristics')('CurrentVerticalTiltAngle', obj, iface);

        require('../characteristics/TargetPosition')(obj, iface);
        require('../characteristics/CurrentPosition')(obj, iface);
        require('../characteristics/HoldPosition')(obj, iface);
        require('../characteristics/PositionState')(obj, iface);
        require('../characteristics/ObstructionDetected')(obj, iface);
    };
};
