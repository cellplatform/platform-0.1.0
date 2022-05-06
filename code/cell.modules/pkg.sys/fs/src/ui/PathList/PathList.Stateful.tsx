import React from 'react';

import { CssValue, t } from './common';
import { PathList } from './PathList';

type FilesystemName = string;
type DirPath = string;

export type PathListStatefulProps = {
  instance: { bus: t.EventBus<any>; id: FilesystemName };
  dir?: DirPath;
  scroll?: boolean;
  padding?: t.CssEdgesInput;
  style?: CssValue;
};

export const PathListStateful: React.FC<PathListStatefulProps> = (props) => {
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
