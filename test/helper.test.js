/*global describe: true, it: true */
var path = require('path');
var helper = require('./helper');
var should = require('should');
var fs = require('fs');

var Packet = require('..').DNSPacket;
//var fixtureDir = path.join(__dirname, 'fixtures');
var packets = require('./packets.json');

describe('helper', function () {
  it('prepareJs', function (done) {
    //this is a tricky one
    var filename = path.join(__dirname, 'fixtures', 'mdns-inbound-type47.js');
    var text = fs.readFileSync(filename, 'utf8');
    var js = helper.prepareJs(text);
    js.should.be.a.String;
    js.should.match(/new Buffer\(/);
    done();
  });

  it('readJs', function (done) {
    var filename = path.join(__dirname, 'fixtures', 'mdns-inbound-type47.js');
    var js = helper.readJs(filename);
    should.exist(js);
    js.should.have.property('header');
    done();
  });

  describe('from buffer', function () {
    var b = new Buffer(packets.in.sample10, 'hex');
    it('writeJs', function (done) {
      helper.writeBin(path.join('./', 'test.bin.log'), b);
      done();
    });
    it('writeJs', function (done) {
      helper.writeJs(path.join('./', 'test.js.log'), Packet.parse(b));
      done();
    });
  });

});
