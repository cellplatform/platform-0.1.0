import { expect } from '../test';
import { t } from '../common';
import { value } from '.';

type P = t.ICellProps & {
  style: { bold?: boolean; italic?: boolean; underline?: boolean };
  status: { error?: { message: string } };
  merge: { colspan?: number; rowspan?: number };
};

type R = t.IRowProps & { grid: { isEnabled?: boolean } };
type C = t.IColumnProps & { grid: { isEnabled?: boolean } };

describe('toggleProp', () => {
  describe('cell', () => {
    const defaults = { bold: false, italic: false, underline: false };

    it('cell: non-boolean values ignored', () => {
      const style = { bold: { msg: 'NEVER' } } as any;
      const props = { style };
      const res = value.toggleCellProp<P, 'style'>({
        defaults,
        section: 'style',
        field: 'bold',
        props,
      });
      expect(res).to.eql(props); // Non boolean field value ignored.
    });

    it('cell: toggle sequence', () => {
      const section = 'style';
      const field = 'bold';

      const res1 = value.toggleCellProp<P, 'style'>({ defaults, section, field });
      const res2 = value.toggleCellProp<P, 'style'>({ defaults, props: res1, section, field });
      const res3 = value.toggleCellProp<P, 'style'>({ defaults, props: res2, section, field });
      const res4 = value.toggleCellProp<P, 'style'>({
        defaults,
        props: res3,
        section,
        field: 'italic',
      });
      const res5 = value.toggleCellProp<P, 'style'>({ defaults, props: res4, section, field });

      expect(res1).to.eql({ style: { bold: true } }); // Nothing => true (default)
      expect(res2).to.eql(undefined); // True to nothing
      expect(res3).to.eql({ style: { bold: true } }); // Nothing => true (default)
      expect(res4).to.eql({ style: { bold: true, italic: true } });
      expect(res5).to.eql({ style: { italic: true } });
    });
  });

  describe('column', () => {
    const defaults = { isEnabled: true };

    it('column: toggles', () => {
      const section = 'grid';
      const field = 'isEnabled';

      const res1 = value.toggleColumnProp<C, 'grid'>({ defaults, section, field });
      const res2 = value.toggleColumnProp<C, 'grid'>({ defaults, props: res1, section, field });
      const res3 = value.toggleColumnProp<C, 'grid'>({ defaults, props: res2, section, field });

      expect(res1?.grid.isEnabled).to.eql(false);
      expect(res2).to.eql(undefined);
      expect(res3?.grid.isEnabled).to.eql(false);
    });
  });

  describe('row', () => {
    const defaults = { isEnabled: true };

    it('row: toggles', () => {
      const section = 'grid';
      const field = 'isEnabled';

      const res1 = value.toggleRowProp<R, 'grid'>({ defaults, section, field });
      const res2 = value.toggleRowProp<R, 'grid'>({ defaults, props: res1, section, field });
      const res3 = value.toggleRowProp<R, 'grid'>({ defaults, props: res2, section, field });

      expect(res1?.grid.isEnabled).to.eql(false);
      expect(res2).to.eql(undefined);
      expect(res3?.grid.isEnabled).to.eql(false);
    });
  });
});
