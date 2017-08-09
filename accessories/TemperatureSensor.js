/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

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
            log.debug('> hap update', settings.name, 'CurrentTemperature', mqttStatus[settings.topic.statusTemperature]);
            sensor.getService(Service.TemperatureSensor)
                .updateCharacteristic(Characteristic.CurrentTemperature, convertTemperature(settings, val));
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

        return sensor;
    };
};
