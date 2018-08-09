/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_FilterMaintenance(acc, settings, subtype) {
        acc.addService(Service.FilterMaintenance, settings.name, subtype)
            .getCharacteristic(Characteristic.FilterChangeIndication)
            .on('get', callback => {
                const val = mqttStatus[settings.topic.statusFilterChangeIndication];
                log.debug('< hap get', settings.name, 'FilterChangeIndication');
                log.debug('> hap re_get', settings.name, val);
                callback(null, val);
            });

        mqttSub(settings.topic.statusFilterChangeIndication, val => {
            log.debug('> hap update', settings.name, 'FilterChangeIndication', val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.FilterChangeIndication, val);
        });

        if (settings.topic.statusFilterLifeLevel) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.FilterLifeLevel)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'FilterLifeLevel');
                    const level = mqttStatus[settings.topic.statusFilterLifeLevel];

                    log.debug('> hap re_get', settings.name, 'FilterLifeLevel', level);
                    callback(null, level);
                });

            mqttSub(settings.topic.statusFilterLifeLevel, val => {
                log.debug('> hap update', settings.name, 'FilterLifeLevel', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.FilterLifeLevel, val);
            });
        }

        if (settings.topic.setResetFilterIndication) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.ResetFilterIndication)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'ResetFilterIndication', value);
                    mqttPub(settings.topic.setResetFilterIndication, value);
                    callback();
                });
        }
    };
};
