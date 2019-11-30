import { config } from '.';
import { expect, fs } from '../../test';

const { DEFAULT } = config;

const loadSync = (args: config.IConfigArgs) => {
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
        deployment: 'my-deployment',
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

  describe('validation', () => {
    it('valid', () => {
      const config = loadSync({ path: 'default' });
      const res = config.validate();
      expect(res.isValid).to.eql(true);
      expect(res.errors).to.eql([]);
    });

    it('invalid', () => {
      const test = (modify: (config: config.IConfig) => void, error: string) => {
        const config = loadSync({});
        modify(config);

        const res = config.validate();
        const hasError = res.errors.some(e => e.message.includes(error));

        expect(res.isValid).to.eql(false);
        expect(hasError).to.eql(true);
      };

      test(c => (c.exists = false), 'Configuration file does not exist');
      test(c => (c.data.title = '  '), 'Missing [title] value');
      test(c => (c.data.now.deployment = '  '), 'Missing [now.deployment] value');
      test(c => (c.data.now.domain = '  '), 'Missing [now.domain] value');
      test(c => (c.data.now.mongo = '  '), 'Missing [now.mongo] value');
    });
  });
});
