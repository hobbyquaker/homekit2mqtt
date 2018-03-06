/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    // TODO Implement

    /*
  // Required Characteristics
  this.addCharacteristic(Characteristic.Active);

  // Optional Characteristics
  this.addOptionalCharacteristic(Characteristic.CurrentFanState); READ TODO
   Characteristic.CurrentFanState.INACTIVE = 0;
   Characteristic.CurrentFanState.IDLE = 1;
   Characteristic.CurrentFanState.BLOWING_AIR = 2;

  this.addOptionalCharacteristic(Characteristic.TargetFanState); READ/WRITE TODO
   Characteristic.TargetFanState.MANUAL = 0;
   Characteristic.TargetFanState.AUTO = 1;

  this.addOptionalCharacteristic(Characteristic.LockPhysicalControls); READ/WRITE TODO
   Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED = 0;
   Characteristic.LockPhysicalControls.CONTROL_LOCK_ENABLED = 1;

  this.addOptionalCharacteristic(Characteristic.Name);
  this.addOptionalCharacteristic(Characteristic.RotationDirection);
  this.addOptionalCharacteristic(Characteristic.RotationSpeed);

  this.addOptionalCharacteristic(Characteristic.SwingMode); READ/WRITE TODO
   Characteristic.SwingMode.SWING_DISABLED = 0;
   Characteristic.SwingMode.SWING_ENABLED = 1;

     */

    return function createService_Fanv2(acc, settings, subtype) {
        /* istanbul ignore else */
        if (typeof settings.payload.activeActive === 'undefined') {
            settings.payload.activeActive = 1;
        }

        /* istanbul ignore else */
        if (typeof settings.payload.activeInactive === 'undefined') {
            settings.payload.activeInactive = 0;
        }

        /* istanbul ignore if */
        if (typeof settings.payload.rotationDirectionCounterClockwise === 'undefined') {
            settings.payload.rotationDirectionCounterClockwise = Characteristic.RotationDirection.COUNTER_CLOCKWISE;
        }

        /* istanbul ignore if */
        if (typeof settings.payload.rotationDirectionClockwise === 'undefined') {
            settings.payload.rotationDirectionClockwise = Characteristic.RotationDirection.CLOCKWISE;
        }

        acc.addService(Service.Fanv2)
            .getCharacteristic(Characteristic.Active)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'Active', value);
                const active = value ? settings.payload.activeActive : settings.payload.activeInactive;
                mqttPub(settings.topic.setActive, active);
                callback();
            });

        /* istanbul ignore else */
        if (settings.topic.statusActive) {
            mqttSub(settings.topic.statusActive, val => {
                const active = (val === settings.payload.activeActive ? 1 : 0);
                log.debug('> hap update', settings.name, 'Active', active);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.Active, active);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.Active)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'Active');
                    const active = (mqttStatus[settings.topic.statusActive] === settings.payload.activeActive ? 1 : 0);
                    log.debug('> hap re_get', settings.name, 'Active', active);
                    callback(null, active);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.setRotationDirection) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.RotationDirection)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'RotationDirection', value);
                    /* istanbul ignore next */
                    const dir = value === Characteristic.RotationDirection.COUNTER_CLOCKWISE ?
                        settings.payload.rotationDirectionCounterClockwise :
                        settings.payload.rotationDirectionClockwise;

                    mqttPub(settings.topic.setRotationDirection, dir);
                    callback();
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusRotationDirection) {
            mqttSub(settings.topic.statusRotationDirection, val => {
                /* istanbul ignore next */
                const dir = mqttStatus[settings.topic.statusRotationDirection] === settings.payload.rotationDirectionCounterClockwise ?
                    Characteristic.RotationDirection.COUNTER_CLOCKWISE :
                    Characteristic.RotationDirection.CLOCKWISE;
                log.debug('> hap update', settings.name, 'RotationDirection', dir);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.RotationDirection, dir);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.RotationDirection)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'RotationDirection');
                    /* istanbul ignore next */
                    const dir = mqttStatus[settings.topic.statusRotationDirection] === settings.payload.rotationDirectionCounterClockwise ?
                        Characteristic.RotationDirection.COUNTER_CLOCKWISE :
                        Characteristic.RotationDirection.CLOCKWISE;
                    log.debug('> hap re_get', settings.name, 'RotationDirection', dir);
                    callback(null, dir);
                });
        }

        /* istanbul ignore else */
        if (settings.topic.setRotationSpeed) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.RotationSpeed)
                .on('set', (value, callback) => {
                    log.debug('< hap set', settings.name, 'RotationSpeed', value);
                    /* istanbul ignore next */
                    const speed = (value * (settings.payload.rotationSpeedFactor || 1)) || 0;
                    mqttPub(settings.topic.setRotationSpeed, speed);
                    callback();
                });
        }

        /* istanbul ignore else */
        if (settings.topic.statusRotationSpeed) {
            mqttSub(settings.topic.statusRotationSpeed, val => {
                /* istanbul ignore next */
                const speed = (val / (settings.payload.rotationSpeedFactor || 1)) || 0;
                log.debug('> hap update', settings.name, 'RotationSpeed', speed);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.RotationSpeed, speed);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.RotationSpeed)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'RotationSpeed');
                    /* istanbul ignore next */
                    const speed = (mqttStatus[settings.topic.statusRotationSpeed] / (settings.payload.rotationSpeedFactor || 1)) || 0;
                    log.debug('> hap re_get', settings.name, 'RotationSpeed', speed);
                    callback(null, speed);
                });
        }
    };
};
