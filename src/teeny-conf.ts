import * as fs from "fs";
import * as path from "path";
import atomicWrite from "write-file-atomic";

import has from "lodash.has";
import get from "lodash.get";
import set from "lodash.set";
import unset from "lodash.unset";
import clonedeep from "lodash.clonedeep";

// -----------------------------------------------------------------------------
// TypeScript Helpers
// -----------------------------------------------------------------------------

type StringableKey<T> = T extends readonly unknown[]
  ? number extends T["length"]
    ? number
    : `${number}`
  : string | number;

type Path<T> = T extends object
  ? {
      [P in keyof T & StringableKey<T>]: `${P}` | `${P}.${Path<T[P]>}`;
    }[keyof T & StringableKey<T>]
  : never;

type UntypedConfig = Record<string, any>;

// -----------------------------------------------------------------------------
// TeenyConf itself
// -----------------------------------------------------------------------------

class TeenyConf<
  Config extends UntypedConfig,
  ConfigKey extends string = Path<Config>
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
      this._conf = clonedeep(this._defaultConfig);

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
      return get(this._conf, key, def);
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
    this._conf = clonedeep(this._defaultConfig);
  }

  /**
   * Check if a key exists
   */
  has(key: ConfigKey | string): boolean {
    return has(this._conf, key);
  }
}

export default TeenyConf;
