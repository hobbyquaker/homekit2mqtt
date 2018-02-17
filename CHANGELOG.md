0.9.1 / 2018-02-17
==================

  * remove alert
  * fix add/stop button
  * fix default 0
  * wait on quit
  * dont subscribe empty topics
  * log error when trying to subscribe empty topic
  * remove identify
  * increase button col width

0.9.0 / 2018-02-17
==================

  * batteryLevel conversion (closes [#82](https://github.com/hobbyquaker/homekit2mqtt/issues/82))
  * multi-service accessories
  * extend test config

0.8.4 / 2018-02-16
==================

  * move test-config
  * convert identify topic/payload, prepare saving of converted config
  * fix [#80](https://github.com/hobbyquaker/homekit2mqtt/issues/80)
  * parseInt config variables

0.8.3 / 2018-02-14
==================

  * edit properties (close [#62](https://github.com/hobbyquaker/homekit2mqtt/issues/62))
  * add props
  * add hue templates
  * fix testbridge command

0.8.2 / 2018-02-14
==================

  * add testbridge command

0.8.1 / 2018-02-14
==================

  * set props TargetHeatingCoolingState

0.8.0 / 2018-02-14
==================

  * enable props for TargetHeatingCoolingState
  * alphabetic order
  * reformat
  * add Faucet, IrrigationSystem, Microphone, Slat, Valve
  * test BatteryService
  * fix test
  * fix accessory id
  * always set names
  * Revert "fix logging"
    This reverts commit 0e1d104
  * fix logging
  * add service name ([#56](https://github.com/hobbyquaker/homekit2mqtt/issues/56))
  * adapt new config schema ([#56](https://github.com/hobbyquaker/homekit2mqtt/issues/56))
  * rename dir accessories to services (prepare [#56](https://github.com/hobbyquaker/homekit2mqtt/issues/56))
  * refactor accessory creation (prepare [#56](https://github.com/hobbyquaker/homekit2mqtt/issues/56))

0.7.10 / 2018-02-12
===================

  * remove unnecessary param
  * unifiy mqtt logging
  * fix slat
  * fix return
  * implements BatteryService (closes [#76](https://github.com/hobbyquaker/homekit2mqtt/issues/76))
  * fix log output
  * unify config names
  * add TemperatureDisplayUnits config
  * implements slat (closes [#74](https://github.com/hobbyquaker/homekit2mqtt/issues/74))
  * remove StatefulProgrammableSwitch (close [#75](https://github.com/hobbyquaker/homekit2mqtt/issues/75))

0.7.9 / 2018-02-11
==================

  * use val (close [#57](https://github.com/hobbyquaker/homekit2mqtt/issues/57))

0.7.8 / 2018-02-11
==================

  * implement valve and irrigation
  * implement config
  * prepare new services
  * implement faucet [#41](https://github.com/hobbyquaker/homekit2mqtt/issues/41)

0.7.7 / 2018-02-09
==================

  * prepare [#41](https://github.com/hobbyquaker/homekit2mqtt/issues/41)
  * add param --disable-json-parse (implements [#63](https://github.com/hobbyquaker/homekit2mqtt/issues/63))
  * bootstrap css fixes
  * hap-nodejs 0.4.41

0.7.6 / 2018-01-24
==================

  * add unnecessary popper.js to get rid of stupid unmet peer dep warning

0.7.5 / 2018-01-24
==================

  * adapt gridsize to bootstrap 4
  * prepare service valve
  * update deps

0.7.4 / 2018-01-24
==================

  * Add support for statusActive, statusFault, and statusTampered characteristics to CarbonDioxideSensor.
  * decrease test timeouts
  * retry all tests. trying to mitigate test fail issues on travis...
  * increase test timeout

0.7.3 / 2018-01-06
==================

  * ContactSensor StatusActive, StatusFault, StatusTampered
  * statusActive bool
  * payload option naming
  * add mqtt-smarthome badge
  * test ContactSensor StatusActive, StatusFault, StatusTampered