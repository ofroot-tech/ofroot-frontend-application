/**
 * Exercise the dependency that Jest actually resolves, including the reported
 * returned-object prototype poisoning cases. Resolution walks through Jest
 * itself, so these checks also verify that its transitive override is active.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const jestRequire = createRequire(require.resolve('jest/package.json'));
const coreRequire = createRequire(jestRequire.resolve('@jest/core/package.json'));
const configRequire = createRequire(coreRequire.resolve('jest-config/package.json'));
const merge = configRequire('deepmerge');
let checked = 0;
function check(name, body) { body(); checked++; console.log(`PASS ${name}`); }
function unpoisoned(result) {
  assert.equal(Object.getPrototypeOf(result), Object.prototype);
  assert.equal(result.isAdmin, undefined);
  assert.equal(Object.prototype.isAdmin, undefined);
}
const payload = () => JSON.parse('{"__proto__":{"isAdmin":true}}');

check('Jest resolves the exact reviewed vendored implementation', () => {
  const expected = fs.readFileSync(path.resolve(__dirname, '../vendor/deepmerge/index.js'));
  const installed = fs.readFileSync(configRequire.resolve('deepmerge'));
  assert.deepEqual(installed, expected, 'Repack the vendored artifact whenever its reviewed source changes.');
});

check('null-prototype target does not inherit source privileges', () => {
  const result = merge(Object.create(null), payload());
  unpoisoned(result);
  assert.equal(Object.hasOwn(result, '__proto__'), true);
  assert.equal(Object.getOwnPropertyDescriptor(result, '__proto__').enumerable, true);
  assert.equal(result.__proto__.isAdmin, true); // An explicit own key, never inherited authorization state.
});
for (const placeholder of [null, undefined, 0, false, '']) {
  check(`nested ${String(placeholder)} placeholder keeps a normal prototype`, () => {
    unpoisoned(merge({ session: placeholder }, { session: payload() }).session);
  });
}
check('own prototype key on the target cannot poison its clone', () => {
  const target = payload();
  const result = merge(target, {});
  unpoisoned(result);
  assert.notEqual(result.__proto__, target.__proto__);
  assert.deepEqual(result.__proto__, { isAdmin: true });
});
check('customMerge result is written without calling the prototype setter', () => {
  const target = JSON.parse('{"__proto__":{"left":1}}');
  const source = JSON.parse('{"__proto__":{"right":2}}');
  let called = false;
  const result = merge(target, source, {
    customMerge(key) {
      if (key === '__proto__') return (left, right) => { called = true; return { ...left, ...right, isAdmin: true }; };
    },
  });
  assert.equal(called, true);
  unpoisoned(result);
  assert.deepEqual(result.__proto__, { left: 1, right: 2, isAdmin: true });
});
check('custom array merge can clone a poisoned-target shape safely', () => {
  const result = merge([payload()], [], {
    arrayMerge(target, source, options) {
      return target.concat(source).map(value => options.cloneUnlessOtherwiseSpecified(value, options));
    },
  });
  unpoisoned(result[0]);
});
check('normal recursive merges and input immutability are unchanged', () => {
  const left = { nested: { a: 1 }, values: [{ left: true }] };
  const right = { nested: { b: 2 }, values: [{ right: true }] };
  const result = merge(left, right);
  assert.deepEqual(result, { nested: { a: 1, b: 2 }, values: [{ left: true }, { right: true }] });
  assert.deepEqual(left, { nested: { a: 1 }, values: [{ left: true }] });
  assert.deepEqual(right, { nested: { b: 2 }, values: [{ right: true }] });
  assert.notEqual(result.values[0], left.values[0]);
});
check('arrayMerge overwrite and clone false options are retained', () => {
  assert.deepEqual(merge({ a: [1] }, { a: [2] }, { arrayMerge: (_left, right) => right }), { a: [2] });
  const value = { deep: { original: true } };
  assert.equal(merge({}, value, { clone: false }).deep, value.deep);
});
check('customMerge for ordinary keys is retained', () => {
  assert.deepEqual(merge({ size: { value: 1 } }, { size: { value: 2 } }, {
    customMerge: key => key === 'size' ? (left, right) => ({ value: left.value + right.value }) : undefined,
  }), { size: { value: 3 } });
});
check('enumerable symbols, special objects, and merge.all are retained', () => {
  const key = Symbol('test');
  const when = new Date('2026-10-27T00:00:00Z');
  const regexp = /signal/i;
  const result = merge.all([{ nested: { a: 1 }, [key]: { a: 1 }, when }, { nested: { b: 2 }, [key]: { b: 2 }, regexp }]);
  assert.deepEqual(result.nested, { a: 1, b: 2 });
  assert.deepEqual(result[key], { a: 1, b: 2 });
  assert.equal(result.when, when);
  assert.equal(result.regexp, regexp);
});
check('inherited source keys and protected object methods remain excluded', () => {
  assert.deepEqual(merge({}, Object.assign(Object.create({ injected: true }), { own: true })), { own: true });
  const result = merge({}, JSON.parse('{"constructor":{"prototype":{"isAdmin":true}},"toString":"malicious"}'));
  assert.equal(result.constructor, Object);
  assert.equal(result.toString, Object.prototype.toString);
  unpoisoned(result);
});
check('merge.all rejects non-array input', () => assert.throws(() => merge.all({}), /array/));
console.log(`${checked} deepmerge security and compatibility checks passed.`);
