import * as fs from "fs";
import * as path from "path";
import atomicWrite from "write-file-atomic";

import has from "lodash.has";
import get from "lodash.get";
import set from "lodash.set";
import unset from "lodash.unset";

type UntypedConfig = Record<string, any>;
type UnknownConfig = Record<string, unknown>;

class TeenyConf<
  Config extends UntypedConfig = UnknownConfig,
  ConfigKey extends string = Extract<keyof Config, string>
> {
  _configPath: string;
  _defaultConfig: Config;
  _conf: Config;

  constructor(configPath: string, defaultConfig: Config) {
    if (!configPath) throw new TypeError("teenyconf needs a valid configPath");

    this._configPath = path.resolve(configPath);
    this._defaultConfig = defaultConfig;

    // Check if directory exists, creates it if needed
    if (!fs.existsSync(path.dirname(this._configPath))) {
      fs.mkdirSync(path.dirname(this._configPath));
    }

    try {
      // Load the file
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
  }

  /**
   * Save current config to its associated file
   */
  save(minify = false) {
    const output = minify
      ? JSON.stringify(this._conf)
      : JSON.stringify(this._conf, null, " ");

    atomicWrite.sync(this._configPath, output);
  }

  /**
   * Get a key from conf
   */
  get(): Config | undefined;
  get<T extends ConfigKey>(key: T): Config[T] | undefined;
  get<T extends ConfigKey>(key: T, def: Config[T]): Config[T] | undefined;
  get<T extends ConfigKey>(
    key?: T,
    def?: Config[T]
  ): Config | Config[T] | undefined {
    if (key) {
      if (has(this._conf, key)) return get(this._conf, key);

      return def;
    }

    // Else return everything
    return this._conf;
  }

  /**
   * Set/add key/value pair
   */
  set<T extends ConfigKey>(key: T, value: Config[T]) {
    set(this._conf, key, value);
  }

  /**
   * Delete a key from the configuration
   */
  delete(key: string) {
    unset(this._conf, key);
  }

  /**
   * Clear the configuration and rolls it back the default config
   */
  clear() {
    this._conf = this._defaultConfig;
  }

  /**
   * Check if a key exists
   */
  has(key: ConfigKey): boolean {
    return has(this._conf, key);
  }
}

export default TeenyConf;
