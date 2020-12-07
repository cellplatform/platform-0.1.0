import { log } from '@platform/log/lib/server';
export { log };

export function logVersion() {
  log.info('v1.2.3');
}
