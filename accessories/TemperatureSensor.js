/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_TemperatureSensor(settings) {
        const sensor = newAccessory(settings);

        mqttSub(settings.topic.statusTemperature, val => {
            log.debug('> hap set', settings.name, 'CurrentTemperature', mqttStatus[settings.topic.statusTemperature]);
            sensor.getService(Service.TemperatureSensor)
                .updateCharacteristic(Characteristic.CurrentTemperature, val);
        });

        sensor.addService(Service.TemperatureSensor)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .setProps((settings.props || {}).CurrentTemperature || {minValue: -100})
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'TemperatureSensor', 'CurrentTemperature');
                log.debug('> hap re_get', settings.name, mqttStatus[settings.topic.statusTemperature]);
                callback(null, mqttStatus[settings.topic.statusTemperature]);
            });

        return sensor;
    };
};
