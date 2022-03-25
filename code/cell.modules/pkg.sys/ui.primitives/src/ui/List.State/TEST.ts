import { Test, expect } from 'sys.ui.dev';
import { ListSelection } from './Selection/ListSelection';
import { t } from './common';

export default Test.describe('List.Selection: state', (e) => {
  e.describe('Selection', (e) => {
    e.describe('clean', (e) => {
      e.it('clean: empty', () => {
        expect(ListSelection.clean(undefined as any)).to.eql([]);
        expect(ListSelection.clean(null as any)).to.eql([]);
        expect(ListSelection.clean([])).to.eql([]);
        expect(ListSelection.clean([undefined] as any)).to.eql([]);
        expect(ListSelection.clean([null] as any)).to.eql([]);
      });

      e.it('clean: unique', () => {
        expect(ListSelection.clean([1, 2, 1])).to.eql([1, 2]);
      });

      e.it('clean: sort', () => {
        expect(ListSelection.clean([2, 1, 0])).to.eql([0, 1, 2]);
      });

      e.it('clean: remove < 0', () => {
        expect(ListSelection.clean([1, 0, -1, -99])).to.eql([0, 1]);
      });
    });

    e.describe('isSelected', (e) => {
      e.it('isSelected: true', () => {
        const selection: t.ListSelection = [1, 2, 3];
        expect(ListSelection.isSelected(selection, 2)).to.eql(true);
      });

      e.it('isSelected: false', () => {
        const selection: t.ListSelection = [1, 2, 3];
        expect(ListSelection.isSelected(selection, 5)).to.eql(false);
        expect(ListSelection.isSelected(selection, -1)).to.eql(false);
        expect(ListSelection.isSelected(undefined, 2)).to.eql(false);
        expect(ListSelection.isSelected(null as any, 2)).to.eql(false);
      });
    });
  });
});
