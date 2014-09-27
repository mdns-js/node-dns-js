var debug = require('debug')('mdns-packet:lib:dns:dnsrecord');

/**
 * DNSRecord is a record inside a DNS packet; e.g. a QUESTION, or an ANSWER,
 * AUTHORITY, or ADDITIONAL record. Note that QUESTION records are special,
 * and do not have ttl or data.
 * @class
 * @param {string} name
 * @param {number} type
 * @param {number} cl - class
 * @param {number} [optTTL] - time to live in seconds
 * @param {Buffer} [optData] - additional data ad Node.js Buffer.
 */
var DNSRecord = module.exports = function (name, type, cl, optTTL, consumer) {
  this.name = name;
  this.type = type;
  this.class = cl;

  var isQD = (arguments.length === 3);
  if (!isQD) {
    this.ttl = optTTL;
    var dataSize = consumer.short();
    debug('going for type %s. tell: %d, size: %d, end: %d, length: %d',
      type,
      consumer.tell(),
      dataSize,
      consumer.tell() + dataSize,
      consumer.length
    );
    switch (type) {
      case DNSRecord.Type.A:
        asA(consumer, this);
        break;
      case DNSRecord.Type.NS:
      case DNSRecord.Type.CNAME:
      case DNSRecord.Type.PTR:
        this.data = asName(consumer);
        break;
      case DNSRecord.Type.MX:
        asMx(consumer, this);
        break;
      case DNSRecord.Type.TXT:
        this.data = asTxt(consumer, consumer.tell() + dataSize);
        break;
      case DNSRecord.Type.AAAA:
        asAAAA(consumer, this);
        break;
      case DNSRecord.Type.SRV:
        asSrv(consumer, this);
        break;
      default:
        console.warn('got a not implemented record type of ' + type);
    }
    debug('pos after', consumer.tell());
  }
};

/**
 * Enum for record type values
 * @readonly
 * @enum {number}
 */
DNSRecord.Type = {
  A: 0x01,        // 1
  NS: 0x02,       //2
  CNAME: 0x05,    //5
  PTR: 0x0c,      // 12
  MX: 0x0F,       //15
  TXT: 0x10,      // 16
  AAAA: 28,       // 0x16
  SRV: 0x21,       // 33
};


function asName(consumer) {
  return consumer.name(true);
}


function asSrv(consumer, record) {
  record.priority = consumer.short();
  record.weight = consumer.short();
  record.port = consumer.short();
  record.target = consumer.name();
}

function asMx(consumer, record) {
  record.priority = consumer.short();
  record.exchange = asName(consumer);
}

function asTxt(consumer, endAt) {
  var items = consumer.name(false, endAt);
  debug('txt items', items);
  if (items.length === 1 && items[0].length > 0) {
    return items[0];
  }
  return items;
}


function asA(consumer, record) {
  var data = '';
  for (var i = 0; i < 3; i++) {
    data += consumer.byte() + '.';
  }
  data += consumer.byte();
  record.address = data;
}


/*
 * Parse data into a IPV6 address string
 * @returns {string}
 */
function asAAAA(consumer, packet) {
  var data = '';
  for (var i = 0; i < 7; i++) {
    data += consumer.short().toString(16) + ':';
  }
  data += consumer.short().toString(16);
  packet.address = data;
}

