/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_HumiditySensor(acc, settings, subtype) {
        mqttSub(settings.topic.statusHumidity, val => {
            log.debug('> hap update', settings.name, 'CurrentRelativeHumidity', mqttStatus[settings.topic.statusHumidity]);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.CurrentRelativeHumidity, val);
        });

        acc.addService(Service.HumiditySensor, settings.name, subtype)
            .getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'HumiditySensor', 'CurrentRelativeHumidity');
                log.debug('> hap re_get', settings.name, mqttStatus[settings.topic.statusHumidity]);
                callback(null, mqttStatus[settings.topic.statusHumidity]);
            });

        require('../characteristics/StatusLowBattery')({acc, settings, subtype}, iface);
        require('../characteristics/StatusActive')({acc, settings, subtype}, iface);
        require('../characteristics/StatusFault')({acc, settings, subtype}, iface);
        require('../characteristics/StatusTampered')({acc, settings, subtype}, iface);
    };
};
