import { Observable } from 'rxjs';
import * as t from '../common/types';

/**
 * Keyboard events within a command line application.
 */
export type ICmdKeyboard = {
  events$: Observable<t.CmdAppKeyboardEvent>;
  started$: Observable<t.ICmdAppKeyboardStarted>;
  keypress$: Observable<t.ICmdAppKeypress>;
};
