'use strict';

var cp = require('child_process');
var fs = require('fs');
var concat = require('concat-stream');
var JSON = require('./json-buffer');

var dir = process.argv[2];

var args = JSON.parse(fs.readFileSync(dir + '/input.json'));
function output(result) {
  fs.writeFileSync(dir + '/output.json', JSON.stringify(result));
}

var child = cp.spawn.apply(cp, args);
var options = (args[2] && typeof args[2] === 'object') ?
                args[2] :
              (args[1] && typeof args[1] === 'object' && !Array.isArray(args[1])) ?
                args[1] :
                {};

var complete = false;
var stdout, stderr;
child.stdout.pipe(concat(function (buf) {
  stdout = buf;
}));
child.stderr.pipe(concat(function (buf) {
  stderr = buf;
}));
child.on('error', function (err) {
  output({pid: child.pid, error: err.message});
});
child.on('close', function (status, signal) {
  output({
    pid: child.pid,
    stdout: stdout,
    stderr: stderr,
    status: status,
    signal: signal
  });
});

if (options.timeout && typeof options.timeout === 'number') {
  setTimeout(function () {
    child.kill(options.killSignal || 'SIGTERM');
  }, options.input);
}
if (options.input && (typeof options.input === 'string' || Buffer.isBuffer(options.input))) {
  child.stdin.end(options.input);
}