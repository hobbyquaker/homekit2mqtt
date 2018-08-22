/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_HumidifierDehumidifier(acc, settings, subtype) {
        if (typeof settings.payload.activeTrue === 'undefined') {
            settings.payload.activeTrue = true;
        }

        if (typeof settings.payload.activeFalse === 'undefined') {
            settings.payload.activeFalse = false;
        }

        acc.addService(Service.HumidifierDehumidifier, settings.name, subtype);

        /* istanbul ignore else */
        if (settings.topic.statusWaterLevel) {
            acc.getService(subtype)
                .getCharacteristic(Characteristic.WaterLevel)
                .setProps((settings.props || {}).WaterLevel)
                .on('get', callback => {
                    const water = mqttStatus(settings.topic.statusWaterLevel, settings.json.statusWaterLevel) / (settings.payload.waterLevelFactor || 1);
                    log.debug('< hap get', settings.name, 'WaterLevel');
                    log.debug('> hap re_get', settings.name, water);
                    callback(null, water);
                });

            mqttSub(settings.topic.statusWaterLevel, settings.json.statusWaterLevel, val => {
                val /= (settings.payload.waterLevelFactor || 1);
                log.debug('> hap update', settings.name, 'WaterLevel', val);
                acc.getService(subtype)
                    .updateCharacteristic(Characteristic.WaterLevel, val);
            });
        }

        const obj = {acc, settings, subtype};

        require('../characteristics')('CurrentHumidifierDehumidifierState', obj, iface);
        require('../characteristics')('TargetHumidifierDehumidifierState', obj, iface);
        require('../characteristics')('RelativeHumidityDehumidifierThreshold', obj, iface);
        require('../characteristics')('RelativeHumidityHumidifierThreshold', obj, iface);

        require('../characteristics/Active')(obj, iface);
        require('../characteristics/RotationSpeed')(obj, iface);
        require('../characteristics/SwingMode')(obj, iface);
    };
};
