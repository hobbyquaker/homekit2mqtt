/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    if (settings.topic.setHoldPosition) {
        acc.getService(subtype)
            .getCharacteristic(Characteristic.HoldPosition)
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, 'HoldPosition', value);
                if (typeof settings.payload.holdPositionTrue !== 'undefined' && value) {
                    value = settings.payload.holdPositionTrue;
                } else if (typeof settings.payload.holdPositionFalse !== 'undefined' && !value) {
                    value = settings.payload.holdPositionFalse;
                }
                log.debug('> mqtt', settings.topic.setHoldPosition, value);
                mqttPub(settings.topic.setHoldPosition, value);
                callback();
            });
    }
};
