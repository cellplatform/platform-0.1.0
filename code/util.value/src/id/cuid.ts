import * as cuid from 'cuid';

export function generate() {
  return cuid() as string;
}
