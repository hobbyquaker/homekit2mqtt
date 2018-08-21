/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttSub, Characteristic, log} = iface;

    /* istanbul ignore else */
    if (settings.topic.statusTampered) {
        acc.getService(subtype)
            .getCharacteristic(Characteristic.StatusTampered)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'StatusTampered');
                let bool = mqttStatus[settings.topic.statusTampered] === settings.payload.onTampered;
                if (settings.payload.invertTampered) {
                    bool = !bool;
                }
                const tampered = bool ?
                    Characteristic.StatusTampered.TAMPERED :
                    Characteristic.StatusTampered.NOT_TAMPERED;
                log.debug('> hap re_get', settings.name, 'StatusTampered', tampered);
                callback(null, tampered);
            });

        mqttSub(settings.topic.statusTampered, val => {
            let bool = val === settings.payload.onTampered;
            if (settings.payload.invertTampered) {
                bool = !bool;
            }
            const tampered = bool ?
                Characteristic.StatusTampered.TAMPERED :
                Characteristic.StatusTampered.NOT_TAMPERED;
            log.debug('> hap update', settings.name, 'StatusTampered', tampered);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.StatusTampered, tampered);
        });
    }
};

