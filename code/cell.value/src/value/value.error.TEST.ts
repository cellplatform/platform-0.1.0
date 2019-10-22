import { expect } from 'chai';
import { t } from '../common';
import { value } from '.';

type Parent = t.IErrorParent & { count: number };

describe('error', () => {
  it('no change', () => {
    const target: Parent = { count: 123 };
    const res = value.setError(target);
    expect(res).to.equal(target);
    expect(res.count).to.eql(123);
  });

  it('assigns error', () => {
    const err: t.IError = { type: 'FAIL', message: 'Derp', path: 'A1' };
    const target: Parent = { count: 123 };
    const res = value.setError(target, err);
    expect(res.count).to.eql(123);
    expect(res).to.not.equal(target);
    expect(res.error).to.eql(err);
  });

  it('replaces error', () => {
    const err: t.IError = { type: 'FAIL', message: 'Derp', path: 'A1' };
    const target: Parent = {
      count: 123,
      error: { type: 'FOO', message: 'Previous error.', path: 'A1' },
    };
    const res = value.setError(target, err);
    expect(res.error).to.eql(err);
  });

  it('removes error (undefined)', () => {
    const target: Parent = {
      count: 123,
      error: { type: 'FOO', message: 'Previous error.', path: 'A1' },
    };
    const res = value.setError(target);
    expect(res.count).to.eql(123);
    expect(res.error).to.eql(undefined);
  });
});
