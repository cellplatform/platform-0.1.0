import { expect, t, Subject, MemoryCache, Client } from '../test';
import { ui } from '..';

describe('Context', () => {
  it('has display name', () => {
    expect(ui.Context.displayName).to.eql('@platform/cell.ui/Context');
  });

  it('creates provider', () => {
    const event$ = new Subject<t.EnvEvent>();
    const cache = MemoryCache.create();
    const host = 'localhost:1234';
    const client = Client.typesystem(host);
    const env: t.IEnv = { host, def: 'cell:foo:A1', cache, event$ };
    const ctx: t.IEnvContext = { env, client };

    const res1 = ui.createProvider({ ctx });
    const res2 = ui.createProvider({ ctx, props: { foo: 123 } });

    expect(res1).to.be.an.instanceof(Function);
    expect(res2).to.be.an.instanceof(Function);
  });
});
