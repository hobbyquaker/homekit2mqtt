/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_LeakSensor(acc, settings, subtype) {
        acc.addService(Service.LeakSensor, settings.name, subtype)
            .getCharacteristic(Characteristic.LeakDetected)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'LeakDetected');
                const contact = mqttStatus(settings.topic.statusLeakDetected, settings.json.statusLeakDetected) === settings.payload.onLeakDetected ?
                    Characteristic.LeakDetected.LEAK_DETECTED :
                    Characteristic.LeakDetected.LEAK_NOT_DETECTED;

                log.debug('> hap re_get', settings.name, 'LeakDetected', contact);
                callback(null, contact);
            });

        mqttSub(settings.topic.statusLeakDetected, settings.json.statusLeakDetected, val => {
            const contact = val === settings.payload.onLeakDetected ?
                Characteristic.LeakDetected.LEAK_DETECTED :
                Characteristic.LeakDetected.LEAK_NOT_DETECTED;
            log.debug('> hap update', settings.name, 'LeakDetected', contact);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.LeakDetected, contact);
        });

        require('../characteristics/StatusLowBattery')({acc, settings, subtype}, iface);
        require('../characteristics/StatusActive')({acc, settings, subtype}, iface);
        require('../characteristics/StatusFault')({acc, settings, subtype}, iface);
        require('../characteristics/StatusTampered')({acc, settings, subtype}, iface);
    };
};
