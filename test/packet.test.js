var Code = require('code');   // assertion library
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
//var before = lab.before;
//var after = lab.after;
var expect = Code.expect;

//var debug = require('debug')('mdns-packet:test:dns');
var path = require('path');
var fs = require('fs');

var helper = require('./helper');
var dns = require('../');

var fixtureDir = path.join(__dirname, 'fixtures');
var nativeFixtureDir = path.join(__dirname, '..', 'node_modules',
  'native-dns-packet', 'test', 'fixtures');

var NativePacket = require('native-dns-packet');

function createWritingTests(testFolder) {
  var files = fs.readdirSync(testFolder).filter(function (f) { return /\.js$/.test(f); });
  files.forEach(function (file) {
    it('can write ' + file, function (done) {
      var js = helper.readJs(path.join(testFolder, file));
      expect(js).to.exist();
      var buff = dns.DNSPacket.toBuffer(js);
      var binFile = path.join(testFolder, file.replace(/\.js$/, '.bin'));
      var bin = helper.readBin(binFile);
      var rtrip = dns.DNSPacket.parse(buff);
      expect(buff).to.have.length(bin.length);
      expect(buff).to.be.equal(bin);
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

  it('should be able to create a wildcard query', {only: true},
  function (done) {
    var packet = new dns.DNSPacket();
    packet.header.rd = 0;
    var query = new dns.DNSRecord(
      '_services._dns-sd._udp.local',
      dns.DNSRecord.Type.PTR,
      1
    );
    packet.question.push(query);
    var buf = dns.DNSPacket.toBuffer(packet);

    //compare fixture
    expect(buf.toString('hex'), 'Not as from fixture').to.equal(
      helper.readBin(
        path.join(fixtureDir, 'mdns-outbound-wildcard-query.bin')
      ).toString('hex'));

    var np = new NativePacket();
    np.header.rd = 0;
    np.question.push(query);
    var nb = new Buffer(4096);
    var written = NativePacket.write(nb, np);
    nb = nb.slice(0, written);

    expect(buf.toString('hex'), 'Not as from native').to.equal(
      nb.toString('hex'));

    done();
  });

  describe('parsing fixtures', function () {
    createParsingTests(fixtureDir);
  });

  describe('create fixtures', {skip:true}, function () {
    createWritingTests(fixtureDir);
  });

  describe('fixtures from native-dns-packet', function () {
    describe('parsing', function () {
      createParsingTests(nativeFixtureDir);
    });
  });

});
