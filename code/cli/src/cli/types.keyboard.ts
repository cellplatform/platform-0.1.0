import { Observable } from 'rxjs';
import * as t from '../common/types';

/**
 * Keyboard events within a command line application.
 */
export type ICmdKeyboard = {
  keypress$: Observable<t.ICmdAppKeypress>;
};
