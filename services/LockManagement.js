/* eslint unicorn/filename-case: "off", func-names: "off", camelcase: "off", no-unused-vars: "off" */

module.exports = function (iface) {
    const {mqttPub, mqttSub, mqttStatus, log, Service, Characteristic} = iface;

    /* TODO #114

    // Required Characteristics
    this.addCharacteristic(Characteristic.LockControlPoint); Write, TLV8 // TODO clarify - what is this?! :)
    this.addCharacteristic(Characteristic.Version); Read, Notify, String

    // Optional Characteristics
    this.addOptionalCharacteristic(Characteristic.Logs); Read, Notify, TLV8
    this.addOptionalCharacteristic(Characteristic.AudioFeedback); Read, Write, Notify, Bool
    this.addOptionalCharacteristic(Characteristic.LockManagementAutoSecurityTimeout); Read, Write, Notify, Uint32, Seconds
    this.addOptionalCharacteristic(Characteristic.AdministratorOnlyAccess); Read, Write, Notify, Bool
    this.addOptionalCharacteristic(Characteristic.LockLastKnownAction); Read, Notify, Uint8
    this.addOptionalCharacteristic(Characteristic.CurrentDoorState); Read, Notify, Uint8
    this.addOptionalCharacteristic(Characteristic.MotionDetected); Read, Notifdy, Bool
    this.addOptionalCharacteristic(Characteristic.Name);

    // The value property of CurrentDoorState must be one of the following:
    Characteristic.CurrentDoorState.OPEN = 0;
    Characteristic.CurrentDoorState.CLOSED = 1;
    Characteristic.CurrentDoorState.OPENING = 2;
    Characteristic.CurrentDoorState.CLOSING = 3;
    Characteristic.CurrentDoorState.STOPPED = 4;


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
