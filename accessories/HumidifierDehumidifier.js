/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    // TODO Implement

    /*
  // Required Characteristics
  this.addCharacteristic(Characteristic.CurrentRelativeHumidity);
  this.addCharacteristic(Characteristic.CurrentHumidifierDehumidifierState);
  this.addCharacteristic(Characteristic.TargetHumidifierDehumidifierState);
  this.addCharacteristic(Characteristic.Active);

  // Optional Characteristics
  this.addOptionalCharacteristic(Characteristic.LockPhysicalControls);
  this.addOptionalCharacteristic(Characteristic.Name);
  this.addOptionalCharacteristic(Characteristic.SwingMode);
  this.addOptionalCharacteristic(Characteristic.WaterLevel);
  this.addOptionalCharacteristic(Characteristic.RelativeHumidityDehumidifierThreshold);
  this.addOptionalCharacteristic(Characteristic.RelativeHumidityHumidifierThreshold);
  this.addOptionalCharacteristic(Characteristic.RotationSpeed);
     */

    return function createAccessory_HumidifierDehumidifier(settings) {
        throw new Error('Service HumidifierDehumidifier not yet implemented');
    };
};
