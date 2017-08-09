/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

/* TODO
 this.addOptionalCharacteristic(Characteristic.StatusActive);
 this.addOptionalCharacteristic(Characteristic.StatusFault);
 this.addOptionalCharacteristic(Characteristic.StatusLowBattery);
 this.addOptionalCharacteristic(Characteristic.StatusTampered);
 */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    function convertTemperature(settings, value) {
        if (settings.config && settings.config.fahrenheit) {
            log.debug('converting', value, '°F to °C');
            return (value - 32) / 1.8;
        }
        return value;
    }

    return function createAccessory_TemperatureSensor(settings) {
        const sensor = newAccessory(settings);

        mqttSub(settings.topic.statusTemperature, val => {
            const temperature = convertTemperature(settings, val);
            log.debug('> hap update', settings.name, 'CurrentTemperature', temperature);
            sensor.getService(Service.TemperatureSensor)
                .updateCharacteristic(Characteristic.CurrentTemperature, temperature);
        });

        sensor.addService(Service.TemperatureSensor)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .setProps((settings.props || {}).CurrentTemperature || {minValue: -100})
            .on('get', callback => {
                const temperature = convertTemperature(settings, mqttStatus[settings.topic.statusTemperature]);
                log.debug('< hap get', settings.name, 'TemperatureSensor', 'CurrentTemperature');
                log.debug('> hap re_get', settings.name, temperature);
                callback(null, temperature);
            });

        if (settings.topic.statusLowBattery) {
            sensor.addService(Service.TemperatureSensor, settings.name)
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
                sensor.getService(Service.TemperatureSensor)
                    .updateCharacteristic(Characteristic.StatusLowBattery, bat);
            });
        }

        return sensor;
    };
};
