/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off", no-negated-condition: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_OccupancySensor(settings) {
        const sensor = newAccessory(settings);

        sensor.addService(Service.OccupancySensor, settings.name)
            .getCharacteristic(Characteristic.OccupancyDetected)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'OccupancyDetected');
                const motion = mqttStatus[settings.topic.statusOccupancyDetected] === settings.payload.onOccupancyDetected;

                log.debug('> hap re_get', settings.name, 'OccupancyDetected', motion ?
                    Characteristic.OccupancyDetected.OCCUPANCY_DETECTED :
                    Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED);
                callback(null, motion);
            });

        mqttSub(settings.topic.statusOccupancyDetected, val => {
            const motion = val === settings.payload.onOccupancyDetected;
            log.debug('> hap update', settings.name, 'OccupancyDetected', motion);
            sensor.getService(Service.OccupancySensor)
                .updateCharacteristic(Characteristic.OccupancyDetected, motion ?
                    Characteristic.OccupancyDetected.OCCUPANCY_DETECTED :
                    Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED);
        });

	/* istanbul ignore else */
        if (settings.topic.statusLowBattery) {
            sensor.getService(Service.OccupancySensor, settings.name)
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
                log.debug('> hap update', settings.name, 'StatusLowBattery', bat);
                sensor.getService(Service.OccupancySensor)
                    .updateCharacteristic(Characteristic.StatusLowBattery, bat);
            });
        }

        return sensor;
    };
};
