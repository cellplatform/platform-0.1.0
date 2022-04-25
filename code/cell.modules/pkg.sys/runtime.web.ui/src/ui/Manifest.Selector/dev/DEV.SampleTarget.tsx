import React from 'react';

import { useModuleTarget } from '../../useModuleTarget';
import { css, t } from '../common';

type Id = string;
export type DevSampleTargetProps = {
  instance: { bus: t.EventBus; id?: Id };
  target: string;
};

/**
 * Sample UI for the [useModule] hook.
 */
export const DevSampleTarget: React.FC<DevSampleTargetProps> = (props) => {
  const { instance, target } = props;

  const remote = useModuleTarget({ instance, target });
  const Component = remote.module?.default;

  /**
   * Render
   */
  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
    }),
  };

  const el = Component && <Component bus={instance.bus} />;
  return <div {...styles.base}>{el}</div>;
};
