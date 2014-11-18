var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
//var before = lab.before;
//var after = lab.after;
var Code = require('code');   // assertion library
var expect = Code.expect;

//var debug = require('debug')('mdns-packet:test:dns');
var path = require('path');
//var fs = require('fs');

var helper = require('./helper');
var dns = require('../');

var fixtureDir = path.join(__dirname, 'fixtures');
var nativeFixtureDir = path.join(__dirname, '..', 'node_modules',
  'native-dns-packet', 'test', 'fixtures');

var NativePacket = require('native-dns-packet');


describe('DNSPacket', function () {

  it('should be able to create a wildcard query', function (done) {
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

  it('should be able to create PTR answer', function (done) {
    var packet = new dns.DNSPacket();
    packet.header.rd = 0;
    packet.header.qr = 1;
    packet.header.aa = 1;
    //query
    var query = new dns.DNSRecord(
      '_services._dns-sd._udp.local',
      dns.DNSRecord.Type.PTR,
      1
    );
    packet.question.push(query);

    //answer
    packet.answer.push({
      name:'_services._dns-sd._udp.local', //reference to first record name
      type: dns.DNSRecord.Type.PTR,
      class: 1,
      ttl: 10,
      data: '_workstation._tcp.local'
    });

    packet.answer.push({
      name:'_services._dns-sd._udp.local', //reference to first record name
      type: dns.DNSRecord.Type.PTR,
      class: 1,
      ttl: 10,
      data: '_udisks-ssh._tcp.local'
    });

    var buf = dns.DNSPacket.toBuffer(packet);

    var pr = dns.DNSPacket.parse(buf);
    var fixture = helper.readBin(
      path.join(fixtureDir, 'mdns-inbound-linux_workstation.bin')
    );

    helper.equalDeep(pr, dns.DNSPacket.parse(fixture));


    //helper.equalBuffer(fixture, buf, 8);

    // //expect(buf.toString('hex')).to.equal(fixStr);

    // var parsed = dns.DNSPacket.parse(buf);
    done();
  });

  describe('parsing fixtures', function () {
    helper.createParsingTests(lab, fixtureDir);
  });

  // describe('create fixtures', {skip:true}, function () {
  //   helper.createWritingTests(lab, fixtureDir);
  // });

  describe('fixtures from native-dns-packet', function () {
    describe('parsing', function () {
      helper.createParsingTests(lab, nativeFixtureDir);
    });
  });

});
