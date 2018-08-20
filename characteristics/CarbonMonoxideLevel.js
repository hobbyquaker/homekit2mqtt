/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    /* istanbul ignore else */
    if (settings.topic.statusCarbonMonoxideLevel) {
        mqttSub(settings.topic.statusCarbonMonoxideLevel, val => {
            log.debug('> hap update', settings.name, 'CarbonMonoxideLevel', val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.CarbonMonoxideLevel, val);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.CarbonMonoxideLevel)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CarbonMonoxideLevel');
                log.debug('> hap re_get', settings.name, 'CarbonMonoxideLevel', mqttStatus[settings.topic.statusCarbonMonoxideLevel]);
                callback(null, mqttStatus[settings.topic.statusCarbonMonoxideLevel]);
            });
    }
};
