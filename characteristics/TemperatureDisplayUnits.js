/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    acc.getService(subtype)
        .getCharacteristic(Characteristic.TemperatureDisplayUnits)
        .on('set', (value, callback) => {
            log.debug('< hap set', settings.name, 'TemperatureDisplayUnits', value);
            log.debug('> config', settings.name, 'TemperatureDisplayUnits', value);
            settings.config.TemperatureDisplayUnits = value;
            callback();
        });

    acc.getService(subtype)
        .getCharacteristic(Characteristic.TemperatureDisplayUnits)
        .on('get', callback => {
            log.debug('< hap get', settings.name, 'TemperatureDisplayUnits');
            log.debug('> hap re_get', settings.name, 'TemperatureDisplayUnits', settings.config.TemperatureDisplayUnits || 0);
            callback(null, settings.config.TemperatureDisplayUnits || 0);
        });
};
