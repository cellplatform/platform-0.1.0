import { expect } from 'chai';
import { t } from '../common';
import { formula } from '.';

describe.only('formula', () => {
  it('throw if not a formula', () => {
    // formula.create({ text: '123' })
  });

  it('formula', async () => {
    //

    const res = formula.create({ text: '=SUM(1,A2,3)' });

    console.log('-------------------------------------------');
    console.log('res', res);
  });
});
