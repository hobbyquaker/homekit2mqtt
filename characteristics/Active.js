/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    /* istanbul ignore else */
    if (typeof settings.payload.activeActive === 'undefined') {
        if (typeof settings.payload.activeTrue === 'undefined') {
            settings.payload.activeActive = Characteristic.Active.ACTIVE;
        } else {
            settings.payload.activeActive = settings.payload.activeTrue;
        }
    }

    /* istanbul ignore else */
    if (typeof settings.payload.activeInactive === 'undefined') {
        if (typeof settings.payload.activeFalse === 'undefined') {
            settings.payload.activeInactive = Characteristic.Active.INACTIVE;
        } else {
            settings.payload.activeInactive = settings.payload.activeFalse;
        }
    }

    acc.getService(subtype)
        .getCharacteristic(Characteristic.Active)
        .on('set', (value, callback) => {
            log.debug('< hap set', settings.name, 'Active', value);
            const active = value ? settings.payload.activeActive : settings.payload.activeInactive;
            mqttPub(settings.topic.setActive, active);
            callback();
        });

    /* istanbul ignore else */
    if (settings.topic.statusActive) {
        mqttSub(settings.topic.statusActive, val => {
            const active = val === settings.payload.activeActive ?
                Characteristic.Active.ACTIVE :
                Characteristic.Active.INACTIVE;
            log.debug('> hap update', settings.name, 'Active', active);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.Active, active);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.Active)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'Active');
                const active = mqttStatus[settings.topic.statusActive] === settings.payload.activeActive ?
                    Characteristic.Active.ACTIVE :
                    Characteristic.Active.INACTIVE;
                log.debug('> hap re_get', settings.name, 'Active', active);
                callback(null, active);
            });
    }
};
