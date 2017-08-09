#!/usr/bin/env node

const path = require('path');
const Mqtt = require('mqtt');
const log = require('yalm');
const HAP = require('hap-nodejs');
const pkgHap = require('./node_modules/hap-nodejs/package.json');
const pkg = require('./package.json');
const config = require('./config.js');

log.setLevel(config.verbosity);

log(pkg.name + ' ' + pkg.version + ' starting');

const mqttStatus = {};        // Holds the payloads of the last-received message, keys are the topics.
const mqttCallbacks = {};     // Holds arrays of subscription callbacks, keys are the topics.
let mqttConnected;

let bridgeListening;

log.info('mqtt trying to connect', config.url);
const mqtt = Mqtt.connect(config.url, {will: {topic: config.name + '/connected', payload: '0', retain: true}});

mqtt.on('connect', () => {
    mqttConnected = true;
    log.info('mqtt connected ' + config.url);
    if (!bridgeListening) {
        mqtt.publish(config.name + '/connected', '1', {retain: true});
    }
});

mqtt.on('reconnect', () => {
    log.info('mqtt reconnect');
});

mqtt.on('offline', () => {
    log.info('mqtt offline');
});

mqtt.on('close', () => {
    if (mqttConnected) {
        mqttConnected = false;
        log.info('mqtt closed ' + config.url);
    }
});

mqtt.on('error', err => {
    log.error('mqtt error ' + err);
});

mqtt.on('message', (topic, payload) => {
    payload = payload.toString();
    let state;
    try {
        // Todo - check for json objects in a less nasty way ;)
        if (payload.indexOf('{') === -1) {
            throw new Error('not an object');
        } // We have no use for arrays here.
        // We got an Object - let's hope it follows mqtt-smarthome architecture and has an attribute "val"
        // see https://github.com/mqtt-smarthome/mqtt-smarthome/blob/master/Architecture.md
        state = JSON.parse(payload).val;
    } catch (err) {
        // Nasty type guessing.
        // Do we really need to cast the strings "true" and "false" to bool?
        if (payload === 'true') {
            state = true;
        } else if (payload === 'false') {
            state = false;
        } else if (isNaN(payload)) {
            state = payload;
        } else {
            state = parseFloat(payload);
        }
    }
    log.debug('< mqtt', topic, state);
    mqttStatus[topic] = state;
    if (mqttCallbacks[topic]) {
        mqttCallbacks[topic].forEach(cb => {
            cb(state);
        });
    }
});

// MQTT subscribe function that provides a callback on incoming messages.
// Not meant to be used with wildcards!
function mqttSub(topic, callback) {
    topic = String(topic);
    if (typeof callback === 'function') {
        if (mqttCallbacks[topic]) {
            mqttCallbacks[topic].push(callback);
        } else {
            mqttCallbacks[topic] = [callback];
            log.debug('mqtt subscribe', topic);
            mqtt.subscribe(topic);
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
            payload = String(payload);
        }
        mqtt.publish(topic, payload, options, err => {
            if (err) {
                log.error('mqtt publish error ' + err);
            }
        });
    }
}

log.info('using hap-nodejs version', pkgHap.version);

const uuid = HAP.uuid;
const Bridge = HAP.Bridge;
const Accessory = HAP.Accessory;
const Service = HAP.Service;
const Characteristic = HAP.Characteristic;

if (config.storagedir) {
    log.info('using directory ' + config.storagedir + ' for persistent storage');
}
// If storagedir is not set it uses HAP-Nodejs default
// (usually /usr/local/lib/node_modules/homekit2mqtt/node_modules/node-persist/persist)
HAP.init(config.storagedir || undefined);

// Create Bridge which will host all Accessories
const bridge = new Bridge(config.bridgename, uuid.generate(config.bridgename));

// Listen for Bridge identification event
bridge.on('identify', (paired, callback) => {
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
    const acc = new Accessory(settings.name, uuid.generate(settings.id));
    if (settings.manufacturer || settings.model || settings.serial) {
        acc.getService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.Manufacturer, settings.manufacturer || '-')
            .setCharacteristic(Characteristic.Model, settings.model || '-')
            .setCharacteristic(Characteristic.SerialNumber, settings.serial || '-');
    }
    if (!settings.payload) {
        settings.payload = {};
    }
    acc.on('identify', (paired, callback) => {
        identify(settings, paired, callback);
    });
    return acc;
}

const createAccessory = {};

function loadAccessory(acc) {
    const file = 'accessories/' + acc + '.js';
    log.debug('loading', file);
    createAccessory[acc] = require(path.join(__dirname, file))({mqttPub, mqttSub, mqttStatus, log, newAccessory, Service, Characteristic});
}

// Load and create all accessories
log.info('loading HomeKit to MQTT mapping file ' + config.mapfile);
const mapping = require(config.mapfile);
let accCount = 0;
Object.keys(mapping).forEach(id => {
    const a = mapping[id];
    a.id = id;
    if (!createAccessory[a.service]) {
        loadAccessory(a.service);
    }
    log.debug('addBridgedAccessory ' + a.service + ' ' + a.name);
    bridge.addBridgedAccessory(createAccessory[a.service](a));
    accCount++;
});
log.info('hap created', accCount, 'Accessories');

log('hap publishing bridge "' + config.bridgename + '" username=' + config.username, 'port=' + config.port, 'pincode=' + config.c);
bridge.publish({
    username: config.username,
    port: config.port,
    pincode: config.c,
    category: Accessory.Categories.OTHER
});

bridge._server.on('listening', () => {
    bridgeListening = true;
    mqtt.publish(config.name + '/connected', '2', {retain: true});
    log('hap Bridge listening on port', config.port);
});

bridge._server.on('pair', username => {
    log('hap paired', username);
});

bridge._server.on('unpair', username => {
    log('hap unpaired', username);
});

bridge._server.on('verify', () => {
    log('hap verify');
});
