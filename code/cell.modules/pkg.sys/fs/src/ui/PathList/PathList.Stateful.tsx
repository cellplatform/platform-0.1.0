import React from 'react';

import { CssValue, t } from './common';
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
  selection?: t.ListSelectionConfig;
  tabIndex?: number;
  style?: CssValue;
};

/**
 * <PathList> with state configured.
 */
export const PathListStateful: React.FC<PathListStatefulProps> = (props) => {
  const { instance, dir } = props;
  const state = PathList.useState({ instance, dir });
  return (
    <PathList
      instance={instance}
      scroll={props.scroll}
      files={state.files}
      spinning={!state.ready}
      padding={props.padding}
      selection={props.selection}
      tabIndex={props.tabIndex}
      style={props.style}
    />
  );
};
