/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    acc.getService(subtype)
        .getCharacteristic(Characteristic.CurrentRelativeHumidity)
        .on('get', callback => {
            log.debug('< hap get', settings.name, 'CurrentRelativeHumidity');
            log.debug('> hap re_get', settings.name, mqttStatus[settings.topic.statusHumidity]);
            callback(null, mqttStatus[settings.topic.statusHumidity]);
        });

    mqttSub(settings.topic.statusHumidity, val => {
        log.debug('> hap update', settings.name, 'CurrentRelativeHumidity', mqttStatus[settings.topic.statusHumidity]);
        acc.getService(subtype)
            .updateCharacteristic(Characteristic.CurrentRelativeHumidity, val);
    });
};
