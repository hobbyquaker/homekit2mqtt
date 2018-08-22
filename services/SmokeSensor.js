/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_SmokeSensor(acc, settings, subtype) {
        acc.addService(Service.SmokeSensor, settings.name, subtype)
            .getCharacteristic(Characteristic.SmokeDetected)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'SmokeDetected');
                const smoke = mqttStatus(settings.topic.statusSmokeDetected, settings.json.statusSmokeDetected) === settings.payload.onSmokeDetected ?
                    Characteristic.SmokeDetected.SMOKE_DETECTED :
                    Characteristic.SmokeDetected.SMOKE_NOT_DETECTED;

                log.debug('> hap re_get', settings.name, 'SmokeDetected', smoke);
                callback(null, smoke);
            });

        mqttSub(settings.topic.statusSmokeDetected, settings.json.statusSmokeDetected, val => {
            const smoke = val === settings.payload.onSmokeDetected ?
                Characteristic.SmokeDetected.SMOKE_DETECTED :
                Characteristic.SmokeDetected.SMOKE_NOT_DETECTED;
            log.debug('> hap update', settings.name, 'SmokeDetected', smoke);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.SmokeDetected, smoke);
        });

        require('../characteristics/StatusLowBattery')({acc, settings, subtype}, iface);
        require('../characteristics/StatusActive')({acc, settings, subtype}, iface);
        require('../characteristics/StatusFault')({acc, settings, subtype}, iface);
        require('../characteristics/StatusTampered')({acc, settings, subtype}, iface);
    };
};
