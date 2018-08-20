/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (characteristic, obj, iface) {
    const {acc, settings, subtype} = obj;
    const {mqttStatus, mqttPub, mqttSub, Characteristic, log} = iface;

    if (!Characteristic[characteristic]) {
        throw new Error('Unknown Characteristic ' + characteristic);
    }

    const setTopic = 'set' + characteristic;
    const statusTopic = 'status' + characteristic;

    const {props, eventOnlyCharacteristic} = acc.getService(subtype).getCharacteristic(Characteristic[characteristic]);

    console.log('props', props);

    /* istanbul ignore else */
    if (props.perms.includes(Characteristic.Perms.PAIRED_READ) && settings.topic[statusTopic]) {
        mqttSub(settings.topic[statusTopic], val => {
            log.debug('> hap update', settings.name, characteristic, val);
            acc.getService(subtype)
                .updateCharacteristic(Characteristic[characteristic], val);
        });
        acc.getService(subtype)
            .getCharacteristic(Characteristic[characteristic])
            .on('get', callback => {
                log.debug('< hap get', settings.name, characteristic);
                log.debug('> hap re_get', settings.name, characteristic, mqttStatus[settings.topic[statusTopic]]);
                callback(null, mqttStatus[settings.topic[statusTopic]]);
            });
    }

    /* istanbul ignore else */
    if (props.perms.includes(Characteristic.Perms.PAIRED_WRITE) && settings.topic[setTopic]) {
        acc.getService(subtype)
            .getCharacteristic(Characteristic[characteristic])
            .on('set', (value, callback) => {
                log.debug('< hap set', settings.name, characteristic, value);
                mqttPub(settings.topic[setTopic], value);
                callback();
            });
    }
};
