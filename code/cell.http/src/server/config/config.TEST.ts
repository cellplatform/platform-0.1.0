import { config } from '.';
import { expect, fs } from '../../test';

const { DEFAULT } = config;

const loadSync = (args: config.ILoadArgs) => {
  const path = args.path || 'default.yml';
  args = { ...args, path: fs.resolve('src/test/config', path) };
  return config.loadSync(args);
};

describe('settings.config', () => {
  it('does not exist', () => {
    const res = config.loadSync();
    expect(res.exists).to.eql(false);
    expect(res.path).to.eql(fs.resolve('config.yml'));
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
      now: {
        ...DEFAULT.now,
        name: 'my-deployment',
        domain: 'domain.com',
        mongo: '@platform-mongo',
      },
    });
  });

  it('loads with variations of file extension [none, .yml, .yaml]', () => {
    const test = (path: string) => {
      const res = loadSync({ path });
      expect(res.path).to.eql(fs.resolve('src/test/config/default.yml'));
      expect(res.exists).to.eql(true);
    };
    test('default');
    test('default.yml');
    test('default.yaml');
    test('  default  '); // NB: spaces trimmed.
  });
});
