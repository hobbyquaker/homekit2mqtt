#!/usr/bin/env node

require('should');

const cp = require('child_process');
const path = require('path');
const streamSplitter = require('stream-splitter');
const Mqtt = require('mqtt');
mqtt = Mqtt.connect('mqtt://127.0.0.1');

const homekitCmd = path.join(__dirname, '/index.js');
const homekitArgs = ['-v', 'debug'];
let homekit;
let homekitPipeOut;
let homekitPipeErr;
const homekitSubscriptions = {};
const homekitBuffer = [];

let subIndex = 0;

const mqttSubscriptions = {};
function mqttSubscribe(topic, callback) {
    if (mqttSubscriptions[topic]) {
        mqttSubscriptions[topic].push(callback);
    } else {
        mqttSubscriptions[topic] = [callback];
        mqtt.subscribe(topic);
    }
}
mqtt.on('message', (topic, payload) => {
    if (mqttSubscriptions[topic]) {
        mqttSubscriptions[topic].forEach(callback => {
            callback(payload.toString());
        });
    }
});

function subscribe(type, rx, cb) {
    subIndex += 1;
    if (type === 'sim') {
        simSubscriptions[subIndex] = {rx, cb};
    } else if (type === 'homekit') {
        homekitSubscriptions[subIndex] = {rx, cb};
    }
    matchSubscriptions(type);
    return subIndex;
}

function unsubscribe(type, subIndex) {
    if (type === 'sim') {
        delete simSubscriptions[subIndex];
    } else if (type === 'homekit') {
        delete homekitSubscriptions[subIndex];
    }
}

function matchSubscriptions(type, data) {
    let subs;
    let buf;
    if (type === 'sim') {
        subs = simSubscriptions;
        buf = simBuffer;
    } else if (type === 'homekit') {
        subs = homekitSubscriptions;
        buf = homekitBuffer;
    }
    if (data) {
        buf.push(data);
    }
    buf.forEach((line, index) => {
        Object.keys(subs).forEach(key => {
            const sub = subs[key];
            if (line.match(sub.rx)) {
                sub.cb(line);
                delete subs[key];
                buf.splice(index, 1);
            }
        });
    });
}

function startHomekit() {
    homekit = cp.spawn(homekitCmd, homekitArgs);
    homekitPipeOut = homekit.stdout.pipe(streamSplitter('\n'));
    homekitPipeErr = homekit.stderr.pipe(streamSplitter('\n'));
    homekitPipeOut.on('token', data => {
        console.log('homekit', data.toString());
        matchSubscriptions('homekit', data.toString());
    });
    homekitPipeErr.on('token', data => {
        console.log('homekit', data.toString());
        matchSubscriptions('homekit', data.toString());
    });
}

function end(code) {
    if (homekit.kill) {
        homekit.kill();
    }
    if (typeof code !== 'undefined') {
        process.exit(code);
    }
}

process.on('SIGINT', () => {
    end(1);
});

process.on('exit', () => {
    end();
});

describe('start homekit2mqtt', () => {
    it('should start without error', function (done) {
        this.timeout(20000);
        subscribe('homekit', /homekit2mqtt [0-9.]+ starting/, () => {
            done();
        });
        startHomekit();
    });
    it('should create accessories', function (done) {
        subscribe('homekit', /hap created [0-9]+ Accessories/, () => {
            done();
        });
    });
    it('should announce the bridge', function (done) {
        subscribe('homekit', /hap publishing bridge/, () => {
            done();
        });
    });
    it('should listen on port 51826', function (done) {
        subscribe('homekit', /hap Bridge listening on port 51826/, () => {
            done();
        });
    });
});

describe('homekit2mqtt - mqtt connection', () => {
    it('homekit2mqtt should connect to the mqtt broker', function (done) {
        this.timeout(12000);
        subscribe('homekit', /mqtt connected/, () => {
            done();
        });
    });
    it('should publish connected=2 on mqtt', function (done) {
        mqttSubscribe('homekit/connected', function (payload) {
            if (payload === '2') {
                done();
            }
        });
    });
});


describe('homekit2mqtt - mqtt operations', () => {
    it('should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Steckdose Fernseher On true/, () => {
            done();
        });
        mqtt.publish('Switch/status', '1');
    });
});

setTimeout(() => {
    homekit.kill();
    process.exit(1);
}, 30000);
