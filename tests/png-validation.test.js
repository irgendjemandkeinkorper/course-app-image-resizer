const test = require('node:test');
const assert = require('node:assert/strict');
const {makePng} = require('./png-fixtures');

function inspectPng(bytes) {
  assert.deepEqual([...bytes.subarray(0, 8)], [137,80,78,71,13,10,26,10]);
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bitDepth: bytes[24],
    colorType: bytes[25],
  };
}

test('opaque app-icon fixture is RGB with no alpha channel', () => {
  const png = makePng(180, 180, 2, [255, 255, 255]);
  assert.deepEqual(inspectPng(png), {width: 180, height: 180, bitDepth: 8, colorType: 2});
  assert.ok(png.length < 4 * 1024 * 1024);
});

test('transparent logo fixture is RGBA', () => {
  const png = makePng(990, 495, 6, [63, 106, 67, 128]);
  assert.deepEqual(inspectPng(png), {width: 990, height: 495, bitDepth: 8, colorType: 6});
});

test('size limit boundary is expressed in bytes', () => {
  const limit = 4 * 1024 * 1024;
  assert.equal(limit, 4194304);
  assert.ok(makePng(1, 1, 2, [0, 0, 0]).length < limit);
});
