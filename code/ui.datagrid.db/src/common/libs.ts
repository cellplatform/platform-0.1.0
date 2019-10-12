export { coord } from '@platform/cell.coord';
export { value, time, rx } from '@platform/util.value';

import * as util from '@platform/ui.datagrid.util';
export { util };

/**
 * Ramda
 */
import { uniq, equals, groupBy, prop, flatten } from 'ramda';
export const R = { uniq, equals, groupBy, prop, flatten };
