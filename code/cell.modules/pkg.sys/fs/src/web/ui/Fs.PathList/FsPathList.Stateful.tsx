import React from 'react';

import { FsPathList } from './FsPathList';
import { FsPathListStatefulProps } from './types';

/**
 * <PathList> with state configured.
 */
export const FsPathListStateful: React.FC<FsPathListStatefulProps> = (props) => {
  const { instance, dir, droppable, selectable, onStateChange } = props;

  const state = FsPathList.useState({
    instance,
    dir,
    droppable,
    selectable,
    onStateChange,
  });

  return (
    <FsPathList
      instance={instance}
      files={state.files}
      state={state.lazy}
      spinning={state.spinning}
      scroll={props.scroll}
      padding={props.padding}
      selectable={props.selectable}
      tabIndex={props.tabIndex}
      theme={props.theme}
      style={props.style}
      droppable={droppable}
      onDrop={state.onDrop}
    />
  );
};
