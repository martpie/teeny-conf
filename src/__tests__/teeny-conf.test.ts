import { beforeEach, afterAll, test, expect } from "vitest";
import fs from "fs";
import path from "path";
import util from "util";
import rimraf from "rimraf";
import uniqid from "uniqid";

import teenyconf from "../teeny-conf";

const readFile = util.promisify(fs.readFile);
const tmpPath = "./tmp";

function generateDirectory() {
  return path.resolve(tmpPath, uniqid.time("test-"), "conf.json");
}

/**
 * Hooks
 */
beforeEach(() => {
  rimraf.sync(tmpPath);
  fs.mkdirSync(tmpPath);
});

afterAll(() => {
  rimraf.sync(tmpPath);
});

/**
 * Tests
 */
test("Invalid instantiation should throw an error", () => {
  const newconf = () => {
    // @ts-expect-error
    new teenyconf();
  };

  expect(newconf).toThrow("teenyconf needs a valid configPath");
});

test("Valid instantiation should not throw anything", () => {
  const configPath = generateDirectory();

  const newconfWithPath = () => {
    new teenyconf(configPath, {});
  };

  expect(newconfWithPath).not.toThrow();
});

test("Default config option should be respected", async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, { fr: "bonjour", en: "hello" });

  // Check in-memory
  expect(conf.get()).toEqual({ fr: "bonjour", en: "hello" });

  // Check on disk
  const json = JSON.parse((await readFile(configPath)).toString());
  expect(json).toEqual({ fr: "bonjour", en: "hello" });
});

test("conf.get should return the whole conf by default", async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, { fr: "bonjour", en: "hello" });

  // Check in-memory
  expect(conf.get()).toEqual({ fr: "bonjour", en: "hello" });
});

test("conf.get should return the specific key if specified", async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, {
    fr: "bonjour",
    number: 42,
    nested: {
      a: 1,
      b: "stuff",
    },
  });

  // Check in-memory
  expect(conf.get("fr")).toBe("bonjour");
  expect(conf.get("number")).toBe(42);
  expect(conf.get("nested.b")).toBe("stuff");
});

test("conf.get should return the default value if the key does not exist", async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, {
    fr: undefined as string | undefined,
  });

  expect(conf.get("fr", "bonjour")).toBe("bonjour");
});

test("conf.getx should return the specific key if specified", async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, {
    fr: "bonjour",
    number: 42,
    nested: {
      a: 1,
      b: "stuff",
    },
  });

  // Check in-memory
  expect(conf.getx("fr")).toBe("bonjour");
  expect(conf.getx("number")).toBe(42);
  expect(conf.getx("nested.b")).toBe("stuff");
});

test("conf.getx should throw if a requested key does not exist", async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf<{ fr: string; de: string }>(configPath, {
    fr: "bonjour",
  });

  // Check in-memory
  expect(() => {
    conf.getx("de");
  }).toThrow();
});

test("conf.set should update the key/value pair if already existing", async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, {
    fr: "bonjour",
    en: "helo",
    nested: { b: "test" },
  });

  conf.set("en", "hello");
  conf.set("nested.b", "test2");

  // Check in-memory
  expect(conf.get()).toEqual({
    fr: "bonjour",
    en: "hello",
    nested: { b: "test2" },
  });
  expect(conf.get("en")).toBe("hello");
  expect(conf.get("nested.b")).toBe("test2");
});

test("conf.delete should remove the key/value pair", async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, {
    fr: "bonjour",
    en: "hello",
    nested: { b: "test" },
    nested2: { b: "test" },
  });

  conf.delete("nested2");
  expect(conf.get()).toEqual({
    fr: "bonjour",
    en: "hello",
    nested: { b: "test" },
  });

  conf.delete("nested.b");
  expect(conf.get()).toEqual({ fr: "bonjour", en: "hello", nested: {} });

  conf.delete("en");
  expect(conf.get()).toEqual({ fr: "bonjour", nested: {} });
  expect(conf.get("fr")).toBe("bonjour");
});

test("conf.save should correctly save file on disk", async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, {
    fr: "bonjour",
    en: "hello",
    de: "wrong",
  });

  conf.set("de", "guten Tag");
  conf.delete("en");

  conf.save();

  // Check on disk
  const json = JSON.parse((await readFile(configPath)).toString());
  expect(json).toEqual({ fr: "bonjour", de: "guten Tag" });
});

test("conf.save minify option should be respected", async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, {
    fr: "bonjour",
    en: "hello",
    de: "wrong",
  });

  conf.set("de", "guten Tag");
  conf.delete("en");

  conf.save(true);

  // Check on disk
  const file = await readFile(configPath, "utf8");
  expect(file).toBe('{"fr":"bonjour","de":"guten Tag"}');
});

test("conf.reload should work correctly", async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, {
    fr: "bonjour",
    en: "hello",
    de: "hello",
  });
  const conf2 = new teenyconf(configPath, { de: "test" });

  conf.set("de", "guten Tag");
  conf.delete("en");

  conf.save();
  conf2.reload();

  expect(conf2.get()).toEqual({ fr: "bonjour", de: "guten Tag" });
});

test("conf.clear should work correctly", async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, { fr: "bonjour", en: "hello" });

  conf.set("en", "nopenope");
  conf.clear();

  // Check on disk
  expect(conf.get()).toEqual({ fr: "bonjour", en: "hello" });
});

test("conf.has should work correctly", async () => {
  const configPath = generateDirectory();

  const conf = new teenyconf(configPath, { fr: "bonjour", en: "hello" });

  // Check on disk
  expect(conf.has("fr")).toBe(true);
  expect(conf.has("de")).toBe(false);
});
