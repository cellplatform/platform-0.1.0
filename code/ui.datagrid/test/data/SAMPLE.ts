import { t } from '../common';

const CELLS: t.IGridData['cells'] = {
  A1: { value: '=A5' },
  A2: { value: '123', props: { style: { bold: true } } },
  // A2: {value:'* one\n * two'},
  // A2: {value:'# Heading\nhello'},
  A3: { value: 'A3 `code`' },
  A5: { value: '=A2', props: { merge: { colspan: 2 } } },
  A6: { value: '=SUM(1, A5, C4)' },
  A8: { value: '=SUM(1,2)' },
  A9: { value: '=1+2+5' },
  A10: { value: '=1+B10+B10' },
  A14: { value: '=A15' },
  A15: { value: '=A14' },
  A16: { value: '=A15' },
  B10: { value: '5' },
  A11: { value: '=SUM(1,B11,B11)' },
  B11: { value: '10' },
  B1: { value: 'locked' },
  B2: { value: 'cancel' },
  C1: {
    value: 'Yo',
    props: {
      view: {
        cell: { type: 'MyView', className: 'my-foo' },
        screen: { type: 'MyScreen', className: 'my-screen' },
      },
    },
  },
  C4: { value: 'Hello' },
  C5: { value: 'Hello', props: { merge: { rowspan: 2 } } },
};

const COLUMNS: t.IGridData['columns'] = {
  A: { props: { width: 250 } },
};

const ROWS: t.IGridData['rows'] = {
  A: { props: {} },
};

export const SAMPLE = {
  NS: 'ns:24FPqPC', // NB: the "ns:" uri prefix is stripped.
  CELLS,
  COLUMNS,
  ROWS,
};
