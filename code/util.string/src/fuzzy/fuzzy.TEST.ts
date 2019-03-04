import { expect } from 'chai';
import { str } from '..';

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

  describe('isMatch', () => {
    it('true', () => {
      const res = str.fuzzy.isMatch('bcn', 'bacon');
      expect(res).to.eql(true);
    });
    it('false', () => {
      const res = str.fuzzy.isMatch('bcn', 'zebra');
      expect(res).to.eql(false);
    });
  });

  describe('filter', () => {
    it('list of results', () => {
      const list = ['baconing', 'narwhal', 'a mighty bear canoe'];
      const res = str.fuzzy.filter('bcn', list);
      expect(res.length).to.eql(2);
      expect(res[0]).to.eql({ value: 'baconing', score: 3, index: 0 });
      expect(res[1]).to.eql({ value: 'a mighty bear canoe', score: 3, index: 2 });
    });

    it('no results', () => {
      const list = ['baconing', 'narwhal', 'a mighty bear canoe'];
      const res = str.fuzzy.filter('zz', list);
      expect(res).to.eql([]);
    });
  });
});
