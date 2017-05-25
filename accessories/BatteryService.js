/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    /*
     // Required Characteristics
     this.addCharacteristic(Characteristic.BatteryLevel);
     this.addCharacteristic(Characteristic.ChargingState);
     this.addCharacteristic(Characteristic.StatusLowBattery);

     // Optional Characteristics
     this.addOptionalCharacteristic(Characteristic.Name);

     // The value property of StatusLowBattery must be one of the following:
     Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL = 0;
     Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW = 1;

     // The value property of ChargingState must be one of the following:
     Characteristic.ChargingState.NOT_CHARGING = 0;
     Characteristic.ChargingState.CHARGING = 1;
     Characteristic.ChargingState.NOT_CHARGEABLE = 2;
     */

    return function createAccessory_BatteryService(settings) {
        throw new Error('Service BatteryService not yet implemented');
    };
};
