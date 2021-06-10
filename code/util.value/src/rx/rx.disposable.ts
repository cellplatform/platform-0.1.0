import { IDisposable } from '@platform/types';
import { Observable } from 'rxjs';

import { dispose } from '../dispose';

/**
 * Generates the base mechanism of an disposable observable.
 */
export function disposable(until$?: Observable<any>): IDisposable {
  return dispose.create(until$);
}
