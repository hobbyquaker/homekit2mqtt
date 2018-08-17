/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    /*
   // Required Characteristics
  this.addCharacteristic(Characteristic.Active);
  this.addCharacteristic(Characteristic.ProgramMode);
  this.addCharacteristic(Characteristic.InUse);

  // Optional Characteristics
  this.addOptionalCharacteristic(Characteristic.Name);
  this.addOptionalCharacteristic(Characteristic.RemainingDuration);
  this.addOptionalCharacteristic(Characteristic.StatusFault);
     */

    return function createService_IrrigationSystem(acc, settings, subtype) {
        if (typeof settings.payload.activeTrue === 'undefined') {
            settings.payload.activeTrue = true;
        }

        if (typeof settings.payload.inUseTrue === 'undefined') {
            settings.payload.inUseTrue = true;
        }

        if (typeof settings.payload.faultTrue === 'undefined') {
            settings.payload.faultTrue = true;
        }

        if (typeof settings.payload.activeFalse === 'undefined') {
            settings.payload.activeFalse = false;
        }

        acc.addService(Service.IrrigationSystem, settings.name, subtype);

        mqttSub(settings.topic.statusProgramMode, val => {
            log.debug('> hap update', settings.name, 'ProgramMode', val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.ProgramMode, val);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.ProgramMode)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'ProgramMode');
                const mode = mqttStatus[settings.topic.statusProgramMode];
                log.debug('> hap re_get', settings.name, 'ProgramMode', mode);
                callback(null, mode);
            });

        mqttSub(settings.topic.statusInUse, val => {
            const inUse = val === settings.payload.inUseTrue ? 1 : 0;
            log.debug('> hap update', settings.name, 'InUse', inUse);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.InUse, inUse);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic.InUse)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'InUse');
                const inUse = mqttStatus[settings.topic.statusInUse] === settings.payload.inUseTrue ? 1 : 0;
                log.debug('> hap re_get', settings.name, 'InUse', inUse);
                callback(null, inUse);
            });

        /* istanbul ignore else  */
        if (settings.topic.statusRemainingDuration) {
            mqttSub(settings.topic.statusRemainingDuration, val => {
                log.debug('> hap update', settings.name, 'RemainingDuration', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.RemainingDuration, val);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.RemainingDuration)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'RemainingDuration');
                    const duration = mqttStatus[settings.topic.statusRemainingDuration];
                    log.debug('> hap re_get', settings.name, 'RemainingDuration', duration);
                    callback(null, duration);
                });
        }

        /* istanbul ignore else  */
        if (settings.topic.statusFault) {
            mqttSub(settings.topic.statusFault, val => {
                const fault = val === settings.payload.faultTrue ? 1 : 0;
                log.debug('> hap update', settings.name, 'StatusFault', fault);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.StatusFault, fault);
            });
            acc.getService(subtype)
                .getCharacteristic(Characteristic.StatusFault)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'StatusFault');
                    const fault = mqttStatus[settings.topic.statusFault] === settings.payload.faultTrue ? 1 : 0;
                    log.debug('> hap re_get', settings.name, 'StatusFault', fault);
                    callback(null, fault);
                });
        }

        require('../characteristics/Active')({acc, settings, subtype}, iface);
    };
};
