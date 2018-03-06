/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    /*
     // Required Characteristics
     this.addCharacteristic(Characteristic.LockControlPoint);
     this.addCharacteristic(Characteristic.Version);

     // Optional Characteristics
     this.addOptionalCharacteristic(Characteristic.Logs);
     this.addOptionalCharacteristic(Characteristic.AudioFeedback);
     this.addOptionalCharacteristic(Characteristic.LockManagementAutoSecurityTimeout);
     this.addOptionalCharacteristic(Characteristic.AdministratorOnlyAccess);
     this.addOptionalCharacteristic(Characteristic.LockLastKnownAction);
     this.addOptionalCharacteristic(Characteristic.CurrentDoorState);
     this.addOptionalCharacteristic(Characteristic.MotionDetected);
     this.addOptionalCharacteristic(Characteristic.Name);

     // The value property of LockLastKnownAction must be one of the following:
     Characteristic.LockLastKnownAction.SECURED_PHYSICALLY_INTERIOR = 0;
     Characteristic.LockLastKnownAction.UNSECURED_PHYSICALLY_INTERIOR = 1;
     Characteristic.LockLastKnownAction.SECURED_PHYSICALLY_EXTERIOR = 2;
     Characteristic.LockLastKnownAction.UNSECURED_PHYSICALLY_EXTERIOR = 3;
     Characteristic.LockLastKnownAction.SECURED_BY_KEYPAD = 4;
     Characteristic.LockLastKnownAction.UNSECURED_BY_KEYPAD = 5;
     Characteristic.LockLastKnownAction.SECURED_REMOTELY = 6;
     Characteristic.LockLastKnownAction.UNSECURED_REMOTELY = 7;
     Characteristic.LockLastKnownAction.SECURED_BY_AUTO_SECURE_TIMEOUT = 8;
     */

    return function createService_LockManagement(acc, settings, subtype) {
        throw new Error('Service LockManagement not yet implemented');
    };
};
