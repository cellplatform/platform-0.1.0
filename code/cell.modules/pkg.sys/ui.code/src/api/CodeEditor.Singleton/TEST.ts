import { CodeEditor } from '..';
import { expect, Test } from '../../test';
import { rx } from '../common';
import { staticPaths } from '../Configure/Configure.paths';

export default Test.describe('CodeEditor.Singleton', (e) => {
  e.it('start', () => {
    const bus = rx.bus();
    const res1 = CodeEditor.start(bus);
    const res2 = CodeEditor.start(bus);
    const res3 = CodeEditor.start(rx.bus());

    expect(res1.id).to.eql(rx.bus.instance(bus));
    expect(res2).to.equal(res1);
    expect(res3).to.not.equal(res1); // NB: Different instance created with new bus.
  });

  e.describe('status', (e) => {
    e.it('fire: timeout (controller not started)', async () => {
      const bus = rx.bus();
      const events = CodeEditor.events(bus);
      const res = await events.status.fire({ timeout: 10 });
      expect(res.error).to.include('Timed out');
    });

    e.it('fire: not initialized (ready: false)', async () => {
      const bus = rx.bus();
      const events = CodeEditor.start(bus);
      const defaultPaths = staticPaths();
      const res = await events.status.fire();

      expect(res.error).to.eql(undefined);
      expect(res.info?.ready).to.eql(false);
      expect(res.info?.paths).to.eql(defaultPaths);
    });

    e.it('get: not initialized (ready: false)', async () => {
      const bus = rx.bus();
      const events = CodeEditor.start(bus);
      const defaultPaths = staticPaths();
      const res = await events.status.get({ timeout: 10 });
      expect(res?.ready).to.eql(false);
      expect(res?.paths).to.eql(defaultPaths);
    });
  });

  e.describe('init', (e) => {
    e.it('initialize with "staticRoot" for paths (ready: true)', async () => {
      const bus = rx.bus();
      const events = CodeEditor.start(bus);

      const staticRoot = 'https://foo.com/path///';
      const res = await events.init.fire({ staticRoot });

      expect(res.info?.ready).to.eql(true);
      expect(res.info?.paths.vs).to.eql('https://foo.com/path/static/vs');
      expect(res.info?.paths.types.es).to.eql('https://foo.com/path/static/types.d/lib.es');
      expect(res.info?.paths.types.sys).to.eql('https://foo.com/path/static/types.d/lib.sys');

      const info = await events.status.get();
      expect(res.info).to.eql(info); // NB: Same as retrieved status.
    });

    e.it('initialize with default paths', async () => {
      const bus = rx.bus();
      const events = CodeEditor.start(bus);
      const defaultPaths = staticPaths();

      const res = await events.init.fire({});

      expect(res.info?.ready).to.eql(true);
      expect(res.info?.paths).to.eql(defaultPaths);

      const info = await events.status.get();
      expect(res.info).to.eql(info); // NB: Same as retrieved status.
    });
  });
});
