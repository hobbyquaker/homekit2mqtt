module.exports = function (iface) {

    var {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    return function createAccessory_CameraControl(settings) {
        throw new Error('Service CameraControl not yet implemented');
    };

};