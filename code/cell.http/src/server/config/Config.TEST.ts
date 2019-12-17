import { Config } from '.';
import { t, expect, fs } from '../../test';

const loadSync = (args: t.IHttpConfigFileArgs) => {
  const path = args.path || 'default.yml';
  args = { ...args, path: fs.resolve('src/test/config', path) };
  return Config.loadSync(args);
};

describe('settings.config', () => {
  it('does not exist', () => {
    const res = Config.loadSync();
    expect(res.exists).to.eql(false);
    expect(res.path).to.eql(fs.resolve('config.yml'));
  });

  it('does not exist (throws)', () => {
    const fn = () => Config.loadSync({ throw: true });
    expect(fn).to.throw(/does not exist/);
  });

  it('empty', () => {
    const res = loadSync({ path: 'empty.yml' });
    expect(res.path).to.eql(fs.resolve('src/test/config/empty.yml'));
    expect(res.exists).to.eql(true);
    expect(res.data).to.eql(Config.DEFAULT);
  });

  it('default', () => {
    const res = loadSync({});
    expect(res.path).to.eql(fs.resolve('src/test/config/default.yml'));
    expect(res.exists).to.eql(true);

    expect(res.data).to.eql({
      ...Config.DEFAULT,
      title: 'My Title',
      fs: {
        ...Config.DEFAULT.fs,
        endpoint: 'sfo2.digitaloceanspaces.com',
        root: 'platform/tmp/test',
      },
      now: {
        ...Config.DEFAULT.now,
        deployment: 'my-deployment',
        domain: 'domain.com',
      },
      secret: {
        ...Config.DEFAULT.secret,
        mongo: '@platform-mongo',
        s3: { key: 's3-key', secret: 's3-secret' },
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
      const test = (modify: (config: t.IHttpConfigFile) => void, error: string) => {
        const config = loadSync({});
        modify(config);

        const res = config.validate();
        const hasError = res.errors.some(e => e.message.includes(error));

        expect(res.isValid).to.eql(false, error);
        expect(hasError).to.eql(true, error);
      };

      test(c => (c.exists = false), 'Configuration file does not exist');
      test(c => (c.data.title = '  '), 'Missing [title] value');
      test(c => (c.data.now.deployment = '  '), 'Missing [now.deployment] value');
      test(c => (c.data.now.domain = '  '), 'Missing [now.domain] value');
      test(c => (c.data.secret.mongo = '  '), 'Missing [secret.mongo] value');
      test(c => (c.data.secret.s3 = { key: '', secret: '' }), 'Missing [secret.s3] value');
      test(c => (c.data.fs.endpoint = ' '), 'Missing [fs.endpoint] value');
      test(c => (c.data.fs.root = ' '), 'Missing [fs.root] value');
    });
  });
});
