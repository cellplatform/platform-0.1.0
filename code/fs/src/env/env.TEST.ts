import { expect } from 'chai';
import { fs } from '../common';
import { resolve, join } from 'path';
import { env } from '.';

const dir = resolve('test/env');
const file = join(dir, '.env');
const content = `
FS_ENV_TEST="foo"
`;

const setup = async () => {
  delete process.env.FS_ENV_TEST;
  await fs.writeFile(file, content);
};

describe.only('env', () => {
  beforeEach(async () => setup());

  it('does non have env vars loaded ', async () => {
    expect(process.env.FS_ENV_TEST).to.eql(undefined);
  });

  it('load', async () => {
    const test = (args: env.IEnvLoadArgs, expected?: string) => {
      delete process.env.FS_ENV_TEST;
      expect(process.env.FS_ENV_TEST).to.eql(undefined);
      env.load(args);
      expect(process.env.FS_ENV_TEST).to.eql(expected);
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
});
