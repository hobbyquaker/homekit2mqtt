/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_SmokeSensor(settings) {
        const sensor = newAccessory(settings);

        sensor.addService(Service.SmokeSensor, settings.name)
            .getCharacteristic(Characteristic.SmokeDetected)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'SmokeDetected');
                const smoke = mqttStatus[settings.topic.statusSmokeDetected] === settings.payload.onSmokeDetected ?
                    Characteristic.SmokeDetected.SMOKE_DETECTED :
                    Characteristic.SmokeDetected.SMOKE_NOT_DETECTED;

                log.debug('> hap re_get', settings.name, 'SmokeDetected', smoke);
                callback(null, smoke);
            });

        mqttSub(settings.topic.statusSmokeDetected, val => {
            const smoke = val === settings.payload.onSmokeDetected ?
                Characteristic.SmokeDetected.SMOKE_DETECTED :
                Characteristic.SmokeDetected.SMOKE_NOT_DETECTED;
            log.debug('> hap set', settings.name, 'SmokeDetected', smoke);
            sensor.getService(Service.SmokeSensor)
                .setCharacteristic(Characteristic.SmokeDetected, smoke);
        });

        if (settings.topic.statusLowBattery) {
            sensor.getService(Service.SmokeSensor, settings.name)
                .getCharacteristic(Characteristic.StatusLowBattery)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'StatusLowBattery');
                    const bat = mqttStatus[settings.topic.statusLowBattery] !== settings.payload.onLowBattery ?
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL :
                        Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
                    log.debug('> hap re_get', settings.name, 'StatusLowBattery', bat);
                    callback(null, bat);
                });

            mqttSub(settings.topic.statusLowBattery, val => {
                const bat = val !== settings.payload.onLowBattery ?
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL :
                    Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
                log.debug('> hap set', settings.name, 'StatusLowBattery', bat);
                sensor.getService(Service.SmokeSensor)
                    .setCharacteristic(Characteristic.StatusLowBattery, bat);
            });
        }

        return sensor;
    };
};
