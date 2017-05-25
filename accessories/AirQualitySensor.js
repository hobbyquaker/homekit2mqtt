module.exports = function (iface) {
    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    /*
     // Required Characteristics
     this.addCharacteristic(Characteristic.AirQuality);

     // Optional Characteristics
     this.addOptionalCharacteristic(Characteristic.AirParticulateDensity);
     this.addOptionalCharacteristic(Characteristic.AirParticulateSize);
     this.addOptionalCharacteristic(Characteristic.StatusActive);
     this.addOptionalCharacteristic(Characteristic.StatusFault);
     this.addOptionalCharacteristic(Characteristic.StatusTampered);
     this.addOptionalCharacteristic(Characteristic.StatusLowBattery);
     this.addOptionalCharacteristic(Characteristic.Name);

     Characteristic.AirQuality.UNKNOWN = 0;
     Characteristic.AirQuality.EXCELLENT = 1;
     Characteristic.AirQuality.GOOD = 2;
     Characteristic.AirQuality.FAIR = 3;
     Characteristic.AirQuality.INFERIOR = 4;
     Characteristic.AirQuality.POOR = 5;
     */

    return function createAccessory_AirQualitySensor(settings) {
        throw new Error('Service AirQualitySensor not yet implemented');
    };
};
