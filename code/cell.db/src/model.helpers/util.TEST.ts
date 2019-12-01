import { expect, getTestDb } from '../test';
import { models } from '..';

describe('model.helpers (util)', () => {
  describe('setProps', () => {
    it('updates props', async () => {
      const db = await getTestDb({});
      const model = await models.Ns.create({ db, uri: 'ns:foo' }).ready;
      expect(model.props.props).to.eql(undefined);
      models.setProps(model, { name: 'Hello' });
      expect(model.props.props).to.eql({ name: 'Hello' });
    });

    it('no change (undefined passed)', async () => {
      const db = await getTestDb({});
      const model = await models.Ns.create({ db, uri: 'ns:foo' }).ready;
      expect(model.props.props).to.eql(undefined);
      models.setProps(model);
      expect(model.props.props).to.eql(undefined);
    });

    it('squashes props', async () => {
      const db = await getTestDb({});
      const model = await models.Ns.create({ db, uri: 'ns:foo' }).ready;

      models.setProps(model, { name: 'Hello' });
      expect(model.props.props).to.eql({ name: 'Hello' });

      models.setProps(model, { name: undefined });
      expect(model.props.props).to.eql(undefined);
    });
  });
});
