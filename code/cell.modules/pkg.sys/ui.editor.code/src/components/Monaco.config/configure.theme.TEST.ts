import { t, expect } from '../../test';

import { Themes, Theme } from '.';

describe('Theme', () => {
  describe('shade', () => {
    it('isDark', () => {
      const test = (theme: t.CodeEditorTheme, expected: boolean) => {
        expect(Theme.isDark(theme)).to.eql(expected);
      };
      test('dark', true);
      test('ink', true);
      test('light', false);
    });

    it('isLight', () => {
      const test = (theme: t.CodeEditorTheme, expected: boolean) => {
        expect(Theme.isLight(theme)).to.eql(expected);
      };
      test('light', true);
      test('dark', false);
      test('ink', false);
    });
  });

  describe('byName', () => {
    it('get by name', () => {
      expect(Theme.byName('ink')).to.eql(Themes.ink());
    });

    it('throw: theme not supported', () => {
      const fn = () => Theme.byName('foobar' as any);
      expect(fn).to.throw(/Theme 'foobar' not supported/);
    });
  });

  describe('Themes', () => {
    it('light', () => {
      const theme = Themes.light();
      expect(theme.base).to.eql('vs');
      expect(Theme.byName('light')).to.eql(theme);
    });

    it('light', () => {
      const theme = Themes.dark();
      expect(theme.base).to.eql('vs-dark');
      expect(Theme.byName('dark')).to.eql(theme);
    });

    it('ink', () => {
      const theme = Themes.ink();
      expect(theme.base).to.eql('vs-dark');
      expect(Theme.byName('ink')).to.eql(theme);
    });
  });
});
