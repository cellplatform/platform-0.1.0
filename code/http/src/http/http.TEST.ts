import { expect } from 'chai';
import { http } from '..';

describe('http', () => {
  describe('default instance (singleton)', () => {
    it('has methods', () => {
      expect(http.head).to.be.an.instanceof(Function);
      expect(http.get).to.be.an.instanceof(Function);
      expect(http.put).to.be.an.instanceof(Function);
      expect(http.post).to.be.an.instanceof(Function);
      expect(http.patch).to.be.an.instanceof(Function);
      expect(http.delete).to.be.an.instanceof(Function);
    });

    it('has empty headers (by default)', () => {
      expect(http.headers).to.eql({});
    });
  });

  describe('create', () => {
    it('creates (default headers)', () => {
      const res = http.create();
      expect(res.headers).to.eql({});
    });

    it('creates with custom headers (passed through all calls)', () => {
      const res = http.create({ headers: { MyHeader: 'abc' } });
      expect(res.headers.MyHeader).to.eql('abc');
    });

    it('headers immutable', () => {
      const lib = http.create({ headers: { foo: 123 } });
      const res1 = lib.headers;
      const res2 = lib.headers;

      expect(res1).to.eql(res2);
      expect(res1).to.not.equal(res2);
    });
  });
});
