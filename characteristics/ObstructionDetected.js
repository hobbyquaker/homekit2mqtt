/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    /* istanbul ignore else */
    if (settings.topic.statusObstruction) {
        acc.getService(subtype)
            .getCharacteristic(Characteristic.ObstructionDetected)
            .on('get', callback => {
                log.debug('< hap get', settings.name, 'ObstructionDetected');
                const obstruction = mqttStatus[settings.topic.statusObstruction] === settings.payload.onObstructionDetected;
                log.debug('> hap re_get', settings.name, 'ObstructionDetected', obstruction);
                callback(null, obstruction);
            });

        mqttSub(settings.topic.statusObstruction, val => {
            const obstruction = val === settings.payload.onObstructionDetected;
            log.debug('> hap update', settings.name, 'ObstructionDetected', obstruction);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic.ObstructionDetected, obstruction);
        });
    }
};
