import { expect } from 'chai';
import { value } from '.';

describe('value.toNumber', () => {
  it('returns the non-number value', () => {
    const NOW = new Date();
    const OBJECT = { foo: 123 };
    expect(value.toNumber('hello')).to.equal('hello');
    expect(value.toNumber(OBJECT)).to.equal(OBJECT);
    expect(value.toNumber(NOW)).to.equal(NOW);
    expect(value.toNumber(null)).to.equal(null);
    expect(value.toNumber(undefined)).to.equal(undefined);
  });

  it('converts a string to a number', () => {
    expect(value.toNumber('0')).to.equal(0);
    expect(value.toNumber('-1')).to.equal(-1);
    expect(value.toNumber('1')).to.equal(1);
    expect(value.toNumber('12.34')).to.equal(12.34);
  });

  it('does not convert a number/unit string toa number', () => {
    expect(value.toNumber('10px')).to.equal('10px');
  });
});

describe('value.toBool', () => {
  describe('existing Boolean value', () => {
    it('true (no change)', () => {
      expect(value.toBool(true)).to.equal(true);
    });

    it('false (no change)', () => {
      expect(value.toBool(false)).to.equal(false);
    });
  });

  describe('string to Boolean', () => {
    it('converts `true` (string) to true', () => {
      expect(value.toBool('true')).to.equal(true);
      expect(value.toBool('True')).to.equal(true);
      expect(value.toBool('   truE   ')).to.equal(true);
    });

    it('converts `false` (string) to false', () => {
      expect(value.toBool('false')).to.equal(false);
      expect(value.toBool('False')).to.equal(false);
      expect(value.toBool('   falSe   ')).to.equal(false);
    });
  });

  it('does not convert other value types', () => {
    expect(value.toBool(undefined)).to.equal(undefined);
    expect(value.toBool(null)).to.equal(undefined);
    expect(value.toBool('Foo')).to.equal(undefined);
    expect(value.toBool('')).to.equal(undefined);
    expect(value.toBool(' ')).to.equal(undefined);
    expect(value.toBool(123)).to.equal(undefined);
    expect(value.toBool({ foo: 123 })).to.eql(undefined);
  });

  it('returns the given default value', () => {
    expect(value.toBool(undefined, true)).to.equal(true);
    expect(value.toBool(undefined, false)).to.equal(false);
    expect(value.toBool(undefined, 123)).to.equal(123);

    expect(value.toBool(null, true)).to.equal(true);
    expect(value.toBool(null, false)).to.equal(false);
    expect(value.toBool(null, 123)).to.equal(123);
  });
});

describe('toType', () => {
  it('converts to bool (true)', () => {
    expect(value.toType('true')).to.equal(true);
    expect(value.toType(' true  ')).to.equal(true);
    expect(value.toType('True')).to.equal(true);
    expect(value.toType('TRUE')).to.equal(true);
  });

  it('converts to bool (false)', () => {
    expect(value.toType('false')).to.equal(false);
    expect(value.toType(' false  ')).to.equal(false);
    expect(value.toType('False')).to.equal(false);
    expect(value.toType('FALSE')).to.equal(false);
  });

  it('converts to number', () => {
    expect(value.toType('123')).to.equal(123);
    expect(value.toType(' -123  ')).to.equal(-123);
    expect(value.toType('0')).to.equal(0);
    expect(value.toType('0.0001')).to.equal(0.0001);
  });

  it('converts does not convert', () => {
    const now = new Date();
    expect(value.toType('foo')).to.eql('foo');
    expect(value.toType(undefined)).to.eql(undefined);
    expect(value.toType(null)).to.eql(null);
    expect(value.toType({})).to.eql({});
    expect(value.toType(now)).to.eql(now);
    expect(value.toType(123)).to.eql(123);
  });
});

describe('isPromise', () => {
  const myThing = () => {
    return new Promise((resolve, reject) => {
      resolve();
    });
  };

  it('is a promise', () => {
    const promise = myThing();
    expect(value.isPromise(promise)).to.equal(true);
  });

  it('is not a promise', () => {
    expect(value.isPromise()).to.equal(false);
    expect(value.isPromise(null)).to.equal(false);
    expect(value.isPromise(123)).to.equal(false);
    expect(value.isPromise({ then: 123 })).to.equal(false);
  });
});

describe('isJson', () => {
  it('is not JSON', () => {
    expect(value.isJson()).to.eql(false);
    expect(value.isJson(null)).to.eql(false);
    expect(value.isJson(123)).to.eql(false);
    expect(value.isJson(new Date())).to.eql(false);
    expect(value.isJson({})).to.eql(false);
  });

  it('is a string but not JSON', () => {
    expect(value.isJson('')).to.eql(false);
    expect(value.isJson('  ')).to.eql(false);
    expect(value.isJson('hello')).to.eql(false);
  });

  it('is JSON', () => {
    expect(value.isJson('{}')).to.eql(true);
    expect(value.isJson('[]')).to.eql(true);
    expect(value.isJson('{ "foo": 123 }')).to.eql(true);
    expect(value.isJson('[1,2,3]')).to.eql(true);
  });

  it('is JSON (trimmed string)', () => {
    expect(value.isJson('  {} ')).to.eql(true);
    expect(value.isJson(' []  ')).to.eql(true);
  });
});

describe('isIsoDate', () => {
  it('does not fail if the value is not a string', () => {
    expect(value.isIsoDate()).to.eql(false);
    expect(value.isIsoDate(123 as any)).to.eql(false);
    expect(value.isIsoDate({} as any)).to.eql(false);
    expect(value.isIsoDate(new Date() as any)).to.eql(false);
  });

  it('is an ISO date', () => {
    expect(value.isIsoDate('2015-02-21T00:52:43.822Z')).to.eql(true);
    expect(value.isIsoDate('2015-02-21T00:52:43Z')).to.eql(true);
    expect(value.isIsoDate('2015-02-21T00:52Z')).to.eql(true);
  });

  it('is not an ISO date', () => {
    expect(value.isIsoDate('2015-02-21T00:52:43.822')).to.eql(false);
    expect(value.isIsoDate('2015-02-21T00:52:43')).to.eql(false);
    expect(value.isIsoDate('2015-02-21T00:52')).to.eql(false);
    expect(value.isIsoDate('2015-02-21T00Z')).to.eql(false);
  });
});
