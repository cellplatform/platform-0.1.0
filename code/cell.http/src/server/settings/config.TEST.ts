import { expect, fs, expectError } from '../../test';
import { config } from '.';

const load = async (args: config.ILoadArgs) => {
  const path = args.path || 'default.yml';
  args = { ...args, path: fs.resolve('src/test/config', path) };
  return config.load(args);
};

describe.only('settings.config', () => {
  it('does not exist', async () => {
    const res = await config.load();
    expect(res.path).to.eql(fs.resolve('config.yml'));
    expect(res.exists).to.eql(false);
  });

  it('does not exist (throws)', async () => {
    await expectError(() => config.load({ throw: true }), 'does not exist');
  });

  it('empty', async () => {
    const res = await load({ path: 'empty.yml' });
    expect(res.path).to.eql(fs.resolve('src/test/config/empty.yml'));
    expect(res.exists).to.eql(true);
    expect(res.data).to.eql(config.DEFAULT);
  });

  it('default', async () => {
    const res = await load({});
    expect(res.path).to.eql(fs.resolve('src/test/config/default.yml'));
    expect(res.exists).to.eql(true);
    expect(res.data).to.eql({
      ...config.DEFAULT,
      title: 'My Title',
      db: { ...config.DEFAULT.db, dev: 'myDev' }, // NB: Merged partial values from YAML with default set.
    });
  });
});
