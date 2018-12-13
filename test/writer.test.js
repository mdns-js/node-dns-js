var Code = require('code');   // assertion library
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
//var before = lab.before;
//var after = lab.after;
var expect = Code.expect;

var BufferWriter = require('../lib/bufferwriter');


describe('BufferWriter', function () {

  it('should default to a 512 byte buffer', function () {
    var out = new BufferWriter();
    expect(out.buf).to.have.length(512);

  });

  it('should default to a 512 byte buffer', function () {
    var out = new BufferWriter(10);
    expect(out.buf).to.have.length(10);
  });


  it('#buffer with undefined should return writer', function () {
    var out = new BufferWriter(10);
    var o = out.buffer();
    expect(o).to.be.instanceof(BufferWriter);
  });

  it('#buffer should accept buffer as input', function () {
    var out = new BufferWriter(10);
    var o = out.buffer(new Buffer('abc'));
    expect(o).to.be.instanceof(BufferWriter);
    expect(o.buf.toString('utf8', 0, 3)).to.equal('abc');
  });

  it('#buffer should not move forward on empty buffer', function () {
    var out = new BufferWriter(10);
    var o = out.buffer(new Buffer(0));
    expect(o).to.be.instanceof(BufferWriter);
    expect(out.tell()).to.equal(0);
  });


  it('#buffer throw if input is not writer or buffer', function () {
    var throws = function () {
      var out = new BufferWriter(10);
      out.buffer('asdf');
    };
    expect(throws).to.throw(Error, 'VariableError: not a buffer');
  });


  it('#seek should throw on negative', function () {
    var throws = function () {
      var out = new BufferWriter(10);
      out.seek(-1);
    };
    expect(throws).to.throw(Error, 'Negative pos not allowed');

  });

  it('#seek should throw after length', function () {
    var throws = function () {
      var out = new BufferWriter(10);
      out.seek(12);
    };
    expect(throws).to.throw(Error, 'Cannot seek after EOF. 12 > 10');


  });

  it('#indexOf should return array with all occurances', function () {
    var out = new BufferWriter();
    out.buffer(new Buffer('helloworldfoobarfoo'));
    var r = out.indexOf('foo');
    expect(r).to.include([10, 16]);
  });

  // it('#name withLength', function () {
  //   var out = new BufferWriter();
  //   out.name('hello', true);
  //   expect(o.tell()).to.equal(6);
  //   done();
  // });

});
