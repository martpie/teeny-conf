# teeny-conf
A small npm package to handle one or multiple config files in Node apps. Works fine with Electron and NW.js.

API asynchronous or synchronous, depending of your needs.

## Why another ?

I didn't find what I wanted on npm, I was needing a conf I could put in a variable, so I could export it without any problem to another scope.

## Example

### Basic

config.js:
``` javascript
import teeny = from 'teeny-conf';

const config = new teeny('config.json'));
config.loadOrCreateSync();
```

### with an export

config.js:
``` javascript
const teeny = require('teeny-conf');

const  config = new teeny('config.json'));
config.loadOrCreateSync();

export default config;
```

main.js
``` javascript
import config from './config.js';
// now you can use config.set(), config.get(), etc...
```

## API

Most of the operations have two versions: a synchronous and an asynchronous one, depending of your needs.

### Constructor

`new teeny(configPath)`

#### Params

`configPath`: the filename where you want your config / your config already is.

### teenyconf.loadOrCreate(defaultConfig, callback)

load a config file or create it if it does not exist. If `pathToFile` does not exist, a file will be created with the wanted name passed in the constructor, and `defaultConfig` in. If `defaultConfig` is not defined, this will be an empty object.

### teenyconf.loadOrCreateSync(defaultConfig)

synchronous `loadOrCreate`.

### teenyconf.getAll()

get the whole conf

### teenyconf.get(key)

get `key` in your config. Please note this does not support sublevel-keys yet.

### teenyconf.set(key, value)

set `key` to `value`

### teenyconf.delete(key)

delete `key`

### teenyconf.save(minify, callback)

save config file with `callback`. `minify` is optional and let you minify the json output.

### teenyconf.saveSync(minify)

save config file synchronously. `minify` is optional and let you minify the json output.
