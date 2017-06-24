#!/usr/bin/env node

require('should');

const cp = require('child_process');
const path = require('path');
const streamSplitter = require('stream-splitter');
const Mqtt = require('mqtt');

mqtt = Mqtt.connect('mqtt://127.0.0.1');

const config = require('./example-homekit2mqtt.json');

const homekitCmd = path.join(__dirname, '/index.js');
const homekitArgs = ['-v', 'debug'];
let homekit;
let homekitPipeOut;
let homekitPipeErr;
const homekitSubscriptions = {};
const homekitBuffer = [];

let subIndex = 0;

const clientCmd = path.join(__dirname, '/node_modules/.bin/hap-client-tool -d 127.0.0.1 -p 51826');
let clientAccs;


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

let aidSwitch;
let iidSwitch;

describe('start dbus', function () {
    this.timeout(60000);
    it('should start dbus', done => {
        cp.exec('dbus-launch', (err, stdout, stderr) => {
            console.log('dbus err', err);
            console.log('dbus stdout', stdout);
            console.log('dbus stderr', stderr);
            setTimeout(done, 3000);
        });
    });
});

describe('hap-client - homekit2mqtt connection', function () {
    this.timeout(180000);
    it('should pair without error', function (done)  {
        console.log('--- setting timeout to 60000');
        this.timeout(180000);
        console.log('--- subscribing...');
        subscribe('homekit', /hap paired/, () => {
            setTimeout(function () {
                done();
            }, 3000);
        });


        console.log('--- trying to pair...');
        var pair = cp.spawn(path.join(__dirname, '/node_modules/.bin/hap-client-tool'), ['-d', '127.0.0.1', '-p', '51826', 'pair']);

        pair.on('close', (code) => {
            console.log(`--- pair close - child process exited with code ${code}`);
        });
        pair.on('exit', (code) => {
            console.log(`--- pair exit- child process exited with code ${code}`);
        });
        pair.on('error', (err) => {
            console.log('--- pair error - Failed to start child process.', err);
        });
        pair.stdout.on('data', data => {
            data = data.toString();
            console.log('pair stdout', data);
            if (data.match(/pin code/)) {
                console.log('--- writing pin to stdin');
                pair.stdin.write('031-45-154\n');
                pair.stdin.write('\n');
            }
        });
        pair.stderr.on('data', data => {
            console.log('pair stderr', data.toString());
        });


        /*
        var pairPipeOut = pair.stdout.pipe(streamSplitter('\n'));
        var pairPipeErr = pair.stderr.pipe(streamSplitter('\n'));
        pairPipeOut.on('token', data => {
            console.log('pair', data.toString());
        });

        pairPipeErr.on('token', data => {
            console.log('pair', data.toString());
        });

        cp.exec('echo "031-45-154" | ' + clientCmd + ' pair', (err, stdout, stderr) => {
            console.log('client err', err);
            console.log('client stdout', stdout);
            console.log('client stderr', stderr);

        });
        */
    });
    it('should be able to dump accessories', (done) => {
        cp.exec(clientCmd + ' dump', (err, stdout, stderr) => {
            var clientAccs = JSON.parse(stdout).accessories;

            clientAccs.forEach(acc => {
                acc.services.forEach(service => {
                    if (service.Name === 'Switch') {
                        aidSwitch = acc.aid;
                        service.characteristics.forEach(ch => {
                            if (ch.Name === 'On') {
                                iidSwitch = ch.iid;

                            }
                        });

                    }
                });
            });
            // add one because the bridge itself is also an accessory
            if (clientAccs.length === (Object.keys(config).length + 1)) {
                done();
            }
        });
    });
    it('should get the status of the switch', (done) => {
        cp.exec(clientCmd + ' get --aid ' + aidSwitch + ' --iid ' + iidSwitch, (err, stdout, stderr) => {
            if (stdout === 'false\n') {
                done();
            }
        });
    });
});

describe('mqtt - homekit2mqtt - client', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Steckdose Fernseher On true/, () => {
            done();

        });
        mqtt.publish('Switch/status', '1');
    });
    it('client should get the status of the switch', (done) => {
        cp.exec(clientCmd + ' get --aid ' + aidSwitch + ' --iid ' + iidSwitch, (err, stdout, stderr) => {
            if (stdout === 'true\n') {
                done();
            }
        });
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Steckdose Fernseher On false/, () => {
            done();

        });
        mqtt.publish('Switch/status', '0');
    });
    it('client should get the status of the switch', (done) => {
        cp.exec(clientCmd + ' get --aid ' + aidSwitch + ' --iid ' + iidSwitch, (err, stdout, stderr) => {
            if (stdout === 'false\n') {
                done();
            }
        });
    });
});

describe('client - homekit2mqtt - mqtt', () => {
    it('homekit2mqtt should publish on mqtt after client did a set', (done) => {
        mqttSubscribe('Switch/set', payload => {
            if (payload === '1') {
                done();
            }
        });
        cp.exec(clientCmd + ' set --aid ' + aidSwitch + ' --iid ' + iidSwitch + ' true');

    });
});

setTimeout(() => {
    homekit.kill();
    process.exit(1);
}, 30000);
