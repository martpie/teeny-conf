import * as fs from 'fs';
import * as path from 'path';
import * as atomicWrite from 'write-file-atomic';

const has = require('lodash.has');
const get = require('lodash.get');
const set = require('lodash.set');
const unset = require('lodash.unset');

type ConfigValue = any; // Matching JSON.parse implementation
type Config = Record<string, ConfigValue>

class TeenyConf {
  _configPath: string;
  _defaultConfig: Config;
  _conf: Config;

  constructor (configPath: string, defaultConfig: Config = {}) {

    if (!configPath) throw (new TypeError('teenyconf needs a valid configPath'));

    this._configPath = path.resolve(configPath);
    this._defaultConfig = defaultConfig;

    // Check if directory exists, creates it if needed
    if (!fs.existsSync(path.dirname(this._configPath))) {
      fs.mkdirSync(path.dirname(this._configPath))
    }

    try { // Load the file
      this._conf = JSON.parse(fs.readFileSync(this._configPath).toString());
    } catch (err) {
      // console.info(`An error occured when parsing ${_configPath}, fallback on default config`);
      this._conf = this._defaultConfig;

      this.save();
    }
  }

  /**
   * Reload the configuration from file
   */
  reload() {
    this._conf = JSON.parse(fs.readFileSync(this._configPath).toString());
  };

  /**
   * Save current config to its associated file
   * @param  {Boolean} [minify=false] minify the content of the file
   */
  save(minify = false) {
    const output = minify ? JSON.stringify(this._conf) : JSON.stringify(this._conf, null, ' ');

    atomicWrite.sync(this._configPath, output);
  };

  /**
   * Get a key from conf
   * @param  {String} key
   * @param  {String} def default value to return if there is no key
   * @return {any}
   */
  get(): Config;
  get(key: string): ConfigValue;
  get(key: string, def: any): ConfigValue;
  get(key?: string, def?: any): ConfigValue {
    if (key) {
      if (has(this._conf, key)) return get(this._conf, key);

      return def;
    }

    // Else return everything
    return this._conf;
  };

  /**
   * Set/add key/value pair
   * @param  {String} key key to be updated
   * @param  {any} value new key value
   */
  set(key: string, value: ConfigValue) {
    set(this._conf, key, value);
  };

  /**
   * Delete a key from the configuration
   * @param  {String} key key to be deleted
   */
  delete(key: string) {
    unset(this._conf, key);
  };

  /**
   * Delete a key from the configuration
   */
  clear() {
    this._conf = {};
  };

  /**
   * Check if a key exists
   * @param  {String} key
   */
  has(key: string): boolean {
    return has(this._conf, key);
  };
}

export default TeenyConf;
