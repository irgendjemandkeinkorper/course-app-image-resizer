const zlib = require('node:zlib');

function chunk(type, data) {
  const bytes = Buffer.from(type);
  const body = Buffer.concat([bytes, data]);
  const crc = zlib.crc32 ? zlib.crc32(body) : crc32(body);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  bytes.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc >>> 0, 8 + data.length);
  return out;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makePng(width, height, colorType, pixel) {
  const channels = colorType === 2 ? 3 : 4;
  const row = Buffer.alloc(1 + width * channels);
  row[0] = 0;
  for (let x = 0; x < width; x++) Buffer.from(pixel).copy(row, 1 + x * channels, 0, channels);
  const raw = Buffer.concat(Array.from({length: height}, () => row));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = colorType;
  return Buffer.concat([
    Buffer.from('\x89PNG\r\n\x1a\n', 'binary'),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

module.exports = { makePng };
