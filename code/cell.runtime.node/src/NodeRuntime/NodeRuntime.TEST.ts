import { t, expect, rx } from '../test';
import { NodeRuntime } from '.';

/**
 * NOTE:
 *    For all server/data related tests that exercise pulling
 *    bundles from a server see:
 *
 *        [@platform/cell.router]/src/tests/...
 *
 *    Which spins up a mock server to test against.
 *
 */
describe.only('NodeRuntime', () => {
  const bus = rx.bus();

  it('✨✨ NOTE: See tests in [cell.router]', () => {
    //
  });

  it('create (init)', () => {
    const runtime = NodeRuntime.create({ bus });
    expect(runtime.name).to.eql('cell.runtime.node');
    expect(typeof runtime.id === 'string').to.eql(true);
  });

  it('dispose', () => {
    const runtime = NodeRuntime.create({ bus });
    expect(runtime.isDisposed).to.eql(false);

    const count = {
      runtime: 0,
      events: 0,
    };

    runtime.dispose$.subscribe(() => count.runtime++);
    runtime.events.dispose$.subscribe(() => count.events++);

    runtime.dispose();
    expect(runtime.isDisposed).to.eql(true);

    runtime.dispose();
    runtime.dispose();
    expect(count.runtime).to.eql(1);
    expect(count.events).to.eql(1);
  });

  it('node version', () => {
    const runtime = NodeRuntime.create({ bus });
    const version = `node@${(process.version || '').replace(/^v/, '')}`;
    expect(runtime.version).to.eql(version);
  });

  it('urls', () => {
    const bundle: t.RuntimeBundleOrigin = { host: 'domain.com', uri: 'cell:foo:A1', dir: 'v1' };
    const urls = NodeRuntime.urls(bundle);
    expect(urls.files).to.eql('https://domain.com/cell:foo:A1/fs?filter=v1/**');
    expect(urls.manifest).to.eql('https://domain.com/cell:foo:A1/fs/v1/index.json');
  });

  describe('stdlibs', () => {
    it('no libs (by default)', () => {
      const runtime = NodeRuntime.create({ bus });
      expect(runtime.stdlibs).to.eql([]);
    });

    it('specific libs', () => {
      const runtime = NodeRuntime.create({ bus, stdlibs: ['fs', 'crypto', 'fs'] }); // NB: repeats removed.
      expect(runtime.stdlibs).to.eql(['fs', 'crypto']);
    });

    it('wildcard (*)', () => {
      expect(NodeRuntime.create({ bus, stdlibs: ['*', '*'] }).stdlibs).to.eql(['*']); // NB: repeats removed.
      expect(NodeRuntime.create({ bus, stdlibs: '*' }).stdlibs).to.eql(['*']);
    });
  });
});
