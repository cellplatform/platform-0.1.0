import { DEFAULT, FC, THEMES } from './common';
import { usePathListState } from './logic/usePathListState';
import { PathListStateful as Stateful } from './PathList.Stateful';
import { PathListProps } from './types';
import { PathList as View } from './ui/PathList';
import { wrangle } from './wrangle';

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
export const PathList = FC.decorate<PathListProps, Fields>(
  View,
  { Stateful, useState: usePathListState, wrangle, THEMES, DEFAULT },
  { displayName: 'PathList' },
);
