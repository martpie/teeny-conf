var fs = require('fs');

var teenyconf = function(configPath) {

    var _metas = {
        configPath: configPath || 'config.json'
    };

    var _conf = {};

    this.loadOrCreate = function(defaultConfig, callback) {

        var self = this;
        defaultConfig = defaultConfig || {};

        try {
            if(!fs.existsSync(_metas.configPath)) {
                // Load the file
                _conf = defaultConfig;
                self.saveSync();
                callback();

            } else {

                fs.readFile(_metas.configPath, function(err, data) {

                    if(err) throw err;

                    // Check if json is valid
                    try {
                        _conf = JSON.parse(data);
                        callback();
                    }
                    catch(err) {
                        throw 'Error reading ' + _metas.configPath + ': ' + err;
                    }
                });
            }
        }
        catch(err) {
            console.error(err);
        }
    },

    this.loadOrCreateSync = function(defaultConfig) {

        var self = this;
        defaultConfig = defaultConfig || {};

        try {
            if(!fs.existsSync(_metas.configPath)) {
                // Load the file
                _conf = defaultConfig;
                self.saveSync();

            } else {

                var data = fs.readFileSync(_metas.configPath);

                // Check if json is valid
                try {
                    _conf = JSON.parse(data);
                }
                catch(err) {
                    throw 'Error reading ' + _metas.configPath + ': ' + err;
                }
            }
        }
        catch(err) {
            console.error(err);
        }
    },

    this.get = function(key) {

        return _conf[key];
    },

    this.getAll = function() {

        return _conf;
    },

    this.set = function(key, value) {

        _conf[key] = value;
    },

    this.delete = function(key) {

        delete _conf[key];
    },

    this.save = function(minify, callback) {

        minify = minify || false;
        var self = this;
        var output = minify ? JSON.stringify(_conf) : JSON.stringify(_conf, null, ' ');

        try {
            fs.writeFile(_metas.configPath, output, function(err) {
                if(err) throw err;
                else callback();
            });
        }
        catch(err) {
            console.error(err);
        }
    },

    this.saveSync = function(minify) {

        minify = minify || false;
        var self = this;
        var output = minify ? JSON.stringify(_conf) : JSON.stringify(_conf, null, ' ');

        try {
            fs.writeFileSync(_metas.configPath, output);
        }
        catch(err) {
            console.error(err);
        }
    }
}

module.exports = teenyconf;
