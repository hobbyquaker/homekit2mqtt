module.exports = function (iface) {
    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_CameraRTSPStreamManagement(settings) {
        throw new Error('Service CameraRTSPStreamManagement not yet implemented');
    };
};
