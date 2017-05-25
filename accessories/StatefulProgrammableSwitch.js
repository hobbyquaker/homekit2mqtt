/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic} = iface;

    /*
     // Required Characteristics
     this.addCharacteristic(Characteristic.ProgrammableSwitchEvent);
     this.addCharacteristic(Characteristic.ProgrammableSwitchOutputState);

     // Optional Characteristics
     this.addOptionalCharacteristic(Characteristic.Name);
     */

    return function createAccessory_StatefulProgrammableSwitch(settings) {
        throw new Error('Service StatefulProgrammableSwitch not yet implemented');
    };
};
