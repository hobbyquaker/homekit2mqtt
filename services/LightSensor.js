/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_LightSensor(acc, settings, subtype) {
        mqttSub(settings.topic.statusAmbientLightLevel, settings.json.statusAmbientLightLevel, val => {
            val /= (settings.payload.ambientLightLevelFactor || 1);
            log.debug('> hap update', settings.name, 'CurrentAmbientLightLevel', mqttStatus[settings.topic.statusAmbientLightLevel]);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.CurrentAmbientLightLevel, val);
        });

        acc.addService(Service.LightSensor, settings.name, subtype)
            .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
            .on('get', callback => {
                const val = mqttStatus(settings.topic.statusAmbientLightLevel, settings.json.statusAmbientLightLevel) / (settings.payload.ambientLightLevelFactor || 1);
                log.debug('< hap get', settings.name, 'LightSensor', 'CurrentAmbientLightLevel');
                log.debug('> hap re_get', settings.name, val);
                callback(null, val);
            });

        require('../characteristics/StatusLowBattery')({acc, settings, subtype}, iface);
        require('../characteristics/StatusActive')({acc, settings, subtype}, iface);
        require('../characteristics/StatusFault')({acc, settings, subtype}, iface);
        require('../characteristics/StatusTampered')({acc, settings, subtype}, iface);
    };
};
