import React, { useEffect, useState } from 'react';

import { CmdCard, CmdCardProps } from '..';
import { t } from '../common';

export type DevSampleProps = {
  bus: t.EventBus<any>;
  props: CmdCardProps;
  onStateChange?: (e: t.CmdCardState) => void;
};

export const DevSample: React.FC<DevSampleProps> = (args) => {
  const { props, bus } = args;
  const { instance } = props;

  const [state, setState] = useState<undefined | t.CmdCardState>();

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const controller = CmdCard.State.Controller({ instance, bus });

    controller.state$.subscribe((state) => {
      setState(state);
      args.onStateChange?.(state);
    });

    return () => controller.dispose();
  }, [instance.id, bus]); // eslint-disable-line

  /**
   * [Render]
   */
  return <CmdCard {...props} state={state} style={{ flex: 1 }} />;
};
