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

        mqttSub(settings.topic.statusSecuritySystemCurrentState, val => {
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
                const val = mqttStatus[settings.topic.statusSecuritySystemCurrentState];
                log.debug('> hap re_get', settings.name, 'SecuritySystemCurrentState', val);
                callback(null, val);
            });

        /* istanbul ignore else */
        if (settings.topic.statusSecuritySystemAlarmType) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.StatusSecuritySystemAlarmType)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'StatusSecuritySystemAlarmType');
                    const SecuritySystemAlarmType = mqttStatus[settings.topic.statusSecuritySystemAlarmType];
                    log.debug('> hap re_get', settings.name, 'StatusSecuritySystemAlarmType', SecuritySystemAlarmType);
                    callback(null, SecuritySystemAlarmType);
                });

            mqttSub(settings.topic.statusSecuritySystemAlarmType, val => {
                const SecuritySystemAlarmType = val === settings.payload.onSecuritySystemAlarmType;
                log.debug('> hap update', settings.name, 'StatusSecuritySystemAlarmType', SecuritySystemAlarmType);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.StatusSecuritySystemAlarmType, SecuritySystemAlarmType);
            });
        }

        require('../characteristics/StatusFault')({acc, settings, subtype}, iface);
        require('../characteristics/StatusTampered')({acc, settings, subtype}, iface);
    };
};
