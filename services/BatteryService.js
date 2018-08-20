/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_BatteryService(acc, settings, subtype) {
        acc.addService(Service.BatteryService, settings.name, subtype);

        /* istanbul ignore else */
        if (settings.topic.statusBatteryLevel) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.BatteryLevel)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'BatteryLevel');
                    let val = mqttStatus[settings.topic.statusBatteryLevel];
                    /* istanbul ignore else */
                    if (settings.config && (typeof settings.payload.maxBatteryLevel !== 'undefined')) {
                        const max = settings.payload.maxBatteryLevel;
                        const min = settings.payload.minBatteryLevel || 0;
                        const range = max - min;
                        val = ((val - min) / range) * 100;
                    }
                    log.debug('> hap re_get', settings.name, 'BatteryLevel', val);
                    callback(null, val);
                });

            mqttSub(settings.topic.statusBatteryLevel, val => {
                /* istanbul ignore else */
                if (settings.config && (typeof settings.payload.maxBatteryLevel !== 'undefined')) {
                    const max = settings.payload.maxBatteryLevel;
                    const min = settings.payload.minBatteryLevel || 0;
                    const range = max - min;
                    val = ((val - min) / range) * 100;
                }
                log.debug('> hap update', settings.name, 'BatteryLevel', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.BatteryLevel, val);
            });
        }

        if (settings.topic.statusChargingState) {
            mqttSub(settings.topic.statusChargingState, val => {
                log.debug('> hap update', settings.name, 'ChargingState', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.ChargingState, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.ChargingState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'ChargingState');
                    const val = mqttStatus[settings.topic.statusChargingState];
                    log.debug('> hap re_get', settings.name, 'ChargingState', val);
                    callback(null, val);
                });
        } else {
            acc.getService(subtype)
                .setCharacteristic(Characteristic.ChargingState, Characteristic.ChargingState.NOT_CHARGEABLE);
            acc.getService(subtype)
                .getCharacteristic(Characteristic.ChargingState)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'ChargingState');
                    log.debug('> hap re_get', settings.name, 'ChargingState', Characteristic.ChargingState.NOT_CHARGEABLE);
                    callback(null, Characteristic.ChargingState.NOT_CHARGEABLE);
                });
        }

        const obj = {acc, settings, subtype};

        require('../characteristics/StatusLowBattery')(obj, iface);
    };
};
