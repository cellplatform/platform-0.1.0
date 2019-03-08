import { expect } from 'chai';
import { str } from '..';
import { curry } from 'ramda';

describe('fuzzy', () => {
  describe('match', () => {
    it('matches', () => {
      const res = str.fuzzy.match('bcn', 'bacon');
      expect(res && res.value).to.eql('bacon');
      expect(res && res.score).to.eql(3);
    });

    it('no match', () => {
      const res = str.fuzzy.match('bcn', 'zebra');
      expect(res).to.eql(undefined);
    });
  });

  describe('isMatch (single value)', () => {
    it('true', () => {
      const res = str.fuzzy.isMatch('bcn', 'bacon');
      expect(res).to.eql(true);
    });

    it('false', () => {
      const res = str.fuzzy.isMatch('bcn', 'zebra');
      expect(res).to.eql(false);
    });
  });

  describe('isMatch (within list)', () => {
    const list = ['get', 'watch', 'put'];
    it('true', () => {
      const res = str.fuzzy.isMatch('t', list);
      expect(res).to.eql(true);
    });

    it('false', () => {
      const res = str.fuzzy.isMatch('z', list);
      expect(res).to.eql(false);
    });
  });

  describe('filter', () => {
    const list = ['baconing', 'narwhal', 'a mighty bear canoe'];
    it('list of results', () => {
      const res = str.fuzzy.filter('bcn', list);
      expect(res.length).to.eql(2);
      expect(res[0]).to.eql({ value: 'baconing', score: 3, index: 0 });
      expect(res[1]).to.eql({ value: 'a mighty bear canoe', score: 3, index: 2 });
    });

    it('no results', () => {
      const res = str.fuzzy.filter('zz', list);
      expect(res).to.eql([]);
    });

    it('returns all values when no (empty) pattern is given', () => {
      const res = str.fuzzy.filter('', list);
      expect(res.length).to.eql(3);
      expect(res[0].index).to.eql(0);
      expect(res[1].index).to.eql(1);
      expect(res[2].index).to.eql(2);

      expect(res[0].score).to.eql(0);
      expect(res[1].score).to.eql(0);
      expect(res[2].score).to.eql(0);
    });

    it('curries', () => {
      const filter = curry(str.fuzzy.filter);
      const bcn = filter('bcn');
      const res = bcn(list);
      expect(res.length).to.eql(2);
    });
  });
});
