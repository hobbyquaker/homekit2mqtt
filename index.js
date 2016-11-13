#!/usr/bin/env node

var pkg =               require('./package.json');
var config =            require('./config.js');
var log =               require('yalm');
log.setLevel(config.verbosity);

log(pkg.name + ' ' + pkg.version + ' starting');

var fs =                require('fs');
var Mqtt =              require('mqtt');

var mqttStatus = {};        // Holds the payloads of the last-received message, keys are the topics.
var mqttCallbacks = {};     // Holds arrays of subscription callbacks, keys are the topics.
var mqttConnected;

var bridgeListening;

log.info('mqtt trying to connect', config.url);
var mqtt = Mqtt.connect(config.url, {will: {topic: config.name + '/connected', payload: '0', retain: true}});

mqtt.on('connect', function () {
    mqttConnected = true;
    log.info('mqtt connected ' + config.url);
    if (!bridgeListening) mqtt.publish(config.name + '/connected', '1', {retain: true});
});

mqtt.on('reconnect', function () {
    log.info('mqtt reconnect');
});

mqtt.on('offline', function () {
    log.info('mqtt offline');
});

mqtt.on('close', function () {
    if (mqttConnected) {
        mqttConnected = false;
        log.info('mqtt closed ' + config.url);
    }
});

mqtt.on('error', function (err) {
    log.error('mqtt error ' + err);
});

mqtt.on('message', function (topic, payload) {
    payload = payload.toString();
    var state;
    try {
        // todo - check for json objects in a less nasty way ;)
        if (payload.indexOf('{') === -1) throw 'not an object'; // We have no use for arrays here.
        // We got an Object - let's hope it follows mqtt-smarthome architecture and has an attribute "val"
        // see https://github.com/mqtt-smarthome/mqtt-smarthome/blob/master/Architecture.md
        state = JSON.parse(payload).val;
    } catch (e) {
        // Nasty type guessing.
        // Do we really need to cast the strings "true" and "false" to bool?
        if (payload === 'true') {
            state = true;
        } else if (payload === 'false') {
            state = false;
        } else if (!isNaN(payload)) {
            state = parseFloat(payload);
        } else {
            state = payload;
        }
    }
    log.debug('< mqtt', topic, state);
    mqttStatus[topic] = state;
    if (mqttCallbacks[topic]) {
        mqttCallbacks[topic].forEach(function (cb) {
            cb(state);
        });
    }
});


// MQTT subscribe function that provides a callback on incoming messages.
// Not meant to be used with wildcards!
function mqttSub(topic, callback) {
    if (typeof callback === 'function') {
        if (!mqttCallbacks[topic]) {
            mqttCallbacks[topic] = [callback];
            log.debug('mqtt subscribe', topic);
            mqtt.subscribe(topic);
        } else {
            mqttCallbacks[topic].push(callback);
        }
    } else {
        log.debug('mqtt subscribe', topic);
        mqtt.subscribe(topic);
    }
}

// MQTT publish function, checks for valid topic and converts payload to string in a meaningful manner.
function mqttPub(topic, payload, options) {
    if (!topic || (typeof topic !== 'string')) {
        log.error('mqttPub invalid topic', topic);
    } else {
        if (typeof payload === 'object') {
            payload = JSON.stringify(payload);
        } else if (typeof payload !== 'string') {
            payload = '' + payload;
        }
        mqtt.publish(topic, payload, options, function (err) {
            if (err) log.error('mqtt publish error ' + err);
        });
    }
}

var pkgHap =            require('./node_modules/hap-nodejs/package.json');
log.info('using hap-nodejs version', pkgHap.version);

var HAP =               require('hap-nodejs');
var uuid =              HAP.uuid;
var Bridge =            HAP.Bridge;
var Accessory =         HAP.Accessory;
var Service =           HAP.Service;
var Characteristic =    HAP.Characteristic;

if (config.storagedir) {
    log.info('using directory ' + config.storagedir + ' for persistent storage');
}
// If storagedir is not set it uses HAP-Nodejs default
// (usually /usr/local/lib/node_modules/homekit2mqtt/node_modules/node-persist/persist)
HAP.init(config.storagedir || undefined);

// Create Bridge which will host all Accessories
var bridge = new Bridge(config.bridgename, uuid.generate(config.bridgename));

// Listen for Bridge identification event
bridge.on('identify', function (paired, callback) {
    log('< hap bridge identify', paired ? '(paired)' : '(unpaired)');
    callback();
});

// Handler for Accessory identification events
function identify(settings, paired, callback) {
    log.debug('< hap identify', settings.name, paired ? '(paired)' : '(unpaired)');
    if (settings.topic.identify) {
        log.debug('> mqtt', settings.topic.identify, settings.payload.identify);
        mqttPub(settings.topic.identify, settings.payload.identify);
    }
    callback();
}

function newAccessory(settings) {
    var acc = new Accessory(settings.name, uuid.generate(settings.id));
    if (settings.manufacturer || settings.model || settings.serial) {
        acc.getService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.Manufacturer, settings.manufacturer || "-")
            .setCharacteristic(Characteristic.Model, settings.model || "-" )
            .setCharacteristic(Characteristic.SerialNumber, settings.serial || "-");
    }
    if (!settings.payload) settings.payload = {};
    acc.on('identify', function (paired, callback) {
        identify(settings, paired, callback);
    });
    return acc;
}

var createAccessory = {};
// import createAccessory functions
fs.readdirSync(__dirname + '/accessories').forEach(function (file) {
    var acc = file.replace(/\.js$/, '');
    createAccessory[acc] = require(__dirname + '/accessories/' + file)({mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic});
});

// Load and create all accessories
log.info('loading HomeKit to MQTT mapping file ' + config.mapfile);
var mapping = require(config.mapfile);
var accCount = 0;
Object.keys(mapping).forEach(function (id) {
    var a = mapping[id];
    a.id = id;
    if (createAccessory[a.service]) {
        log.debug('addBridgedAccessory ' + a.service + ' ' + a.name);
        bridge.addBridgedAccessory(createAccessory[a.service](a));
        accCount++;
    } else {
        log.err('unknown service', a.service, id);
    }
});
log.info('hap created', accCount, 'Accessories');

log('hap publishing bridge "' + config.bridgename + '" username=' + config.username, 'port=' + config.port, 'pincode=' + config.c);
bridge.publish({
    username: config.username,
    port: config.port,
    pincode: config.c,
    category: Accessory.Categories.OTHER
});

bridge._server.on('listening', function () {
    bridgeListening = true;
    mqtt.publish(config.name + '/connected', '2', {retain: true});
    log('hap Bridge listening on port', config.port);
});

bridge._server.on('pair', function (username, publickey) {
    log('hap paired', username);
});

bridge._server.on('unpair', function (username) {
    log('hap unpaired', username);
});

bridge._server.on('verify', function () {
    log('hap verify');
});
