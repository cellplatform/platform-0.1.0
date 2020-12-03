export const FOO = 1234;
import { log } from '@platform/log/lib/server';
log.info.green('app.ts', log.yellow(FOO));
