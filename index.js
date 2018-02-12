#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Mqtt = require('mqtt');
const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');

const app = express();

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
    /* istanbul ignore if */
    if (!bridgeListening) {
        mqttPub(config.name + '/connected', '1', {retain: true});
    }
});

/* istanbul ignore next */
mqtt.on('reconnect', () => {
    log.info('mqtt reconnect');
});

/* istanbul ignore next */
mqtt.on('offline', () => {
    log.info('mqtt offline');
});

/* istanbul ignore next */
mqtt.on('close', () => {
    if (mqttConnected) {
        mqttConnected = false;
        log.info('mqtt closed ' + config.url);
    }
});

/* istanbul ignore next */
mqtt.on('error', err => {
    log.error('mqtt error ' + err);
});

function typeGuess(payload) {
    let state;
    // Nasty type guessing.
    // TODO clarify Do we really want/need to cast the strings "true" and "false" to bool? https://github.com/hobbyquaker/homekit2mqtt/issues/66
    if (payload === 'true') {
        state = true;
    } else if (payload === 'false') {
        state = false;
    } else if (isNaN(payload)) {
        state = payload;
    } else {
        state = parseFloat(payload);
    }
    return state;
}

// MQTT subscribe function that provides a callback on incoming messages.
// Not meant to be used with wildcards!
function mqttSub(topic, callback) {
    topic = String(topic);
    /* istanbul ignore else */
    if (typeof callback === 'function') {
        /* istanbul ignore if */
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
    /* istanbul ignore if */
    if (!topic || (typeof topic !== 'string')) {
        log.error('mqttPub invalid topic', topic);
    } else {
        /* istanbul ignore if */
        if (typeof payload === 'object') {
            payload = JSON.stringify(payload);
        } else if (typeof payload !== 'string') {
            payload = String(payload);
        }
        log.debug('> mqtt', topic, payload);
        mqtt.publish(topic, payload, options, err => {
            /* istanbul ignore next */
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

/* istanbul ignore next */
if (config.storagedir) {
    log.info('using directory ' + config.storagedir + ' for persistent storage');
}
// If storagedir is not set it uses HAP-Nodejs default
// (usually /usr/local/lib/node_modules/homekit2mqtt/node_modules/node-persist/persist)
HAP.init(config.storagedir || undefined);

// Create Bridge which will host all Accessories
const bridge = new Bridge(config.bridgename, uuid.generate(config.bridgename));

// Listen for Bridge identification event
/* istanbul ignore next */
bridge.on('identify', (paired, callback) => {
    log('< hap bridge identify', paired ? '(paired)' : '(unpaired)');
    callback();
});

// Handler for Accessory identification events
/* istanbul ignore next */
function identify(settings, paired, callback) {
    log.debug('< hap identify', settings.name, paired ? '(paired)' : '(unpaired)');
    if (settings.topic.identify) {
        log.debug('> mqtt', settings.topic.identify, settings.payload.identify);
        mqttPub(settings.topic.identify, settings.payload.identify);
    }
    callback();
}

function newAccessory(settings) {
    log.debug('creating new accessory', settings.name);
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
    if (!settings.config) {
        settings.config = {};
    }
    /* istanbul ignore next */
    acc.on('identify', (paired, callback) => {
        identify(settings, paired, callback);
    });
    return acc;
}

const addService = {};

function loadService(service) {
    const file = 'accessories/' + service + '.js';
    log.debug('loading', file);
    addService[service] = require(path.join(__dirname, file))({mqttPub, mqttSub, mqttStatus, log, Service, Characteristic});
}

let mapping;
let accCount;

function createBridge() {
    mqtt.on('message', (topic, payload) => {
        payload = payload.toString();
        let state;
        if (payload.indexOf('{') === -1 || config.disableJsonParse) {
            state = typeGuess(payload);
        } else {
            try {
                // We got an Object - let's hope it follows mqtt-smarthome architecture and has an attribute "val"
                // see https://github.com/mqtt-smarthome/mqtt-smarthome/blob/master/Architecture.md
                state = JSON.parse(payload).val;
                // TODO make attribute configurable to support non-mqtt-smarthome json payloads https://github.com/hobbyquaker/homekit2mqtt/issues/67
                if (typeof state === 'undefined') {
                    // :-( there is no "val" attribute
                    throw new TypeError('attribute val undefined');
                }
            } catch (err) {
                state = typeGuess(payload);
            }
        }

        log.debug('< mqtt', topic, state);
        mqttStatus[topic] = state;
        /* istanbul ignore else */
        if (mqttCallbacks[topic]) {
            mqttCallbacks[topic].forEach(cb => {
                cb(state);
            });
        }
    });

// Load and create all accessories
    log.info('loading HomeKit to MQTT mapping file ' + config.mapfile);
    mapping = require(config.mapfile);
    accCount = 0;
    Object.keys(mapping).forEach(id => {
        const settings = mapping[id];
        const acc = newAccessory(settings);
        settings.id = id;

        if (!addService[settings.service]) {
            loadService(settings.service);
        }

        log.debug('adding service', settings.service, 'to accessory', settings.name);
        addService[settings.service](acc, settings);

        log.debug('addBridgedAccessory ' + settings.name);
        bridge.addBridgedAccessory(acc);
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
        mqttPub(config.name + '/connected', '2', {retain: true});
        log('hap Bridge listening on port', config.port);
    });

    bridge._server.on('pair', username => {
        log('hap paired', username);
    });

    /* istanbul ignore next */
    bridge._server.on('unpair', username => {
        log('hap unpaired', username);
    });

    /* istanbul ignore next */
    bridge._server.on('verify', () => {
        log('hap verify');
    });
}

let isStarted = false;

function start() {
    if (isStarted) {
        log.error('already started');
        return;
    }
    isStarted = true;
    log.debug('mqtt unsubscribe #');
    mqtt.unsubscribe('#');
    createBridge();
}

if (config.disableWeb) {
    createBridge();
} else {
    // Get all retained messages (used for autocomplete in web ui)
    log.debug('mqtt subscribe #');
    mqtt.subscribe('#');
    const topics = [];
    let retainTimeout = setTimeout(start, 1000);
    mqtt.on('message', (topic, payload, msg) => {
        if (isStarted) {
            return;
        }
        if (msg.retain) {
            clearTimeout(retainTimeout);
            retainTimeout = setTimeout(start, 1000);
        }
        if (topics.indexOf(topic) === -1 && topic !== config.name + '/connected') {
            topics.push(topic);
        }
    });

    app.listen(config.webPort, () => {
        log.info('http server listening on port', config.webPort);
    });

    app.use(basicAuth({
        users: {homekit: config.pincode},
        challenge: true,
        realm: 'homekit2mqtt ui'
    }));

    app.get('/', (req, res) => {
        res.redirect(301, '/ui');
    });
    app.use('/ui', express.static(path.join(__dirname, '/ui')));
    app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')));
    app.use('/services.json', express.static(path.join(__dirname, '/services.json')));

    app.get('/topics', (req, res) => {
        log.info('http > topics');
        res.send(JSON.stringify(topics));
    });

    app.get('/config', (req, res) => {
        log.info('http > config');
        res.send(JSON.stringify(mapping));
    });

    app.post('/config', bodyParser.json(), (req, res) => {
        log.info('http < config');
        mapping = req.body;
        fs.writeFileSync(config.mapfile, JSON.stringify(req.body, null, '  '));
        log.info('saved config to', config.mapfile);
        res.send('ok');
    });

    app.get('/quit', (req, res) => {
        log.info('http < quit');
        res.send('ok');
        process.exit(0);
    });
}
