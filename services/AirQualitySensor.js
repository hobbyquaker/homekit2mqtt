/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    /*
     // Required Characteristics
     this.addCharacteristic(Characteristic.AirQuality);

     // Optional Characteristics

      {"name": "statusAirQuality"},
      {"name": "statusLowBattery", "optional": true},
      {"name": "statusTampered", "optional": true},
      {"name": "statusActive", "optional": true},
      {"name": "statusFault", "optional": true},
      {"name": "statusOzoneDensity", "type": "Number", "optional": true},
      {"name": "statusNitrogenDioxideDensity", "type": "Number", "optional": true},
      {"name": "statusSulphurDioxideDensity", "type": "Number", "optional": true},
      {"name": "statusPM2_5Density", "type": "Number", "optional": true},
      {"name": "statusPM10Density", "type": "Number", "optional": true},
      {"name": "statusVOCDensity", "type": "Number", "optional": true},
      {"name": "statusCarbonMonoxideLevel", "type": "Number", "optional": true},
      {"name": "statusCarbonDioxideLevel", "type": "Number", "optional": true}

     Characteristic.AirQuality.UNKNOWN = 0;
     Characteristic.AirQuality.EXCELLENT = 1;
     Characteristic.AirQuality.GOOD = 2;
     Characteristic.AirQuality.FAIR = 3;
     Characteristic.AirQuality.INFERIOR = 4;
     Characteristic.AirQuality.POOR = 5;
     */

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
