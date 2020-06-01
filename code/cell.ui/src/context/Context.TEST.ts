import { ui } from '..';
import { Client, expect, Subject, t } from '../test';

describe('Context', () => {
  it('has display name', () => {
    expect(ui.Context.displayName).to.eql('@platform/cell.ui/Context');
  });

  it('creates provider', () => {
    const event$ = new Subject<t.EnvEvent>();
    const host = 'localhost:1234';
    const client = Client.typesystem(host);
    const ctx: t.IEnvContext<t.EnvEvent> = { client, event$, fire: (e) => event$.next(e) };

    const res1 = ui.createProvider({ ctx });
    const res2 = ui.createProvider({ ctx, props: { foo: 123 } });

    expect(res1).to.be.an.instanceof(Function);
    expect(res2).to.be.an.instanceof(Function);
  });
});
