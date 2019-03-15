# teeny-conf

[![Build Status](https://img.shields.io/circleci/project/github/martpie/teeny-conf.svg)](https://circleci.com/gh/martpie/teeny-conf)
[![Dependencies](https://david-dm.org/martpie/teeny-conf.svg)](https://github.com/martpie/teeny-conf)

A small npm package to handle one or multiple config files in Node apps. Works well with Electron and NW.js.

All I/O operations are synchronous and write operation are atomic to avoid files corruption.

Saving and reloading are manual, in case you have to handle large files and avoid useless I/O operations.

## Why another ?

I didn't find what I wanted on npm, I was needing a conf I could put in a variable, so I could export it without any problem to another scope.

## Installation

``` bash
npm install teeny-conf
```

## Usage

### Basic

config.js:
``` javascript
import teeny from 'teeny-conf';

const config = new teeny('config.json'));

conf.set('language', 'en');
conf.save(); // Save is a manual operation
```
### Nested keys

config.js:
``` javascript
import teeny from 'teeny-conf';

const config = new teeny('config.json', {
  some: {
    nested: {
      property: 42
    }
  }
}));

conf.get('some.nested.property'); // -> 42
```

### Using an export

config.js:
``` javascript
import teeny from 'teeny-conf';

const config = new teeny('config.json'));

export default config;
```

main.js
``` javascript
import config from './config.js';
// now you can use config.set(), config.get(), etc...
```


## API

All `key` in the docs refer to a usual key or a nested key.


### Constructor

`new teeny(configPath[, defaultConfig])`

#### Params

`configPath` String<br />
the filename where you want your config / your config already is. If the directory/file does not exist, it will be created automatically.

`defaultConfig` Object<br />
the default configuration to use if the config file does not already exists.

#### Return value

A `teeny` object.


### `teenyconf.get([key])`

Get the `key` value in your config. If no `key` is specified, returns the whole conf.<br />
Please note `set` does not support sub-keys yet.

#### Params

`key` String (optional)<br/>
name of the key

#### Return value

`any`


### `teenyconf.set(key, value)`

Set `key` to `value`.

#### Params

`key` String<br />
name of the key

`value` any<br />
the new value for this key


### `teenyconf.has(key)`

Check if a key exists in the conf.

#### Params

`key` String<br />
name of the key

#### Return value

`Boolean`


### `teenyconf.delete(key)`

Delete `key`.

#### Params

`key` String<br />
name of the key


### `teenyconf.clear()`

Clear the conf and set it to empty object.


### `teenyconf.save([minify])`

Save the current config into its associated file.

#### Params

`minify` Boolean<br />
default to `false`. Let you minify the content of the file

#### Return value

none


### `teenyconf.reload()`

Reload the configuration from file. Can be useful if you have multiple instances of teeny-conf using the same file.

#### Return value

none
