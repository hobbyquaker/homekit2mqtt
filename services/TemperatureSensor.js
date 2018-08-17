/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    function convertTemperature(settings, value) {
        if (settings.payload.fahrenheit) {
            log.debug('converting', value, '°F to °C');
            return (value - 32) / 1.8;
        }
        return value;
    }

    return function createService_TemperatureSensor(acc, settings, subtype) {
        acc.addService(Service.TemperatureSensor, settings.name, subtype)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .setProps((settings.props || {}).CurrentTemperature || {minValue: -100})
            .on('get', callback => {
                const temperature = convertTemperature(settings, mqttStatus[settings.topic.statusTemperature]);
                log.debug('< hap get', settings.name, 'TemperatureSensor', 'CurrentTemperature');
                log.debug('> hap re_get', settings.name, temperature);
                callback(null, temperature);
            });

        mqttSub(settings.topic.statusTemperature, val => {
            const temperature = convertTemperature(settings, val);
            log.debug('> hap update', settings.name, 'CurrentTemperature', temperature);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.CurrentTemperature, temperature);
        });

        require('../characteristics/StatusLowBattery')({acc, settings, subtype}, iface);
        require('../characteristics/StatusActive')({acc, settings, subtype}, iface);
        require('../characteristics/StatusFault')({acc, settings, subtype}, iface);
        require('../characteristics/StatusTampered')({acc, settings, subtype}, iface);
    };
};
