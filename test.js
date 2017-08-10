#!/usr/bin/env node

require('should');

const cp = require('child_process');
const path = require('path');
const streamSplitter = require('stream-splitter');
const Mqtt = require('mqtt');

mqtt = Mqtt.connect('mqtt://127.0.0.1');

const config = require('./example-homekit2mqtt.json');

const homekitCmd = path.join(__dirname, '/index.js');

function randomHex() {
    return ('0' + Math.floor(Math.random() * 0xff)).slice(-2);
}

const homekitArgs = ['-v', 'debug', '-a', 'CC:22:3D:' + randomHex() + ':' + randomHex() + ':' + randomHex()];
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
        return mqttSubscriptions[topic] - 1;
    } else {
        mqttSubscriptions[topic] = [callback];
        mqtt.subscribe(topic);
        return 0;
    }
}
mqtt.on('message', (topic, payload) => {
    if (mqttSubscriptions[topic]) {
        mqttSubscriptions[topic].forEach((callback, index) => {
            callback(payload.toString());
        });
    }
});

function mqttUnsubscribe(topic, id) {
    mqttSubscriptions[topic].splice(id, 1);
}

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

let aid = {};
let iid = {};
/*
if (process.platform !== 'darwin' && process.env.TRAVIS) {
    describe('start dbus', function () {
        this.timeout(60000);
        it('should start dbus', done => {
            cp.exec('dbus-launch', (err, stdout, stderr) => {
		if (!err) {
                	setTimeout(done, 3000);
		} 
            });
        });
    });
}
*/

describe('hap-client - homekit2mqtt pairing', function () {
    this.timeout(180000);
    it('should pair without error', function (done) {
        this.timeout(180000);
        subscribe('homekit', /hap paired/, () => {
            setTimeout(function () {
                done();
            }, 3000);
        });

        console.log('--- trying to pair...');
        try {
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
        } catch (err) {
            console.log('...', err);
        }


    });
    
    
});

describe('hap-client - homekit2mqtt', function () {
    this.retries(3);
    it('should be able to dump accessories', function (done) {
        this.timeout(24000);
        this.retries(3);

        cp.exec(clientCmd + ' dump', {maxBuffer: 1024 * 2048}, (err, stdout, stderr) => {
            console.log(err, stderr);
            if (err) {
                done(err);
            }
            let clientAccs;
            try {
                clientAccs = JSON.parse(stdout).accessories;
            } catch (err) {
                done(err);
            }
            clientAccs.forEach(acc => {
                let name;
                let iidTmp = {};

                acc.services.forEach(service => {
                    service.characteristics.forEach(ch => {
                        iidTmp[String(ch.Name).replace(/ /g, '')] = ch.iid;
                        if (ch.Name === 'Name') {
                            name = ch.value
                        }
                    });

                });
                aid[name] = acc.aid;
                iid[name] = iidTmp;
            });

            // add one because the bridge itself is also an accessory
            if (clientAccs.length === (Object.keys(config).length + 1)) {
                done();
            } else {
                done(new Error('wrong clientAccs length'));
            }
        });
    });
});





describe('Fan', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Fan On true/, () => {
            done();
        });
        mqtt.publish('Fan/status', 'true');
    });
    it('client should get the status of the Fan', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Fan + ' --iid ' + iid.Fan.On, (err, stdout, stderr) => {
            if (stdout === 'true\n') {
                done();
            }
        });
    });


    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        let id = mqttSubscribe('Fan/set', payload => {
            if (payload === 'true') {
                mqttUnsubscribe('Fan/set', id);
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Fan + ' --iid ' + iid.Fan.On + ' 1';
        console.log(cmd);
        cp.exec(cmd);
    });

    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        mqttSubscribe('Fan/set', payload => {
            if (payload === 'false') {
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Fan + ' --iid ' + iid.Fan.On + ' 0';
        console.log(cmd);
        cp.exec(cmd);
    });

});

describe('Fan RotationSpeed', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Fan RotationSpeed 80/, () => {
            done();
        });
        mqtt.publish('Fan/status/RotationSpeed', '80');
    });
    it('client should get the status of the Fan', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Fan + ' --iid ' + iid.Fan.RotationSpeed, (err, stdout, stderr) => {
            if (stdout === '80\n') {
                done();
            }
        });
    });

    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        mqttSubscribe('Fan/set/RotationSpeed', payload => {
            if (payload === '20') {
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Fan + ' --iid ' + iid.Fan.RotationSpeed + ' 20';
        console.log(cmd);
        cp.exec(cmd);
    });
});

describe('Fan RotationDirection', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Fan RotationDirection 1/, () => {
            done();
        });
        mqtt.publish('Fan/status/RotationDirection', 'left');
    });
    it('client should get the status of the Fan', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Fan + ' --iid ' + iid.Fan.RotationDirection, (err, stdout, stderr) => {
            if (stdout === '1\n') {
                done();
            }
        });
    });

    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        mqttSubscribe('Fan/set/RotationDirection', payload => {
            if (payload === 'right') {
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Fan + ' --iid ' + iid.Fan.RotationDirection + ' 0';
        console.log(cmd);
        cp.exec(cmd);
    });
});


describe('Lightbulb', () => {


    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Lightbulb On true/, () => {
            done();
        });
        mqtt.publish('Lightbulb/status', '1');
    });
    it('client should get the status of the switch', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.On, (err, stdout, stderr) => {
            if (stdout === 'true\n') {
                done();
            }
        });
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Lightbulb On false/, () => {
            done();
        });
        mqtt.publish('Lightbulb/status', '0');
    });
    it('client should get the status of the switch', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.On, (err, stdout, stderr) => {
            if (stdout === 'false\n') {
                done();
            }
        });
    });


    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        let id = mqttSubscribe('Lightbulb/set', payload => {
            if (payload === '254') {
                mqttUnsubscribe('Lightbulb/set', id);
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.On + ' 1';
        console.log(cmd);
        cp.exec(cmd);
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Lightbulb On true/, () => {
            done();
        });
        mqtt.publish('Lightbulb/status', '254');
    });
    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        mqttSubscribe('Lightbulb/set', payload => {
            if (payload === '0') {
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.On + ' 0';
        console.log(cmd);
        cp.exec(cmd);
    });

});


describe('Lightbulb Brightness', () => {


    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Lightbulb Brightness 100/, () => {
            done();
        });
        mqtt.publish('Lightbulb/status/Brightness', '254');
    });
    it('client should get the status of the Lightbulb', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.Brightness, (err, stdout, stderr) => {
            if (stdout === '100\n') {
                done();
            }
        });
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Lightbulb Brightness 0/, () => {
            done();
        });
        mqtt.publish('Lightbulb/status/Brightness', '0');
    });
    it('client should get the status of the Lightbulb', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.Brightness, (err, stdout, stderr) => {
            if (stdout === '0\n') {
                done();
            }
        });
    });


    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        let id = mqttSubscribe('Lightbulb/set/Brightness', payload => {
            if (payload === '254') {
                mqttUnsubscribe('Lightbulb/set/Brightness', id);
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.Brightness + ' 100';
        console.log(cmd);
        cp.exec(cmd);
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Lightbulb Brightness 100/, () => {
            done();
        });
        mqtt.publish('Lightbulb/status/Brightness', '254');
    });
    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        mqttSubscribe('Lightbulb/set/Brightness', payload => {
            if (payload === '0') {
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.Brightness + ' 0';
        console.log(cmd);
        cp.exec(cmd);
    });

});

describe('Lightbulb Saturation', () => {


    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Lightbulb Saturation 100/, () => {
            done();
        });
        mqtt.publish('Lightbulb/status/Saturation', '254');
    });
    it('client should get the status of the Lightbulb', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.Saturation, (err, stdout, stderr) => {
            if (stdout === '100\n') {
                done();
            }
        });
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Lightbulb Saturation 0/, () => {
            done();
        });
        mqtt.publish('Lightbulb/status/Saturation', '0');
    });
    it('client should get the status of the Lightbulb', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.Saturation, (err, stdout, stderr) => {
            if (stdout === '0\n') {
                done();
            }
        });
    });


    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        let id = mqttSubscribe('Lightbulb/set/Saturation', payload => {
            if (payload === '254') {
                mqttUnsubscribe('Lightbulb/set/Saturation', id);
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.Saturation + ' 100';
        console.log(cmd);
        cp.exec(cmd);
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Lightbulb Saturation 100/, () => {
            done();
        });
        mqtt.publish('Lightbulb/status/Saturation', '254');
    });
    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        mqttSubscribe('Lightbulb/set/Saturation', payload => {
            if (payload === '0') {
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.Saturation + ' 0';
        console.log(cmd);
        cp.exec(cmd);
    });

});

describe('Lightbulb Hue', () => {


    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Lightbulb Hue 360/, () => {
            done();
        });
        mqtt.publish('Lightbulb/status/Hue', '65535');
    });
    it('client should get the status of the Lightbulb', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.Hue, (err, stdout, stderr) => {
            if (stdout === '360\n') {
                done();
            }
        });
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Lightbulb Hue 0/, () => {
            done();
        });
        mqtt.publish('Lightbulb/status/Hue', '0');
    });
    it('client should get the status of the Lightbulb', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.Hue, (err, stdout, stderr) => {
            if (stdout === '0\n') {
                done();
            }
        });
    });


    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        let id = mqttSubscribe('Lightbulb/set/Hue', payload => {
            if (payload === '65535') {
                mqttUnsubscribe('Lightbulb/set/Hue', id);
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.Hue + ' 360';
        console.log(cmd);
        cp.exec(cmd);
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Lightbulb Hue 360/, () => {
            done();
        });
        mqtt.publish('Lightbulb/status/Hue', '65535');
    });
    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        mqttSubscribe('Lightbulb/set/Hue', payload => {
            if (payload === '0') {
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Lightbulb + ' --iid ' + iid.Lightbulb.Hue + ' 0';
        console.log(cmd);
        cp.exec(cmd);
    });

});



describe('Switch', () => {
    it('should get the status of the switch', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Switch1 + ' --iid ' + iid.Switch1.On, (err, stdout, stderr) => {
            if (stdout === 'false\n') {
                done();
            }
        });
    });

    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Switch1 On true/, () => {
            done();
        });
        mqtt.publish('Switch/status', '1');
    });
    it('client should get the status of the switch', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Switch1 + ' --iid ' + iid.Switch1.On, (err, stdout, stderr) => {
            if (stdout === 'true\n') {
                done();
            }
        });
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Switch1 On false/, () => {
            done();
        });
        mqtt.publish('Switch/status', '0');
    });
    it('client should get the status of the switch', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Switch1 + ' --iid ' + iid.Switch1.On, (err, stdout, stderr) => {
            if (stdout === 'false\n') {
                done();
            }
        });
    });


    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        let id = mqttSubscribe('Switch/set', payload => {
            if (payload === '1') {
                mqttUnsubscribe('Switch/set', id);
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Switch1 + ' --iid ' + iid.Switch1.On + ' 1';
        console.log(cmd);
        cp.exec(cmd);
    });

    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        mqttSubscribe('Switch/set', payload => {
            if (payload === '0') {
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Switch1 + ' --iid ' + iid.Switch1.On + ' 0';
        console.log(cmd);
        cp.exec(cmd);
    });

});

describe('HumiditySensor', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update HumiditySensor CurrentRelativeHumidity 21/, () => {
            done();
        });
        mqtt.publish('HumiditySensor/status', '21');
    });
    it('client should get the temperature', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.HumiditySensor + ' --iid ' + iid.HumiditySensor.CurrentRelativeHumidity, (err, stdout, stderr) => {
            if (stdout === '21\n') {
                done();
            }
        });
    });
});

testLowBattery('HumiditySensor');

describe('TemperatureSensor', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update TemperatureSensor CurrentTemperature 21/, () => {
            done();
        });
        mqtt.publish('TemperatureSensor/Temperature', '21');
    });
    it('client should get the temperature', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.TemperatureSensor + ' --iid ' + iid.TemperatureSensor.CurrentTemperature, (err, stdout, stderr) => {
            if (stdout === '21\n') {
                done();
            }
        });
    });
});

testLowBattery('TemperatureSensor');

describe('TemperatureSensor Fahrenheit', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update TemperatureSensorF CurrentTemperature 20/, () => {
            done();
        });
        mqtt.publish('TemperatureSensorF/Temperature', '68');
    });
    it('client should get the temperature', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.TemperatureSensorF + ' --iid ' + iid.TemperatureSensorF.CurrentTemperature, (err, stdout, stderr) => {
            if (stdout === '20\n') {
                done();
            }
        });
    });
});

describe('ContactSensor ContactSensorState', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update ContactSensor ContactSensorState 1/, () => {
            done();
        });
        mqtt.publish('ContactSensor/status', '1');
    });
    it('client should get the status of the ContactSensor', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.ContactSensor + ' --iid ' + iid.ContactSensor.ContactSensorState, (err, stdout, stderr) => {
            if (stdout === '1\n') {
                done();
            }
        });
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update ContactSensor ContactSensorState 0/, () => {
            done();
        });
        mqtt.publish('ContactSensor/status', '0');
    });
    it('client should get the status of the ContactSensor', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.ContactSensor + ' --iid ' + iid.ContactSensor.ContactSensorState, (err, stdout, stderr) => {
            if (stdout === '0\n') {
                done();
            }
        });
    });
});

testLowBattery('ContactSensor');

describe('MotionSensor MotionSensorState', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update MotionSensor MotionDetected true/, () => {
            done();
        });
        mqtt.publish('MotionSensor/status', '1');
    });
    it('client should get the status of the MotionSensor', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.MotionSensor + ' --iid ' + iid.MotionSensor.MotionDetected, (err, stdout, stderr) => {
            if (stdout === 'true\n') {
                done();
            }
        });
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update MotionSensor MotionDetected false/, () => {
            done();
        });
        mqtt.publish('MotionSensor/status', '0');
    });
    it('client should get the status of the MotionSensor', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.MotionSensor + ' --iid ' + iid.MotionSensor.MotionDetected, (err, stdout, stderr) => {
            if (stdout === 'false\n') {
                done();
            }
        });
    });
});

testLowBattery('MotionSensor');

describe('OccupancySensor OccupancySensorState', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update OccupancySensor OccupancyDetected true/, () => {
            done();
        });
        mqtt.publish('OccupancySensor/status', '1');
    });
    it('client should get the status of the OccupancySensor', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.OccupancySensor + ' --iid ' + iid.OccupancySensor.OccupancyDetected, (err, stdout, stderr) => {
            if (stdout === 'true\n') {
                done();
            }
        });
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update OccupancySensor OccupancyDetected false/, () => {
            done();
        });
        mqtt.publish('OccupancySensor/status', '0');
    });
    it('client should get the status of the OccupancySensor', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.OccupancySensor + ' --iid ' + iid.OccupancySensor.OccupancyDetected, (err, stdout, stderr) => {
            if (stdout === 'false\n') {
                done();
            }
        });
    });
});

testLowBattery('OccupancySensor');

describe('SmokeSensor SmokeSensorState', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update SmokeSensor SmokeDetected 1/, () => {
            done();
        });
        mqtt.publish('SmokeSensor/status', '1');
    });
    it('client should get the status of the SmokeSensor', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.SmokeSensor + ' --iid ' + iid.SmokeSensor.SmokeDetected, (err, stdout, stderr) => {
            if (stdout === '1\n') {
                done();
            }
        });
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update SmokeSensor SmokeDetected 0/, () => {
            done();
        });
        mqtt.publish('SmokeSensor/status', '0');
    });
    it('client should get the status of the SmokeSensor', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.SmokeSensor + ' --iid ' + iid.SmokeSensor.SmokeDetected, (err, stdout, stderr) => {
            if (stdout === '0\n') {
                done();
            }
        });
    });
});

testLowBattery('SmokeSensor');

describe('CarbonMonoxideSensor CarbonMonoxideSensorState', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update CarbonMonoxideSensor CarbonMonoxideDetected 1/, () => {
            done();
        });
        mqtt.publish('CarbonMonoxideSensor/status', '1');
    });
    it('client should get the status of the CarbonMonoxideSensor', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.CarbonMonoxideSensor + ' --iid ' + iid.CarbonMonoxideSensor.CarbonMonoxideDetected, (err, stdout, stderr) => {
            if (stdout === '1\n') {
                done();
            }
        });
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update CarbonMonoxideSensor CarbonMonoxideDetected 0/, () => {
            done();
        });
        mqtt.publish('CarbonMonoxideSensor/status', '0');
    });
    it('client should get the status of the CarbonMonoxideSensor', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.CarbonMonoxideSensor + ' --iid ' + iid.CarbonMonoxideSensor.CarbonMonoxideDetected, (err, stdout, stderr) => {
            if (stdout === '0\n') {
                done();
            }
        });
    });
});

testLowBattery('CarbonMonoxideSensor');

describe('CarbonDioxideSensor CarbonDioxideSensorState', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update CarbonDioxideSensor CarbonDioxideDetected 1/, () => {
            done();
        });
        mqtt.publish('CarbonDioxideSensor/status', '1');
    });
    it('client should get the status of the CarbonDioxideSensor', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.CarbonDioxideSensor + ' --iid ' + iid.CarbonDioxideSensor.CarbonDioxideDetected, (err, stdout, stderr) => {
            if (stdout === '1\n') {
                done();
            }
        });
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update CarbonDioxideSensor CarbonDioxideDetected 0/, () => {
            done();
        });
        mqtt.publish('CarbonDioxideSensor/status', '0');
    });
    it('client should get the status of the CarbonDioxideSensor', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.CarbonDioxideSensor + ' --iid ' + iid.CarbonDioxideSensor.CarbonDioxideDetected, (err, stdout, stderr) => {
            if (stdout === '0\n') {
                done();
            }
        });
    });
});

testLowBattery('CarbonDioxideSensor');

describe('LeakSensor LeakSensorState', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update LeakSensor LeakDetected 1/, () => {
            done();
        });
        mqtt.publish('LeakSensor/status', '1');
    });
    it('client should get the status of the LeakSensor', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.LeakSensor + ' --iid ' + iid.LeakSensor.LeakDetected, (err, stdout, stderr) => {
            if (stdout === '1\n') {
                done();
            }
        });
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update LeakSensor LeakDetected 0/, () => {
            done();
        });
        mqtt.publish('LeakSensor/status', '0');
    });
    it('client should get the status of the LeakSensor', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.LeakSensor + ' --iid ' + iid.LeakSensor.LeakDetected, (err, stdout, stderr) => {
            if (stdout === '0\n') {
                done();
            }
        });
    });
});

testLowBattery('LeakSensor');


describe('Doorbell', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap set Doorbell ProgrammableSwitchEvent 1/, () => {
            done();
        });
        mqtt.publish('Doorbell/status', '1');
    });
});





describe('Outlet', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Outlet On true/, () => {
            done();
        });
        mqtt.publish('Outlet/status', '1');
    });
    it('client should get the status of the Outlet', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Outlet + ' --iid ' + iid.Outlet.On, (err, stdout, stderr) => {
            if (stdout === 'true\n') {
                done();
            }
        });
    });


    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        let id = mqttSubscribe('Outlet/set', payload => {
            if (payload === '1') {
                mqttUnsubscribe('Outlet/set', id);
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Outlet + ' --iid ' + iid.Outlet.On + ' 1';
        console.log(cmd);
        cp.exec(cmd);
    });

    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        mqttSubscribe('Outlet/set', payload => {
            if (payload === '0') {
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Outlet + ' --iid ' + iid.Outlet.On + ' 0';
        console.log(cmd);
        cp.exec(cmd);
    });

});

describe('Outlet OutletInUse', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Outlet OutletInUse true/, () => {
            done();
        });
        mqtt.publish('Outlet/status/OutletInUse', '1');
    });
    it('client should get the status of the Outlet', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Outlet + ' --iid ' + iid.Outlet.OutletInUse, (err, stdout, stderr) => {
            if (stdout === 'true\n') {
                done();
            }
        });
    });
});


describe('SecuritySystem CurrentState', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update SecuritySystem SecuritySystemCurrentState 1/, () => {
            done();
        });
        mqtt.publish('SecuritySystem/status/CurrentState', '1');
    });
    it('client should get the status of the SecuritySystem', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.SecuritySystem + ' --iid ' + iid.SecuritySystem.SecuritySystemCurrentState, (err, stdout, stderr) => {
            if (stdout === '1\n') {
                done();
            }
        });
    });

    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update SecuritySystem SecuritySystemCurrentState 0/, () => {
            done();
        });
        mqtt.publish('SecuritySystem/status/CurrentState', '0');
    });
    it('client should get the status of the SecuritySystem', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.SecuritySystem + ' --iid ' + iid.SecuritySystem.SecuritySystemCurrentState, (err, stdout, stderr) => {
            if (stdout === '0\n') {
                done();
            }
        });
    });

    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update SecuritySystem SecuritySystemCurrentState 4/, () => {
            done();
        });
        mqtt.publish('SecuritySystem/status/CurrentState', '4');
    });
    it('client should get the status of the SecuritySystem', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.SecuritySystem + ' --iid ' + iid.SecuritySystem.SecuritySystemCurrentState, (err, stdout, stderr) => {
            if (stdout === '4\n') {
                done();
            }
        });
    });

    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        mqttSubscribe('SecuritySystem/set/TargetState', payload => {
            if (payload === '2') {
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.SecuritySystem + ' --iid ' + iid.SecuritySystem.SecuritySystemTargetState + ' 2';
        console.log(cmd);
        cp.exec(cmd);
    });
});



describe('Speaker Mute', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Speaker Mute true/, () => {
            done();
        });
        mqtt.publish('Speaker/status/Mute', '1');
    });
    it('client should get the status of the Speaker', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Speaker + ' --iid ' + iid.Speaker.Mute, (err, stdout, stderr) => {
            if (stdout === 'true\n') {
                done();
            }
        });
    });
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Speaker Mute false/, () => {
            done();
        });
        mqtt.publish('Speaker/status/Mute', '0');
    });
    it('client should get the status of the Speaker', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Speaker + ' --iid ' + iid.Speaker.Mute, (err, stdout, stderr) => {
            if (stdout === 'false\n') {
                done();
            }
        });
    });
    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        mqttSubscribe('Speaker/set/Mute', payload => {
            if (payload === '0') {
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Speaker + ' --iid ' + iid.Speaker.Mute + ' 0';
        console.log(cmd);
        cp.exec(cmd);
    });
    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        mqttSubscribe('Speaker/set/Mute', payload => {
            if (payload === '1') {
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Speaker + ' --iid ' + iid.Speaker.Mute + ' 1';
        console.log(cmd);
        cp.exec(cmd);
    });
});



describe('Speaker Volume', () => {
    it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
        this.timeout(12000);
        subscribe('homekit', /hap update Speaker Volume 80/, () => {
            done();
        });
        mqtt.publish('Speaker/status/Volume', '80');
    });
    it('client should get the status of the Speaker', function (done) {
        this.timeout(12000);
        cp.exec(clientCmd + ' get --aid ' + aid.Speaker + ' --iid ' + iid.Speaker.Volume, (err, stdout, stderr) => {
            if (stdout === '80\n') {
                done();
            }
        });
    });

    it('homekit2mqtt should publish on mqtt after client did a set', function (done) {
        this.timeout(12000);
        mqttSubscribe('Speaker/set/Volume', payload => {
            if (payload === '20') {
                done();
            }
        });
        const cmd = clientCmd + ' set --aid ' + aid.Speaker + ' --iid ' + iid.Speaker.Volume + ' 20';
        console.log(cmd);
        cp.exec(cmd);
    });
});

function testLowBattery(name) {
    describe(name + ' StatusLowBattery', function () {
        it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
            this.timeout(12000);
            subscribe('homekit', new RegExp('hap update ' + name + ' StatusLowBattery 1'), () => {
                done();
            });
            mqtt.publish(name + '/status/LowBattery', '{"val":1}');
        });
        it('client should get the status of the ' + name, function (done) {
            this.timeout(12000);
            cp.exec(clientCmd + ' get --aid ' + aid[name] + ' --iid ' + iid[name].StatusLowBattery, (err, stdout, stderr) => {
                if (stdout === '1\n') {
                    done();
                }
            });
        });
        it('homekit2mqtt should receive a status via mqtt and update it on hap', function (done) {
            this.timeout(12000);
            subscribe('homekit', new RegExp('hap update ' + name + ' StatusLowBattery 0'), () => {
                done();
            });
            mqtt.publish(name + '/status/LowBattery', '{"val":0}');
        });
        it('client should get the status of the MotionSensor', function (done) {
            this.timeout(12000);
            cp.exec(clientCmd + ' get --aid ' + aid[name] + ' --iid ' + iid[name].StatusLowBattery, (err, stdout, stderr) => {
                if (stdout === '0\n') {
                    done();
                }
            });
        });
    });
}

setTimeout(() => {
    homekit.kill();
    process.exit(1);
}, 600000);
