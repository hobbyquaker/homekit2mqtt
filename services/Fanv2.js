/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_Fanv2(acc, settings, subtype) {
        acc.addService(Service.Fanv2);

        mqttSub(settings.topic.statusCurrentFanState, val => {
            log.debug('> hap update', settings.name, 'CurrentFanState', val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.CurrentFanState, val);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.CurrentFanState)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'CurrentFanState');
                const state = mqttStatus[settings.topic.statusCurrentFanState];
                log.debug('> hap re_get', settings.name, 'CurrentFanState', state);
                callback(null, state);
            });

        acc.getService(subtype)
            .getCharacteristic(Characteristic.TargetFanState)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'TargetFanState', value);
                mqttPub(settings.topic.setTargetFanState, value);
                callback();
            });

        mqttSub(settings.topic.statusTargetFanState, val => {
            log.debug('> hap update', settings.name, 'TargetFanState', val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.TargetFanState, val);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.TargetFanState)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'TargetFanState');
                const state = mqttStatus[settings.topic.statusTargetFanState];
                log.debug('> hap re_get', settings.name, 'TargetFanState', state);
                callback(null, state);
            });

        require('../characteristics/Active')({acc, settings, subtype}, iface);
        require('../characteristics/RotationSpeed')({acc, settings, subtype}, iface);
        require('../characteristics/RotationDirection')({acc, settings, subtype}, iface);
        require('../characteristics/LockPhysicalControls')({acc, settings, subtype}, iface);
        require('../characteristics/SwingMode')({acc, settings, subtype}, iface);
    };
};
