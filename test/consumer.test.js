var Code = require('@hapi/code');   // assertion library
var Lab = require('@hapi/lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
//var before = lab.before;
//var after = lab.after;
var expect = Code.expect;

var BufferConsumer = require('../lib/bufferconsumer');
var BufferWriter = require('../lib/bufferwriter');


describe('BufferConsumer', function () {

  it('throw if no buffer as argument', function () {
    var throws = function () {
      return (new BufferConsumer());
    };

    expect(throws).to.throw(Error, 'Expected instance of Buffer');

  });

  it('throw if seek before 0', function () {
    var throws = function () {
      var b = Buffer.alloc(512);
      var consumer = new BufferConsumer(b);
      consumer.seek(-1);
    };

    expect(throws).to.throw(Error, 'Negative pos not allowed');
  });

  it('throw if seek after end', function () {
    var throws = function () {
      var b = Buffer.alloc(512);
      var consumer = new BufferConsumer(b);
      consumer.seek(515);
    };

    expect(throws).to.throw(Error, 'Cannot seek after EOF. 515 > 512');

  });

  it('thow if slice after end', function () {
    var throws = function () {
      var b = Buffer.alloc(512);
      var consumer = new BufferConsumer(b);
      consumer.seek(500);
      consumer.slice(100);
    };

    expect(throws).to.throw(Error, 'Buffer overflow');

  });

  it('#string with length', function () {
    var b = Buffer.from('qwertasdfg');
    var consumer = new BufferConsumer(b);
    var s = consumer.string('utf8', 3);
    expect(s).to.equal('qwe');
    s = consumer.string();
    expect(s).to.equal('rtasdfg');

  });

});


describe('BufferWriter', function () {
  it('#name on empty buffer', function () {
    var out = new BufferWriter();
    out.name('');
    out.dump();
    var consumer = new BufferConsumer(out.dump());
    var s = consumer.name();
    expect(s).to.equal('');

  });
});
