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

        require('../characteristics/StatusLowBattery')({acc, settings, subtype}, iface);
        require('../characteristics/StatusActive')({acc, settings, subtype}, iface);
        require('../characteristics/StatusFault')({acc, settings, subtype}, iface);
        require('../characteristics/StatusTampered')({acc, settings, subtype}, iface);
    };
};

