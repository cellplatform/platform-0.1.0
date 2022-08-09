import * as t from '../../common/types';

export * from '../common';
export { Icons } from '../Icons';

export const ALL = {
  align: <t.DocImageCreditAlign[]>['Left', 'Center', 'Right'],
};

/**
 * Constants
 */
export const DEFAULT = {
  borderRadius: 6,
  draggable: false,
  credit: {
    align: <t.DocImageCreditAlign>'Right',
  },
};
