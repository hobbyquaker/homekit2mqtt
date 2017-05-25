module.exports = function (iface) {
    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    /*
     // Required Characteristics
     this.addCharacteristic(Characteristic.RelayEnabled);
     this.addCharacteristic(Characteristic.RelayState);
     this.addCharacteristic(Characteristic.RelayControlPoint);

     */

    return function createAccessory_Relay(settings) {
        throw new Error('Service Relay not yet implemented');
    };
};
