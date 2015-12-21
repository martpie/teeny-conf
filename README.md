# teeny-conf
A small npm package to handle one or multiple config files in Node apps. Works fine with Electron and NW.js.

API asynchronous or synchronous, depending of your needs.

## Why another ?

I didn't find what I wanted on npm, I was needing a conf I could put in a variable, so I could export it without any problem to another scope.

## Example

config.js:
``` javascript
var teenyconf = require('teeny-conf');

var config = teenyconf.loadOrCreate('config.json', {});

module.exports = config;
```

main.js
``` javascript
var config = require('./config.js');
// now you can use config.set(), config.get(), etc...
```

## API

All operations are synchronous to avoid multiple successive save conflicts. An async mode may come in the future if people ask for it.

### teenyconf.loadOrCreate(pathToFile, defaultConfig, callback)

load a config file or create it if it does not exist. If `pathToFile` does not exist, a file will be created with the wanted name, and `defaultConfig` in.

### teenyconf.loadOrCreateSync(pathToFile, defaultConfig)

synchronous `loadOrCreate`.

### teenyconf.getAll()

get the whole conf

### teenyconf.get(key)

get `key`

### teenyconf.set(key, value)

set `key` to `value`

### teenyconf.save(callback)

save config file

### teenyconf.saveSync()

save config file synchronously
