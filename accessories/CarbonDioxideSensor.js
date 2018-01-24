/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_CarbonDioxideSensor(settings) {
        const sensor = newAccessory(settings);

        sensor.addService(Service.CarbonDioxideSensor, settings.name)
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
            sensor.getService(Service.CarbonDioxideSensor)
                .updateCharacteristic(Characteristic.CarbonDioxideDetected, contact);
        });

        /* istanbul ignore else */
        if (settings.topic.statusLowBattery) {
            sensor.getService(Service.CarbonDioxideSensor, settings.name)
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
                sensor.getService(Service.CarbonDioxideSensor)
                    .updateCharacteristic(Characteristic.StatusLowBattery, bat);
            });
        }

        /* istanbul ignore else */
        /* Optional: Status Active */
        if (settings.topic.statusActive) {
            sensor.getService(Service.CarbonDioxideSensor, settings.name)
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
                sensor.getService(Service.CarbonDioxideSensor)
                    .updateCharacteristic(Characteristic.StatusActive, act);
            });
        }

        /* istanbul ignore else */
        /* Optional: Status Fault */
        if (settings.topic.statusFault) {
            sensor.getService(Service.CarbonDioxideSensor, settings.name)
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
                sensor.getService(Service.CarbonDioxideSensor)
                    .updateCharacteristic(Characteristic.StatusFault, fault);
            });
        }

        /* istanbul ignore else */
        /* Optional: Status Tampered */
        if (settings.topic.statusTampered) {
            sensor.getService(Service.CarbonDioxideSensor, settings.name)
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
                sensor.getService(Service.CarbonDioxideSensor)
                    .updateCharacteristic(Characteristic.StatusTampered, tampered);
            });
        }

        return sensor;
    };
};

