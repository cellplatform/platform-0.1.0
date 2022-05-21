import { DEFAULT, FC, THEMES } from './common';
import { usePathListState } from './logic/usePathListState';
import { FsPathListStateful as Stateful } from './FsPathList.Stateful';
import { FsPathListProps } from './types';
import { PathList as View } from './ui/PathList';
import { wrangle } from './ui/wrangle';

/**
 * Export
 */
type Fields = {
  Stateful: typeof Stateful;
  useState: typeof usePathListState;
  wrangle: typeof wrangle;
  THEMES: typeof THEMES;
  DEFAULT: typeof DEFAULT;
};
export const FsPathList = FC.decorate<FsPathListProps, Fields>(
  View,
  { Stateful, useState: usePathListState, wrangle, THEMES, DEFAULT },
  { displayName: 'Fs.PathList' },
);
