/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_ContactSensor(acc, settings, subtype) {
        acc.addService(Service.ContactSensor, settings.name, subtype)
            .getCharacteristic(Characteristic.ContactSensorState)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'ContactSensorState');
                const contact = mqttStatus(settings.topic.statusContactSensorState, settings.json.statusContactSensorState) === settings.payload.onContactDetected ?
                    Characteristic.ContactSensorState.CONTACT_DETECTED :
                    Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;

                log.debug('> hap re_get', settings.name, 'ContactSensorState', contact);
                callback(null, contact);
            });

        mqttSub(settings.topic.statusContactSensorState, settings.json.statusContactSensorState, val => {
            const contact = val === settings.payload.onContactDetected ?
                Characteristic.ContactSensorState.CONTACT_DETECTED :
                Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
            log.debug('> hap update', settings.name, 'ContactSensorState', contact);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.ContactSensorState, contact);
        });

        require('../characteristics/StatusLowBattery')({acc, settings, subtype}, iface);
        require('../characteristics/StatusActive')({acc, settings, subtype}, iface);
        require('../characteristics/StatusFault')({acc, settings, subtype}, iface);
        require('../characteristics/StatusTampered')({acc, settings, subtype}, iface);
    };
};
