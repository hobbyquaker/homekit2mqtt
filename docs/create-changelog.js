const fs = require('fs');
const path = require('path');
const changelog = require('changelog');

changelog.generate('homekit2mqtt', 'all')
    .then(data => {
        data.versions.forEach(v => {
            if (v.changes) {
                const changes = [];

                v.changes.forEach(change => {
                    // Console.log(change);
                    let exclude = false;

                    if (change.message.match(/lint/i)) {
                        exclude = true;
                    } else if (change.message.match(/bump version/i)) {
                        exclude = true;
                    } else if (change.message.match(/update readme/i)) {
                        exclude = true;
                    } else if (change.message.match(/Merge branch/i)) {
                        exclude = true;
                    } else if (change.message.match(/add contributor/i)) {
                        exclude = true;
                    }

                    if (exclude) {
                        console.log('exclude', change.message);
                    } else {
                        changes.push(change);
                    }
                });

                v.changes = changes;
            }
        });

        fs.writeFileSync(path.join(__dirname, '..', 'CHANGELOG.md'), changelog.markdown(data));
    });
