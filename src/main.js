var fs = require('fs');

var tinyconf = {

    metas: {
        path: 'config.json'
    },

    conf: {},

    loadOrCreate: function(pathToFile, defaultConfig, callback) {

        var self = this;

        try {
            if(!fs.existsSync(pathToFile)) {
                // Load the file
                self.metas.path = 'pathToFile';
                self.conf = defaultConfig;
                self.saveSync();
                callback();
                return self;

            } else {

                fs.readFile(pathToFile, function(err, data) {
                    if(err) throw err;

                    // Check if json is valid
                    try {
                        JSON.parse(data);
                    }
                    catch(err) {
                        throw 'Error parsing JSON: ' + err;
                    }

                    self.metas.path = pathToFile;
                    self.conf = JSON.parse(data);
                    callback();
                    return self;
                })
            }
        }
        catch(err) {
            console.error(err);
        }
    },

    loadOrCreateSync(pathToFile, defaultConfig) {

        var self = this;

        try {
            if(!fs.existsSync(pathToFile)) {
                // Load the file
                self.metas.path = pathToFile;
                self.conf = defaultConfig;
                self.saveSync();
                return self;

            } else {

                var data = fs.readFileSync(pathToFile);

                // Check if json is valid
                try {
                    JSON.parse(data);
                }
                catch(err) {
                    throw 'Error parsing JSON: ' + err;
                }

                self.metas.path = pathToFile;
                self.conf = JSON.parse(data);
                return self;
            }
        }
        catch(err) {
            console.error(err);
        }
    },

    get: function(key) {

        return this.conf[key];
    },

    getAll: function() {

        return this.conf;
    },

    set: function(key, value) {

        this.conf[key] = value;
    },

    save: function(callback) {

        var self = this;

        try {
            fs.writeFile(self.metas.path, JSON.stringify(self.conf), function(err) {
                if(err) throw err;
                callback();
            });
        }
        catch(err) {
            console.error(err);
        }
    },

    saveSync: function() {
        var self = this;

        try {

            fs.writeFileSync(self.metas.path, JSON.stringify(self.conf));
        }
        catch(err) {
            console.error(err);
        }
    }
}

module.exports = tinyconf;
