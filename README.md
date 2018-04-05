# teeny-conf

A small npm package to handle one or multiple config files in Node apps. Works well with Electron and NW.js.

All I/O operations are asynchronous and make use of Promises since v2.0, this means you can use `await/async` for async methods.

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
await config.load();

conf.set('language', 'en');

await conf.save();
```

### Using an export

config.js:
``` javascript
import teeny from 'teeny-conf';

const config = new teeny('config.json'));
await config.load();

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

`new teeny(configPath[, defaultConfig])`

#### Params

`configPath` String<br />
the filename where you want your config / your config already is. If the directory/file does not exist, it will be created automatically.

`defaultConfig` Object<br />
the default configuration if the config file does not currently exists.


### `teenyconf.load()`

Load the existing config file into teeny if it exists. This is a mandatory step before everything else.

#### Return value

`Promise`


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

`Promise`


### `teenyconf.reload()`

Reload the configuration from file. Can be useful if you have multiple instances of teeny-conf using the same file.

#### Return value

`Promise`
