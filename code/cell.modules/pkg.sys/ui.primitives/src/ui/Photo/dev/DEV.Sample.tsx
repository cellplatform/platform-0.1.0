import React from 'react';

import { Photo } from '..';
import { t } from '../../common';

export type DevSampleProps = {
  props: t.PhotoProps;
  indexTimer: { enabled: boolean; loop: boolean };
};

export const DevSample: React.FC<DevSampleProps> = (args) => {
  const { props } = args;

  const timer = Photo.useIndexSequence({
    def: props.def,
    index: props.index,
    enabled: args.indexTimer.enabled,
    loop: args.indexTimer.loop,
    defaultDuration: props.defaults?.duration,
  });

  /**
   * [Render]
   */
  return <Photo {...props} index={timer.index} style={{ flex: 1 }} />;
};
