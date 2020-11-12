import { ConfigBuilder } from '.';
import { expect, t } from '../../test';
import { Redirects } from './util';

const create = () => {
  const model = ConfigBuilder.model('foo');
  const builder = ConfigBuilder.builder(model);
  return { model, builder };
};

describe('config/util: redirect', () => {
  it('empty list', () => {
    const redirects = Redirects([]);
    expect(redirects.list).to.eql([]);
  });

  describe('path', () => {
    it('format path', () => {
      const test = (input: any, expected: string) => {
        const redirects = Redirects([]);
        expect(redirects.path(input).path).to.eql(expected);
      };
      test('  foo.js  ', 'foo.js');
      test('    ', '');
      test(undefined, '');
      test(null, '');
      test({}, '');
    });

    it('path not matched: empty list => isAllowed:true', () => {
      const redirects = Redirects([]);
      const path = redirects.path('foo.js');
      expect(path.isAllowed).to.eql(true); // NB: default (undefined) => ALLOW
      expect(path.grant).to.eql(undefined);
    });

    it('path not matched: empty list => isAllowed:true (defaultAllow: false)', () => {
      const redirects = Redirects([]);
      const path = redirects.path('foo.js', { defaultAllow: false });
      expect(path.isAllowed).to.eql(false);
      expect(path.grant).to.eql(undefined);
    });

    it('ALLOW => true', () => {
      const { builder } = create();
      const redirects = Redirects(builder.redirect('ALLOW', '  foo.js').toObject().redirects);
      const path = redirects.path('foo.js  ');
      expect(path.isAllowed).to.eql(true);
      expect(path.grant?.action).to.eql('ALLOW');
    });

    it('DENY => false', () => {
      const { builder } = create();
      const redirects = Redirects(builder.redirect('DENY', '  foo.js').toObject().redirects);
      const path = redirects.path('foo.js  ');
      expect(path.isAllowed).to.eql(false);
      expect(path.grant?.action).to.eql('DENY');
    });

    it('boolean grants', () => {
      const test = (
        action: boolean,
        expectedIsAllowed: boolean,
        expectedAction: t.CompilerModelRedirectAction,
      ) => {
        const { builder } = create();
        builder.redirect(action, 'foo.js');
        const redirects = Redirects(builder.toObject().redirects);
        const path = redirects.path('foo.js');
        expect(path.isAllowed).to.eql(expectedIsAllowed);
        expect(path.grant?.action).to.eql(expectedAction);
      };

      test(true, true, 'ALLOW');
      test(false, false, 'DENY');
    });

    it('grep: pattern match', () => {
      const { builder } = create();
      builder.redirect('ALLOW', 'src/*/bin/**');
      const redirects = Redirects(builder.toObject().redirects);

      const test = (input: any, expectedAction: t.CompilerModelRedirectAction | undefined) => {
        const path = redirects.path(input);
        expect(path.grant?.action).to.eql(expectedAction);
      };

      test('src/foo/bin/foo.js', 'ALLOW');
      test('src/foo/bin/foo/bar/baz.js', 'ALLOW');

      test('src/foo/bin', undefined);
      test('src/foo/common/foo.js', undefined);
      test('code/foo/bin/foo.js', undefined);
      test('  ', undefined);
      test(null, undefined);
      test({}, undefined);
    });

    it('grep: file suffix', () => {
      const { builder } = create();
      builder.redirect('DENY', '*.worker.js');
      const redirects = Redirects(builder.toObject().redirects);
      const redirect = redirects.path('service.worker.js');
      expect(redirect.isAllowed).to.eql(false);
      expect(redirect.grant?.action).to.eql('DENY');
    });

    it('grep: folder/**', () => {
      const { builder } = create();
      builder.redirect('DENY', 'static/**');
      const redirects = Redirects(builder.toObject().redirects);

      const test = (input: string, isAllowed: boolean) => {
        const path = redirects.path(input);
        expect(path.isAllowed).to.eql(isAllowed);
      };

      test('static/vs/language/css/cssMode.js', false);
      test('static/foo', false);
      test('static/', false);
      test('static', true); // No match.
    });

    it('grep: override on subpath', () => {
      const { builder } = create();
      builder.redirect('ALLOW', 'src/**').redirect('DENY', 'src/test/**');
      const redirects = Redirects(builder.toObject().redirects);

      const test = (input: any, expectedAction: t.CompilerModelRedirectAction | undefined) => {
        const path = redirects.path(input);
        expect(path.grant?.action).to.eql(expectedAction);
      };

      test('src/foo.js', 'ALLOW');
      test('src/dir/foo.js', 'ALLOW');
      test('src/test/foo.js', 'DENY');
    });
  });
});
