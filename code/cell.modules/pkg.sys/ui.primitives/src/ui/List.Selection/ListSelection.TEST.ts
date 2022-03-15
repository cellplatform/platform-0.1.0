import { Test, expect } from 'sys.ui.dev';
import { ListSelection } from '.';
import { t } from '../common';

export default Test.describe('List.Selection', (e) => {
  e.describe('is (flags)', (e) => {
    const is = ListSelection.is;
    e.it('is.selected', () => {
      const selection: t.ListSelection = { indexes: [1, 2, 3] };
      expect(is.selected(selection, 2)).to.eql(true);
      expect(is.selected(selection, 5)).to.eql(false);
      expect(is.selected(selection, -1)).to.eql(false);
      expect(is.selected(undefined, 2)).to.eql(false);
    });
  });
});
