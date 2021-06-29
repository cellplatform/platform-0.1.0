import { expect, rx, Mock, IMock } from '../../test';
import { Bundle } from '.';

const bus = rx.bus();

describe('main.Bundle', () => {
  describe('Events', () => {
    const is = Bundle.Events.is;

    it('is (static/instance)', () => {
      const events = Bundle.Events({ bus });
      expect(events.is).to.equal(Bundle.Events.is);
    });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };

      test('foo', false);
      test('runtime.electron/Bundle', false);

      test('runtime.electron/Bundle/', true);
      test('runtime.electron/Bundle/status:req', true);
    });
  });

  describe.only('Controller', () => {
    describe('list', () => {
      let mock: IMock;
      before(async () => (mock = await Mock.init()));
      after(async () => mock?.dispose());

      it('empty', async () => {
        const res = await mock.events.bundle.list.get();
        expect(res.items).to.eql([]);
        expect(res.error).to.eql(undefined);
      });
    });
  });
});
