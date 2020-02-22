import { expect } from 'chai';

import { t } from '../common';
import * as util from './util.axis';

describe('axis (column/row)', () => {
  describe('toRowProps', () => {
    it('default props (empty {})', () => {
      const test = (input?: any) => {
        const res = util.toGridRowProps(input);
        expect(res.grid?.height).to.eql(-1);
      };
      test();
      test(null);
      test({});
    });

    it('props', () => {
      const row: t.IGridRowData = { props: { grid: { height: 123 } } };
      const props = util.toGridRowProps(row.props);
      expect(props.grid?.height).to.eql(123);
    });
  });

  describe('toColumnProps', () => {
    it('default props (empty {})', () => {
      const test = (input?: any) => {
        const res = util.toGridColumnProps(input);
        expect(res.grid?.width).to.eql(-1);
      };
      test();
      test(null);
      test({});
    });

    it('props', () => {
      const column: t.IGridColumnData = { props: { grid: { width: 123 } } };
      const props = util.toGridColumnProps(column.props);
      expect(props.grid?.width).to.eql(123);
    });
  });
});
