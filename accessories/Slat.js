/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

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

    return function createAccessory_Slat(settings) {
        const slat = newAccessory(settings);

        slat.addService(Service.Slat, settings.name)
            .getCharacteristic(Characteristic.CurrentSlatState)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'CurrentSlatState', value);
                log.debug('> mqtt', settings.topic.statusCurrentSlatState, value);
                mqttPub(settings.topic.statusCurrentSlatState, value);
                callback();
            });

        const type = settings.config.SlatType || 0;
        log.debug('> hap set', settings.name, 'SlatType', type);
        slat.getService(Service.Slat)
            .setCharacteristic(Characteristic.SlatType, type);

        if (settings.topic.statusCurrentTiltAngle) {
            mqttSub(settings.topic.statusCurrentTiltAngle, val => {
                log.debug('< mqtt', settings.topic.statusCurrentTiltAngle, val);
                const angle = mqttStatus[settings.topic.statusCurrentTiltAngle];
                log.debug('> hap update', settings.name, 'CurrentTiltAngle', angle);
                slat.getService(Service.Valve)
                    .updateCharacteristic(Characteristic.CurrentTiltAngle, angle);
            });
        }

        if (settings.topic.statusTargetTiltAngle) {
            mqttSub(settings.topic.statusTargetTiltAngle, val => {
                log.debug('< mqtt', settings.topic.statusTargetTiltAngle, val);
                const angle = mqttStatus[settings.topic.statusTargetTiltAngle];
                log.debug('> hap update', settings.name, 'TargetTiltAngle', angle);
                slat.getService(Service.Valve)
                    .updateCharacteristic(Characteristic.TargetTiltAngle, angle);
            });
        }

        if (settings.topic.setTargetTiltAngle) {
            slat.addService(Service.Slat, settings.name)
                .getCharacteristic(Characteristic.TargetTiltAngle)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'TargetTiltAngle', value);
                    log.debug('> mqtt', settings.topic.setTargetTiltAngle, value);
                    mqttPub(settings.topic.setTargetTiltAngle, value);
                    callback();
                });
        }

        if (settings.topic.statusSwingMode) {
            mqttSub(settings.topic.statusSwingMode, val => {
                log.debug('< mqtt', settings.topic.statusSwingMode, val);
                const angle = mqttStatus[settings.topic.statusSwingMode];
                log.debug('> hap update', settings.name, 'SwingMode', angle);
                slat.getService(Service.Valve)
                    .updateCharacteristic(Characteristic.SwingMode, angle);
            });
        }

        if (settings.topic.setSwingMode) {
            slat.addService(Service.Slat, settings.name)
                .getCharacteristic(Characteristic.SwingMode)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'SwingMode', value);
                    log.debug('> mqtt', settings.topic.setSwingMode, value);
                    mqttPub(settings.topic.setSwingMode, value);
                    callback();
                });
        }

        return slat;
    };
};
