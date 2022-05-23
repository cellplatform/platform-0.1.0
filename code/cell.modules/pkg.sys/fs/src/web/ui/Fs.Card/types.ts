import * as t from '../../common/types';

export type FsCardTheme = 'Light' | 'Dark';

export type FsCardBodyState = {
  instance: t.FsViewInstance;
  count?: number;
};
