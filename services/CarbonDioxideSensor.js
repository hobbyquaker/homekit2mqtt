/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_CarbonDioxideSensor(acc, settings, subtype) {
        acc.addService(Service.CarbonDioxideSensor, settings.name, subtype)
            .getCharacteristic(Characteristic.CarbonDioxideDetected)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CarbonDioxideDetected');
                const contact = mqttStatus[settings.topic.statusCarbonDioxideDetected] === settings.payload.onCarbonDioxideDetected ?
                    Characteristic.CarbonDioxideDetected.CO2_LEVELS_ABNORMAL :
                    Characteristic.CarbonDioxideDetected.CO2_LEVELS_NORMAL;

                log.debug('> hap re_get', settings.name, 'CarbonDioxideDetected', contact);
                callback(null, contact);
            });

        mqttSub(settings.topic.statusCarbonDioxideDetected, val => {
            const contact = val === settings.payload.onCarbonDioxideDetected ?
                Characteristic.CarbonDioxideDetected.CO2_LEVELS_ABNORMAL :
                Characteristic.CarbonDioxideDetected.CO2_LEVELS_NORMAL;
            log.debug('> hap update', settings.name, 'CarbonDioxideDetected', contact);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.CarbonDioxideDetected, contact);
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
        /* Optional: Status Active */
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
        /* Optional: Status Fault */
        if (settings.topic.statusFault) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.StatusFault)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'StatusFault');
                    const fault = mqttStatus[settings.topic.statusFault] !== settings.payload.onFault ?
                        Characteristic.StatusFault.NO_FAULT :
                        Characteristic.StatusFault.GENERAL_FAULT;
                    log.debug('> hap re_get', settings.name, 'StatusFault', fault);
                    callback(null, fault);
                });

            mqttSub(settings.topic.statusFault, val => {
                const fault = val !== settings.payload.onFault ?
                    Characteristic.StatusFault.NO_FAULT :
                    Characteristic.StatusFault.GENERAL_FAULT;
                log.debug('> hap update', settings.name, 'StatusFault', fault);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.StatusFault, fault);
            });
        }

        /* istanbul ignore else */
        /* Optional: Status Tampered */
        if (settings.topic.statusTampered) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.StatusTampered)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'StatusTampered');
                    const tampered = mqttStatus[settings.topic.statusTampered] !== settings.payload.onTampered ?
                        Characteristic.StatusTampered.NOT_TAMPERED :
                        Characteristic.StatusTampered.TAMPERED;
                    log.debug('> hap re_get', settings.name, 'StatusTampered', tampered);
                    callback(null, tampered);
                });

            mqttSub(settings.topic.statusTampered, val => {
                const tampered = val !== settings.payload.onTampered ?
                    Characteristic.StatusTampered.NOT_TAMPERED :
                    Characteristic.StatusTampered.TAMPERED;
                log.debug('> hap update', settings.name, 'StatusTampered', tampered);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.StatusTampered, tampered);
            });
        }
        
        if (settings.topic.statusCarbonDioxideLevel) {
             mqttSub(settings.topic.statusCarbonDioxideLevel, val => {
                log.debug('> hap update', settings.name, 'CarbonDioxideLevel', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.CarbonDioxideLevel, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.CarbonDioxideLevel)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CarbonDioxideLevel');
                    log.debug('> hap re_get', settings.name, 'CarbonDioxideLevel', mqttStatus[settings.topic.statusCarbonDioxideLevel]);
                    callback(null, mqttStatus[settings.topic.statusCarbonDioxideLevel]);
                });       	
      	}
      	
        if (settings.topic.statusCarbonDioxidePeakLevel) {
              mqttSub(settings.topic.statusCarbonDioxidePeakLevel, val => {
                log.debug('> hap update', settings.name, 'CarbonDioxidePeakLevel', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.CarbonDioxidePeakLevel, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.CarbonDioxidePeakLevel)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CarbonDioxidePeakLevel');
                    log.debug('> hap re_get', settings.name, 'CarbonDioxidePeakLevel', mqttStatus[settings.topic.statusCarbonDioxidePeakLevel]);
                    callback(null, mqttStatus[settings.topic.statusCarbonDioxidePeakLevel]);
                });       	
       	
      	}


    };
};

