/**
 *
 * An axon Transport for winston
 *
 * ### License
 *
 * Copyright (c) 2013-2014 Yoovant by Marcello Gesmundo. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above
 *      copyright notice, this list of conditions and the following
 *      disclaimer in the documentation and/or other materials provided
 *      with the distribution.
 *    * Neither the name of Yoovant nor the names of its
 *      contributors may be used to endorse or promote products derived
 *      from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

var axon = require('axon'),
    util = require('util'),
    winston = require('winston'),
    common = require('winston/lib/winston/common'),
    Transport = winston.Transport;

//
// ### function Axon (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Axon transport object responsible
// for push log messages and metadata using axon messages
//
var Axon = exports.Axon = function (options) {
  options = options || {};

  Transport.call(this, options);

  this.timestamp = (typeof options.timestamp !== 'undefined' ? options.timestamp : false);
  this.host = options.host || '127.0.0.1';
  this.port = options.port || 3000;
  this.sock = axon.socket('push');
  this.sock.connect(util.format('tcp://%s:%d', this.host, this.port));
};

util.inherits(Axon, Transport);

Axon.prototype.name = 'axon';

//
// Define a getter so that `winston.transports.Axon`
// is available and thus backwards compatible.
//
winston.transports.Axon = Axon;

//
// ### function log (level, msg, [meta], [callback])
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Core logging method exposed to Winston. Metadata is optional.
//
Axon.prototype.log = function (level, msg, meta, callback) {
  if (this.silent) {
    return callback && callback(null, true);
  }

  var self = this,
      output;

  output = common.log({
    colorize: false,
    json: true,
    level: level,
    message: msg,
    meta: meta,
    timestamp: this.timestamp
  });

  // send the message
  this.sock.send(output);

  //
  // Emit the `logged` event immediately because the event loop
  // will not exit until `process.stdout` has drained anyway.
  //
  self.emit('logged');
  if (callback) {
    callback(null, true);
  }
};
