#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Mqtt = require('mqtt');
const chalk = require('chalk');
const qrcode = require('qrcode-terminal');
const nextport = require('nextport');
const oe = require('obj-ease');
const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');

const app = express();

const log = require('yalm');
const HAP = require('hap-nodejs');
const pkgHap = require('hap-nodejs/package.json');
const pkg = require('./package.json');
const config = require('./config.js');

log.setLevel(config.verbosity);

log(pkg.name + ' ' + pkg.version + ' starting');
process.title = pkg.name;

const mqttStatusRaw = {}; // Holds the payloads of the last-received message, keys are the topics.

function mqttStatus(topic, attr) { // Holds the payloads of the last-received message, keys are the topics.
    if (attr && typeof mqttStatusRaw[topic] === 'object') {
        return oe.getProp(mqttStatusRaw[topic], attr);
    }
    return mqttStatus[topic];
}

const mqttCallbacks = {}; // Holds arrays of subscription callbacks, keys are the topics.
let mqttConnected;

let bridgeListening;
const topics = [];

log.info('mqtt trying to connect', config.url);
const mqtt = Mqtt.connect(config.url, {
    will: {topic: config.name + '/connected', payload: '0', retain: true},
    rejectUnauthorized: !config.insecure
});

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
function mqttSub(topic, /* string, optional, default "val" */ attr, callback) {
    topic = String(topic);
    /* istanbul ignore next */
    if (topic === '') {
        log.error('trying to subscribe empty topic');
        return;
    }
    /* istanbul ignore if */
    if (typeof attr === 'function') {
        callback = attr;
        attr = 'val';
    } else if (attr) {
        attr = String(attr);
    } else {
        attr = 'val';
    }
    /* istanbul ignore else */
    if (typeof callback === 'function') {
        /* istanbul ignore if */
        if (mqttCallbacks[topic]) {
            mqttCallbacks[topic].push({attr, callback});
        } else {
            mqttCallbacks[topic] = [{attr, callback}];
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
        /* istanbul ignore if */
        } else if (typeof payload === 'undefined') {
            payload = '';
        } else if (typeof payload !== 'string') {
            payload = String(payload);
        }
        log.debug('> mqtt', topic, payload);
        /* istanbul ignore else */
        if (config.retain) {
            if (!options) {
                options = {};
            }
            options.retain = true;
        }
        mqtt.publish(topic, payload, options, err => {
            /* istanbul ignore next */
            if (err) {
                log.error('mqtt publish error ' + err);
            }
        });
    }
}

log.info('using hap-nodejs version', pkgHap.version);

const {uuid, Bridge, Accessory, Service, Characteristic} = HAP;

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
    if (settings.topicIdentify) {
        log.debug('> mqtt', settings.topicIdentify, settings.payloadIdentify);
        mqttPub(settings.topicIdentify, settings.payloadIdentify);
    }
    callback();
}

function mac(data) {
    const sha1sum = crypto.createHash('sha1');
    sha1sum.update(data);
    const s = sha1sum.digest('hex');
    let i = -1;
    return 'xx:xx:xx:xx:xx:xx'.replace(/[x]/g, () => {
        i += 1;
        return s[i];
    }).toUpperCase();
}

function newAccessory(settings) {
    log.debug('creating new accessory', '"' + settings.name + '"', '"' + settings.id + '"', uuid.generate(settings.id));
    const acc = new Accessory(settings.name, uuid.generate(settings.id), settings.category);
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
    const file = 'services/' + service + '.js';
    log.debug('loading', file);
    addService[service] = require(path.join(__dirname, file))({mqttPub, mqttSub, mqttStatus, log, Service, Characteristic, HAP});
}

let mapping;
let accCount;

/* Convert old config file schema to keep compatiblity */
/* istanbul ignore next */
function convertMapping() {
    let isConverted;
    Object.keys(mapping).forEach(id => {
        const accConfig = mapping[id];

        if (!accConfig.services) {
            accConfig.services = [];
            isConverted = true;
        }

        if (accConfig.topic && accConfig.topic.identify) {
            accConfig.topicIdentify = accConfig.topic.identify;
            delete accConfig.topic.identify;
            isConverted = true;
        }

        if (accConfig.payload && accConfig.payload.identify) {
            accConfig.payloadIdentify = accConfig.payload.identify;
            delete accConfig.payload.identify;
            isConverted = true;
        }

        if (accConfig.service) {
            accConfig.services.unshift({
                name: accConfig.name,
                service: accConfig.service,
                topic: accConfig.topic || {},
                payload: accConfig.payload || {},
                config: accConfig.config || {},
                props: accConfig.props || {}
            });
            delete accConfig.service;
            delete accConfig.topic;
            delete accConfig.payload;
            delete accConfig.config;
            delete accConfig.props;
            isConverted = true;
        }
    });
    if (isConverted) {
        log.info('mapping file converted');
        saveMapping();
    }
}

function createBridge() {
    mqtt.on('message', (topic, payload) => {
        payload = payload.toString();
        let json;
        if (payload.indexOf('{') !== -1 && !config.disableJsonParse) {
            try {
                json = JSON.parse(payload);
            } catch (err) {}
        }
        const state = typeGuess(payload);
        log.debug('< mqtt', topic, state, payload);

        mqttStatusRaw[topic] = json || state;
        mqttStatus[topic] = (json && typeof json.val !== 'undefined') ? json.val : state;

        /* istanbul ignore else */
        if (mqttCallbacks[topic]) {
            mqttCallbacks[topic].forEach(obj => {
                const {attr, callback} = obj;
                /* istanbul ignore else */
                if (typeof callback === 'function') {
                    if (attr) {
                        callback(json ? oe.getProp(json, attr) : state);
                    } else {
                        callback(state);
                    }
                }
            });
        }
        // Topics array Used for autocomplete in web ui)
        if (topics.indexOf(topic) === -1 && topic !== (config.name + '/connected')) {
            topics.push(topic);
        }
    });

    // Load and create all accessories
    log.info('loading HomeKit to MQTT mapping file ' + config.mapfile);
    mapping = JSON.parse(fs.readFileSync(config.mapfile));
    convertMapping();
    accCount = 0;
    let accCountBridged = 0;
    Object.keys(mapping).forEach(id => {
        const accConfig = mapping[id];
        accConfig.id = id;
        const acc = newAccessory(accConfig);

        let cam = false;
        const camName = accConfig.name;
        accConfig.services.forEach((s, i) => {
            if (s.service === 'CameraRTSPStreamManagement') {
                cam = true;
            }
            if (!addService[s.service]) {
                loadService(s.service);
            }
            if (!s.json) {
                s.json = {};
            }
            log.debug('adding service', s.service, 'to accessory', accConfig.name);
            addService[s.service](acc, s, String(i));
        });

        if (cam) {
            nextport(config.port, port => {
                const username = mac(acc.UUID);
                log.debug('hap publishing camera accessory ' + accConfig.name);
                acc.publish({
                    username,
                    port,
                    pincode: config.c,
                    category: Accessory.Categories.CAMERA
                });

                log.debug('hap publishing camera accessory "' + camName + '" username=' + username, 'port=' + port,
                    'pincode=' + config.c, 'setupURI=' + acc.setupURI());
                acc._server.on('listening', () => {
                    bridgeListening = true;
                    mqttPub(config.name + '/connected', '2', {retain: true});
                    log('hap camera', camName, 'listening on port', port);

                    console.log('  \nScan this code with your HomeKit app on your iOS device to pair with', camName);
                    qrcode.generate(acc.setupURI());
                    console.log('  ');
                });

                acc._server.on('pair', username => {
                    log('hap camera', camName, 'paired', username);
                });

                /* istanbul ignore next */
                acc._server.on('unpair', username => {
                    log('hap camera', camName, 'unpaired', username);
                });

                /* istanbul ignore next */
                acc._server.on('verify', () => {
                    log('hap camera', camName, 'verify');
                });
            });
            accCount++;
        } else {
            log.debug('addBridgedAccessory ' + accConfig.name);
            bridge.addBridgedAccessory(acc);
            accCountBridged++;
        }
    });
    log.info('hap created', accCount, 'Camera Accessories and', accCountBridged, 'Bridged Accessories.');

    bridge.publish({
        username: config.username,
        port: config.port,
        pincode: config.c,
        category: Accessory.Categories.OTHER
    });
    log.debug('hap publishing bridge "' + config.bridgename + '" username=' + config.username, 'port=' + config.port,
        'pincode=' + config.c, 'setupURI=' + bridge.setupURI());

    bridge._server.on('listening', () => {
        bridgeListening = true;
        mqttPub(config.name + '/connected', '2', {retain: true});
        log('hap Bridge listening on port', config.port);

        console.log('\nScan this code with your HomeKit app on your iOS device to pair with the bridge');
        qrcode.generate(bridge.setupURI());
        console.log('Or enter this code with your HomeKit app on your iOS device to pair with homekit2mqtt:');
        console.log(chalk.black.bgWhite('                       '));
        console.log(chalk.black.bgWhite('    ┌────────────┐     '));
        console.log(chalk.black.bgWhite('    │ ' + config.pincode + ' │     '));
        console.log(chalk.black.bgWhite('    └────────────┘     '));
        console.log(chalk.black.bgWhite('                       '));
        console.log('');
    });

    bridge._server.on('pair', username => {
        log('hap bridge paired', username);
    });

    /* istanbul ignore next */
    bridge._server.on('unpair', username => {
        log('hap bridge unpaired', username);
    });

    /* istanbul ignore next */
    bridge._server.on('verify', () => {
        log('hap bridge verify');
    });
}

function saveMapping() {
    fs.writeFileSync(config.mapfile, JSON.stringify(mapping, null, '  '));
    log.info('saved config to', config.mapfile);
}

let isStarted = false;

function start() {
    /* istanbul ignore if */
    if (isStarted) {
        log.error('already started');
        return;
    }
    isStarted = true;
    log.debug('mqtt unsubscribe #');
    mqtt.unsubscribe('#');
    createBridge();
}

/* istanbul ignore if */
if (config.disableWeb) {
    createBridge();
} else {
    // Get all retained messages (used for autocomplete in web ui)
    log.debug('mqtt subscribe #');
    mqtt.subscribe('#');
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
    app.use('/services.json', express.static(path.join(__dirname, '/services.json')));

    module.paths.forEach(folder => {
        app.use('/node_modules', express.static(folder));
    });

    app.get('/topics', (req, res) => {
        log.info('http > topics');
        res.send(JSON.stringify(topics));
    });

    app.get('/categories', (req, res) => {
        log.info('http > categories');
        res.send(JSON.stringify(HAP.Accessory.Categories));
    });

    app.get('/config', (req, res) => {
        log.info('http > config');
        res.send(JSON.stringify(mapping));
    });

    app.post('/config', bodyParser.json(), (req, res) => {
        log.info('http < config');
        mapping = req.body;
        saveMapping();
        res.send('ok');
    });

    app.get('/quit', (req, res) => {
        log.info('http < quit');
        res.send('ok');
        setTimeout(() => {
            process.exit(0);
        }, 250);
    });
}
