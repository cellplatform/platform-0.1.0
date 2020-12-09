import { RuntimeModule } from './types';

declare global {
  const __CELL__: RuntimeModule;
  const __webpack_share_scopes__: any;
  const __webpack_init_sharing__: any;
}
