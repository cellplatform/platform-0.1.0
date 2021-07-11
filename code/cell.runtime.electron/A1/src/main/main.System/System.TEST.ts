import { expect, rx, Mock, t, ENV } from '../../test';
import { System } from '.';

const bus = rx.bus();

describe('main.System', () => {
  describe('Events', () => {
    const is = System.Events.is;

    it('is (static/instance)', () => {
      const events = System.Events({ bus });
      expect(events.is).to.equal(System.Events.is);
    });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('runtime.electron/System/', true);
    });

    it('is.data', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.data({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('runtime.electron/System/data/', true);
    });

    it('is.open', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.open({ type, payload: {} })).to.eql(expected);
      };
      test('foo', false);
      test('runtime.electron/System/open/', true);
    });
  });

  describe('Server', () => {
    it('start (http)', async () => {
      const mock = await Mock.server();

      const res = await mock.http.info();
      const body = res.body as t.IResGetElectronSysInfo;
      mock.dispose();

      expect(res.status).to.eql(200);
      expect(body.host).to.eql(`localhost:${mock.port}`);
      expect(body.region).to.eql('local:desktop');
      expect(body.runtime.type).to.eql('cell.runtime.electron');
      expect(body.runtime.version).to.eql(ENV.pkg.version);
    });
  });
});
