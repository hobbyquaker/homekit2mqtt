module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    /*
     // Required Characteristics
     this.addCharacteristic(Characteristic.CurrentPosition);
     this.addCharacteristic(Characteristic.TargetPosition);
     this.addCharacteristic(Characteristic.PositionState);

     // Optional Characteristics
     this.addOptionalCharacteristic(Characteristic.HoldPosition);
     this.addOptionalCharacteristic(Characteristic.ObstructionDetected);
     this.addOptionalCharacteristic(Characteristic.Name);
     */


    return function createAccessory_Window(settings) {
        throw new Error('Service Window not yet implemented');
    };

};