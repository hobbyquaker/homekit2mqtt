/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    /*
     // Required Characteristics
     this.addCharacteristic(Characteristic.RelayEnabled);
     this.addCharacteristic(Characteristic.RelayState);
     this.addCharacteristic(Characteristic.RelayControlPoint);

     */

    return function createService_Relay(acc, settings) {
        throw new Error('Service Relay not yet implemented');
    };
};
