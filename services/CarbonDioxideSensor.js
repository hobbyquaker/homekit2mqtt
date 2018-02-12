/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_CarbonDioxideSensor(acc, settings) {
        acc.addService(Service.CarbonDioxideSensor)
            .getCharacteristic(Characteristic.CarbonDioxideDetected)
            .on('get', callback => {
                log.debug('< hap get', settings.name || acc.name, 'CarbonDioxideDetected');
                const contact = mqttStatus[settings.topic.statusCarbonDioxideDetected] === settings.payload.onCarbonDioxideDetected ?
                    Characteristic.CarbonDioxideDetected.CO2_LEVELS_ABNORMAL :
                    Characteristic.CarbonDioxideDetected.CO2_LEVELS_NORMAL;

                log.debug('> hap re_get', settings.name || acc.name, 'CarbonDioxideDetected', contact);
                callback(null, contact);
            });

        mqttSub(settings.topic.statusCarbonDioxideDetected, val => {
            const contact = val === settings.payload.onCarbonDioxideDetected ?
                Characteristic.CarbonDioxideDetected.CO2_LEVELS_ABNORMAL :
                Characteristic.CarbonDioxideDetected.CO2_LEVELS_NORMAL;
            log.debug('> hap update', settings.name || acc.name, 'CarbonDioxideDetected', contact);
            acc.getService(Service.CarbonDioxideSensor)
                .updateCharacteristic(Characteristic.CarbonDioxideDetected, contact);
        });

        /* istanbul ignore else */
        if (settings.topic.statusLowBattery) {
            acc.getService(Service.CarbonDioxideSensor)
                .getCharacteristic(Characteristic.StatusLowBattery)
                .on('get', callback => {
                    log.debug('< hap get', settings.name || acc.name, 'StatusLowBattery');
                    const bat = mqttStatus[settings.topic.statusLowBattery] !== settings.payload.onLowBattery ?
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL :
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
                    log.debug('> hap re_get', settings.name || acc.name, 'StatusLowBattery', bat);
                    callback(null, bat);
                });

            mqttSub(settings.topic.statusLowBattery, val => {
                const bat = val !== settings.payload.onLowBattery ?
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL :
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
                log.debug('> hap update', settings.name || acc.name, 'StatusLowBattery', bat);
                acc.getService(Service.CarbonDioxideSensor)
                    .updateCharacteristic(Characteristic.StatusLowBattery, bat);
            });
        }

        /* istanbul ignore else */
        /* Optional: Status Active */
        if (settings.topic.statusActive) {
            acc.getService(Service.CarbonDioxideSensor)
                .getCharacteristic(Characteristic.StatusActive)
                .on('get', callback => {
                    log.debug('< hap get', settings.name || acc.name, 'StatusActive');
                    const act = mqttStatus[settings.topic.statusActive] === settings.payload.onActive;
                    log.debug('> hap re_get', settings.name || acc.name, 'StatusActive', act);
                    callback(null, act);
                });

            mqttSub(settings.topic.statusActive, val => {
                const act = val === settings.payload.onActive;
                log.debug('> hap update', settings.name || acc.name, 'StatusActive', act);
                acc.getService(Service.CarbonDioxideSensor)
                    .updateCharacteristic(Characteristic.StatusActive, act);
            });
        }

        /* istanbul ignore else */
        /* Optional: Status Fault */
        if (settings.topic.statusFault) {
            acc.getService(Service.CarbonDioxideSensor)
                .getCharacteristic(Characteristic.StatusFault)
                .on('get', callback => {
                    log.debug('< hap get', settings.name || acc.name, 'StatusFault');
                    const fault = mqttStatus[settings.topic.statusFault] !== settings.payload.onFault ?
                        Characteristic.StatusFault.NO_FAULT :
                        Characteristic.StatusFault.GENERAL_FAULT;
                    log.debug('> hap re_get', settings.name || acc.name, 'StatusFault', fault);
                    callback(null, fault);
                });

            mqttSub(settings.topic.statusFault, val => {
                const fault = val !== settings.payload.onFault ?
                    Characteristic.StatusFault.NO_FAULT :
                    Characteristic.StatusFault.GENERAL_FAULT;
                log.debug('> hap update', settings.name || acc.name, 'StatusFault', fault);
                acc.getService(Service.CarbonDioxideSensor)
                    .updateCharacteristic(Characteristic.StatusFault, fault);
            });
        }

        /* istanbul ignore else */
        /* Optional: Status Tampered */
        if (settings.topic.statusTampered) {
            acc.getService(Service.CarbonDioxideSensor)
                .getCharacteristic(Characteristic.StatusTampered)
                .on('get', callback => {
                    log.debug('< hap get', settings.name || acc.name, 'StatusTampered');
                    const tampered = mqttStatus[settings.topic.statusTampered] !== settings.payload.onTampered ?
                        Characteristic.StatusTampered.NOT_TAMPERED :
                        Characteristic.StatusTampered.TAMPERED;
                    log.debug('> hap re_get', settings.name || acc.name, 'StatusTampered', tampered);
                    callback(null, tampered);
                });

            mqttSub(settings.topic.statusTampered, val => {
                const tampered = val !== settings.payload.onTampered ?
                    Characteristic.StatusTampered.NOT_TAMPERED :
                    Characteristic.StatusTampered.TAMPERED;
                log.debug('> hap update', settings.name || acc.name, 'StatusTampered', tampered);
                acc.getService(Service.CarbonDioxideSensor)
                    .updateCharacteristic(Characteristic.StatusTampered, tampered);
            });
        }
    };
};

