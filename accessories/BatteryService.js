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
        const bat = newAccessory(settings);

        bat.addService(Service.BatteryService);
            /*
            .getCharacteristic(Characteristic.BatteryLevel)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'BatteryLevel');
                const level = mqttStatus[settings.topic.statusBatteryLevel];
                log.debug('> hap re_get', settings.name, 'BatteryLevel', level);
                callback(null, level);
            });
            */

        mqttSub(settings.topic.statusBatteryLevel, val => {
            log.debug('> hap update', settings.name, 'BatteryLevel', val);
            bat.getService(Service.BatteryService)
                .updateCharacteristic(Characteristic.BatteryLevel, val);
        });

        mqttSub(settings.topic.statusChargingState, val => {
            log.debug('> hap update', settings.name, 'ChargingState', val);
            bat.getService(Service.BatteryService)
                .updateCharacteristic(Characteristic.ChargingState, val);
        });

        mqttSub(settings.topic.statusLowBattery, val => {
            val = (val === settings.payload.onLowBattery) ? 1 : 0;
            log.debug('> hap update', settings.name, 'StatusLowBattery', val);
            bat.getService(Service.BatteryService)
                .updateCharacteristic(Characteristic.StatusLowBattery, val);
        });
    };
};
