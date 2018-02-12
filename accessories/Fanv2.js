/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    // TODO Implement

    /*
  // Required Characteristics
  this.addCharacteristic(Characteristic.Active);

  // Optional Characteristics
  this.addOptionalCharacteristic(Characteristic.CurrentFanState);
  this.addOptionalCharacteristic(Characteristic.TargetFanState);
  this.addOptionalCharacteristic(Characteristic.LockPhysicalControls);
  this.addOptionalCharacteristic(Characteristic.Name);
  this.addOptionalCharacteristic(Characteristic.RotationDirection);
  this.addOptionalCharacteristic(Characteristic.RotationSpeed);
  this.addOptionalCharacteristic(Characteristic.SwingMode);
     */

    return function createService_Fanv2(settings) {
        throw new Error('Service Fanv2 not yet implemented');
    };
};
