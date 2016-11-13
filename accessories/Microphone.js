module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    /*
     // Required Characteristics
     this.addCharacteristic(Characteristic.Mute);

     // Optional Characteristics
     this.addOptionalCharacteristic(Characteristic.Volume);
     this.addOptionalCharacteristic(Characteristic.Name);
     */

    return function createAccessory_Microphone(settings) {
        throw new Error('Service Microphone not yet implemented');
    };

};