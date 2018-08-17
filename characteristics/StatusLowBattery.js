/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttSub, Characteristic, log} = iface;

    /* istanbul ignore else */
    if (settings.topic.statusLowBattery) {
        acc.getService(subtype)
            .getCharacteristic(Characteristic.StatusLowBattery)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'StatusLowBattery');
                const bat = mqttStatus[settings.topic.statusLowBattery] === settings.payload.onLowBattery ?
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW :
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
                log.debug('> hap re_get', settings.name, 'StatusLowBattery', bat);
                callback(null, bat);
            });

        mqttSub(settings.topic.statusLowBattery, val => {
            const bat = val === settings.payload.onLowBattery ?
                Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW :
                Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
            log.debug('> hap update', settings.name, 'StatusLowBattery', bat);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.StatusLowBattery, bat);
        });
    }
};
