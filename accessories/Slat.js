/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    // TODO Implement

    /*
  // Required Characteristics
  this.addCharacteristic(Characteristic.SlatType);
  this.addCharacteristic(Characteristic.CurrentSlatState);

  // Optional Characteristics
  this.addOptionalCharacteristic(Characteristic.Name);
  this.addOptionalCharacteristic(Characteristic.CurrentTiltAngle);
  this.addOptionalCharacteristic(Characteristic.TargetTiltAngle);
  this.addOptionalCharacteristic(Characteristic.SwingMode);
     */

    return function createAccessory_Slat(settings) {
        throw new Error('Service Slat not yet implemented');
    };
};
