# winston-axon

This is a message oriented Transport for [winston][2] based on [axon][1] .

## Motivation

If you have a large application with a lot of independent services, you can easy log every service with a unique socket logging endpoint using [axon][1] as message-oriented library.

## Installation

Install `winston-axon` as usual:

    $ npm install winston-axon

## Options

When you add `winston-axon` to your [winston][2] logger, you can provide this options:

* __host__: (Default: 127.0.0.1) Remote host of the socket logging endpoint
* __port__: (Default: 3000) Remote port of the socket logging endpoint
* __timestamp__: (Default false) Boolean flag indicating if we should add a timestamp to the output. If function is specified, its return value will be used instead of timestamps.

## Usage

To use this plugin you must have a socket logging endpoint (server) and at least a logger (client).

### Server

Create your own server use this simple example:

    // dependencies
    var axon = require('axon');
    var winston = require('winston');

    // set socket
    var sock = axon.socket('pull');
    sock.bind('tcp://127.0.0.1:3000');

    // create a customized Console Transport
    var consoleTransport = new winston.transports.Console({
      level: 'debug',
      colorize: true,
      timestamp: false
    });

    // create new Logger
    var logger = new (winston.Logger)({
      transports: [
        consoleTransport // add other Transport types if you need
      ],
      exitOnError: true
    });

    // wait for incoming logs
    sock.on('message', function(msg) {
      logger.log(msg.level, msg);
    });

    logger.info('server started');

Save as _server.js_ and start the server:

    $ node server.js

    info: server started

### Client

Into the client simply add `winston-axon` as new Transport to your winston instance:

    var winston = require('winston');
    var Axon = require('winston-axon').Axon;
    winston.add(Axon, { level: 'debug', timestamp: new Date() });
    winston.debug({ message: 'Test Object Log Message', error: false });
    winston.log('info', 'Test Log Message', { anything: 'This is metadata' });

Save as _client.js_ and start it:

    $ node client.js

    info: Test Log Message anything=This is metadata

Now in your previous terminal session (that when the server is running) you see this new lines:

    debug:  level=debug, message=Debug text only message, timestamp=2014-03-14T14:22:18.536Z
    debug:  custom=Test Object Log Message, error=false, level=debug, message=Debug exented message, timestamp=2014-03-14T14:22:18.537Z
    info:  anything=This is metadata, level=info, message=Test Log Message, timestamp=2014-03-14T14:22:18.538Z

Note that into the client terminal you see only the _info_ message whereas into the server terminal you see all messages because the server has a customized level of the Console Transport.

For more information please refer to [winston][2] and [axon][1] documentations.

## Run Tests

Like other Transport plugins, all of the winston-axon tests are written in vows, and designed to be run with npm.

    $ npm test



[1]: https://npmjs.org/package/axon
[2]: https://npmjs.org/package/winston
