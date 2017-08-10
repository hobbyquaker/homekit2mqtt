/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_Outlet(settings) {
        const acc = newAccessory(settings);

        acc.addService(Service.Outlet, settings.name)
            .getCharacteristic(Characteristic.On)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'On', value);
                const on = value ? settings.payload.onTrue : settings.payload.onFalse;
                log.debug('> mqtt', settings.topic.setOn, on);
                mqttPub(settings.topic.setOn, on);
                callback();
            });

        /* istanbul ignore else */
        if (settings.topic.statusOn) {
            mqttSub(settings.topic.statusOn, val => {
                log.debug('< mqtt', settings.topic.statusOn, val);
                const on = mqttStatus[settings.topic.statusOn] === settings.payload.onTrue;
                log.debug('> hap update', settings.name, 'On', on);
                acc.getService(Service.Outlet)
                    .updateCharacteristic(Characteristic.On, on);
            });
            acc.getService(Service.Outlet)
                .getCharacteristic(Characteristic.On)
                .on('get', callback => {
                    log.debug('< hap get', settings.name, 'On');
                    const on = mqttStatus[settings.topic.statusOn] === settings.payload.onTrue;
                    log.debug('> hap re_get', settings.name, 'On', on);
                    callback(null, on);
                });
        }

        acc.getService(Service.Outlet)
            .getCharacteristic(Characteristic.OutletInUse)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'OutletInUse');
                const inUse = mqttStatus[settings.topic.statusOutletInUse] === settings.payload.onOutletInUse;
                log.debug('> hap re_get', settings.name, 'OutletInUse', inUse);
                callback(null, inUse);
            });

        mqttSub(settings.topic.statusOutletInUse, val => {
            const inUse = val === settings.payload.onOutletInUse;
            log.debug('> hap update', settings.name, 'OutletInUse', inUse);
            acc.getService(Service.Outlet)
                .updateCharacteristic(Characteristic.OutletInUse, inUse);
        });

        return acc;
    };
};
