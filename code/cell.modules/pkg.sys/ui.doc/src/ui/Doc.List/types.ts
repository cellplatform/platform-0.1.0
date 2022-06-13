import * as t from '../../common/types';

export type DocListItemData = {
  sizes: t.DocLayoutSizes;
  showAsCard?: boolean | DocListCardType;
  connectorLines?: boolean;
};

export type DocListCardType = 'Stark' | 'Soft';
