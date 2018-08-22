/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_CarbonMonoxideSensor(acc, settings, subtype) {
        acc.addService(Service.CarbonMonoxideSensor, settings.name, subtype);

        acc.getService(subtype)
            .getCharacteristic(Characteristic.CarbonMonoxideDetected)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CarbonMonoxideDetected');
                const detected = mqttStatus(settings.topic.statusCarbonMonoxideDetected, settings.json.statusCarbonMonoxideDetected) === settings.payload.onCarbonMonoxideDetected ?
                    Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL :
                    Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL;
                log.debug('> hap re_get', settings.name, 'CarbonMonoxideDetected', detected);
                callback(null, detected);
            });

        mqttSub(settings.topic.statusCarbonMonoxideDetected, settings.json.statusCarbonMonoxideDetected, val => {
            const detected = val === settings.payload.onCarbonMonoxideDetected ?
                Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL :
                Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL;
            log.debug('> hap update', settings.name, 'CarbonMonoxideDetected', detected);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.CarbonMonoxideDetected, detected);
        });

        const obj = {acc, settings, subtype};

        require('../characteristics')('CarbonMonoxidePeakLevel', obj, iface);

        require('../characteristics/CarbonMonoxideLevel')(obj, iface);
        require('../characteristics/StatusLowBattery')(obj, iface);
        require('../characteristics/StatusActive')(obj, iface);
        require('../characteristics/StatusFault')(obj, iface);
        require('../characteristics/StatusTampered')(obj, iface);
    };
};
