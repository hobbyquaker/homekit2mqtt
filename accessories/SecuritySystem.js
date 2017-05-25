/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    // TODO

    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_SecuritySystem(settings) {
        const acc = newAccessory(settings);
        // Required Characteristics

        /*
         this.addCharacteristic(Characteristic.SecuritySystemTargetState);

         Characteristic.SecuritySystemTargetState.STAY_ARM = 0;
         Characteristic.SecuritySystemTargetState.AWAY_ARM = 1;
         Characteristic.SecuritySystemTargetState.NIGHT_ARM = 2;
         Characteristic.SecuritySystemTargetState.DISARM = 3;

         */

        acc.addService(Service.SecuritySystem, settings.name)
            .getCharacteristic(Characteristic.SecuritySystemTargetState)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'SecuritySystemTargetState', value);
                /*
                If (value === Characteristic.SecuritySystemTargetState.STAY_ARM) {
                    value = settings.payload.STAY_ARM;
                } else if (value === Characteristic.SecuritySystemTargetState.AWAY_ARM) {
                    value = settings.payload.AWAY_ARM;
                } else if (value === Characteristic.SecuritySystemTargetState.NIGHT_ARM) {
                    value = settings.payload.NIGHT_ARM;
                } else if (value === Characteristic.SecuritySystemTargetState.DISARM) {
                    value = settings.payload.DISARMED;
                }
                */
                log.debug('> mqtt', settings.topic.setSecuritySystemTargetState, value);
                mqttPub(settings.topic.setSecuritySystemTargetState, value);
                callback();
            });

        /*
         This.addCharacteristic(Characteristic.SecuritySystemCurrentState);

         Characteristic.SecuritySystemCurrentState.STAY_ARM = 0;
         Characteristic.SecuritySystemCurrentState.AWAY_ARM = 1;
         Characteristic.SecuritySystemCurrentState.NIGHT_ARM = 2;
         Characteristic.SecuritySystemCurrentState.DISARMED = 3;
         Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED = 4;
         */

        mqttSub(settings.topic.statusSecuritySystemCurrentState, val => {
            /*
            If (val === settings.payload.STAY_ARM) {
                val = Characteristic.SecuritySystemCurrentState.STAY_ARM;
            } else if (val === settings.payload.AWAY_ARM) {
                val = Characteristic.SecuritySystemCurrentState.AWAY_ARM;
            } else if (val === settings.payload.NIGHT_ARM) {
                val = Characteristic.SecuritySystemCurrentState.NIGHT_ARM;
            } else if (val === settings.payload.DISARMED) {
                val = Characteristic.SecuritySystemCurrentState.DISARMED;
            } else if (val === settings.payload.ALARM_TRIGGERED) {
                val = Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED;
            }
            */
            log.debug('> hap set', settings.name, 'SecuritySystemCurrentState', val);
            acc.getService(Service.SecuritySystem)
                .setCharacteristic(Characteristic.SecuritySystemCurrentState, val);
            if (val !== 4) {
                acc.getService(Service.SecuritySystem)
                    .updateCharacteristic(Characteristic.SecuritySystemTargetState, val);
            }
        });

        acc.getService(Service.SecuritySystem)
            .getCharacteristic(Characteristic.SecuritySystemCurrentState)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'SecuritySystemCurrentState');
                const val = mqttStatus[settings.topic.statusSecuritySystemCurrentState];
                /*
                If (val === settings.payload.STAY_ARM) {
                    val = Characteristic.SecuritySystemCurrentState.STAY_ARM;
                } else if (val === settings.payload.AWAY_ARM) {
                    val = Characteristic.SecuritySystemCurrentState.AWAY_ARM;
                } else if (val === settings.payload.NIGHT_ARM) {
                    val = Characteristic.SecuritySystemCurrentState.NIGHT_ARM;
                } else if (val === settings.payload.DISARMED) {
                    val = Characteristic.SecuritySystemCurrentState.DISARMED;
                } else if (val === settings.payload.ALARM_TRIGGERED) {
                    val = Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED;
                }
                */
                log.debug('> hap re_get', settings.name, 'SecuritySystemCurrentState', val);
                callback(null, val);
            });

        /*

         // Optional Characteristics
         this.addOptionalCharacteristic(Characteristic.StatusFault);

         Characteristic.StatusFault.NO_FAULT = 0;
         Characteristic.StatusFault.GENERAL_FAULT = 1;

         this.addOptionalCharacteristic(Characteristic.StatusTampered);

         Characteristic.StatusTampered.NOT_TAMPERED = 0;
         Characteristic.StatusTampered.TAMPERED = 1;

         this.addOptionalCharacteristic(Characteristic.SecuritySystemAlarmType);

         format: Characteristic.Formats.UINT8,
         maxValue: 1,
         minValue: 0,

         */

        return acc;
    };
};
