/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    // TODO Implement

    /*
   // Required Characteristics
  this.addCharacteristic(Characteristic.Active);
  this.addCharacteristic(Characteristic.ProgramMode);
  this.addCharacteristic(Characteristic.InUse);

  // Optional Characteristics
  this.addOptionalCharacteristic(Characteristic.Name);
  this.addOptionalCharacteristic(Characteristic.RemainingDuration);
  this.addOptionalCharacteristic(Characteristic.StatusFault);
     */

    return function createAccessory_IrrigationSystem(settings) {
        throw new Error('Service IrrigationSystem not yet implemented');
    };
};
