/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_CarbonMonoxideSensor(acc, settings, subtype) {
        acc.addService(Service.CarbonMonoxideSensor, settings.name, subtype)
            .getCharacteristic(Characteristic.CarbonMonoxideDetected)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CarbonMonoxideDetected');
                const contact = mqttStatus[settings.topic.statusCarbonMonoxideDetected] === settings.payload.onCarbonMonoxideDetected ?
                    Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL :
                    Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL;

                log.debug('> hap re_get', settings.name, 'CarbonMonoxideDetected', contact);
                callback(null, contact);
            });

        mqttSub(settings.topic.statusCarbonMonoxideDetected, val => {
            const contact = val === settings.payload.onCarbonMonoxideDetected ?
                Characteristic.CarbonMonoxideDetected.CO_LEVELS_ABNORMAL :
                Characteristic.CarbonMonoxideDetected.CO_LEVELS_NORMAL;
            log.debug('> hap update', settings.name, 'CarbonMonoxideDetected', contact);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.CarbonMonoxideDetected, contact);
        });

        require('../characteristics/CarbonMonoxideLevel')({acc, settings, subtype}, iface);
        require('../characteristics/StatusLowBattery')({acc, settings, subtype}, iface);
        require('../characteristics/StatusActive')({acc, settings, subtype}, iface);
        require('../characteristics/StatusFault')({acc, settings, subtype}, iface);
        require('../characteristics/StatusTampered')({acc, settings, subtype}, iface);
    };
};
