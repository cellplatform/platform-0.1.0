import * as coord from '@platform/util.value.cell';
export { coord };

export { value, time, rx } from '@platform/util.value';
export {
  removeMarkdownEncoding,
  isEmptyCellValue,
  isDefaultGridValue,
} from '@platform/ui.datagrid.types/lib/util';

/**
 * Ramda
 */
import { uniq, equals, groupBy, prop, flatten } from 'ramda';
export const R = { uniq, equals, groupBy, prop, flatten };
