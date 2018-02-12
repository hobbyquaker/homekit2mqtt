/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    // TODO Implement

    /*
  // Required Characteristics
  this.addCharacteristic(Characteristic.Active);
  this.addCharacteristic(Characteristic.CurrentAirPurifierState);
  this.addCharacteristic(Characteristic.TargetAirPurifierState);

  // Optional Characteristics
  this.addOptionalCharacteristic(Characteristic.LockPhysicalControls);
  this.addOptionalCharacteristic(Characteristic.Name);
  this.addOptionalCharacteristic(Characteristic.SwingMode);
  this.addOptionalCharacteristic(Characteristic.RotationSpeed);
     */

    return function createService_AirPurifier(acc, settings) {
        throw new Error('Service AirPurifier not yet implemented');
    };
};
