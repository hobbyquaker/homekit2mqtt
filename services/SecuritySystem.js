/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_SecuritySystem(acc, settings, subtype) {
        acc.addService(Service.SecuritySystem, settings.name, subtype)
            .getCharacteristic(Characteristic.SecuritySystemTargetState)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'SecuritySystemTargetState', value);
                mqttPub(settings.topic.setSecuritySystemTargetState, value);
                callback();
            });

        mqttSub(settings.topic.statusSecuritySystemCurrentState, settings.json.statusSecuritySystemCurrentState, val => {
            log.debug('> hap update', settings.name, 'SecuritySystemCurrentState', val);
            acc.getService(subtype)
                .setCharacteristic(Characteristic.SecuritySystemCurrentState, val);
            if (val !== 4) {
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.SecuritySystemTargetState, val);
            }
        });

        acc.getService(subtype)
            .getCharacteristic(Characteristic.SecuritySystemCurrentState)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'SecuritySystemCurrentState');
                const val = mqttStatus(settings.topic.statusSecuritySystemCurrentState, settings.json.statusSecuritySystemCurrentState);
                log.debug('> hap re_get', settings.name, 'SecuritySystemCurrentState', val);
                callback(null, val);
            });

        const obj = {acc, settings, subtype};

        require('../characteristics')('SecuritySystemAlarmType', obj, iface);

        require('../characteristics/StatusFault')(obj, iface);
        require('../characteristics/StatusTampered')(obj, iface);
    };
};
