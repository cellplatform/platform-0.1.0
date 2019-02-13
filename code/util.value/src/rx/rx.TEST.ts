import { expect } from 'chai';
import { Subject } from 'rxjs';

import { rx } from '.';
import { time } from '../time';

describe('rx', () => {
  describe('debounceBuffer', () => {
    it('buffers several values', async () => {
      type T = { value: number };
      const source$ = new Subject<T>();
      const buffered$ = rx.debounceBuffer(source$); // NB: default debounce time: 0

      let results: T[][] = [];
      buffered$.subscribe(e => (results = [...results, e]));

      source$.next({ value: 1 });
      source$.next({ value: 2 });
      source$.next({ value: 3 });
      expect(results.length).to.eql(0);

      await time.wait(0);
      expect(results.length).to.eql(1);
      expect(results[0]).to.eql([{ value: 1 }, { value: 2 }, { value: 3 }]);
    });

    it('buffers into two groups after delay', async () => {
      const source$ = new Subject<number>();
      const buffered$ = rx.debounceBuffer(source$, 10); // NB: default debounce time: 0

      let results: number[][] = [];
      buffered$.subscribe(e => (results = [...results, e]));

      source$.next(1);
      source$.next(2);
      await time.wait(5); // NB: Still in the first debounce window.
      source$.next(3);

      await time.wait(10);
      source$.next(4);

      await time.wait(10);
      source$.next(5);
      source$.next(6);

      await time.wait(10);
      expect(results.length).to.eql(3);
      expect(results[0]).to.eql([1, 2, 3]);
      expect(results[1]).to.eql([4]);
      expect(results[2]).to.eql([5, 6]);
    });
  });
});
