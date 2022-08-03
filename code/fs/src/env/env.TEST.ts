import { expect } from '../test';
import { join, resolve } from 'path';

import { env } from '.';

type IMyVars = {
  FS_ENV_TEXT: string;
  FS_ENV_NUMBER: number;
  FS_ENV_TRUE: boolean;
  FS_ENV_FALSE: boolean;
};

const dir = resolve('test/env');
const file = '.test.env';

const removeVars = () => {
  delete process.env.FS_ENV_TEXT;
  delete process.env.FS_ENV_NUMBER;
  delete process.env.FS_ENV_TRUE;
  delete process.env.FS_ENV_FALSE;
  delete process.env.NOW_REGION;
};

const setup = async () => {
  removeVars();
  env.reset();
};

describe('env', () => {
  beforeEach(async () => setup());
  afterEach(() => removeVars());

  it('does non have env vars loaded ', async () => {
    expect(process.env.FS_ENV_TEXT).to.eql(undefined);
  });

  it('load', () => {
    const test = (args: env.IEnvLoadArgs, expected?: any) => {
      env.reset();
      delete process.env.FS_ENV_TEXT;
      expect(process.env.FS_ENV_TEXT).to.eql(undefined);
      env.load({ file, ...args });
      expect(process.env.FS_ENV_TEXT).to.eql(expected);
    };

    test({}, undefined); // NB: No [.env] in the root of the project.
    test({ dir: resolve('test') }, undefined);
    test({ dir }, 'foo');
    test({ dir, ancestor: true }, 'foo');

    test({ dir: join(dir, '1/2/3'), ancestor: true }, 'foo');
    test({ dir: join(dir, '1/2/3'), ancestor: 3 }, 'foo');
    test({ dir: join(dir, '1/2/3'), ancestor: 2 }, undefined); // NB: not within "max level" scope.
    test({ dir: join(dir, '1/2/3'), ancestor: false }, undefined);

    test({ dir: join(dir, '1'), ancestor: true }, 'foo');
    test({ dir: join(dir, '1/2'), ancestor: true }, 'foo');
    test({ dir: join(dir, '1/2/3'), ancestor: true }, 'foo');
  });

  it('does not load when on zeit/now', () => {
    process.env.NOW_REGION = 'sfo1'; // NB: Simulate being on `zeit/now`.

    expect(process.env.FS_ENV_TEXT).to.eql(undefined);
    env.load({ dir });
    expect(process.env.FS_ENV_TEXT).to.eql(undefined);
    expect(env.value('FS_ENV_TEXT')).to.eql(undefined);
  });

  describe('value', () => {
    it('read (types)', () => {
      env.load({ dir, file });

      expect(env.value('NO_EXIST')).to.eql(undefined);

      expect(env.value('FS_ENV_TEXT')).to.eql('foo');
      expect(env.value<string>('FS_ENV_TEXT')).to.eql('foo');

      expect(env.value<boolean>('FS_ENV_TRUE')).to.eql(true);
      expect(env.value<boolean>('FS_ENV_FALSE')).to.eql(false);

      expect(env.value<number>('FS_ENV_NUMBER')).to.eql(123);
    });

    it('value (throws if not found)', () => {
      env.load({ dir, file });
      const fn = () => env.value('NO_EXIST', { throw: true });
      expect(fn).to.throw(/The process\.env\["NO_EXIST"\] variable does not exist/);
    });
  });

  describe('values (load and read)', () => {
    it('nothing loaded, no .env var', () => {
      const res = env.values<IMyVars>([
        'FS_ENV_TEXT',
        'FS_ENV_TRUE',
        'FS_ENV_FALSE',
        'FS_ENV_NUMBER',
      ]);
      expect(res.FS_ENV_TEXT).to.eql(undefined);
      expect(res.FS_ENV_NUMBER).to.eql(undefined);
      expect(res.FS_ENV_TRUE).to.eql(undefined);
      expect(res.FS_ENV_FALSE).to.eql(undefined);
    });

    it('values', () => {
      const res = env.values<IMyVars>(
        ['FS_ENV_TEXT', 'FS_ENV_TRUE', 'FS_ENV_FALSE', 'FS_ENV_NUMBER'],
        { dir, file },
      );
      expect(res.FS_ENV_TEXT).to.eql('foo');
      expect(res.FS_ENV_NUMBER).to.eql(123);
      expect(res.FS_ENV_TRUE).to.eql(true);
      expect(res.FS_ENV_FALSE).to.eql(false);
    });
  });
});
