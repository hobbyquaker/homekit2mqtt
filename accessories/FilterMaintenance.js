/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    // TODO Implement

    /*
  // Required Characteristics
  this.addCharacteristic(Characteristic.FilterChangeIndication);

  // Optional Characteristics
  this.addOptionalCharacteristic(Characteristic.FilterLifeLevel);
  this.addOptionalCharacteristic(Characteristic.ResetFilterIndication);
  this.addOptionalCharacteristic(Characteristic.Name);
     */

    return function createAccessory_FilterMaintenance(settings) {
        throw new Error('Service FilterMaintenance not yet implemented');
    };
};
