import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as rimraf from 'rimraf';
import * as uniqid from 'uniqid';

import teenyconf from '../teeny-conf';

const readFile = util.promisify(fs.readFile);
const tmpPath = './tmp';

function generateDirectory() {
  return path.resolve(tmpPath, uniqid.time('test-'), 'conf.json');
}

/**
 * Hooks
 */
beforeAll(() => {
  rimraf.sync(tmpPath);
  fs.mkdirSync(tmpPath);
});

afterAll(() => {
  rimraf.sync(tmpPath);
});

/**
 * Tests
 */
test('Invalid instantiation should throw an error', () => {
  const newconf = () => {
    // @ts-ignore
    new teenyconf();
  };

  expect(newconf).toThrow('teenyconf.load needs a valid configPath');
});


test('Valid instantiation should not throw anything', () => {
  const configPath = generateDirectory();

  const newconfWithPath = () => {
    new teenyconf(configPath);
  };

  expect(newconfWithPath).not.toThrow();
});

test('Calling conf.load() twice should throw an exception', async () => {
  const configPath = generateDirectory();

  async function newconf() {
    const conf = new teenyconf(configPath);
    await conf.load();
    await conf.load();
  }

  await expect(newconf()).rejects.toThrow('teeny-conf is already loaded');
});


test('Default config option should be respected', async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, { fr: 'bonjour', en: 'hello' });
  await conf.load();

  // Check in-memory
  expect(await conf.get()).toEqual({ fr: 'bonjour', en: 'hello' });

  // Check on disk
  const json = JSON.parse((await readFile(configPath)).toString());
  expect(json).toEqual({ fr: 'bonjour', en: 'hello' });
});


test('conf.get should return the whole conf by default', async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, { fr: 'bonjour', en: 'hello' });
  await conf.load();

  // Check in-memory
  expect(conf.get()).toEqual({ fr: 'bonjour', en: 'hello' });
});


test('conf.get should return the specific key if specified', async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, { fr: 'bonjour', number: 42 });
  await conf.load();

  // Check in-memory
  expect(conf.get('fr')).toBe('bonjour');
  expect(conf.get('number')).toBe(42);
  expect(conf.get('something')).toBe(undefined);
});


test('conf.get should return the default value if the key does not exist', async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, {});
  await conf.load();

  expect(conf.get('fr', 'bonjour')).toBe('bonjour');
});


test('conf.set should add a key/value pair if not existing', async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, { fr: 'bonjour' });
  await conf.load();
  conf.set('de', 'guten Tag');

  // Check in-memory
  expect(conf.get()).toEqual({ fr: 'bonjour', de: 'guten Tag' });
  expect(conf.get('de')).toBe('guten Tag');
});


test('conf.set should update the key/value pair if already existing', async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, { fr: 'bonjour', en: 'helo' });
  await conf.load();
  conf.set('en', 'hello');

  // Check in-memory
  expect(conf.get()).toEqual({ fr: 'bonjour', en: 'hello' });
  expect(conf.get('en')).toBe('hello');
});


test('conf.save should correctly save file on disk', async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, { fr: 'bonjour', en: 'hello' });
  await conf.load();

  conf.set('de', 'guten Tag');
  conf.delete('en');

  await conf.save();

  // Check on disk
  const json = JSON.parse((await readFile(configPath)).toString());
  expect(json).toEqual({ fr: 'bonjour', de: 'guten Tag' });
});

test('conf.save minify option should be respected', async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, { fr: 'bonjour', en: 'hello' });
  await conf.load();

  conf.set('de', 'guten Tag');
  conf.delete('en');

  await conf.save(true);

  // Check on disk
  const file = await readFile(configPath, 'utf8');
  expect(file).toBe('{"fr":"bonjour","de":"guten Tag"}');
});


test('conf.reload should work correctly', async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, { fr: 'bonjour', en: 'hello' });
  await conf.load();

  const conf2 = new teenyconf(configPath);
  await conf2.load();

  conf.set('de', 'guten Tag');
  conf.delete('en');

  await conf.save();
  await conf2.reload();

  expect(conf2.get()).toEqual({ fr: 'bonjour', de: 'guten Tag' });
});


test('conf.clear should work correctly', async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, { fr: 'bonjour', en: 'hello' });
  await conf.load();

  conf.clear();

  // Check on disk
  expect(conf.get()).toEqual({});
});


test('conf.has should work correctly', async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, { fr: 'bonjour', en: 'hello' });
  await conf.load();

  // Check on disk
  expect(conf.has('fr')).toBe(true);
  expect(conf.has('de')).toBe(false);
});
