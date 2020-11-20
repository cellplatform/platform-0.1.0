import { RuntimeEnv } from './types';

declare global {
  const __CELL_ENV__: RuntimeEnv;
  const __webpack_share_scopes__: any;
  const __webpack_init_sharing__: any;
}
