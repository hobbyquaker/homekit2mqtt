/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

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

    return function createService_BatteryService(acc, settings, subtype) {
        acc.addService(Service.BatteryService, settings.name, subtype);
        /*
            .getCharacteristic(Characteristic.BatteryLevel)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'BatteryLevel');
                const level = mqttStatus[settings.topic.statusBatteryLevel];
                log.debug('> hap re_get', settings.name, 'BatteryLevel', level);
                callback(null, level);
            });
            */

        if (settings.topic.statusBatteryLevel) {
            mqttSub(settings.topic.statusBatteryLevel, val => {
                if (settings.config && (typeof settings.payload.maxBatteryLevel !== 'undefined')) {
                    const max = settings.payload.maxBatteryLevel;
                    const min = settings.payload.minBatteryLevel || 0;
                    const range = max - min;
                    val = ((val - min) / range) * 100;
                }
                log.debug('> hap update', settings.name, 'BatteryLevel', val);
                acc.getService(Service.BatteryService)
                    .updateCharacteristic(Characteristic.BatteryLevel, val);
            });
        }

        if (settings.topic.statusChargingState) {
            mqttSub(settings.topic.statusChargingState, val => {
                log.debug('> hap update', settings.name, 'ChargingState', val);
                acc.getService(Service.BatteryService)
                    .updateCharacteristic(Characteristic.ChargingState, val);
            });
        }

        if (settings.topic.statusLowBattery) {
            mqttSub(settings.topic.statusLowBattery, val => {
                val = (val === settings.payload.onLowBattery) ? 1 : 0;
                log.debug('> hap update', settings.name, 'StatusLowBattery', val);
                acc.getService(Service.BatteryService)
                    .updateCharacteristic(Characteristic.StatusLowBattery, val);
            });
        }
    };
};
