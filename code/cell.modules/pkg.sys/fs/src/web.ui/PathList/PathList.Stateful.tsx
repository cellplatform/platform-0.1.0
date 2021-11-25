import React, { useEffect, useRef, useState } from 'react';

import { CssValue, t } from './common';
import { usePathListState } from './hooks/usePathListState';
import { PathList } from './PathList';

type FilesystemName = string;
type DirPath = string;

export type PathListStatefulProps = {
  bus: t.EventBus;
  id: FilesystemName;
  dir?: DirPath;
  scroll?: boolean;
  style?: CssValue;
};

export const PathListStateful: React.FC<PathListStatefulProps> = (props) => {
  const { bus, id } = props;
  const state = usePathListState({ bus, id });

  /**
   * [Render]
   */
  return <PathList scroll={props.scroll} files={state.files} style={props.style} />;
};
