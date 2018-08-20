/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    /*
    // Required Characteristics
    this.addCharacteristic(Characteristic.SlatType);
    this.addCharacteristic(Characteristic.CurrentSlatState);

    // The value property of CurrentSlatState must be one of the following:
    Characteristic.CurrentSlatState.FIXED = 0;
    Characteristic.CurrentSlatState.JAMMED = 1;
    Characteristic.CurrentSlatState.SWINGING = 2;

    // Optional Characteristics
    this.addOptionalCharacteristic(Characteristic.Name);
    this.addOptionalCharacteristic(Characteristic.CurrentTiltAngle);
    this.addOptionalCharacteristic(Characteristic.TargetTiltAngle);
    this.addOptionalCharacteristic(Characteristic.SwingMode);

    // The value property of SwingMode must be one of the following:
    Characteristic.SwingMode.SWING_DISABLED = 0;
    Characteristic.SwingMode.SWING_ENABLED = 1;
     */

    return function createService_Slat(acc, settings, subtype) {
        acc.addService(Service.Slat, settings.name, subtype);

        mqttSub(settings.topic.statusCurrentSlatState, val => {
            const angle = mqttStatus[settings.topic.statusCurrentSlatState];
            log.debug('> hap update', settings.name, 'CurrentSlatState', angle);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.CurrentSlatState, angle);
        });

        const type = settings.config.SlatType || 0;
        log.debug('> hap set', settings.name, 'SlatType', type);
        acc.getService(subtype)
            .setCharacteristic(Characteristic.SlatType, type);

        if (settings.topic.statusCurrentTiltAngle) {
            mqttSub(settings.topic.statusCurrentTiltAngle, val => {
                log.debug('> hap update', settings.name, 'CurrentTiltAngle', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.CurrentTiltAngle, val);
            });
        }

        if (settings.topic.statusTargetTiltAngle) {
            mqttSub(settings.topic.statusTargetTiltAngle, val => {
                log.debug('> hap update', settings.name, 'TargetTiltAngle', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.TargetTiltAngle, val);
            });
        }

        if (settings.topic.setTargetTiltAngle) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.TargetTiltAngle)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'TargetTiltAngle', value);
                    mqttPub(settings.topic.setTargetTiltAngle, value);
                    callback();
                });
        }

        require('../characteristics/SwingMode')({acc, settings, subtype}, iface);
    };
};
