/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_HeaterCooler(acc, settings, subtype) {
        if (typeof settings.payload.activeTrue === 'undefined') {
            settings.payload.activeTrue = true;
        }

        if (typeof settings.payload.activeFalse === 'undefined') {
            settings.payload.activeFalse = false;
        }

        acc.addService(Service.HeaterCooler, settings.name, subtype);

        const obj = {acc, settings, subtype};

        require('../characteristics')('CurrentHeaterCoolerState', obj, iface);
        require('../characteristics')('TargetHeaterCoolerState', obj, iface);
        require('../characteristics')('CoolingThresholdTemperature', obj, iface);
        require('../characteristics')('HeatingThresholdTemperature', obj, iface);

        require('../characteristics/Active')(obj, iface);
        require('../characteristics/CurrentTemperature')(obj, iface);
        require('../characteristics/RotationSpeed')(obj, iface);
        require('../characteristics/TemperatureDisplayUnits')(obj, iface);
        require('../characteristics/SwingMode')(obj, iface);
    };
};
