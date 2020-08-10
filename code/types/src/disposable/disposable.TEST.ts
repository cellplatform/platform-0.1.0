import { expect } from 'chai';
import { disposable } from '.';

describe('disposable', () => {
  it('create', () => {
    const obj = disposable();
    expect(obj.isDisposed).to.eql(false);
  });

  it('dispose()', () => {
    const obj = disposable();
    obj.dispose();
    expect(obj.isDisposed).to.eql(true);
  });

  it('event: dispose$', () => {
    const obj = disposable();

    let count = 0;
    obj.dispose$.subscribe(() => count++);

    obj.dispose();
    obj.dispose();
    obj.dispose();
    expect(count).to.eql(1);
  });
});
