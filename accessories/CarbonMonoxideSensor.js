/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

/* TODO
 this.addOptionalCharacteristic(Characteristic.StatusActive);
 this.addOptionalCharacteristic(Characteristic.StatusFault);
 this.addOptionalCharacteristic(Characteristic.StatusTampered);
 */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_CarbonMonoxideSensor(settings) {
        const sensor = newAccessory(settings);

        sensor.addService(Service.CarbonMonoxideSensor)
            .getCharacteristic(Characteristic.CarbonMonoxideDetected)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CarbonMonoxideDetected');
                const contact = mqttStatus[settings.topic.statusCarbonMonoxideDetected] === settings.payload.onCarbonMonoxideDetected ?
                    Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL :
                    Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL;

                log.debug('> hap re_get', settings.name, 'CarbonMonoxideDetected', contact);
                callback(null, contact);
            });

        mqttSub(settings.topic.statusCarbonMonoxideDetected, val => {
            const contact = val === settings.payload.onCarbonMonoxideDetected ?
                Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL :
                Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL;
            log.debug('> hap update', settings.name, 'CarbonMonoxideDetected', contact);
            sensor.getService(Service.CarbonMonoxideSensor)
                .updateCharacteristic(Characteristic.CarbonMonoxideDetected, contact);
        });

        /* istanbul ignore else */
        if (settings.topic.statusLowBattery) {
            sensor.getService(Service.CarbonMonoxideSensor)
                .getCharacteristic(Characteristic.StatusLowBattery)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'StatusLowBattery');
                    const bat = mqttStatus[settings.topic.statusLowBattery] !== settings.payload.onLowBattery ?
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL :
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
                    log.debug('> hap re_get', settings.name, 'StatusLowBattery', bat);
                    callback(null, bat);
                });

            mqttSub(settings.topic.statusLowBattery, val => {
                const bat = val !== settings.payload.onLowBattery ?
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL :
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
                log.debug('> hap update', settings.name, 'StatusLowBattery', bat);
                sensor.getService(Service.CarbonMonoxideSensor)
                    .updateCharacteristic(Characteristic.StatusLowBattery, bat);
            });
        }

        return sensor;
    };
};
