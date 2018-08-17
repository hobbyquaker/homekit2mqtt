/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    acc.getService(subtype)
        .getCharacteristic(Characteristic.MotionDetected)
        .on('get', callback => {
            log.debug('< hap get', settings.name, 'MotionDetected');
            const motion = mqttStatus[settings.topic.statusMotionDetected] === settings.payload.onMotionDetected;

            log.debug('> hap re_get', settings.name, 'MotionDetected', motion);
            callback(null, motion);
        });

    mqttSub(settings.topic.statusMotionDetected, val => {
        const motion = val === settings.payload.onMotionDetected;
        log.debug('> hap update', settings.name, 'MotionDetected', motion);
        acc.getService(subtype)
            .updateCharacteristic(Characteristic.MotionDetected, motion);
    });
};
