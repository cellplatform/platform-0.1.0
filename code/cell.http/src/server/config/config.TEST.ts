import { config } from '.';
import { expect, fs } from '../../test';

const loadSync = (args: config.ILoadArgs) => {
  const path = args.path || 'default.yml';
  args = { ...args, path: fs.resolve('src/test/config', path) };
  return config.loadSync(args);
};

describe.only('settings.config', () => {
  it('does not exist', () => {
    const res = config.loadSync();
    expect(res.path).to.eql(fs.resolve('config.yml'));
    expect(res.exists).to.eql(false);
  });

  it('does not exist (throws)', () => {
    const fn = () => config.loadSync({ throw: true });
    expect(fn).to.throw(/does not exist/);
  });

  it('empty', () => {
    const res = loadSync({ path: 'empty.yml' });
    expect(res.path).to.eql(fs.resolve('src/test/config/empty.yml'));
    expect(res.exists).to.eql(true);
    expect(res.data).to.eql(config.DEFAULT);
  });

  it('default', () => {
    const res = loadSync({});
    expect(res.path).to.eql(fs.resolve('src/test/config/default.yml'));
    expect(res.exists).to.eql(true);
    expect(res.data).to.eql({
      ...config.DEFAULT,
      title: 'My Title',
      db: { ...config.DEFAULT.db, dev: 'myDev' }, // NB: Merged partial values from YAML with default set.
    });
  });
});
