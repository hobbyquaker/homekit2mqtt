/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_SmokeSensor(acc, settings, subtype) {
        acc.addService(Service.SmokeSensor, settings.name, subtype)
            .getCharacteristic(Characteristic.SmokeDetected)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'SmokeDetected');
                const smoke = mqttStatus[settings.topic.statusSmokeDetected] === settings.payload.onSmokeDetected ?
                    Characteristic.SmokeDetected.SMOKE_DETECTED :
                    Characteristic.SmokeDetected.SMOKE_NOT_DETECTED;

                log.debug('> hap re_get', settings.name, 'SmokeDetected', smoke);
                callback(null, smoke);
            });

        mqttSub(settings.topic.statusSmokeDetected, val => {
            const smoke = val === settings.payload.onSmokeDetected ?
                Characteristic.SmokeDetected.SMOKE_DETECTED :
                Characteristic.SmokeDetected.SMOKE_NOT_DETECTED;
            log.debug('> hap update', settings.name, 'SmokeDetected', smoke);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.SmokeDetected, smoke);
        });

        /* istanbul ignore else */
        if (settings.topic.statusLowBattery) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.StatusLowBattery)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'StatusLowBattery');
                    const bat = mqttStatus[settings.topic.statusLowBattery] !== settings.payload.onLowBattery ?
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL :
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
                    log.debug('> hap re_get', settings.name, 'StatusLowBattery', bat);
                    callback(null, bat);
                });

            mqttSub(settings.topic.statusLowBattery, val => {
                const bat = val !== settings.payload.onLowBattery ?
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL :
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
                log.debug('> hap update', settings.name, 'StatusLowBattery', bat);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.StatusLowBattery, bat);
            });
        }

        /* istanbul ignore else */
        if (settings.topic.statusActive) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.StatusActive)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'StatusActive');
                    const act = mqttStatus[settings.topic.statusActive] === settings.payload.onActive;
                    log.debug('> hap re_get', settings.name, 'StatusActive', act);
                    callback(null, act);
                });

            mqttSub(settings.topic.statusActive, val => {
                const act = val === settings.payload.onActive;
                log.debug('> hap update', settings.name, 'StatusActive', act);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.StatusActive, act);
            });
        }

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
    };
};
