import { expect, t } from '../test';
import { Format } from './util';
import { DevActions } from '..';

describe('util: Format', () => {
  describe('toActionsArray', () => {
    type A = t.Actions;
    const actions1 = DevActions().namespace('one');
    const actions2 = DevActions().namespace('two');
    const actions3 = import('../test/sample-3/DEV');

    it('undefined', async () => {
      const res = Format.toActionsArray();
      expect(res.total).to.eql(0);
      expect(res.items).to.eql([]);
      expect(await res.load()).to.eql([]);
    });

    it('single', async () => {
      const res = Format.toActionsArray(actions1);
      expect(res.total).to.eql(1);
      expect(await res.load()).to.eql([actions1]);
      expect(res.items).to.eql([actions1]);
      expect((res.items[0] as A).toObject().namespace).to.eql('one');
    });

    it('[array]', async () => {
      const res = Format.toActionsArray([actions1, actions2]);
      expect(res.total).to.eql(2);
      expect(await res.load()).to.eql([actions1, actions2]);
      expect(res.items).to.eql([actions1, actions2]);
      expect((res.items[0] as A).toObject().namespace).to.eql('one');
      expect((res.items[1] as A).toObject().namespace).to.eql('two');
    });

    it('dynamic import', async () => {
      const res = Format.toActionsArray(actions3);
      expect(res.total).to.eql(1);
      await res.load();
      expect((res.items[0] as A).toObject().namespace).to.eql('test/sample-3');
    });

    it('dynamic import [array]', async () => {
      const res = Format.toActionsArray([actions1, actions3]);
      expect(res.total).to.eql(2);
      await res.load();
      expect((res.items[0] as A).toObject().namespace).to.eql('one');
      expect((res.items[1] as A).toObject().namespace).to.eql('test/sample-3');
    });
  });
});
