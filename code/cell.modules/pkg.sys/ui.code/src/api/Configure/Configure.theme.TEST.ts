import { Theme, Themes } from '.';
import { t } from '../common';
import { expect, Test } from '../../test';

export default Test.describe('Theme', (e) => {
  e.describe('shade', (e) => {
    e.it('isDark', () => {
      const test = (theme: t.CodeEditorTheme, expected: boolean) => {
        expect(Theme.isDark(theme)).to.eql(expected);
      };
      test('dark', true);
      test('light', false);
    });

    e.it('isLight', () => {
      const test = (theme: t.CodeEditorTheme, expected: boolean) => {
        expect(Theme.isLight(theme)).to.eql(expected);
      };
      test('light', true);
      test('dark', false);
    });
  });

  e.describe('byName', (e) => {
    e.it('get by name', () => {
      expect(Theme.byName('dark')).to.eql(Themes.dark());
    });

    e.it('throw: theme not supported', () => {
      const fn = () => Theme.byName('foobar' as any);
      expect(fn).to.throw(/Theme 'foobar' not supported/);
    });
  });

  e.describe('Themes', (e) => {
    e.it('light', () => {
      const theme = Themes.light();
      expect(theme.name).to.eql('light');
      expect(theme.data.base).to.eql('vs');
      expect(Theme.byName('light')).to.eql(theme);
    });

    e.it('dark', () => {
      const theme = Themes.dark();
      expect(theme.name).to.eql('dark');
      expect(theme.data.base).to.eql('vs-dark');
      expect(Theme.byName('dark')).to.eql(theme);
    });
  });
});
