/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    settings.topic.statusCurrentRelativeHumidity = settings.topic.statusCurrentRelativeHumidity || settings.topic.statusHumidity;

    /* istanbul ignore else */
    if (settings.topic.statusCurrentRelativeHumidity) {
        mqttSub(settings.topic.statusCurrentRelativeHumidity, settings.json.statusCurrentRelativeHumidity, val => {
            log.debug('> hap update', settings.name, 'CurrentRelativeHumidity', val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.CurrentRelativeHumidity, val);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CurrentRelativeHumidity');
                log.debug('> hap re_get', settings.name, 'CurrentRelativeHumidity', mqttStatus(settings.topic.statusCurrentRelativeHumidity, settings.json.statusCurrentRelativeHumidity));
                callback(null, mqttStatus[settings.topic.statusCurrentRelativeHumidity]);
            });
    }
};
