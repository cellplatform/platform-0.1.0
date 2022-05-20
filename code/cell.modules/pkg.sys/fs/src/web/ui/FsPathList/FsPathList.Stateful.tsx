import React from 'react';

import { FsPathList } from './FsPathList';
import { PathListStatefulProps } from './types';

/**
 * <PathList> with state configured.
 */
export const FsPathListStateful: React.FC<PathListStatefulProps> = (props) => {
  const { instance, dir, droppable } = props;
  const state = FsPathList.useState({ instance, dir, droppable });
  return (
    <FsPathList
      instance={instance}
      files={state.files}
      spinning={!state.ready}
      scroll={props.scroll}
      padding={props.padding}
      selection={props.selection}
      tabIndex={props.tabIndex}
      theme={props.theme}
      style={props.style}
      droppable={droppable}
      onDrop={state.onDrop}
    />
  );
};
