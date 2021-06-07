import { HttpProtocol } from '@platform/cell.types/lib/types.Http';

import('./qrcode');

export type Foo = {
  count: number;
  protocol: HttpProtocol;
};
