const fs = require('fs');
const changelog = require('changelog');

changelog.generate('homekit2mqtt', 'all')
    .then(data => {

        console.log('?!?')

        data.versions.forEach(v => {

            if (v.changes) {
                const changes = [];

                v.changes.forEach(change => {
                    //console.log(change);
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
                        console.log('exclude', change.message)
                    } else {
                        changes.push(change);
                    }


                });

                v.changes = changes;
            }



        });


        fs.writeFileSync(__dirname + '/../CHANGELOG.md', changelog.markdown(data));
    });