var debug = require('debug')('mdns-packet:test:helper');
var fs = require('fs');
var vm = require('vm');
var util = require('util');


exports.createJs = function (obj) {
  return util.inspect(obj, {depth: null});
};

exports.writeBin = function (filename, buf) {
  var ws = fs.createWriteStream(filename);
  ws.write(buf);
  ws.end();
};

exports.writeJs = function (filename, obj) {
  fs.writeFileSync(filename, exports.createJs(obj));
};


exports.readBin = function (filename) {
  return fs.readFileSync(filename);
};

exports.readJs = function (filename) {
  var js = 'foo = ' + fs.readFileSync(filename, 'utf8');
  return vm.runInThisContext(js, filename);
};

exports.equalJs = function (expected, actual) {
  var e = exports.createJs(expected);
  var a = exports.createJs(actual);
  a.should.equal(e, 'Objects are not the same');
};

var equalDeep = exports.equalDeep = function (expected, actual) {
  for (var key in expected) {
    if (expected.hasOwnProperty(key)) {
      debug('expected %s', key, expected[key]);
      actual.should.have.property(key);
      if (typeof expected[key] === 'object') {
        equalDeep(expected[key], actual[key]);
      }
      else {
        if (key !== 'name') {
          if (typeof actual[key] === 'undefined') {
            (typeof actual[key]).should.equal(typeof expected[key]);
          }
          else {
            actual[key].should.equal(expected[key]);
          }
        }
        else {
          actual[key].should.have.length(expected[key].length);
          debug('actual: %s, expected: %s', actual[key], expected[key]);
        }
      }
    }
  }
};
