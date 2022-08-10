import { Subject } from 'rxjs';
import * as t from '@platform/types';

export const Rx = {
  bus(): t.EventBus {
    const $ = new Subject<any>();
    return {
      $: $.asObservable(),
      fire(e: t.Event) {
        $.next(e);
      },
    };
  },
};

console.log('loaded: src/foo.ts');
