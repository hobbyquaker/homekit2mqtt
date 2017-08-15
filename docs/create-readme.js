const fs = require('fs');
const path = require('path');

const header = fs.readFileSync(path.join(__dirname, '/README.header.md'));
const footer = fs.readFileSync(path.join(__dirname, '/README.footer.md'));

const services = require(path.join(__dirname, '/../services.json'));

let output = '';

Object.keys(services).forEach(s => {
    output += '#### ' + s + '\n\ntopic\n\n';
    services[s].topic.forEach(t => {
        output += '* ' + t.name;
        if (t.optional) {
            output += ' (optional)';
        }
        if (t.desc) {
            output += '    \n  ' + t.desc;
        }
        output += '\n';
    });
    output += '\n';

    output += 'payload\n\n';
    services[s].payload.forEach(p => {
        output += '* ' + p.name;
        if (p.optional) {
            output += ' (optional';
        }
        if (p.default) {
            output += ', default: `' + p.default + '`)';
        } else if (p.optional) {
            output += ')';
        }
        if (p.desc) {
            output += '    \n  ' + p.desc;
        }
        output += '\n';
    });
    output += '\n';
});

fs.writeFileSync(path.join(__dirname, '/../README.md'), [header, output, footer].join('\n'));
