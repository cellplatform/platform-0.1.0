import { expect } from 'chai';
import { authorize } from '.';
import { t } from '../common';

describe('auth.authorize', () => {
  it('runs policies (single, multiple, sync, async)', async () => {
    const list: string[] = [];
    const policy1: t.IAuthPolicy = {
      name: 'one',
      eval: e => {
        list.push(e.name);
        // NB: No grant/deny call - ambiguous result, no determination.
      },
    };
    const policy2: t.IAuthPolicy = {
      name: 'two',
      eval: async e => {
        list.push(e.name);
        e.access('GRANT');
      },
    };

    const res1 = await authorize({ policy: policy1 });
    expect(list.length).to.eql(1);
    expect(res1.isDenied).to.eql(false);
    expect(res1.results).to.eql([]);

    const res2 = await authorize({ policy: [policy1, policy2] });
    expect(list.length).to.eql(3);
    expect(res2.isDenied).to.eql(false);
    expect(res2.results).to.eql([{ access: 'GRANT', policy: 'two' }]);
  });

  it('grant', async () => {
    const policy: t.IAuthPolicy = {
      name: 'AUTH/foo',
      eval: e => e.grant(),
    };
    const res = await authorize({ policy });
    expect(res.isDenied).to.eql(false);
    expect(res.results.length).to.eql(1);
    expect(res.results[0].access).to.eql('GRANT');
  });

  it('deny', async () => {
    const policy: t.IAuthPolicy = {
      name: 'AUTH/foo',
      eval: e => e.deny(),
    };
    const res = await authorize({ policy });
    expect(res.isDenied).to.eql(true);
    expect(res.results.length).to.eql(1);
    expect(res.results[0].access).to.eql('DENY');
  });

  it('completes execution on all policies (even after DENY)', async () => {
    const deny: t.IAuthPolicy = { name: 'AUTH/deny', eval: e => e.deny() };
    const grant: t.IAuthPolicy = { name: 'AUTH/grant', eval: e => e.grant() };
    const res = await authorize({ policy: [deny, grant] });
    expect(res.isDenied).to.eql(false);
    expect(res.results.length).to.eql(2);
    expect(res.results[0].access).to.eql('DENY');
    expect(res.results[1].access).to.eql('GRANT');
  });

  it('stops execution of policies', async () => {
    const deny: t.IAuthPolicy = { name: 'AUTH/deny', eval: e => e.deny().stop() };
    const grant: t.IAuthPolicy = { name: 'AUTH/grant', eval: e => e.grant() };
    const res = await authorize({ policy: [grant, deny, grant, grant] });

    expect(res.isDenied).to.eql(true);
    expect(res.results.length).to.eql(2);
    expect(res.results[0].access).to.eql('GRANT');
    expect(res.results[1].access).to.eql('DENY');
  });
});
