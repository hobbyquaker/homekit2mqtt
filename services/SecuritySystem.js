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
        if (settings.topic.statusFault) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.StatusFault)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'StatusFault');
                    const fault = mqttStatus[settings.topic.statusFault] === settings.payload.onFault ?
                        Characteristic.StatusFault.GENERAL_FAULT :
                        Characteristic.StatusFault.NO_FAULT;
                    log.debug('> hap re_get', settings.name, 'StatusFault', fault);
                    callback(null, fault);
                });

            mqttSub(settings.topic.statusFault, val => {
                const fault = val === settings.payload.onFault ?
                    Characteristic.StatusFault.GENERAL_FAULT :
                    Characteristic.StatusFault.NO_FAULT;
                log.debug('> hap update', settings.name, 'StatusFault', fault);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.StatusFault, fault);
            });
        }

        /* istanbul ignore else */
        if (settings.topic.statusTampered) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.StatusTampered)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'StatusTampered');
                    const tampered = mqttStatus[settings.topic.statusTampered] === settings.payload.onTampered ?
                        Characteristic.StatusTampered.TAMPERED :
                        Characteristic.StatusTampered.NOT_TAMPERED;
                    log.debug('> hap re_get', settings.name, 'StatusTampered', tampered);
                    callback(null, tampered);
                });

            mqttSub(settings.topic.statusTampered, val => {
                const tampered = val === settings.payload.onTampered ?
                    Characteristic.StatusTampered.TAMPERED :
                    Characteristic.StatusTampered.NOT_TAMPERED;
                log.debug('> hap update', settings.name, 'StatusTampered', tampered);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.StatusTampered, tampered);
            });
        }

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
    };
};
