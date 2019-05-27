import { expect } from 'chai';
import { auth } from '..';

describe('policy: userRequired', () => {
  const { userRequired } = auth.policy;

  it('DENY when no user supplied', async () => {
    const res = await auth.authorize({ policy: userRequired });
    expect(res.isDenied).to.eql(true);
  });

  it('GRANT when user supplied', async () => {
    const user = { id: 'me', roles: [] };
    const res = await auth.authorize({ policy: userRequired, user });
    expect(res.isDenied).to.eql(false);
  });
});
