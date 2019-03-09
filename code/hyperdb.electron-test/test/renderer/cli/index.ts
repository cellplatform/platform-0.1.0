import { Subject } from 'rxjs';
import { CliEvent } from './types';

export * from './commands';
export * from './types';

export const events$ = new Subject<CliEvent>();
