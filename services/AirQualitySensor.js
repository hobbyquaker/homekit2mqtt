/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_AirQualitySensor(acc, settings, subtype) {
        mqttSub(settings.topic.statusAirQuality, val => {
            log.debug('> hap update', settings.name, 'AirQuality', mqttStatus[settings.topic.statusAirQuality]);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.AirQuality, val);
        });

        acc.addService(Service.AirQualitySensor, settings.name, subtype)
            .getCharacteristic(Characteristic.AirQuality)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'AirQualitySensor', 'AirQuality');
                log.debug('> hap re_get', settings.name, mqttStatus[settings.topic.statusAirQuality]);
                callback(null, mqttStatus[settings.topic.statusAirQuality]);
            });

        /* istanbul ignore else */
        if (settings.topic.statusLowBattery) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.StatusLowBattery)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'StatusLowBattery');
                    const bat = mqttStatus[settings.topic.statusLowBattery] === settings.payload.onLowBattery ?
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW :
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
                    log.debug('> hap re_get', settings.name, 'StatusLowBattery', bat);
                    callback(null, bat);
                });

            mqttSub(settings.topic.statusLowBattery, val => {
                const bat = val === settings.payload.onLowBattery ?
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW :
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
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

        /* istanbul ignore else */
        if (settings.topic.statusOzoneDensity) {
            mqttSub(settings.topic.statusOzoneDensity, val => {
                log.debug('> hap update', settings.name, 'OzoneDensity', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.OzoneDensity, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.OzoneDensity)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'OzoneDensity');
                    log.debug('> hap re_get', settings.name, 'OzoneDensity', mqttStatus[settings.topic.statusOzoneDensity]);
                    callback(null, mqttStatus[settings.topic.statusOzoneDensity]);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusNitrogenDioxideDensity) {
            mqttSub(settings.topic.statusNitrogenDioxideDensity, val => {
                log.debug('> hap update', settings.name, 'NitrogenDioxideDensity', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.NitrogenDioxideDensity, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.NitrogenDioxideDensity)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'NitrogenDioxideDensity');
                    log.debug('> hap re_get', settings.name, 'NitrogenDioxideDensity', mqttStatus[settings.topic.statusNitrogenDioxideDensity]);
                    callback(null, mqttStatus[settings.topic.statusNitrogenDioxideDensity]);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusSulphurDioxideDensity) {
            mqttSub(settings.topic.statusSulphurDioxideDensity, val => {
                log.debug('> hap update', settings.name, 'SulphurDioxideDensity', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.SulphurDioxideDensity, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.SulphurDioxideDensity)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'SulphurDioxideDensity');
                    log.debug('> hap re_get', settings.name, 'SulphurDioxideDensity', mqttStatus[settings.topic.statusSulphurDioxideDensity]);
                    callback(null, mqttStatus[settings.topic.statusSulphurDioxideDensity]);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusPM2_5Density) {
            mqttSub(settings.topic.statusPM2_5Density, val => {
                log.debug('> hap update', settings.name, 'PM2_5Density', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.PM2_5Density, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.PM2_5Density)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'PM2_5Density');
                    log.debug('> hap re_get', settings.name, 'PM2_5Density', mqttStatus[settings.topic.statusPM2_5Density]);
                    callback(null, mqttStatus[settings.topic.statusPM2_5Density]);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusPM10Density) {
            mqttSub(settings.topic.statusPM10Density, val => {
                log.debug('> hap update', settings.name, 'PM10Density', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.PM10Density, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.PM10Density)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'PM10Density');
                    log.debug('> hap re_get', settings.name, 'PM10Density', mqttStatus[settings.topic.statusPM10Density]);
                    callback(null, mqttStatus[settings.topic.statusPM10Density]);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusVOCDensity) {
            mqttSub(settings.topic.statusVOCDensity, val => {
                log.debug('> hap update', settings.name, 'VOCDensity', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.VOCDensity, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.VOCDensity)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'VOCDensity');
                    log.debug('> hap re_get', settings.name, 'VOCDensity', mqttStatus[settings.topic.statusVOCDensity]);
                    callback(null, mqttStatus[settings.topic.statusVOCDensity]);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusCarbonMonoxideLevel) {
            mqttSub(settings.topic.statusCarbonMonoxideLevel, val => {
                log.debug('> hap update', settings.name, 'CarbonMonoxideLevel', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.CarbonMonoxideLevel, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.CarbonMonoxideLevel)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'CarbonMonoxideLevel');
                    log.debug('> hap re_get', settings.name, 'CarbonMonoxideLevel', mqttStatus[settings.topic.statusCarbonMonoxideLevel]);
                    callback(null, mqttStatus[settings.topic.statusCarbonMonoxideLevel]);
                });
        }

        /* istanbul ignore else */
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
    };
};
