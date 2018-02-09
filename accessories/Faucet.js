/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    // TODO implement

    /*
    // Required Characteristics
    this.addCharacteristic(Characteristic.Active);

    // Optional Characteristics
    this.addOptionalCharacteristic(Characteristic.Name);
    this.addOptionalCharacteristic(Characteristic.StatusFault);
    */

    return function createAccessory_AirQualitySensor(settings) {
        throw new Error('Service Faucet not yet implemented');
    };
};

