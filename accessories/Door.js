module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    /*
    // Required Characteristics
    this.addCharacteristic(Characteristic.CurrentPosition);
    this.addCharacteristic(Characteristic.PositionState);
    this.addCharacteristic(Characteristic.TargetPosition);

    // Optional Characteristics
    this.addOptionalCharacteristic(Characteristic.HoldPosition);
    this.addOptionalCharacteristic(Characteristic.ObstructionDetected);
    this.addOptionalCharacteristic(Characteristic.Name);
    */


    return function createAccessory_Door(settings) {
        throw new Error('Service Door not yet implemented');
    };

};