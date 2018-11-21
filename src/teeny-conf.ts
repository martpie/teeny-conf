import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

type ConfigValue = string | number | boolean | null | Object | any[];
type Config = Record<string, ConfigValue>


class TeenyConf {
  _configPath: string;
  _defaultConfig: Config;
  _conf: Config;
  _loaded: boolean;

  constructor (configPath: string, defaultConfig: Config = {}) {

    if (!configPath) throw (new TypeError('teenyconf.load needs a valid configPath'));

    this._configPath = path.resolve(configPath);
    this._defaultConfig = defaultConfig;

    if (!configPath) throw(new TypeError('teenyconf.load needs a valid configPath'));

    this._conf = {};
    this._loaded = false;
  }

  /**
   * Get the value of a config key
   * If no key is specified, return the whole config
   * @param  {String} key key to be got
   */
  async load() {
    if (this._loaded) {
      throw (new Error('teeny-conf is already loaded'));
    }

    // Check if directory exists, creates it if needed
    if (!fs.existsSync(path.dirname(this._configPath))) {
      await mkdir(path.dirname(this._configPath));
    }

    try { // Load the file
      this._conf = JSON.parse((await readFile(this._configPath)).toString());
    } catch(err) {
      // console.info(`An error occured when parsing ${_configPath}, fallback on default config`);
      this._conf = this._defaultConfig;

      await this.save();
    }

    this._loaded = true;
  };

  /**
   * Reload the configuration from file
   * @return {Promise}
   */
  async reload() {
    this._conf = JSON.parse((await readFile(this._configPath)).toString());
  };

  /**
   * Save current config to its associated file
   * @param  {Boolean} [minify=false] minify the content of the file
   * @return {Promise}
   */
  save = async (minify = false) => {
    const output = minify ? JSON.stringify(this._conf) : JSON.stringify(this._conf, null, ' ');
    await writeFile(this._configPath, output);
  };

  /**
   * Get a key from conf
   * @param  {String} key
   * @param  {String} def default value to return if there is no key
   * @return {[}
   */
  get(key?: string, def?: any): ConfigValue {
    if (key) {
      if (this._conf.hasOwnProperty(key)) return this._conf[key];
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
    this._conf[key] = value;
  };

  /**
   * Delete a key from the configuration
   * @param  {String} key key to be deleted
   */
  delete(key: string) {
    delete this._conf[key];
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
  has(key: string) {
    return this._conf.hasOwnProperty(key);
  };
}

export default TeenyConf;
