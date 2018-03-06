/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_CameraRTSPStreamManagement(acc, settings, subtype) {
        throw new Error('Service CameraRTSPStreamManagement not yet implemented');
    };
};
