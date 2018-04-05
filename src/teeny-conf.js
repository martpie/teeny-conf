const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);


const teenyconf = function(configPath, defaultConfig = {}) {
  if (!configPath) throw(new TypeError('teenyconf.load needs a valid configPath'));

  const _configPath = path.resolve(configPath);
  const _defaultConfig = defaultConfig;

  let _conf = {};
  let _loaded = false;


  // -----------------
  // Utils and methods
  // -----------------

  /**
   * Get the value of a config key
   * If no key is specified, return the whole config
   * @param  {String} key key to be got
   */
  this.load = async () => {
    if (_loaded) {
      throw('teeny-conf is already loaded');
    }

    // Check if directory exists, creates it if needed
    if (!fs.existsSync(path.dirname(configPath))) {
      await mkdir(path.dirname(configPath));
    }

    try { // Load the file
      _conf = JSON.parse(await readFile(_configPath));
    } catch(err) {
      // console.info(`An error occured when parsing ${_configPath}, fallback on default config`);
      _conf = _defaultConfig;

      await this.save();
    }

    _loaded = true;
  };

  /**
   * Reload the configuration from file
   * @return {Promise}
   */
  this.reload = async () => {
    try {
      _conf = JSON.parse(await readFile(_configPath));
    } catch(err) {
      throw(err);
    }
  };

  /**
   * Save current config to its associated file
   * @param  {Boolean} [minify=false] minify the content of the file
   * @return {Promise}
   */
  this.save = async (minify = false) => {
    const output = minify ? JSON.stringify(_conf) : JSON.stringify(_conf, null, ' ');
    await writeFile(_configPath, output);
  };

  /**
   * Get a key from conf
   * @param  {String} key
   * @return {[}
   */
  this.get = (key) => {
    if (key) return _conf[key];

    // Else return everything
    return _conf;
  };

  /**
   * [description]
   * @param  {String} key key to be updated
   * @param  {any} value new key value
   */
  this.set = (key, value) => {
    _conf[key] = value;
  };

  /**
   * Delete a key from the configuration
   * @param  {String} key key to be deleted
   */
  this.delete = (key) => {
    delete _conf[key];
  };

  /**
   * Delete a key from the configuration
   * @param  {String} key key to be deleted
   */
  this.clear = () => {
    _conf = {};
  };
};

module.exports = teenyconf;
