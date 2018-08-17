/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_Outlet(acc, settings, subtype) {
        acc.addService(Service.Outlet, settings.name, subtype);

        acc.getService(subtype)
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
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.OutletInUse, inUse);
        });

        require('../characteristics/On')({acc, settings, subtype}, iface);
    };
};
