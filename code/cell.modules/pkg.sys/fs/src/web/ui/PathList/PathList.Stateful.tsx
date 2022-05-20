import React from 'react';

import { PathList } from './PathList';
import { PathListStatefulProps } from './types';

/**
 * <PathList> with state configured.
 */
export const PathListStateful: React.FC<PathListStatefulProps> = (props) => {
  const { instance, dir, droppable } = props;
  const state = PathList.useState({ instance, dir, droppable });
  return (
    <PathList
      instance={instance}
      scroll={props.scroll}
      files={state.files}
      spinning={!state.ready}
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
