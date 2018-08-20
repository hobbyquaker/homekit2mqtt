/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    return function createService_AirQualitySensor(acc, settings, subtype) {
        acc.addService(Service.AirQualitySensor, settings.name, subtype);

        const obj = {acc, settings, subtype};

        require('../characteristics')('AirQuality', obj, iface);
        require('../characteristics')('OzoneDensity', obj, iface);
        require('../characteristics')('NitrogenDioxideDensity', obj, iface);
        require('../characteristics')('SulphurDioxideDensity', obj, iface);
        require('../characteristics')('PM2_5Density', obj, iface);
        require('../characteristics')('PM10Density', obj, iface);
        require('../characteristics')('VOCDensity', obj, iface);

        require('../characteristics/CarbonDioxideLevel')(obj, iface);
        require('../characteristics/CarbonMonoxideLevel')(obj, iface);
        require('../characteristics/StatusLowBattery')(obj, iface);
        require('../characteristics/StatusActive')(obj, iface);
        require('../characteristics/StatusFault')(obj, iface);
        require('../characteristics/StatusTampered')(obj, iface);
    };
};
