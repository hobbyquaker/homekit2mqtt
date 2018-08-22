/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttSub, Characteristic, log} = iface;

    if (typeof settings.payload.activeTrue !== 'undefined') {
        settings.payload.onActive = settings.payload.activeTrue;
    }

    /* istanbul ignore else */
    if (settings.topic.statusActive) {
        acc.getService(subtype)
            .getCharacteristic(Characteristic.StatusActive)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'StatusActive');
                let act = mqttStatus(settings.topic.statusActive, settings.json.statusActive) === settings.payload.onActive;
                if (settings.payload.invertActive) {
                    act = !act;
                }
                log.debug('> hap re_get', settings.name, 'StatusActive', act);
                callback(null, act);
            });

        mqttSub(settings.topic.statusActive, settings.json.statusActive, val => {
            let act = val === settings.payload.onActive;
            if (settings.payload.invertActive) {
                act = !act;
            }
            log.debug('> hap update', settings.name, 'StatusActive', act);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.StatusActive, act);
        });
    }
};
