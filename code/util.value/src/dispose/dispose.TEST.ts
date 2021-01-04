import { expect } from 'chai';
import { Subject } from 'rxjs';

import { dispose } from '.';

describe('IDisposable', () => {
  it('create', () => {
    const obj = dispose.create();
    expect(typeof obj.dispose).to.eql('function');
    expect(typeof obj.dispose$.subscribe).to.eql('function');
  });

  it('event: dispose$', () => {
    const obj = dispose.create();

    let count = 0;
    obj.dispose$.subscribe(() => count++);

    obj.dispose();
    obj.dispose();
    obj.dispose();
    expect(count).to.eql(1);
  });

  it('until', () => {
    const obj1 = dispose.create();

    const $ = new Subject<void>();
    const obj2 = dispose.until(obj1, $);

    let count = 0;
    obj1.dispose$.subscribe(() => count++);

    expect(obj1).to.equal(obj2);

    $.next();
    $.next();
    $.next();
    expect(count).to.eql(1);
  });
});
