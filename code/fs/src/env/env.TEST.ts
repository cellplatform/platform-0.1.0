import { expect } from 'chai';
import { fs } from '../common';
import { resolve, join } from 'path';
import { env } from '.';

const dir = resolve('test/env');
const file = join(dir, '.env');
const content = `
FS_ENV_TEXT="foo"
FS_ENV_NUMBER=123
FS_ENV_TRUE=true
FS_ENV_FALSE= False
`;

const setup = async () => {
  delete process.env.FS_ENV_TEXT;
  await fs.writeFile(file, content);
};

describe('env', () => {
  beforeEach(async () => setup());

  it('does non have env vars loaded ', async () => {
    expect(process.env.FS_ENV_TEXT).to.eql(undefined);
  });

  it('load', async () => {
    const test = (args: env.IEnvLoadArgs, expected?: any) => {
      delete process.env.FS_ENV_TEXT;
      expect(process.env.FS_ENV_TEXT).to.eql(undefined);
      env.load(args);
      expect(process.env.FS_ENV_TEXT).to.eql(expected);
    };

    test({}, undefined); // NB: No [.env] in the root of the project.
    test({ dir: resolve('test') }, undefined);
    test({ dir }, 'foo');
    test({ dir, ancestor: true }, 'foo');

    test({ dir: join(dir, '1/2/3'), ancestor: true }, 'foo');
    test({ dir: join(dir, '1/2/3'), ancestor: 3 }, 'foo');
    test({ dir: join(dir, '1/2/3'), ancestor: 2 }, undefined);
    test({ dir: join(dir, '1/2/3'), ancestor: false }, undefined);

    test({ dir: join(dir, '1'), ancestor: true }, 'foo');
    test({ dir: join(dir, '1/2'), ancestor: true }, 'foo');
    test({ dir: join(dir, '1/2/3'), ancestor: true }, 'foo');
  });

  it('value (typed)', () => {
    env.load({ dir });

    expect(env.value('NO_EXIST')).to.eql(undefined);

    expect(env.value('FS_ENV_TEXT')).to.eql('foo');
    expect(env.value<string>('FS_ENV_TEXT')).to.eql('foo');

    expect(env.value<boolean>('FS_ENV_TRUE')).to.eql(true);
    expect(env.value<boolean>('FS_ENV_FALSE')).to.eql(false);

    expect(env.value<number>('FS_ENV_NUMBER')).to.eql(123);
  });

  it('value (throws if not found)', () => {
    env.load({ dir });
    const fn = () => env.value('NO_EXIST', { throw: true });
    expect(fn).to.throw(/The process\.env\[\"NO_EXIST\"\] variable does not exist/);
  });
});
