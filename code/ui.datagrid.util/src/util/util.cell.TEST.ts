import { expect } from 'chai';

import { t } from '../common';
import * as util from './util.cell';

describe('util.cell', () => {
  describe('toCellProps', () => {
    it('default props (empty {})', () => {
      const test = (input?: any) => {
        const res = util.toCellProps(input);
        expect(res.value).to.eql(undefined);
        expect(res.merge).to.eql({});
        expect(res.style).to.eql({});
        expect(res.view).to.eql({});
        expect(res.status).to.eql({});
      };
      test();
      test(null);
      test({});
    });

    it('props', () => {
      const A2: t.IGridCellData = {
        value: 'Hello',
        props: {
          value: 456, // NB: Display value.
          style: { bold: true },
          merge: { colspan: 3 },
          view: { type: 'SHOP' },
          status: {
            error: { message: 'Fail', type: 'UNKNOWN' },
          },
        },
      };
      const props = util.toCellProps(A2.props);
      expect(props.style.bold).to.eql(true);
      expect(props.merge.colspan).to.eql(3);
      expect(props.value).to.eql(456);
      expect(props.view.type).to.eql('SHOP');
      expect(props.status.error).to.eql({ message: 'Fail', type: 'UNKNOWN' });
    });
  });
});
