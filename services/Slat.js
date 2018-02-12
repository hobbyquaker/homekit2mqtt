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

    return function createService_Slat(acc, settings) {
        acc.addService(Service.Slat);

        mqttSub(settings.topic.statusCurrentSlatState, val => {
            const angle = mqttStatus[settings.topic.statusCurrentSlatState];
            log.debug('> hap update', settings.name || acc.name, 'CurrentSlatState', angle);
            acc.getService(Service.Slat)
                .updateCharacteristic(Characteristic.CurrentSlatState, angle);
        });

        const type = settings.config.SlatType || 0;
        log.debug('> hap set', settings.name || acc.name, 'SlatType', type);
        acc.getService(Service.Slat)
            .setCharacteristic(Characteristic.SlatType, type);

        if (settings.topic.statusCurrentTiltAngle) {
            mqttSub(settings.topic.statusCurrentTiltAngle, val => {
                log.debug('> hap update', settings.name || acc.name, 'CurrentTiltAngle', val);
                acc.getService(Service.Slat)
                    .updateCharacteristic(Characteristic.CurrentTiltAngle, val);
            });
        }

        if (settings.topic.statusTargetTiltAngle) {
            mqttSub(settings.topic.statusTargetTiltAngle, val => {
                log.debug('> hap update', settings.name || acc.name, 'TargetTiltAngle', val);
                acc.getService(Service.Slat)
                    .updateCharacteristic(Characteristic.TargetTiltAngle, val);
            });
        }

        if (settings.topic.setTargetTiltAngle) {
            acc.getService(Service.Slat)
                .getCharacteristic(Characteristic.TargetTiltAngle)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name || acc.name, 'TargetTiltAngle', value);
                    mqttPub(settings.topic.setTargetTiltAngle, value);
                    callback();
                });
        }

        if (settings.topic.statusSwingMode) {
            mqttSub(settings.topic.statusSwingMode, val => {
                log.debug('> hap update', settings.name || acc.name, 'SwingMode', val);
                acc.getService(Service.Slat)
                    .updateCharacteristic(Characteristic.SwingMode, val);
            });
        }

        if (settings.topic.setSwingMode) {
            acc.getService(Service.Slat)
                .getCharacteristic(Characteristic.SwingMode)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name || acc.name, 'SwingMode', value);
                    mqttPub(settings.topic.setSwingMode, value);
                    callback();
                });
        }
    };
};
