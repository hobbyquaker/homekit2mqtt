var pkg = require('./package.json');
var config = require('yargs')
    .usage(pkg.name + ' ' + pkg.version + '\n' + pkg.description + '\n\nUsage: $0 [options]')
    .describe('v', 'possible values: "error", "warn", "info", "debug"')
    .describe('m', 'JSON file containing HomeKit Services to MQTT mapping definitions. See Readme.')
    .describe('n', 'instance name. used as mqtt client id and as prefix for connected topic')
    .describe('u', 'mqtt broker url. See https://github.com/mqttjs/MQTT.js#connect-using-a-url')
    .describe('h', 'show help')
    .alias({
        'h': 'help',
        'n': 'name',
        'm': 'mapfile',
        'u': 'url',
        'v': 'verbosity'
    })
    .default({
        'u': 'mqtt://127.0.0.1',
        'n': 'name',
        'm': '/opt/mqtt-smarthome/homekit2mqtt.json',
        'v': 'info'
    })
    //.config('config')
    .version(pkg.name + ' ' + pkg.version + '\n', 'version')
    .help('help')
    .argv;

module.exports = config;