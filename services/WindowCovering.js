/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

/*
  // Required Characteristics
  this.addCharacteristic(Characteristic.CurrentPosition);
  this.addCharacteristic(Characteristic.TargetPosition);
  this.addCharacteristic(Characteristic.PositionState);

  // Optional Characteristics
  this.addOptionalCharacteristic(Characteristic.HoldPosition);
  TODO this.addOptionalCharacteristic(Characteristic.TargetHorizontalTiltAngle);
  TODO this.addOptionalCharacteristic(Characteristic.TargetVerticalTiltAngle);
  TODO this.addOptionalCharacteristic(Characteristic.CurrentHorizontalTiltAngle);
  TODO this.addOptionalCharacteristic(Characteristic.CurrentVerticalTiltAngle);
  this.addOptionalCharacteristic(Characteristic.ObstructionDetected);
 */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_WindowCovering(acc, settings, subtype) {
        acc.addService(Service.WindowCovering, settings.name, subtype);

        const obj = {acc, settings, subtype};

        require('../characteristics/TargetPosition')(obj, iface);
        require('../characteristics/CurrentPosition')(obj, iface);
        require('../characteristics/HoldPosition')(obj, iface);
        require('../characteristics/PositionState')(obj, iface);
        require('../characteristics/ObstructionDetected')(obj, iface);
    };
};
