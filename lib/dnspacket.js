var debug = require('debug')('mdns-packet:lib:dns:dnspacket');
var BufferWriter = require('./bufferwriter');
var DataConsumer = require('./bufferconsumer');
var DNSRecord = require('./dnsrecord');
var util = require('util');

/**
 * This callback is used for "each" methods
 * @callback DNSPacket~eachCallback
 * @param {DNSRecord} rec - DNSRecord that was found
 */

var SECTION_NAMES = [
  'answer',
  'authority',
  'additional'
];

function parseHeader(consumer, packet) {
  packet.header.id = consumer.short();
  var val = consumer.short();
  packet.header.qr = (val & 0x8000) >> 15;
  packet.header.opcode = (val & 0x7800) >> 11;
  packet.header.aa = (val & 0x400) >> 10;
  packet.header.tc = (val & 0x200) >> 9;
  packet.header.rd = (val & 0x100) >> 8;
  packet.header.ra = (val & 0x80) >> 7;
  packet.header.res1 = (val & 0x40) >> 6;
  packet.header.res2 = (val & 0x20) >> 5;
  packet.header.res3 = (val & 0x10) >> 4;
  packet.header.rcode = (val & 0xF);

  packet.question = new Array(consumer.short());
  packet.answer = new Array(consumer.short());
  packet.authority = new Array(consumer.short());
  packet.additional = new Array(consumer.short());
}

function writeHeader(writer, packet) {
  var header = packet.header;
  writer.short(header.id);
  var val = 0;
  val += (header.qr << 15) & 0x8000;
  val += (header.opcode << 11) & 0x7800;
  val += (header.aa << 10) & 0x400;
  val += (header.tc << 9) & 0x200;
  val += (header.rd << 8) & 0x100;
  val += (header.ra << 7) & 0x80;
  val += (header.res1 << 6) & 0x40;
  val += (header.res1 << 5) & 0x20;
  val += (header.res1 << 4) & 0x10;
  val += header.rcode & 0xF;
  writer.short(val);
}

function parseRecord(consumer) {
  var r = new DNSRecord(
          consumer.name(),
          consumer.short(), // type
          consumer.short(), // class
          consumer.long(), //ttl
          consumer
          );
  debug('record', r);
  return r;
}


/**
 * DNSPacket holds the state of a DNS packet. It can be modified or serialized
 * in-place.
 *
 * @constructor
 */
var DNSPacket = module.exports = function () {

  this.header = {
    id: 0,
    qr: 0,
    opcode: 0,
    aa: 0,
    tc: 0,
    rd: 1,
    ra: 0,
    res1: 0,
    res2: 0,
    res3: 0,
    rcode: 0
  };
  this.question = [];
  this.answer = [];
  this.authority = [];
  this.additional = [];
  this.edns_options = [];
  this.payload = undefined;


  // this.flags_ = flags || 0; /* uint16 */
  // this.data_ = {'qd': [], 'an': [], 'ns': [], 'ar': []};
  // this.header = {
  //   qr: (flags & FLAG_RESPONSE) === FLAG_RESPONSE,
  //   aa: (flags & FLAG_AUTHORATIVE) === FLAG_AUTHORATIVE,
  //   tc: (flags & FLAG_TRUNCATED) === FLAG_TRUNCATED,
  //   rd: (flags & FLAG_RECURSION) === FLAG_RECURSION
  // }
  // debug('Response', this.header.qr);
  // debug('Authorative', this.header.aa);
  // debug('Truncated', this.header.tc);
  // debug('Recursion', this.header.rd);

};


// /**
//  * Enum identifying DNSPacket sections
//  * @readonly
//  * @enum {string}
//  */
// DNSPacket.Section = {
//   QUESTION: 'qd',
//   ANSWER: 'an',
//   AUTHORITY: 'ns',
//   ADDITIONAL: 'ar'
// };



/**
 * Parse a DNSPacket from an Buffer
 * @param {Buffer} buffer - A Node.js Buffer instance
 * @returns {DNSPacket} Instance of DNSPacket
 */
DNSPacket.parse = function (buffer) {
  var consumer = new DataConsumer(buffer);
  var packet = new DNSPacket();

  parseHeader(consumer, packet);
  debug('packet', packet);

  debug('counters: qd: %s', packet.question.length);
  // Parse the QUESTION section.
  for (var i = 0; i < packet.question.length; i++) {
    debug('doing qd %s', i);
    try {
      var part = new DNSRecord(
          consumer.name(),
          consumer.short(),  // type
          consumer.short()); // class
      packet.question[i] = part;
      debug('new qd dnsrecord: %j', part);
    }
    catch (err) {
      debug('consumer', consumer);
      throw err;
    }
  }

  // Parse the ANSWER, AUTHORITY and ADDITIONAL sections.
  SECTION_NAMES.forEach(function (sectionName) {
    var section = packet[sectionName];
    debug('section %s', sectionName, section.length);
    for (var i = 0; i < section.length; i++) {
      debug('doing record %s', i, consumer.tell());
      var part = parseRecord(consumer);
      section[i] = part;
    }
  });

  if (!consumer.isEOF()) {
    debug('was not EOF on incoming packet',
      consumer.length, consumer.tell());
    debug(util.inspect(packet, {depth: null}));
    throw new Error('Packet not fully parsed');
  }
  return packet;
};


/**
 * Get records from packet
 * @param {DNSPacket.Section} section - record section [qd|an|ns|ar],
 * @param {DNSRecord.Type} [filter] - DNSRecord.Type to filter on
 * @param {DNSPacket~eachCallback} callback - Function callback
 */
DNSPacket.prototype.each = each;


function each(section /*[filter] callback*/) {
  var filter = false;
  var cb;
  if (arguments.length === 2) {
    cb = arguments[1];
  } else {
    filter = arguments[1];
    cb = arguments[2];
  }
  this[section].forEach(function (rec) {
    if (!filter || rec.type === filter) {
      cb(rec);
    }
  });
}


/**
 * Serialize this DNSPacket into an Buffer for sending over UDP.
 * @returns {Buffer} A Node.js Buffer
 */
DNSPacket.toBuffer = function (packet) {
  var writer = new BufferWriter();
  var s = ['question'].concat(SECTION_NAMES);
  writeHeader(writer, packet);

  s.forEach(function (sectionName) {
    var section = packet[sectionName];
    writer.short(section.length);
    debug('tell', writer.tell());
  });

  var e = each.bind(packet);

  s.forEach(function (sectionName) {
    e(sectionName, function (rec) {
      writer.name(rec.name).short(rec.type).short(rec.class);
      debug('tell2', writer.tell());
      if (sectionName !== 'question') {
        throw new Error('can\'t yet serialize non-QD records');
      }
    });
  });

  return writer.slice(0, writer.tell());
};



