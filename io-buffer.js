var Transform = require('stream').Transform;
var util = require('util');

util.inherits(BufferedStream, Transform);
function BufferedStream(size) {
  Transform.call(this);
  this._size = size;
  this._buf = new Buffer(size);
  this._offset = 0;
}

BufferedStream.prototype._transform = function(chunk, enc, callback) {
  if (!Buffer.isBuffer(chunk)) chunk = new Buffer(chunk, enc);

  while (chunk.length) {
    var bytes = chunk.copy(this._buf, this._offset);
    this._offset += bytes;
    chunk = chunk.slice(bytes);
    if (this._offset === this._size) {
      var toRead = new Buffer(this._size);
      this._buf.copy(toRead);
      this.push(toRead);
      this._offset = 0;
    }
  }

  callback();
};

BufferedStream.prototype._flush = function(callback) {
  this.push(this._buf.slice(0, this._offset));
  callback();
};

module.exports = {
  BufferedStream: BufferedStream,
  createBufferedStream: function(size) {
    return new BufferedStream(size);
  }
};
