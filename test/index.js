var stream = require('stream');
var test = require('tape').test;
var ioBuf = require('../io-buffer');
var crypto = require('crypto');

test('buffers writes', function(t) {
  var size, bufSize = 50, totalSent = 0, totalWritten = 0, flushed = false;
  var writable = new stream.Writable();
  writable._write = function(chunk, enc, callback) {
    if (chunk.length === bufSize) t.pass('wrote expected number of bytes');
    if (chunk.length > bufSize) t.fail('wrote more than expected number of bytes');
    if (chunk.length < bufSize) {
      if (!flushed) flushed = true;
      else t.fail('wrote less than expected number of bytes');
    }
    totalWritten += chunk.length;
    callback();
  };
  writable.on('finish', function() {
    t.equal(totalWritten, totalSent, 'wrote correct total number of bytes');
    t.end();
  });

  var buffered = ioBuf.createBufferedStream(bufSize);
  buffered.pipe(writable);

  for (var i = 0; i < 50; i++) {
    size = Math.round(Math.random() * 100);
    totalSent += size;
    buffered.write(new Buffer(size));
  }

  buffered.end();
});

test('buffers reads', function(t) {
  var bufSize = 50, totalSent = 0, totalRead = 0, stopWhen = 1000, flushed = false;

  var readable = new stream.Readable();
  readable._read = function() {
    var size = Math.round(Math.random() * 100);
    totalSent += size;
    this.push(new Buffer(size));
  };

  var buffered = ioBuf.createBufferedStream(bufSize);
  buffered.on('readable', function() {
    var chunk = buffered.read();
    if (chunk.length === bufSize) t.pass('read expected number of bytes');
    if (chunk.length > bufSize) t.fail('read more than expected number of bytes');
    if (chunk.length < bufSize) {
      if (!flushed) flushed = true;
      else t.fail('read less than expected number of bytes');
    }

    totalRead += chunk.length;
    if (totalRead >= stopWhen) readable.push(null);
  });

  buffered.on('end', function() {
    t.equal(totalRead, totalSent, 'wrote correct total number of bytes');
    t.end();
  });

  readable.pipe(buffered);
});

test('buffer maintains order', function(t) {
  var size = Math.floor(Math.random() * (600 - 1) + 1);
  var buffered = ioBuf.createBufferedStream(size);

  var writable = new stream.Writable();
  writable.data = '';
  writable._write = function(chunk, enc, callback) {
    writable.data += chunk;
    callback();
  };

  var data = crypto.randomBytes(300).toString('hex');

  buffered.pipe(writable)
    .on('finish', function() {
      t.equal(writable.data, data, 'expected data');
      t.end();
    });

  buffered.write(data);
  buffered.end();
});
