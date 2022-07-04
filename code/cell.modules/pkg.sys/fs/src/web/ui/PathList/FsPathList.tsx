import { DEFAULT, FC, THEMES } from './common';
import { usePathListState } from './logic/usePathListState';
import { FsPathListStateful as Stateful } from './FsPathList.Stateful';
import { FsPathListProps } from './types';
import { PathList as View } from './ui/PathList';
import { wrangle } from './ui/wrangle';
import { PathListDev } from '../PathList.Dev';

/**
 * Export
 */
type Fields = {
  Stateful: typeof Stateful;
  Dev: typeof PathListDev;
  useState: typeof usePathListState;
  wrangle: typeof wrangle;
  THEMES: typeof THEMES;
  DEFAULT: typeof DEFAULT;
};
export const FsPathList = FC.decorate<FsPathListProps, Fields>(
  View,
  {
    Stateful,
    Dev: PathListDev,
    useState: usePathListState,
    wrangle,
    THEMES,
    DEFAULT,
  },
  { displayName: 'Fs.PathList' },
);
