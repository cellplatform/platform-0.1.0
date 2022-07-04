import React from 'react';

import { FsPathList } from './FsPathList';
import { FsPathListStatefulProps } from './types';

/**
 * <PathList> with state configured.
 */
export const FsPathListStateful: React.FC<FsPathListStatefulProps> = (props) => {
  const { instance, scrollable, dir, droppable, selectable, onStateChanged } = props;

  const state = FsPathList.useState({
    instance,
    dir,
    scrollable,
    droppable,
    selectable,
    onStateChanged,
  });

  /**
   * TODO 🐷
   *
   *    PROBLEM!
   *
   * The state hook above is causing redraw.
   * But with the use of the cursor, we should not need this level of the
   * component to redraw.
   *
   */

  return (
    <FsPathList
      instance={instance}
      cursor={state.data}
      state={state.list}
      spinning={state.spinning}
      scrollable={props.scrollable}
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
