/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    /*
    Service.Valve = function(displayName, subtype) {
    Service.call(this, displayName, '000000D0-0000-1000-8000-0026BB765291', subtype);

    // Required Characteristics
    this.addCharacteristic(Characteristic.Active);
    this.addCharacteristic(Characteristic.InUse);
    this.addCharacteristic(Characteristic.ValveType);

    // Optional Characteristics
    this.addOptionalCharacteristic(Characteristic.SetDuration);
    this.addOptionalCharacteristic(Characteristic.RemainingDuration);
    this.addOptionalCharacteristic(Characteristic.IsConfigured);
    this.addOptionalCharacteristic(Characteristic.ServiceLabelIndex);
    this.addOptionalCharacteristic(Characteristic.StatusFault);
    this.addOptionalCharacteristic(Characteristic.Name);
     */

    return function createAccessory_Valve(settings) {
        throw new Error('Service Valve not yet implemented');
    };
};
