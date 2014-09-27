
/*global describe: true, it: true */
//var debug = require('debug')('mdns-packet:test:dns');
var should = require('should');
var path = require('path');
var fs = require('fs');

var helper = require('./helper');
var dns = require('../');

var fixtureDir = path.join(__dirname, 'fixtures');
var nativeFixtureDir = path.join(__dirname, '..', 'node_modules',
  'native-dns-packet', 'test', 'fixtures');

function createWritingTests(testFolder) {
  var files = fs.readdirSync(testFolder).filter(function (f) { return /\.js$/.test(f); });
  files.forEach(function (file) {
    it('can write ' + file, function (done) {
      var js = helper.readJs(path.join(testFolder, file));
      should.exist(js);
      var buff = dns.DNSPacket.toBuffer(js);
      var binFile = path.join(testFolder, file.replace(/\.js$/, '.bin'));
      var bin = helper.readBin(binFile);
      var rtrip = dns.DNSPacket.parse(buff);
      buff.should.have.length(bin.length);
      buff.should.be.equal(bin);
      helper.equalDeep(js, rtrip);
      done();
    });
  });
}

function createParsingTests(testFolder) {
  var files = fs.readdirSync(testFolder).filter(function (f) { return /\.bin$/.test(f); });
  files.forEach(function (file) {
    it('can parse ' + file, function (done) {
      var bin = helper.readBin(path.join(testFolder, file));
      var js = helper.readJs(path.join(testFolder, file.replace(/\.bin$/, '.js')));
      var ret = dns.DNSPacket.parse(bin);
      helper.equalDeep(js, ret);
      helper.equalJs(js, ret);
      done();
    });
  });
}


describe('DNSPacket', function () {
  it('should be able to create a wildcard query', function (done) {
    var packet = new dns.DNSPacket();
    packet.header.rd = 0;
    packet.question.push(new dns.DNSRecord(
      '_services._dns-sd._udp.local',
      dns.DNSRecord.Type.PTR,
      1
    ));
    var buf = dns.DNSPacket.toBuffer(packet);

    //compare fixture
    buf.toString('hex').should.equal(
      helper.readBin(path.join(fixtureDir, 'mdns-outbound-wildcard-query.bin'))
        .toString('hex'), 'Not as from fixture');
    done();
  });

  describe('parsing fixtures', function () {
    createParsingTests(fixtureDir);
  });

  describe.skip('create fixtures', function () {
    createWritingTests(fixtureDir);
  });

  describe('fixtures from native-dns-packet', function () {
    describe('parsing', function () {
      createParsingTests(nativeFixtureDir);
    });
  });

});
