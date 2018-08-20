/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    /* istanbul ignore else */
    if (settings.topic.statusCarbonDioxideLevel) {
        mqttSub(settings.topic.statusCarbonDioxideLevel, val => {
            log.debug('> hap update', settings.name, 'CarbonDioxideLevel', val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.CarbonDioxideLevel, val);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.CarbonDioxideLevel)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CarbonDioxideLevel');
                log.debug('> hap re_get', settings.name, 'CarbonDioxideLevel', mqttStatus[settings.topic.statusCarbonDioxideLevel]);
                callback(null, mqttStatus[settings.topic.statusCarbonDioxideLevel]);
            });
    }
};
