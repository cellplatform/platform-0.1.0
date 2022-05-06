import React from 'react';

import { FC, CssValue, t } from './common';
import { PathList } from './PathList';

type FilesystemId = string;
type DirPath = string;

/**
 * Types
 */
export type PathListStatefulProps = {
  instance: { bus: t.EventBus<any>; id: FilesystemId };
  dir?: DirPath;
  scroll?: boolean;
  padding?: t.CssEdgesInput;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<PathListStatefulProps> = (props) => {
  const { instance, dir } = props;
  const state = PathList.useState({ instance, dir });

  /**
   * [Render]
   */
  return (
    <PathList
      scroll={props.scroll}
      files={state.files}
      spinning={!state.ready}
      style={props.style}
      padding={props.padding}
    />
  );
};

/**
 * Export
 */
type Fields = {
  useState: typeof PathList.useState;
};
export const PathListStateful = FC.decorate<PathListStatefulProps, Fields>(
  View,
  { useState: PathList.useState },
  { displayName: 'PathListStateful' },
);
