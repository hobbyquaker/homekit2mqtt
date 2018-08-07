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
        const outputArr = []
        output += '* ' + p.name;
        if (p.optional) {
            outputArr.push('optional');
        }
        if (typeof p.default !== 'undefined') {
            outputArr.push('default: `' + p.default + '`');
        }
        if (outputArr.length > 0) {
            output += ' (' + outputArr.join(', ') + ')';
         }
        if (p.desc) {
            output += '    \n  ' + p.desc;
        }
        output += '\n';
    });

    output += '\n';

    if (services[s].config) {
        output += 'config\n\n';
        services[s].config.forEach(c => {
            output += '* ' + c.name + ' ';
            if (c.optional) {
                output += '(optional';
            }
            if (c.default) {
                output += ', default: `' + c.default + '`)';
            } else if (c.optional) {
                output += ')';
            }
            if (c.enum) {
                output += '    \n  ';
                c.enum.forEach((o, i) => {
                    output += (i > 0 ? ', ' : '') + i + ' = ' + o;
                });
            }
            if (c.desc) {
                output += '    \n  ' + c.desc;
            }
            output += '\n';
        });
        output += '\n';
    }

    output += '\n';
});

fs.writeFileSync(path.join(__dirname, '/../README.md'), [header, output, footer].join('\n'));
