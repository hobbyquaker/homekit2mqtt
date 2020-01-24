/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    function convertTemperature(settings, value) {
        if (settings.payload.fahrenheit) {
            log.debug('converting', value, '°F to °C');
            return (value - 32) / 1.8;
        }
        return value;
    }

    settings.topic.statusCurrentTemperature = settings.topic.statusCurrentTemperature || settings.topic.statusTemperature;
    settings.json.statusCurrentTemperature = settings.json.statusCurrentTemperature || settings.json.statusTemperature;

    acc.getService(subtype)
        .getCharacteristic(Characteristic.CurrentTemperature)
        .setProps((settings.props || {}).CurrentTemperature || {minValue: -100})
        .on('get', callback => {
            const temperature = convertTemperature(settings, mqttStatus(settings.topic.statusCurrentTemperature, settings.json.statusCurrentTemperature));
            log.debug('< hap get', settings.name, 'CurrentTemperature');
            log.debug('> hap re_get', settings.name, temperature);
            callback(null, temperature);
        });

    mqttSub(settings.topic.statusCurrentTemperature, settings.json.statusCurrentTemperature, val => {
        const temperature = convertTemperature(settings, val);
        log.debug('> hap update', settings.name, 'CurrentTemperature', temperature);
        acc.getService(subtype)
            .updateCharacteristic(Characteristic.CurrentTemperature, temperature);
    });
};
