import { t } from './common';

declare global {
  const __CELL_ENV__: t.RuntimeEnv;
  const __webpack_share_scopes__: any;
  const __webpack_init_sharing__: any;
}
