# io-buffer

[![Build Status](https://travis-ci.org/rclark/io-buffer.svg?branch=master)](https://travis-ci.org/rclark/io-buffer)

A dead-simple stream that buffers I/O. Data is made available in chunks of your specified size.

## Examples
```javascript
var fs = require('fs');
var ioBuf = require('io-buffer');

// Write data to a file in 256 byte chunks
var buffered = ioBuf.createBufferedStream(256);
buffered.pipe(fs.createWriteStream('/some/file'));

buffered.write(new Buffer(200)); // No data is provided to the fs.WriteStream
buffered.write(new Buffer(100)); // 256 bytes sent to the fs.WriteStream
buffered.end();                  // Remaining 44 bytes sent to the fs.WriteStream

// Read data in 4MB chunks
buffered = ioBuf.createBufferedStream(4 * 1024 * 1024);
var readable = fs.createReadStream('/some/big/file');
readable.pipe(buffered)
  .on('readable', function() {
    var data = buffered.read(); // read 4MB of data
  });
```
