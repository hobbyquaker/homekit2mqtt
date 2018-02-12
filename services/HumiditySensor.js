/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

/* TODO
 this.addOptionalCharacteristic(Characteristic.StatusActive);
 this.addOptionalCharacteristic(Characteristic.StatusFault);
 this.addOptionalCharacteristic(Characteristic.StatusTampered);
 */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_HumiditySensor(acc, settings) {
        mqttSub(settings.topic.statusHumidity, val => {
            log.debug('> hap update', settings.name || acc.name, 'CurrentRelativeHumidity', mqttStatus[settings.topic.statusHumidity]);
            acc.getService(Service.HumiditySensor)
                .updateCharacteristic(Characteristic.CurrentRelativeHumidity, val);
        });

        acc.addService(Service.HumiditySensor)
            .getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .on('get', callback => {
                log.debug('< hap get', settings.name || acc.name, 'HumiditySensor', 'CurrentRelativeHumidity');
                log.debug('> hap re_get', settings.name || acc.name, mqttStatus[settings.topic.statusHumidity]);
                callback(null, mqttStatus[settings.topic.statusHumidity]);
            });

        /* istanbul ignore else */
        if (settings.topic.statusLowBattery) {
            acc.getService(Service.HumiditySensor)
                .getCharacteristic(Characteristic.StatusLowBattery)
                .on('get', callback => {
                    log.debug('< hap get', settings.name || acc.name, 'StatusLowBattery');
                    const bat = mqttStatus[settings.topic.statusLowBattery] === settings.payload.onLowBattery ?
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW :
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;

                    log.debug('> hap re_get', settings.name || acc.name, 'StatusLowBattery', bat);
                    callback(null, bat);
                });

            mqttSub(settings.topic.statusLowBattery, val => {
                const bat = val === settings.payload.onLowBattery ?
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW :
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
                log.debug('> hap update', settings.name || acc.name, 'StatusLowBattery', bat);
                acc.getService(Service.HumiditySensor)
                    .updateCharacteristic(Characteristic.StatusLowBattery, bat);
            });
        }
    };
};
